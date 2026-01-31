/**
 * Meal Routes
 * © 2025 La Voie Shinkofa
 */

import { Router } from 'express';
import * as mealController from '../controllers/meal.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import Joi from 'joi';
import { validate } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createMealSchema = Joi.object({
  date: Joi.date().required(),
  meal_type: Joi.string().valid('petit_dej', 'dejeuner', 'gouter', 'diner').required(),
  dish_name: Joi.string().max(255).optional().allow(null, ''),
  assigned_cook: Joi.string().optional().allow(null, ''),
  notes: Joi.string().optional().allow(null, ''),
  ingredients: Joi.string().optional().allow(null, ''), // JSON string
});

const updateMealSchema = Joi.object({
  dish_name: Joi.string().max(255).optional().allow(null, ''),
  assigned_cook: Joi.string().optional().allow(null, ''),
  notes: Joi.string().optional().allow(null, ''),
  ingredients: Joi.string().optional().allow(null, ''),
});

const bulkCreateMealsSchema = Joi.object({
  meals: Joi.array().items(createMealSchema.fork(['date', 'meal_type'], (schema) => schema.required())).min(1).required(),
});

/**
 * @route   POST /api/v1/meals
 * @desc    Create new meal
 * @access  Private
 */
router.post(
  '/',
  validate(createMealSchema),
  asyncHandler(mealController.createMeal)
);

/**
 * @route   POST /api/v1/meals/bulk
 * @desc    Bulk create meals for week
 * @access  Private
 */
router.post(
  '/bulk',
  validate(bulkCreateMealsSchema),
  asyncHandler(mealController.bulkCreateMeals)
);

/**
 * @route   GET /api/v1/meals
 * @desc    Get meals by date range or week
 * @query   start_date, end_date OR week_start
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(mealController.getMeals)
);

/**
 * @route   GET /api/v1/meals/:id
 * @desc    Get meal by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(mealController.getMealById)
);

/**
 * @route   PATCH /api/v1/meals/:id
 * @desc    Update meal
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateMealSchema),
  asyncHandler(mealController.updateMeal)
);

/**
 * @route   DELETE /api/v1/meals/:id
 * @desc    Delete meal
 * @access  Private
 */
router.delete(
  '/:id',
  asyncHandler(mealController.deleteMeal)
);

export default router;
