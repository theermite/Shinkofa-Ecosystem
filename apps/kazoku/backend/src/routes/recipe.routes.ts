/**
 * Recipe Routes
 * © 2025 La Voie Shinkofa
 */

import { Router } from 'express';
import * as recipeController from '../controllers/recipe.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import Joi from 'joi';
import { validate } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const ingredientSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  quantity: Joi.string().max(50).optional().allow(null, ''),
  unit: Joi.string().valid(
    'piece', 'kg', 'g', 'litre', 'ml', 'cl',
    'cuillere_soupe', 'cuillere_cafe', 'tasse', 'pincee', 'autre'
  ).optional(),
  category: Joi.string().valid(
    'fruits', 'legumes', 'proteines', 'produits_laitiers',
    'epicerie', 'surgeles', 'boissons', 'autre'
  ).optional(),
  is_optional: Joi.boolean().optional(),
});

const createRecipeSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().optional().allow(null, ''),
  category: Joi.string().valid(
    'entree', 'plat', 'dessert', 'snack', 'boisson', 'petit_dejeuner'
  ).optional(),
  prep_time_minutes: Joi.number().min(0).max(1440).optional().allow(null),
  cook_time_minutes: Joi.number().min(0).max(1440).optional().allow(null),
  servings: Joi.number().min(1).max(100).optional(),
  difficulty: Joi.string().valid('facile', 'moyen', 'difficile').optional(),
  instructions: Joi.string().optional().allow(null, ''),
  image_url: Joi.string().uri().max(500).optional().allow(null, ''),
  ingredients: Joi.array().items(ingredientSchema).optional(),
});

const updateRecipeSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().optional().allow(null, ''),
  category: Joi.string().valid(
    'entree', 'plat', 'dessert', 'snack', 'boisson', 'petit_dejeuner'
  ).optional(),
  prep_time_minutes: Joi.number().min(0).max(1440).optional().allow(null),
  cook_time_minutes: Joi.number().min(0).max(1440).optional().allow(null),
  servings: Joi.number().min(1).max(100).optional(),
  difficulty: Joi.string().valid('facile', 'moyen', 'difficile').optional(),
  instructions: Joi.string().optional().allow(null, ''),
  image_url: Joi.string().uri().max(500).optional().allow(null, ''),
  ingredients: Joi.array().items(ingredientSchema).optional(),
});

const generateShoppingListSchema = Joi.object({
  recipe_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  week_start: Joi.date().optional(),
  list_id: Joi.string().uuid().optional(),
});

/**
 * @route   POST /api/v1/recipes
 * @desc    Create new recipe
 * @access  Private
 */
router.post(
  '/',
  validate(createRecipeSchema),
  asyncHandler(recipeController.createRecipe)
);

/**
 * @route   GET /api/v1/recipes
 * @desc    Get all recipes
 * @query   category, search
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(recipeController.getRecipes)
);

/**
 * @route   POST /api/v1/recipes/generate-shopping-list
 * @desc    Generate shopping list from recipes
 * @access  Private
 */
router.post(
  '/generate-shopping-list',
  validate(generateShoppingListSchema),
  asyncHandler(recipeController.generateShoppingList)
);

/**
 * @route   GET /api/v1/recipes/:id
 * @desc    Get recipe by ID with ingredients
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(recipeController.getRecipeById)
);

/**
 * @route   PATCH /api/v1/recipes/:id
 * @desc    Update recipe
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateRecipeSchema),
  asyncHandler(recipeController.updateRecipe)
);

/**
 * @route   DELETE /api/v1/recipes/:id
 * @desc    Delete recipe
 * @access  Private
 */
router.delete(
  '/:id',
  asyncHandler(recipeController.deleteRecipe)
);

/**
 * @route   POST /api/v1/recipes/:id/ingredients
 * @desc    Add ingredient to recipe
 * @access  Private
 */
router.post(
  '/:id/ingredients',
  validate(ingredientSchema),
  asyncHandler(recipeController.addIngredient)
);

/**
 * @route   DELETE /api/v1/recipes/ingredients/:id
 * @desc    Delete ingredient
 * @access  Private
 */
router.delete(
  '/ingredients/:id',
  asyncHandler(recipeController.deleteIngredient)
);

export default router;
