/**
 * Task Model - Database Operations
 * © 2025 La Voie Shinkofa
 */

import { randomUUID } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../config/database';
import { Task, TaskCategory, TaskFrequency, TaskStatus, TaskPriority } from '../types';

/**
 * Create task
 */
export async function createTask(task: {
  title: string;
  description?: string | null;
  category?: TaskCategory;
  assigned_to?: string | null;
  frequency?: TaskFrequency;
  due_date?: Date | null;
  priority?: TaskPriority;
  points?: number;
  notes?: string | null;
  created_by: string;
}): Promise<string> {
  const id = randomUUID();
  const sql = `
    INSERT INTO tasks (
      id, title, description, category, assigned_to, frequency, due_date,
      priority, points, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await query<ResultSetHeader>(sql, [
    id,
    task.title,
    task.description || null,
    task.category || 'autre',
    task.assigned_to || null,
    task.frequency || 'ponctuelle',
    task.due_date || null,
    task.priority || 'moyenne',
    task.points || 1,
    task.notes || null,
    task.created_by,
  ]);

  return id;
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  const sql = 'SELECT * FROM tasks WHERE id = ?';
  const tasks = await query<(Task & RowDataPacket)[]>(sql, [id]);
  return tasks.length > 0 ? tasks[0] : null;
}

/**
 * Get all active tasks
 */
export async function getAllActiveTasks(): Promise<Task[]> {
  const sql = `
    SELECT * FROM tasks
    WHERE status IN ('ouverte', 'assignée', 'en_cours')
    ORDER BY priority DESC, due_date ASC
  `;
  return query<(Task & RowDataPacket)[]>(sql);
}

/**
 * Get tasks by assigned user
 */
export async function getTasksByAssignedUser(userId: string): Promise<Task[]> {
  const sql = `
    SELECT * FROM tasks
    WHERE assigned_to = ?
    ORDER BY priority DESC, due_date ASC
  `;
  return query<(Task & RowDataPacket)[]>(sql, [userId]);
}

/**
 * Get tasks by status
 */
export async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
  const sql = 'SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC';
  return query<(Task & RowDataPacket)[]>(sql, [status]);
}

/**
 * Update task
 */
export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'created_by' | 'created_at' | 'updated_at'>>
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
  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Delete task
 */
export async function deleteTask(id: string): Promise<void> {
  const sql = 'DELETE FROM tasks WHERE id = ?';
  await query(sql, [id]);
}

/**
 * Mark task as completed
 */
export async function completeTask(id: string, completedBy: string): Promise<void> {
  const sql = `
    UPDATE tasks
    SET status = 'complétée', completed_by = ?, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  await query(sql, [completedBy, id]);
}

/**
 * Archive task
 */
export async function archiveTask(id: string): Promise<void> {
  const sql = 'UPDATE tasks SET status = \'archivée\' WHERE id = ?';
  await query(sql, [id]);
}
