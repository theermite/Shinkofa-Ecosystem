/**
 * User Profile Model - Database Operations
 * © 2025 La Voie Shinkofa
 */

import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../config/database';
import { UserProfile, DesignHumanType, Authority } from '../types';

/**
 * Create user profile
 */
export async function createUserProfile(profile: {
  user_id: string;
  design_human_type: DesignHumanType;
  profile_line?: string | null;
  authority?: Authority | null;
  strategy?: string | null;
  focus_hours_per_day?: number;
  break_pattern?: string;
  recovery_needs?: string | null;
  special_needs?: string | null;
  notes?: string | null;
}): Promise<string> {
  const sql = `
    INSERT INTO user_profiles (
      user_id, design_human_type, profile_line, authority, strategy,
      focus_hours_per_day, break_pattern, recovery_needs, special_needs, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await query<ResultSetHeader>(sql, [
    profile.user_id,
    profile.design_human_type,
    profile.profile_line || null,
    profile.authority || null,
    profile.strategy || null,
    profile.focus_hours_per_day || 8,
    profile.break_pattern || 'Pause 15 min toutes les 2h',
    profile.recovery_needs || null,
    profile.special_needs || null,
    profile.notes || null,
  ]);

  return result.insertId.toString();
}

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const sql = 'SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1';
  const profiles = await query<(UserProfile & RowDataPacket)[]>(sql, [userId]);
  return profiles.length > 0 ? profiles[0] : null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
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

  values.push(userId);
  const sql = `UPDATE user_profiles SET ${fields.join(', ')} WHERE user_id = ?`;
  await query(sql, values);
}

/**
 * Get all user profiles
 */
export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const sql = 'SELECT * FROM user_profiles ORDER BY created_at DESC';
  return query<(UserProfile & RowDataPacket)[]>(sql);
}
