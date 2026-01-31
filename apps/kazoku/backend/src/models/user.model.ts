/**
 * User Model - Database Operations
 * © 2025 La Voie Shinkofa
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../config/database';
import { User, UserProfile } from '../types';

/**
 * Find user by email
 */
export async function findUserByEmail(
  email: string
): Promise<User | null> {
  const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE LIMIT 1';
  const users = await query<(User & RowDataPacket)[]>(sql, [email]);
  return users.length > 0 ? users[0] : null;
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const sql = 'SELECT * FROM users WHERE id = ? AND is_active = TRUE LIMIT 1';
  const users = await query<(User & RowDataPacket)[]>(sql, [id]);
  return users.length > 0 ? users[0] : null;
}

/**
 * Create new user
 */
export async function createUser(
  email: string,
  passwordHash: string,
  name: string,
  role: string = 'contributor',
  avatarColor: string = '#4285f4'
): Promise<string> {
  const sql = `
    INSERT INTO users (email, password_hash, name, role, avatar_color)
    VALUES (?, ?, ?, ?, ?)
  `;

  const result = await query<ResultSetHeader>(sql, [
    email,
    passwordHash,
    name,
    role,
    avatarColor,
  ]);

  return result.insertId.toString();
}

/**
 * Update user last login
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
  await query(sql, [userId]);
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'email' | 'avatar_color'>>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.email) {
    fields.push('email = ?');
    values.push(updates.email);
  }
  if (updates.avatar_color) {
    fields.push('avatar_color = ?');
    values.push(updates.avatar_color);
  }

  if (fields.length === 0) return;

  values.push(userId);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Get user with profile
 */
export async function getUserWithProfile(userId: string): Promise<{
  user: User;
  profile: UserProfile | null;
} | null> {
  const user = await findUserById(userId);
  if (!user) return null;

  const profileSql = 'SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1';
  const profiles = await query<(UserProfile & RowDataPacket)[]>(profileSql, [userId]);

  return {
    user,
    profile: profiles.length > 0 ? profiles[0] : null,
  };
}

/**
 * Get all active users
 */
export async function getAllUsers(): Promise<User[]> {
  const sql = `
    SELECT id, email, name, role, avatar_color, created_at, last_login
    FROM users
    WHERE is_active = TRUE
    ORDER BY name ASC
  `;
  return query<(User & RowDataPacket)[]>(sql);
}

/**
 * Update user password hash
 */
export async function updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
  const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
  await query(sql, [passwordHash, userId]);
}

/**
 * Deactivate user (soft delete)
 */
export async function deactivateUser(userId: string): Promise<void> {
  const sql = 'UPDATE users SET is_active = FALSE WHERE id = ?';
  await query(sql, [userId]);
}
