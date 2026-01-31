/**
 * Shopping Model - Database Operations
 * © 2025 La Voie Shinkofa
 */

import { randomUUID } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../config/database';
import { ShoppingList, ShoppingItem, ShoppingStatus } from '../types';

// ======================
// SHOPPING LISTS
// ======================

/**
 * Create shopping list
 */
export async function createShoppingList(list: {
  week_start: Date;
  status?: ShoppingStatus;
  location?: string;
  total_estimate?: number | null;
  created_by: string;
}): Promise<string> {
  const id = randomUUID();
  const sql = `
    INSERT INTO shopping_lists (
      id, week_start, status, location, total_estimate, created_by
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  await query<ResultSetHeader>(sql, [
    id,
    list.week_start,
    list.status || 'planification',
    list.location || 'Torre del Mar',
    list.total_estimate || null,
    list.created_by,
  ]);

  return id;
}

/**
 * Get shopping list by ID
 */
export async function getShoppingListById(id: string): Promise<ShoppingList | null> {
  const sql = 'SELECT * FROM shopping_lists WHERE id = ?';
  const lists = await query<(ShoppingList & RowDataPacket)[]>(sql, [id]);
  return lists.length > 0 ? lists[0] : null;
}

/**
 * Get shopping list by week start
 */
export async function getShoppingListByWeek(weekStart: Date): Promise<ShoppingList | null> {
  const sql = 'SELECT * FROM shopping_lists WHERE week_start = ? LIMIT 1';
  const lists = await query<(ShoppingList & RowDataPacket)[]>(sql, [weekStart]);
  return lists.length > 0 ? lists[0] : null;
}

/**
 * Get all shopping lists
 */
export async function getAllShoppingLists(): Promise<ShoppingList[]> {
  const sql = 'SELECT * FROM shopping_lists ORDER BY week_start DESC';
  return query<(ShoppingList & RowDataPacket)[]>(sql);
}

/**
 * Update shopping list
 */
export async function updateShoppingList(
  id: string,
  updates: Partial<Omit<ShoppingList, 'id' | 'created_by' | 'created_at' | 'updated_at'>>
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
  const sql = `UPDATE shopping_lists SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Delete shopping list
 */
export async function deleteShoppingList(id: string): Promise<void> {
  const sql = 'DELETE FROM shopping_lists WHERE id = ?';
  await query(sql, [id]);
}

/**
 * Complete shopping list
 */
export async function completeShoppingList(id: string, completedBy: string): Promise<void> {
  const sql = `
    UPDATE shopping_lists
    SET status = 'courses_faites', completed_by = ?, completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  await query(sql, [completedBy, id]);
}

// ======================
// SHOPPING ITEMS
// ======================

/**
 * Create shopping item
 */
export async function createShoppingItem(item: {
  shopping_list_id: string;
  name: string;
  quantity?: string | null;
  unit?: string;
  category?: string;
  priority?: string;
  price_estimate?: number | null;
  added_by: string;
}): Promise<string> {
  const id = randomUUID();
  const sql = `
    INSERT INTO shopping_items (
      id, shopping_list_id, name, quantity, unit, category, priority, price_estimate, added_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await query<ResultSetHeader>(sql, [
    id,
    item.shopping_list_id,
    item.name,
    item.quantity || null,
    item.unit || 'pièce',
    item.category || 'autre',
    item.priority || 'souhaité',
    item.price_estimate || null,
    item.added_by,
  ]);

  return id;
}

/**
 * Get shopping item by ID
 */
export async function getShoppingItemById(id: string): Promise<ShoppingItem | null> {
  const sql = 'SELECT * FROM shopping_items WHERE id = ?';
  const items = await query<(ShoppingItem & RowDataPacket)[]>(sql, [id]);
  return items.length > 0 ? items[0] : null;
}

/**
 * Get all items for a shopping list
 */
export async function getShoppingItemsByListId(listId: string): Promise<ShoppingItem[]> {
  const sql = `
    SELECT * FROM shopping_items
    WHERE shopping_list_id = ?
    ORDER BY
      CASE priority
        WHEN 'essentiel' THEN 1
        WHEN 'souhaité' THEN 2
        WHEN 'optionnel' THEN 3
      END ASC,
      category ASC,
      name ASC
  `;
  return query<(ShoppingItem & RowDataPacket)[]>(sql, [listId]);
}

/**
 * Update shopping item
 */
export async function updateShoppingItem(
  id: string,
  updates: Partial<Omit<ShoppingItem, 'id' | 'shopping_list_id' | 'added_by' | 'created_at' | 'updated_at'>>
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
  const sql = `UPDATE shopping_items SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Toggle item checked status
 */
export async function toggleItemChecked(id: string): Promise<void> {
  const sql = 'UPDATE shopping_items SET is_checked = NOT is_checked WHERE id = ?';
  await query(sql, [id]);
}

/**
 * Delete shopping item
 */
export async function deleteShoppingItem(id: string): Promise<void> {
  const sql = 'DELETE FROM shopping_items WHERE id = ?';
  await query(sql, [id]);
}

/**
 * Bulk create shopping items
 */
export async function bulkCreateShoppingItems(
  listId: string,
  items: Array<{
    name: string;
    quantity?: string | null;
    unit?: string;
    category?: string;
    priority?: string;
    price_estimate?: number | null;
  }>,
  addedBy: string
): Promise<void> {
  if (items.length === 0) return;

  const sql = `
    INSERT INTO shopping_items (
      id, shopping_list_id, name, quantity, unit, category, priority, price_estimate, added_by
    ) VALUES ?
  `;

  const values = items.map(item => [
    randomUUID(),
    listId,
    item.name,
    item.quantity || null,
    item.unit || 'piece',
    item.category || 'autre',
    item.priority || 'souhaite',
    item.price_estimate || null,
    addedBy,
  ]);

  await query(sql, [values]);
}
