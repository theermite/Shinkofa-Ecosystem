/**
 * Event Model - Database Operations
 * © 2025 La Voie Shinkofa
 */

import { randomUUID } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../config/database';
import { Event, EventCategory, SyncStatus } from '../types';

/**
 * Create event
 */
export async function createEvent(event: {
  user_id: string;
  title: string;
  description?: string | null;
  start_time: Date;
  end_time: Date;
  category?: EventCategory;
  color?: string;
  is_recurring?: boolean;
  recurrence_rule?: string | null;
}): Promise<string> {
  const id = randomUUID();
  const sql = `
    INSERT INTO events (
      id, user_id, title, description, start_time, end_time, category, color,
      is_recurring, recurrence_rule
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await query<ResultSetHeader>(sql, [
    id,
    event.user_id,
    event.title,
    event.description || null,
    event.start_time,
    event.end_time,
    event.category || 'autre',
    event.color || '#4285f4',
    event.is_recurring || false,
    event.recurrence_rule || null,
  ]);

  return id;
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  const sql = 'SELECT * FROM events WHERE id = ?';
  const events = await query<(Event & RowDataPacket)[]>(sql, [id]);
  return events.length > 0 ? events[0] : null;
}

/**
 * Get events by user ID
 */
export async function getEventsByUserId(userId: string): Promise<Event[]> {
  const sql = 'SELECT * FROM events WHERE user_id = ? ORDER BY start_time ASC';
  return query<(Event & RowDataPacket)[]>(sql, [userId]);
}

/**
 * Get events by date range (filtered by user)
 */
export async function getEventsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Event[]> {
  const sql = `
    SELECT * FROM events
    WHERE user_id = ? AND start_time >= ? AND end_time <= ?
    ORDER BY start_time ASC
  `;
  return query<(Event & RowDataPacket)[]>(sql, [userId, startDate, endDate]);
}

/**
 * Update event
 */
export async function updateEvent(
  id: string,
  updates: Partial<Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return;

  values.push(id);
  const sql = `UPDATE events SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Delete event
 */
export async function deleteEvent(id: string): Promise<void> {
  const sql = 'DELETE FROM events WHERE id = ?';
  await query(sql, [id]);
}

/**
 * Update sync status
 */
export async function updateSyncStatus(
  id: string,
  status: SyncStatus,
  googleCalendarId?: string | null,
  syncError?: string | null
): Promise<void> {
  const sql = `
    UPDATE events
    SET sync_status = ?, google_calendar_id = ?, sync_error = ?
    WHERE id = ?
  `;
  await query(sql, [status, googleCalendarId || null, syncError || null, id]);
}
