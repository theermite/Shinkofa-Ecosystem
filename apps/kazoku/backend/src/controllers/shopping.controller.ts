/**
 * Shopping Controller
 * © 2025 La Voie Shinkofa
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import * as ShoppingModel from '../models/shopping.model';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';

// ======================
// SHOPPING LISTS
// ======================

/**
 * Create shopping list
 * POST /api/v1/shopping/lists
 */
export async function createShoppingList(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const listData = {
      ...req.body,
      created_by: req.user.userId,
    };

    const listId = await ShoppingModel.createShoppingList(listData);

    logger.info('Shopping list created', { listId, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Liste de courses créée avec succès',
      data: { id: listId },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get all shopping lists
 * GET /api/v1/shopping/lists
 */
export async function getShoppingLists(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { week_start } = req.query;

    let lists;
    if (week_start) {
      const list = await ShoppingModel.getShoppingListByWeek(new Date(week_start as string));
      lists = list ? [list] : [];
    } else {
      lists = await ShoppingModel.getAllShoppingLists();
    }

    res.json({
      success: true,
      data: lists,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get shopping list by ID with items
 * GET /api/v1/shopping/lists/:id
 */
export async function getShoppingListById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const list = await ShoppingModel.getShoppingListById(id);
    if (!list) {
      throw new ApiError(404, 'Liste de courses non trouvée');
    }

    // Get items for this list
    const items = await ShoppingModel.getShoppingItemsByListId(id);

    res.json({
      success: true,
      data: {
        list,
        items,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update shopping list
 * PATCH /api/v1/shopping/lists/:id
 */
export async function updateShoppingList(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const list = await ShoppingModel.getShoppingListById(id);
    if (!list) {
      throw new ApiError(404, 'Liste de courses non trouvée');
    }

    await ShoppingModel.updateShoppingList(id, updates);

    logger.info('Shopping list updated', { listId: id, updates });

    res.json({
      success: true,
      message: 'Liste de courses mise à jour avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete shopping list
 * DELETE /api/v1/shopping/lists/:id
 */
export async function deleteShoppingList(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const list = await ShoppingModel.getShoppingListById(id);
    if (!list) {
      throw new ApiError(404, 'Liste de courses non trouvée');
    }

    await ShoppingModel.deleteShoppingList(id);

    logger.info('Shopping list deleted', { listId: id });

    res.json({
      success: true,
      message: 'Liste de courses supprimée avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Complete shopping list
 * POST /api/v1/shopping/lists/:id/complete
 */
export async function completeShoppingList(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const { id } = req.params;

    const list = await ShoppingModel.getShoppingListById(id);
    if (!list) {
      throw new ApiError(404, 'Liste de courses non trouvée');
    }

    await ShoppingModel.completeShoppingList(id, req.user.userId);

    logger.info('Shopping list completed', { listId: id, completedBy: req.user.userId });

    res.json({
      success: true,
      message: 'Courses complétées avec succès',
    });
  } catch (error) {
    throw error;
  }
}

// ======================
// SHOPPING ITEMS
// ======================

/**
 * Create shopping item
 * POST /api/v1/shopping/lists/:listId/items
 */
export async function createShoppingItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const { listId } = req.params;

    // Verify list exists
    const list = await ShoppingModel.getShoppingListById(listId);
    if (!list) {
      throw new ApiError(404, 'Liste de courses non trouvée');
    }

    const itemData = {
      ...req.body,
      shopping_list_id: listId,
      added_by: req.user.userId,
    };

    const itemId = await ShoppingModel.createShoppingItem(itemData);

    logger.info('Shopping item created', { itemId, listId, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Article ajouté avec succès',
      data: { id: itemId },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get all items for a list
 * GET /api/v1/shopping/lists/:listId/items
 */
export async function getShoppingItems(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { listId } = req.params;

    // Verify list exists
    const list = await ShoppingModel.getShoppingListById(listId);
    if (!list) {
      throw new ApiError(404, 'Liste de courses non trouvée');
    }

    const items = await ShoppingModel.getShoppingItemsByListId(listId);

    res.json({
      success: true,
      data: items,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update shopping item
 * PATCH /api/v1/shopping/items/:id
 */
export async function updateShoppingItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await ShoppingModel.getShoppingItemById(id);
    if (!item) {
      throw new ApiError(404, 'Article non trouvé');
    }

    await ShoppingModel.updateShoppingItem(id, updates);

    logger.info('Shopping item updated', { itemId: id, updates });

    res.json({
      success: true,
      message: 'Article mis à jour avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Toggle item checked status
 * POST /api/v1/shopping/items/:id/toggle
 */
export async function toggleItemChecked(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const item = await ShoppingModel.getShoppingItemById(id);
    if (!item) {
      throw new ApiError(404, 'Article non trouvé');
    }

    await ShoppingModel.toggleItemChecked(id);

    logger.info('Shopping item toggled', { itemId: id });

    res.json({
      success: true,
      message: 'Statut article modifié avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete shopping item
 * DELETE /api/v1/shopping/items/:id
 */
export async function deleteShoppingItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const item = await ShoppingModel.getShoppingItemById(id);
    if (!item) {
      throw new ApiError(404, 'Article non trouvé');
    }

    await ShoppingModel.deleteShoppingItem(id);

    logger.info('Shopping item deleted', { itemId: id });

    res.json({
      success: true,
      message: 'Article supprimé avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Bulk create shopping items
 * POST /api/v1/shopping/lists/:listId/items/bulk
 */
export async function bulkCreateShoppingItems(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const { listId } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Liste d\'articles invalide');
    }

    // Verify list exists
    const list = await ShoppingModel.getShoppingListById(listId);
    if (!list) {
      throw new ApiError(404, 'Liste de courses non trouvée');
    }

    await ShoppingModel.bulkCreateShoppingItems(listId, items, req.user!.userId);

    logger.info('Bulk shopping items created', { count: items.length, listId, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: `${items.length} articles ajoutés avec succès`,
    });
  } catch (error) {
    throw error;
  }
}
