/**
 * Meal Controller
 * © 2025 La Voie Shinkofa
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import * as MealModel from '../models/meal.model';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';
import { checkOwnership } from '../middleware/auth';

/**
 * Create meal
 * POST /api/v1/meals
 */
export async function createMeal(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const mealData = {
      ...req.body,
      created_by: req.user.userId,
    };

    const mealId = await MealModel.createMeal(mealData);

    logger.info('Meal created', { mealId, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Repas créé avec succès',
      data: { id: mealId },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get meals by date range or week
 * GET /api/v1/meals
 * Query params: start_date, end_date OR week_start
 */
export async function getMeals(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const { start_date, end_date, week_start } = req.query;

    let meals;
    if (week_start) {
      // Get meals for specific week (filtered by user)
      const weekStartDate = new Date(week_start as string);
      meals = await MealModel.getMealsByWeek(req.user.userId, weekStartDate);
    } else if (start_date && end_date) {
      // Get meals for date range (filtered by user)
      meals = await MealModel.getMealsByDateRange(
        req.user.userId,
        new Date(start_date as string),
        new Date(end_date as string)
      );
    } else {
      // Default: get meals for current week (filtered by user)
      const today = new Date();
      const currentDayOfWeek = today.getDay();
      const daysToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - daysToMonday);
      weekStart.setHours(0, 0, 0, 0);

      meals = await MealModel.getMealsByWeek(req.user.userId, weekStart);
    }

    res.json({
      success: true,
      data: meals,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get meal by ID
 * GET /api/v1/meals/:id
 */
export async function getMealById(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const { id } = req.params;

    const meal = await MealModel.getMealById(id);

    if (!meal) {
      throw new ApiError(404, 'Repas non trouvé');
    }

    // Check ownership
    if (!checkOwnership(req.user.userId, meal.created_by, req.user.role)) {
      throw new ApiError(403, 'Accès refusé - ressource non autorisée');
    }

    res.json({
      success: true,
      data: meal,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update meal
 * PATCH /api/v1/meals/:id
 */
export async function updateMeal(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const { id } = req.params;
    const updates = req.body;

    const meal = await MealModel.getMealById(id);
    if (!meal) {
      throw new ApiError(404, 'Repas non trouvé');
    }

    // Check ownership
    if (!checkOwnership(req.user.userId, meal.created_by, req.user.role)) {
      throw new ApiError(403, 'Accès refusé - ressource non autorisée');
    }

    await MealModel.updateMeal(id, updates);

    logger.info('Meal updated', { mealId: id, updates });

    res.json({
      success: true,
      message: 'Repas mis à jour avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete meal
 * DELETE /api/v1/meals/:id
 */
export async function deleteMeal(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const { id } = req.params;

    const meal = await MealModel.getMealById(id);
    if (!meal) {
      throw new ApiError(404, 'Repas non trouvé');
    }

    // Check ownership
    if (!checkOwnership(req.user.userId, meal.created_by, req.user.role)) {
      throw new ApiError(403, 'Accès refusé - ressource non autorisée');
    }

    await MealModel.deleteMeal(id);

    logger.info('Meal deleted', { mealId: id });

    res.json({
      success: true,
      message: 'Repas supprimé avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Bulk create meals for week
 * POST /api/v1/meals/bulk
 */
export async function bulkCreateMeals(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const { meals } = req.body;

    if (!Array.isArray(meals) || meals.length === 0) {
      throw new ApiError(400, 'Liste de repas invalide');
    }

    // Add created_by to each meal
    const mealsWithCreator = meals.map(meal => ({
      ...meal,
      created_by: req.user!.userId,
    }));

    await MealModel.bulkCreateMeals(mealsWithCreator);

    logger.info('Bulk meals created', { count: meals.length, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: `${meals.length} repas créés avec succès`,
    });
  } catch (error) {
    throw error;
  }
}
