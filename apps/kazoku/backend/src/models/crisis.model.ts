/**
 * Crisis Protocol Model - Database Operations
 * © 2025 La Voie Shinkofa
 */

import { randomUUID } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../config/database';
import { CrisisProtocol, CrisisPerson, CrisisType } from '../types';

/**
 * Create crisis protocol
 */
export async function createCrisisProtocol(protocol: {
  person_name: CrisisPerson;
  design_human_type?: string | null;
  crisis_type: CrisisType;
  trigger_recognition?: string | null;
  immediate_response?: string | null;
  escalation_step1?: string | null;
  escalation_step2?: string | null;
  escalation_step3?: string | null;
  support_needs?: string | null;
  tools_available?: string | null;
  what_to_avoid?: string | null;
  recovery?: string | null;
  notes?: string | null;
  created_by: string;
}): Promise<string> {
  const id = randomUUID();
  const sql = `
    INSERT INTO crisis_protocols (
      id, person_name, design_human_type, crisis_type, trigger_recognition,
      immediate_response, escalation_step1, escalation_step2, escalation_step3,
      support_needs, tools_available, what_to_avoid, recovery, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await query<ResultSetHeader>(sql, [
    id,
    protocol.person_name,
    protocol.design_human_type || null,
    protocol.crisis_type,
    protocol.trigger_recognition || null,
    protocol.immediate_response || null,
    protocol.escalation_step1 || null,
    protocol.escalation_step2 || null,
    protocol.escalation_step3 || null,
    protocol.support_needs || null,
    protocol.tools_available || null,
    protocol.what_to_avoid || null,
    protocol.recovery || null,
    protocol.notes || null,
    protocol.created_by,
  ]);

  return id;
}

/**
 * Get crisis protocol by ID
 */
export async function getCrisisProtocolById(id: string): Promise<CrisisProtocol | null> {
  const sql = 'SELECT * FROM crisis_protocols WHERE id = ?';
  const protocols = await query<(CrisisProtocol & RowDataPacket)[]>(sql, [id]);
  return protocols.length > 0 ? protocols[0] : null;
}

/**
 * Get all crisis protocols for a person
 */
export async function getCrisisProtocolsByPerson(person: CrisisPerson): Promise<CrisisProtocol[]> {
  const sql = `
    SELECT * FROM crisis_protocols
    WHERE person_name = ?
    ORDER BY crisis_type ASC
  `;
  return query<(CrisisProtocol & RowDataPacket)[]>(sql, [person]);
}

/**
 * Get crisis protocol by person and crisis type
 */
export async function getCrisisProtocolByPersonAndType(
  person: CrisisPerson,
  crisisType: CrisisType
): Promise<CrisisProtocol | null> {
  const sql = `
    SELECT * FROM crisis_protocols
    WHERE person_name = ? AND crisis_type = ?
    LIMIT 1
  `;
  const protocols = await query<(CrisisProtocol & RowDataPacket)[]>(sql, [person, crisisType]);
  return protocols.length > 0 ? protocols[0] : null;
}

/**
 * Get all crisis protocols
 */
export async function getAllCrisisProtocols(): Promise<CrisisProtocol[]> {
  const sql = `
    SELECT * FROM crisis_protocols
    ORDER BY person_name ASC, crisis_type ASC
  `;
  return query<(CrisisProtocol & RowDataPacket)[]>(sql);
}

/**
 * Update crisis protocol
 */
export async function updateCrisisProtocol(
  id: string,
  updates: Partial<Omit<CrisisProtocol, 'id' | 'created_by' | 'created_at' | 'updated_at'>>
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
  const sql = `UPDATE crisis_protocols SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Delete crisis protocol
 */
export async function deleteCrisisProtocol(id: string): Promise<void> {
  const sql = 'DELETE FROM crisis_protocols WHERE id = ?';
  await query(sql, [id]);
}
