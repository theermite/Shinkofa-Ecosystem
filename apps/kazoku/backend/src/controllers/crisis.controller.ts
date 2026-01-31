/**
 * Crisis Protocol Controller
 * © 2025 La Voie Shinkofa
 */

import { Response } from 'express';
import { AuthRequest, CrisisPerson } from '../types';
import * as CrisisModel from '../models/crisis.model';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';

/**
 * Create crisis protocol
 * POST /api/v1/crisis
 */
export async function createCrisisProtocol(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const protocolData = {
      ...req.body,
      created_by: req.user.userId,
    };

    const protocolId = await CrisisModel.createCrisisProtocol(protocolData);

    logger.info('Crisis protocol created', {
      protocolId,
      person: req.body.person_name,
      crisisType: req.body.crisis_type,
      userId: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Protocole de crise créé avec succès',
      data: { id: protocolId },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get all crisis protocols or filter by person
 * GET /api/v1/crisis
 * Query: person (optional)
 */
export async function getCrisisProtocols(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { person } = req.query;

    let protocols;
    if (person) {
      const validPersons: CrisisPerson[] = ['Jay', 'Angélique', 'Gautier', 'Lyam', 'Théo', 'Evy', 'Nami'];
      if (!validPersons.includes(person as CrisisPerson)) {
        throw new ApiError(400, 'Personne invalide');
      }
      protocols = await CrisisModel.getCrisisProtocolsByPerson(person as CrisisPerson);
    } else {
      protocols = await CrisisModel.getAllCrisisProtocols();
    }

    res.json({
      success: true,
      data: protocols,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get crisis protocol by ID
 * GET /api/v1/crisis/:id
 */
export async function getCrisisProtocolById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const protocol = await CrisisModel.getCrisisProtocolById(id);

    if (!protocol) {
      throw new ApiError(404, 'Protocole de crise non trouvé');
    }

    res.json({
      success: true,
      data: protocol,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get crisis protocol by person and crisis type
 * GET /api/v1/crisis/search
 * Query: person (required), crisis_type (required)
 */
export async function getCrisisProtocolByPersonAndType(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { person, crisis_type } = req.query;

    if (!person || !crisis_type) {
      throw new ApiError(400, 'Paramètres person et crisis_type requis');
    }

    const validPersons: CrisisPerson[] = ['Jay', 'Angélique', 'Gautier', 'Lyam', 'Théo', 'Evy', 'Nami'];
    if (!validPersons.includes(person as CrisisPerson)) {
      throw new ApiError(400, 'Personne invalide');
    }

    const protocol = await CrisisModel.getCrisisProtocolByPersonAndType(
      person as CrisisPerson,
      crisis_type as any
    );

    if (!protocol) {
      throw new ApiError(404, 'Protocole de crise non trouvé pour cette personne et ce type');
    }

    res.json({
      success: true,
      data: protocol,
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update crisis protocol
 * PATCH /api/v1/crisis/:id
 */
export async function updateCrisisProtocol(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const protocol = await CrisisModel.getCrisisProtocolById(id);
    if (!protocol) {
      throw new ApiError(404, 'Protocole de crise non trouvé');
    }

    await CrisisModel.updateCrisisProtocol(id, updates);

    logger.info('Crisis protocol updated', { protocolId: id, updates });

    res.json({
      success: true,
      message: 'Protocole de crise mis à jour avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Delete crisis protocol
 * DELETE /api/v1/crisis/:id
 */
export async function deleteCrisisProtocol(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const protocol = await CrisisModel.getCrisisProtocolById(id);
    if (!protocol) {
      throw new ApiError(404, 'Protocole de crise non trouvé');
    }

    await CrisisModel.deleteCrisisProtocol(id);

    logger.info('Crisis protocol deleted', { protocolId: id });

    res.json({
      success: true,
      message: 'Protocole de crise supprimé avec succès',
    });
  } catch (error) {
    throw error;
  }
}
