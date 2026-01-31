/**
 * Shopping Routes
 * © 2025 La Voie Shinkofa
 */

import { Router } from 'express';
import * as shoppingController from '../controllers/shopping.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import Joi from 'joi';
import { validate } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createShoppingListSchema = Joi.object({
  week_start: Joi.date().required(),
  status: Joi.string().valid('planification', 'finale', 'courses_faites').optional(),
  location: Joi.string().valid('Torre del Mar', 'Vélez-Málaga', 'autre').optional(),
  total_estimate: Joi.number().min(0).optional().allow(null),
});

const updateShoppingListSchema = Joi.object({
  status: Joi.string().valid('planification', 'finale', 'courses_faites').optional(),
  location: Joi.string().valid('Torre del Mar', 'Vélez-Málaga', 'autre').optional(),
  total_estimate: Joi.number().min(0).optional().allow(null),
});

const createShoppingItemSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  quantity: Joi.string().max(50).optional().allow(null, ''),
  unit: Joi.string().valid('piece', 'kg', 'g', 'litre', 'ml', 'paquet', 'autre').optional(),
  category: Joi.string().valid('fruits', 'legumes', 'proteines', 'produits_laitiers', 'basiques', 'autre').optional(),
  priority: Joi.string().valid('optionnel', 'souhaite', 'essentiel').optional(),
  price_estimate: Joi.number().min(0).optional().allow(null),
});

const updateShoppingItemSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  quantity: Joi.string().max(50).optional().allow(null, ''),
  unit: Joi.string().valid('piece', 'kg', 'g', 'litre', 'ml', 'paquet', 'autre').optional(),
  category: Joi.string().valid('fruits', 'legumes', 'proteines', 'produits_laitiers', 'basiques', 'autre').optional(),
  priority: Joi.string().valid('optionnel', 'souhaite', 'essentiel').optional(),
  is_checked: Joi.boolean().optional(),
  price_estimate: Joi.number().min(0).optional().allow(null),
});

const bulkCreateItemsSchema = Joi.object({
  items: Joi.array().items(createShoppingItemSchema).min(1).required(),
});

// ======================
// SHOPPING LISTS ROUTES
// ======================

/**
 * @route   POST /api/v1/shopping/lists
 * @desc    Create shopping list
 * @access  Private
 */
router.post(
  '/lists',
  validate(createShoppingListSchema),
  asyncHandler(shoppingController.createShoppingList)
);

/**
 * @route   GET /api/v1/shopping/lists
 * @desc    Get all shopping lists (optionally filter by week_start)
 * @query   week_start (optional)
 * @access  Private
 */
router.get(
  '/lists',
  asyncHandler(shoppingController.getShoppingLists)
);

/**
 * @route   GET /api/v1/shopping/lists/:id
 * @desc    Get shopping list by ID with items
 * @access  Private
 */
router.get(
  '/lists/:id',
  asyncHandler(shoppingController.getShoppingListById)
);

/**
 * @route   PATCH /api/v1/shopping/lists/:id
 * @desc    Update shopping list
 * @access  Private
 */
router.patch(
  '/lists/:id',
  validate(updateShoppingListSchema),
  asyncHandler(shoppingController.updateShoppingList)
);

/**
 * @route   DELETE /api/v1/shopping/lists/:id
 * @desc    Delete shopping list
 * @access  Private
 */
router.delete(
  '/lists/:id',
  asyncHandler(shoppingController.deleteShoppingList)
);

/**
 * @route   POST /api/v1/shopping/lists/:id/complete
 * @desc    Mark shopping list as completed
 * @access  Private
 */
router.post(
  '/lists/:id/complete',
  asyncHandler(shoppingController.completeShoppingList)
);

// ======================
// SHOPPING ITEMS ROUTES
// ======================

/**
 * @route   POST /api/v1/shopping/lists/:listId/items
 * @desc    Create shopping item
 * @access  Private
 */
router.post(
  '/lists/:listId/items',
  validate(createShoppingItemSchema),
  asyncHandler(shoppingController.createShoppingItem)
);

/**
 * @route   POST /api/v1/shopping/lists/:listId/items/bulk
 * @desc    Bulk create shopping items
 * @access  Private
 */
router.post(
  '/lists/:listId/items/bulk',
  validate(bulkCreateItemsSchema),
  asyncHandler(shoppingController.bulkCreateShoppingItems)
);

/**
 * @route   GET /api/v1/shopping/lists/:listId/items
 * @desc    Get all items for a shopping list
 * @access  Private
 */
router.get(
  '/lists/:listId/items',
  asyncHandler(shoppingController.getShoppingItems)
);

/**
 * @route   PATCH /api/v1/shopping/items/:id
 * @desc    Update shopping item
 * @access  Private
 */
router.patch(
  '/items/:id',
  validate(updateShoppingItemSchema),
  asyncHandler(shoppingController.updateShoppingItem)
);

/**
 * @route   POST /api/v1/shopping/items/:id/toggle
 * @desc    Toggle item checked status
 * @access  Private
 */
router.post(
  '/items/:id/toggle',
  asyncHandler(shoppingController.toggleItemChecked)
);

/**
 * @route   DELETE /api/v1/shopping/items/:id
 * @desc    Delete shopping item
 * @access  Private
 */
router.delete(
  '/items/:id',
  asyncHandler(shoppingController.deleteShoppingItem)
);

export default router;
