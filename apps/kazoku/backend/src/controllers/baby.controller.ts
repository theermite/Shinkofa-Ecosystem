/**
 * Baby Tracking Controller
 * © 2025 La Voie Shinkofa
 */

import { Response } from 'express';
import { AuthRequest, Enfant, BienEtreEnfant } from '../types';
import * as BabyModel from '../models/baby.model';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';

// ======================
// REPAS LOGS
// ======================

/**
 * Create repas log
 * POST /api/v1/baby/repas
 */
export async function createRepasLog(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const logData = {
      ...req.body,
      logged_by: req.user.userId,
    };

    const logId = await BabyModel.createRepasLog(logData);

    logger.info('Repas log created', { logId, enfant: req.body.enfant, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Repas enregistré avec succès',
      data: { id: logId },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get repas logs
 * GET /api/v1/baby/repas
 * Query: enfant (required), start_date, end_date, today
 */
export async function getRepasLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { enfant, start_date, end_date, today } = req.query;

    if (!enfant || (enfant !== 'Evy' && enfant !== 'Nami')) {
      throw new ApiError(400, 'Paramètre enfant requis (Evy ou Nami)');
    }

    let logs;
    if (today === 'true') {
      logs = await BabyModel.getTodayRepasLogs(enfant as Enfant);
    } else if (start_date && end_date) {
      logs = await BabyModel.getRepasLogsByDateRange(
        enfant as Enfant,
        new Date(start_date as string),
        new Date(end_date as string)
      );
    } else {
      // Default: last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      logs = await BabyModel.getRepasLogsByDateRange(enfant as Enfant, startDate, endDate);
    }

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update repas log
 * PATCH /api/v1/baby/repas/:id
 */
export async function updateRepasLog(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const log = await BabyModel.getRepasLogById(id);
    if (!log) {
      throw new ApiError(404, 'Log repas non trouvé');
    }

    await BabyModel.updateRepasLog(id, updates);

    logger.info('Repas log updated', { logId: id, updates });

    res.json({
      success: true,
      message: 'Log repas mis à jour avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete repas log
 * DELETE /api/v1/baby/repas/:id
 */
export async function deleteRepasLog(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const log = await BabyModel.getRepasLogById(id);
    if (!log) {
      throw new ApiError(404, 'Log repas non trouvé');
    }

    await BabyModel.deleteRepasLog(id);

    logger.info('Repas log deleted', { logId: id });

    res.json({
      success: true,
      message: 'Log repas supprimé avec succès',
    });
  } catch (error) {
    throw error;
  }
}

// ======================
// COUCHE LOGS
// ======================

/**
 * Create couche log
 * POST /api/v1/baby/couches
 */
export async function createCoucheLog(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const logData = {
      ...req.body,
      changed_by: req.user.userId,
    };

    const logId = await BabyModel.createCoucheLog(logData);

    logger.info('Couche log created', { logId, enfant: req.body.enfant, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Couche enregistrée avec succès',
      data: { id: logId },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get couche logs
 * GET /api/v1/baby/couches
 * Query: enfant (required), start_date, end_date, today
 */
export async function getCoucheLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { enfant, start_date, end_date, today } = req.query;

    if (!enfant || (enfant !== 'Evy' && enfant !== 'Nami')) {
      throw new ApiError(400, 'Paramètre enfant requis (Evy ou Nami)');
    }

    let logs;
    if (today === 'true') {
      logs = await BabyModel.getTodayCoucheLogs(enfant as Enfant);
    } else if (start_date && end_date) {
      logs = await BabyModel.getCoucheLogsByDateRange(
        enfant as Enfant,
        new Date(start_date as string),
        new Date(end_date as string)
      );
    } else {
      // Default: last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      logs = await BabyModel.getCoucheLogsByDateRange(enfant as Enfant, startDate, endDate);
    }

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete couche log
 * DELETE /api/v1/baby/couches/:id
 */
export async function deleteCoucheLog(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const log = await BabyModel.getCoucheLogById(id);
    if (!log) {
      throw new ApiError(404, 'Log couche non trouvé');
    }

    await BabyModel.deleteCoucheLog(id);

    logger.info('Couche log deleted', { logId: id });

    res.json({
      success: true,
      message: 'Log couche supprimé avec succès',
    });
  } catch (error) {
    throw error;
  }
}

// ======================
// BIEN-ÊTRE LOGS
// ======================

/**
 * Create bien-être log
 * POST /api/v1/baby/bien-etre
 */
export async function createBienEtreLog(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const logData = {
      ...req.body,
      added_by: req.user.userId,
    };

    const logId = await BabyModel.createBienEtreLog(logData);

    logger.info('Bien-être log created', { logId, enfant: req.body.enfant, userId: req.user.userId });

    res.status(201).json({
      success: true,
      message: 'Note bien-être enregistrée avec succès',
      data: { id: logId },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get bien-être logs
 * GET /api/v1/baby/bien-etre
 * Query: enfant (required), start_date, end_date
 */
export async function getBienEtreLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { enfant, start_date, end_date } = req.query;

    const validChildren: BienEtreEnfant[] = ['Lyam', 'Théo', 'Evy', 'Nami'];
    if (!enfant || !validChildren.includes(enfant as BienEtreEnfant)) {
      throw new ApiError(400, 'Paramètre enfant requis (Lyam, Théo, Evy ou Nami)');
    }

    let logs;
    if (start_date && end_date) {
      logs = await BabyModel.getBienEtreLogsByDateRange(
        enfant as BienEtreEnfant,
        new Date(start_date as string),
        new Date(end_date as string)
      );
    } else {
      logs = await BabyModel.getBienEtreLogsByChild(enfant as BienEtreEnfant);
    }

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete bien-être log
 * DELETE /api/v1/baby/bien-etre/:id
 */
export async function deleteBienEtreLog(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const log = await BabyModel.getBienEtreLogById(id);
    if (!log) {
      throw new ApiError(404, 'Note bien-être non trouvée');
    }

    await BabyModel.deleteBienEtreLog(id);

    logger.info('Bien-être log deleted', { logId: id });

    res.json({
      success: true,
      message: 'Note bien-être supprimée avec succès',
    });
  } catch (error) {
    throw error;
  }
}
