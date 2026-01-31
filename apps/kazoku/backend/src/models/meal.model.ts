/**
 * Meal Model - Database Operations
 * © 2025 La Voie Shinkofa
 */

import { randomUUID } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../config/database';
import { Meal, MealType } from '../types';

/**
 * Create meal
 */
export async function createMeal(meal: {
  date: Date;
  meal_type: MealType;
  dish_name?: string | null;
  assigned_cook?: string | null;
  notes?: string | null;
  ingredients?: string | null;
  created_by: string;
}): Promise<string> {
  const id = randomUUID();
  const sql = `
    INSERT INTO meals (
      id, date, meal_type, dish_name, assigned_cook, notes, ingredients, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      dish_name = VALUES(dish_name),
      assigned_cook = VALUES(assigned_cook),
      notes = VALUES(notes),
      ingredients = VALUES(ingredients)
  `;

  await query<ResultSetHeader>(sql, [
    id,
    meal.date,
    meal.meal_type,
    meal.dish_name || null,
    meal.assigned_cook || null,
    meal.notes || null,
    meal.ingredients || null,
    meal.created_by,
  ]);

  // If duplicate, get existing ID, otherwise use new ID
  const existingMeal = await getMealByDateAndType(meal.date, meal.meal_type);
  return existingMeal?.id || id;
}

/**
 * Get meal by ID
 */
export async function getMealById(id: string): Promise<Meal | null> {
  const sql = 'SELECT * FROM meals WHERE id = ?';
  const meals = await query<(Meal & RowDataPacket)[]>(sql, [id]);
  return meals.length > 0 ? meals[0] : null;
}

/**
 * Get meals by date range
 */
export async function getMealsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Meal[]> {
  const sql = `
    SELECT * FROM meals
    WHERE date >= ? AND date <= ?
    ORDER BY date ASC,
      CASE meal_type
        WHEN 'petit_déj' THEN 1
        WHEN 'déjeuner' THEN 2
        WHEN 'goûter' THEN 3
        WHEN 'dîner' THEN 4
      END ASC
  `;
  return query<(Meal & RowDataPacket)[]>(sql, [startDate, endDate]);
}

/**
 * Get meals by week (start of week = Monday)
 */
export async function getMealsByWeek(weekStart: Date): Promise<Meal[]> {
  const sql = `
    SELECT * FROM meals
    WHERE date >= ? AND date < DATE_ADD(?, INTERVAL 7 DAY)
    ORDER BY date ASC,
      CASE meal_type
        WHEN 'petit_déj' THEN 1
        WHEN 'déjeuner' THEN 2
        WHEN 'goûter' THEN 3
        WHEN 'dîner' THEN 4
      END ASC
  `;
  return query<(Meal & RowDataPacket)[]>(sql, [weekStart, weekStart]);
}

/**
 * Get meal by date and type
 */
export async function getMealByDateAndType(
  date: Date,
  mealType: MealType
): Promise<Meal | null> {
  const sql = 'SELECT * FROM meals WHERE date = ? AND meal_type = ? LIMIT 1';
  const meals = await query<(Meal & RowDataPacket)[]>(sql, [date, mealType]);
  return meals.length > 0 ? meals[0] : null;
}

/**
 * Update meal
 */
export async function updateMeal(
  id: string,
  updates: Partial<Omit<Meal, 'id' | 'created_by' | 'created_at' | 'updated_at'>>
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
  const sql = `UPDATE meals SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Delete meal
 */
export async function deleteMeal(id: string): Promise<void> {
  const sql = 'DELETE FROM meals WHERE id = ?';
  await query(sql, [id]);
}

/**
 * Bulk create meals for week
 */
export async function bulkCreateMeals(meals: Array<{
  date: Date;
  meal_type: MealType;
  dish_name?: string | null;
  assigned_cook?: string | null;
  notes?: string | null;
  ingredients?: string | null;
  created_by: string;
}>): Promise<void> {
  if (meals.length === 0) return;

  const sql = `
    INSERT INTO meals (
      date, meal_type, dish_name, assigned_cook, notes, ingredients, created_by
    ) VALUES ?
    ON DUPLICATE KEY UPDATE
      dish_name = VALUES(dish_name),
      assigned_cook = VALUES(assigned_cook),
      notes = VALUES(notes),
      ingredients = VALUES(ingredients)
  `;

  const values = meals.map(meal => [
    meal.date,
    meal.meal_type,
    meal.dish_name || null,
    meal.assigned_cook || null,
    meal.notes || null,
    meal.ingredients || null,
    meal.created_by,
  ]);

  await query(sql, [values]);
}
