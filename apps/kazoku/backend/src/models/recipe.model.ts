/**
 * Recipe Model - Database Operations
 * © 2025 La Voie Shinkofa
 */

import { randomUUID } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { query } from '../config/database';

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: 'entree' | 'plat' | 'dessert' | 'snack' | 'boisson' | 'petit_dejeuner';
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  instructions?: string;
  image_url?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity?: string;
  unit: 'piece' | 'kg' | 'g' | 'litre' | 'ml' | 'cl' | 'cuillere_soupe' | 'cuillere_cafe' | 'tasse' | 'pincee' | 'autre';
  category: 'fruits' | 'legumes' | 'proteines' | 'produits_laitiers' | 'epicerie' | 'surgeles' | 'boissons' | 'autre';
  is_optional: boolean;
  created_at: Date;
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredient[];
}

/**
 * Create recipe
 */
export async function createRecipe(recipe: {
  name: string;
  description?: string;
  category?: Recipe['category'];
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  difficulty?: Recipe['difficulty'];
  instructions?: string;
  image_url?: string;
  created_by: string;
}): Promise<string> {
  const id = randomUUID();
  const sql = `
    INSERT INTO recipes (
      id, name, description, category, prep_time_minutes, cook_time_minutes,
      servings, difficulty, instructions, image_url, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await query<ResultSetHeader>(sql, [
    id,
    recipe.name,
    recipe.description || null,
    recipe.category || 'plat',
    recipe.prep_time_minutes || null,
    recipe.cook_time_minutes || null,
    recipe.servings || 4,
    recipe.difficulty || 'moyen',
    recipe.instructions || null,
    recipe.image_url || null,
    recipe.created_by,
  ]);

  return id;
}

/**
 * Get recipe by ID
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const sql = 'SELECT * FROM recipes WHERE id = ?';
  const recipes = await query<(Recipe & RowDataPacket)[]>(sql, [id]);
  return recipes.length > 0 ? recipes[0] : null;
}

/**
 * Get recipe with ingredients
 */
export async function getRecipeWithIngredients(id: string): Promise<RecipeWithIngredients | null> {
  const recipe = await getRecipeById(id);
  if (!recipe) return null;

  const ingredients = await getIngredientsByRecipeId(id);
  return { ...recipe, ingredients };
}

/**
 * Get all recipes
 */
export async function getAllRecipes(filters?: {
  category?: string;
  search?: string;
}): Promise<Recipe[]> {
  let sql = 'SELECT * FROM recipes WHERE 1=1';
  const params: any[] = [];

  if (filters?.category) {
    sql += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters?.search) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  sql += ' ORDER BY name ASC';

  return query<(Recipe & RowDataPacket)[]>(sql, params);
}

/**
 * Update recipe
 */
export async function updateRecipe(
  id: string,
  updates: Partial<Omit<Recipe, 'id' | 'created_by' | 'created_at' | 'updated_at'>>
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
  const sql = `UPDATE recipes SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Delete recipe
 */
export async function deleteRecipe(id: string): Promise<void> {
  const sql = 'DELETE FROM recipes WHERE id = ?';
  await query(sql, [id]);
}

/**
 * Add ingredient to recipe
 */
export async function addIngredient(ingredient: {
  recipe_id: string;
  name: string;
  quantity?: string;
  unit?: RecipeIngredient['unit'];
  category?: RecipeIngredient['category'];
  is_optional?: boolean;
}): Promise<string> {
  const id = randomUUID();
  const sql = `
    INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, category, is_optional)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  await query<ResultSetHeader>(sql, [
    id,
    ingredient.recipe_id,
    ingredient.name,
    ingredient.quantity || null,
    ingredient.unit || 'piece',
    ingredient.category || 'autre',
    ingredient.is_optional || false,
  ]);

  return id;
}

/**
 * Get ingredients by recipe ID
 */
export async function getIngredientsByRecipeId(recipeId: string): Promise<RecipeIngredient[]> {
  const sql = 'SELECT * FROM recipe_ingredients WHERE recipe_id = ? ORDER BY category, name';
  return query<(RecipeIngredient & RowDataPacket)[]>(sql, [recipeId]);
}

/**
 * Update ingredient
 */
export async function updateIngredient(
  id: string,
  updates: Partial<Omit<RecipeIngredient, 'id' | 'recipe_id' | 'created_at'>>
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
  const sql = `UPDATE recipe_ingredients SET ${fields.join(', ')} WHERE id = ?`;
  await query(sql, values);
}

/**
 * Delete ingredient
 */
export async function deleteIngredient(id: string): Promise<void> {
  const sql = 'DELETE FROM recipe_ingredients WHERE id = ?';
  await query(sql, [id]);
}

/**
 * Delete all ingredients for a recipe
 */
export async function deleteAllIngredients(recipeId: string): Promise<void> {
  const sql = 'DELETE FROM recipe_ingredients WHERE recipe_id = ?';
  await query(sql, [recipeId]);
}

/**
 * Bulk add ingredients
 */
export async function bulkAddIngredients(
  recipeId: string,
  ingredients: Array<{
    name: string;
    quantity?: string;
    unit?: RecipeIngredient['unit'];
    category?: RecipeIngredient['category'];
    is_optional?: boolean;
  }>
): Promise<void> {
  if (ingredients.length === 0) return;

  const sql = `
    INSERT INTO recipe_ingredients (id, recipe_id, name, quantity, unit, category, is_optional)
    VALUES ?
  `;

  const values = ingredients.map((ing) => [
    randomUUID(),
    recipeId,
    ing.name,
    ing.quantity || null,
    ing.unit || 'piece',
    ing.category || 'autre',
    ing.is_optional || false,
  ]);

  await query(sql, [values]);
}

/**
 * Get ingredients for multiple recipes (for shopping list generation)
 */
export async function getIngredientsForRecipes(recipeIds: string[]): Promise<RecipeIngredient[]> {
  if (recipeIds.length === 0) return [];

  const placeholders = recipeIds.map(() => '?').join(', ');
  const sql = `
    SELECT ri.*, r.name as recipe_name
    FROM recipe_ingredients ri
    JOIN recipes r ON ri.recipe_id = r.id
    WHERE ri.recipe_id IN (${placeholders})
    ORDER BY ri.category, ri.name
  `;

  return query<(RecipeIngredient & RowDataPacket & { recipe_name: string })[]>(sql, recipeIds);
}
