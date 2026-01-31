/**
 * Recipe Controller
 * © 2025 La Voie Shinkofa
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import * as RecipeModel from '../models/recipe.model';
import * as ShoppingModel from '../models/shopping.model';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';

/**
 * Create recipe
 * POST /api/v1/recipes
 */
export async function createRecipe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'Non authentifié');
  }

  const { ingredients, ...recipeData } = req.body;

  const recipeId = await RecipeModel.createRecipe({
    ...recipeData,
    created_by: req.user.userId,
  });

  // Add ingredients if provided
  if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
    await RecipeModel.bulkAddIngredients(recipeId, ingredients);
  }

  logger.info('Recipe created', { recipeId, userId: req.user.userId });

  res.status(201).json({
    success: true,
    message: 'Recette créée avec succès',
    data: { id: recipeId },
  });
}

/**
 * Get all recipes
 * GET /api/v1/recipes
 */
export async function getRecipes(req: AuthRequest, res: Response): Promise<void> {
  const { category, search } = req.query;

  const recipes = await RecipeModel.getAllRecipes({
    category: category as string,
    search: search as string,
  });

  res.json({
    success: true,
    data: recipes,
  });
}

/**
 * Get recipe by ID with ingredients
 * GET /api/v1/recipes/:id
 */
export async function getRecipeById(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const recipe = await RecipeModel.getRecipeWithIngredients(id);

  if (!recipe) {
    throw new ApiError(404, 'Recette non trouvée');
  }

  res.json({
    success: true,
    data: recipe,
  });
}

/**
 * Update recipe
 * PATCH /api/v1/recipes/:id
 */
export async function updateRecipe(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { ingredients, ...updates } = req.body;

  const recipe = await RecipeModel.getRecipeById(id);
  if (!recipe) {
    throw new ApiError(404, 'Recette non trouvée');
  }

  // Update recipe data
  if (Object.keys(updates).length > 0) {
    await RecipeModel.updateRecipe(id, updates);
  }

  // Update ingredients if provided (replace all)
  if (ingredients !== undefined) {
    await RecipeModel.deleteAllIngredients(id);
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      await RecipeModel.bulkAddIngredients(id, ingredients);
    }
  }

  logger.info('Recipe updated', { recipeId: id, updates });

  res.json({
    success: true,
    message: 'Recette mise à jour avec succès',
  });
}

/**
 * Delete recipe
 * DELETE /api/v1/recipes/:id
 */
export async function deleteRecipe(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const recipe = await RecipeModel.getRecipeById(id);
  if (!recipe) {
    throw new ApiError(404, 'Recette non trouvée');
  }

  await RecipeModel.deleteRecipe(id);

  logger.info('Recipe deleted', { recipeId: id });

  res.json({
    success: true,
    message: 'Recette supprimée avec succès',
  });
}

/**
 * Add ingredient to recipe
 * POST /api/v1/recipes/:id/ingredients
 */
export async function addIngredient(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const recipe = await RecipeModel.getRecipeById(id);
  if (!recipe) {
    throw new ApiError(404, 'Recette non trouvée');
  }

  const ingredientId = await RecipeModel.addIngredient({
    recipe_id: id,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    message: 'Ingrédient ajouté avec succès',
    data: { id: ingredientId },
  });
}

/**
 * Delete ingredient
 * DELETE /api/v1/recipes/ingredients/:id
 */
export async function deleteIngredient(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;

  await RecipeModel.deleteIngredient(id);

  res.json({
    success: true,
    message: 'Ingrédient supprimé avec succès',
  });
}

/**
 * Generate shopping list from recipes
 * POST /api/v1/recipes/generate-shopping-list
 */
export async function generateShoppingList(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError(401, 'Non authentifié');
  }

  const { recipe_ids, week_start, list_id } = req.body;

  if (!recipe_ids || !Array.isArray(recipe_ids) || recipe_ids.length === 0) {
    throw new ApiError(400, 'Liste de recettes requise');
  }

  // Get all ingredients from selected recipes
  const ingredients = await RecipeModel.getIngredientsForRecipes(recipe_ids);

  if (ingredients.length === 0) {
    throw new ApiError(400, 'Aucun ingrédient trouvé pour ces recettes');
  }

  // Aggregate ingredients by name and unit
  const aggregatedIngredients = new Map<string, {
    name: string;
    quantity: string;
    unit: string;
    category: string;
  }>();

  for (const ing of ingredients) {
    const key = `${ing.name.toLowerCase()}-${ing.unit}`;
    const existing = aggregatedIngredients.get(key);

    if (existing) {
      // Try to add quantities if numeric
      const existingQty = parseFloat(existing.quantity) || 0;
      const newQty = parseFloat(ing.quantity || '1') || 1;
      existing.quantity = String(existingQty + newQty);
    } else {
      aggregatedIngredients.set(key, {
        name: ing.name,
        quantity: ing.quantity || '1',
        unit: ing.unit,
        category: ing.category,
      });
    }
  }

  let shoppingListId = list_id;

  // Create new shopping list if not provided
  if (!shoppingListId) {
    const weekStartDate = week_start ? new Date(week_start) : new Date();
    shoppingListId = await ShoppingModel.createShoppingList({
      week_start: weekStartDate,
      status: 'planification',
      created_by: req.user.userId,
    });
  }

  // Add items to shopping list
  const items = Array.from(aggregatedIngredients.values()).map((ing) => ({
    name: ing.name,
    quantity: ing.quantity,
    unit: ing.unit as any,
    category: ing.category as any,
    priority: 'souhaite' as const,
  }));

  await ShoppingModel.bulkCreateShoppingItems(shoppingListId, items, req.user.userId);

  logger.info('Shopping list generated from recipes', {
    listId: shoppingListId,
    recipeCount: recipe_ids.length,
    itemCount: items.length,
    userId: req.user.userId,
  });

  res.status(201).json({
    success: true,
    message: `${items.length} ingrédients ajoutés à la liste de courses`,
    data: {
      list_id: shoppingListId,
      items_added: items.length,
    },
  });
}
