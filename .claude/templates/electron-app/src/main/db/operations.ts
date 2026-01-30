/**
 * Database Operations (CRUD)
 */

import { db } from './sqlite';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: number;
  updated_at: number;
}

export function getUsers(): User[] {
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as User[];
}

export function getUserById(id: number): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function createUser(data: { name: string; email: string }): User {
  const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(data.name, data.email);

  const user = getUserById(result.lastInsertRowid as number);
  if (!user) {
    throw new Error('Failed to create user');
  }

  return user;
}

export function updateUser(id: number, data: Partial<{ name: string; email: string }>): void {
  const fields = Object.keys(data)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = [...Object.values(data), id];

  db.prepare(`UPDATE users SET ${fields}, updated_at = strftime('%s', 'now') WHERE id = ?`).run(...values);
}

export function deleteUser(id: number): void {
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}
