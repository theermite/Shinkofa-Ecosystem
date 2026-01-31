/**
 * Baby Tracking Model - Database Operations
 * © 2025 La Voie Shinkofa
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../config/database';
import { RepasLog, CoucheLog, BienEtreLog, Enfant, BienEtreEnfant } from '../types';

// ======================
// REPAS LOGS (Evy, Nami)
// ======================

/**
 * Create repas log
 */
export async function createRepasLog(log: {
  date: Date;
  time: string;
  enfant: Enfant;
  type: 'biberon' | 'repas';
  quantite_ml?: number | null;
  taille_assiette?: 'petite' | 'moyenne' | 'grande' | null;
  duration_minutes?: number | null;
  notes?: string | null;
  logged_by: string;
}): Promise<string> {
  const sql = `
    INSERT INTO repas_logs (
      date, time, enfant, type, quantite_ml, taille_assiette,
      duration_minutes, notes, logged_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await query<ResultSetHeader>(sql, [
    log.date,
    log.time,
    log.enfant,
    log.type,
    log.quantite_ml || null,
    log.taille_assiette || null,
    log.duration_minutes || null,
    log.notes || null,
    log.logged_by,
  ]);

  return result.insertId.toString();
}

/**
 * Get repas log by ID
 */
export async function getRepasLogById(id: string): Promise<RepasLog | null> {
  const sql = 'SELECT * FROM repas_logs WHERE id = ?';
  const logs = await query<(RepasLog & RowDataPacket)[]>(sql, [id]);
  return logs.length > 0 ? logs[0] : null;
}

/**
 * Get repas logs by date range and child
 */
export async function getRepasLogsByDateRange(
  enfant: Enfant,
  startDate: Date,
  endDate: Date
): Promise<RepasLog[]> {
  const sql = `
    SELECT * FROM repas_logs
    WHERE enfant = ? AND date >= ? AND date <= ?
    ORDER BY date DESC, time DESC
  `;
  return query<(RepasLog & RowDataPacket)[]>(sql, [enfant, startDate, endDate]);
}

/**
 * Get today's repas logs for a child
 */
export async function getTodayRepasLogs(enfant: Enfant): Promise<RepasLog[]> {
  const sql = `
    SELECT * FROM repas_logs
    WHERE enfant = ? AND date = CURDATE()
    ORDER BY time DESC
  `;
  return query<(RepasLog & RowDataPacket)[]>(sql, [enfant]);
}

/**
 * Update repas log
 */
export async function updateRepasLog(
  id: string,
  updates: Partial<Omit<RepasLog, 'id' | 'logged_by' | 'created_at' | 'updated_at'>>
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
  const sql = `UPDATE repas_logs SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Delete repas log
 */
export async function deleteRepasLog(id: string): Promise<void> {
  const sql = 'DELETE FROM repas_logs WHERE id = ?';
  await query(sql, [id]);
}

// ======================
// COUCHE LOGS (Evy, Nami)
// ======================

/**
 * Create couche log
 */
export async function createCoucheLog(log: {
  date: Date;
  time: string;
  enfant: Enfant;
  type: 'pipi' | 'caca' | 'mixte';
  changed_by: string;
  notes?: string | null;
}): Promise<string> {
  const sql = `
    INSERT INTO couche_logs (date, time, enfant, type, changed_by, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const result = await query<ResultSetHeader>(sql, [
    log.date,
    log.time,
    log.enfant,
    log.type,
    log.changed_by,
    log.notes || null,
  ]);

  return result.insertId.toString();
}

/**
 * Get couche log by ID
 */
export async function getCoucheLogById(id: string): Promise<CoucheLog | null> {
  const sql = 'SELECT * FROM couche_logs WHERE id = ?';
  const logs = await query<(CoucheLog & RowDataPacket)[]>(sql, [id]);
  return logs.length > 0 ? logs[0] : null;
}

/**
 * Get couche logs by date range and child
 */
export async function getCoucheLogsByDateRange(
  enfant: Enfant,
  startDate: Date,
  endDate: Date
): Promise<CoucheLog[]> {
  const sql = `
    SELECT * FROM couche_logs
    WHERE enfant = ? AND date >= ? AND date <= ?
    ORDER BY date DESC, time DESC
  `;
  return query<(CoucheLog & RowDataPacket)[]>(sql, [enfant, startDate, endDate]);
}

/**
 * Get today's couche logs for a child
 */
export async function getTodayCoucheLogs(enfant: Enfant): Promise<CoucheLog[]> {
  const sql = `
    SELECT * FROM couche_logs
    WHERE enfant = ? AND date = CURDATE()
    ORDER BY time DESC
  `;
  return query<(CoucheLog & RowDataPacket)[]>(sql, [enfant]);
}

/**
 * Delete couche log
 */
export async function deleteCoucheLog(id: string): Promise<void> {
  const sql = 'DELETE FROM couche_logs WHERE id = ?';
  await query(sql, [id]);
}

// ======================
// BIEN-ÊTRE LOGS (All children)
// ======================

/**
 * Create bien-être log
 */
export async function createBienEtreLog(log: {
  date: Date;
  enfant: BienEtreEnfant;
  category: 'santé' | 'sommeil' | 'comportement' | 'développement' | 'humeur' | 'allergie' | 'autre';
  observation: string;
  added_by: string;
}): Promise<string> {
  const sql = `
    INSERT INTO bien_etre_logs (date, enfant, category, observation, added_by)
    VALUES (?, ?, ?, ?, ?)
  `;

  const result = await query<ResultSetHeader>(sql, [
    log.date,
    log.enfant,
    log.category,
    log.observation,
    log.added_by,
  ]);

  return result.insertId.toString();
}

/**
 * Get bien-être log by ID
 */
export async function getBienEtreLogById(id: string): Promise<BienEtreLog | null> {
  const sql = 'SELECT * FROM bien_etre_logs WHERE id = ?';
  const logs = await query<(BienEtreLog & RowDataPacket)[]>(sql, [id]);
  return logs.length > 0 ? logs[0] : null;
}

/**
 * Get bien-être logs by date range and child
 */
export async function getBienEtreLogsByDateRange(
  enfant: BienEtreEnfant,
  startDate: Date,
  endDate: Date
): Promise<BienEtreLog[]> {
  const sql = `
    SELECT * FROM bien_etre_logs
    WHERE enfant = ? AND date >= ? AND date <= ?
    ORDER BY date DESC, created_at DESC
  `;
  return query<(BienEtreLog & RowDataPacket)[]>(sql, [enfant, startDate, endDate]);
}

/**
 * Get bien-être logs by child (all time)
 */
export async function getBienEtreLogsByChild(enfant: BienEtreEnfant): Promise<BienEtreLog[]> {
  const sql = `
    SELECT * FROM bien_etre_logs
    WHERE enfant = ?
    ORDER BY date DESC, created_at DESC
  `;
  return query<(BienEtreLog & RowDataPacket)[]>(sql, [enfant]);
}

/**
 * Delete bien-être log
 */
export async function deleteBienEtreLog(id: string): Promise<void> {
  const sql = 'DELETE FROM bien_etre_logs WHERE id = ?';
  await query(sql, [id]);
}
