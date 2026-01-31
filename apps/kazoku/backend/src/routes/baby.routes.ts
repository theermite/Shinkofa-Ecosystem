/**
 * Baby Tracking Routes
 * © 2025 La Voie Shinkofa
 */

import { Router } from 'express';
import * as babyController from '../controllers/baby.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import Joi from 'joi';
import { validate } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createRepasLogSchema = Joi.object({
  date: Joi.date().required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  enfant: Joi.string().valid('Evy', 'Nami').required(),
  type: Joi.string().valid('biberon', 'repas').required(),
  quantite_ml: Joi.number().min(0).max(500).when('type', {
    is: 'biberon',
    then: Joi.required(),
    otherwise: Joi.optional().allow(null),
  }),
  taille_assiette: Joi.string().valid('petite', 'moyenne', 'grande').when('type', {
    is: 'repas',
    then: Joi.optional(),
    otherwise: Joi.optional().allow(null),
  }),
  duration_minutes: Joi.number().min(0).max(120).optional().allow(null),
  notes: Joi.string().optional().allow(null, ''),
});

const updateRepasLogSchema = Joi.object({
  quantite_ml: Joi.number().min(0).max(500).optional().allow(null),
  taille_assiette: Joi.string().valid('petite', 'moyenne', 'grande').optional().allow(null),
  duration_minutes: Joi.number().min(0).max(120).optional().allow(null),
  notes: Joi.string().optional().allow(null, ''),
});

const createCoucheLogSchema = Joi.object({
  date: Joi.date().required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  enfant: Joi.string().valid('Evy', 'Nami').required(),
  type: Joi.string().valid('pipi', 'caca', 'mixte').required(),
  notes: Joi.string().optional().allow(null, ''),
});

const createBienEtreLogSchema = Joi.object({
  date: Joi.date().required(),
  enfant: Joi.string().valid('Lyam', 'Theo', 'Evy', 'Nami').required(),
  category: Joi.string()
    .valid('sante', 'sommeil', 'comportement', 'developpement', 'humeur', 'allergie', 'autre')
    .required(),
  observation: Joi.string().min(1).required(),
});

// ======================
// REPAS ROUTES
// ======================

/**
 * @route   POST /api/v1/baby/repas
 * @desc    Create repas log
 * @access  Private
 */
router.post(
  '/repas',
  validate(createRepasLogSchema),
  asyncHandler(babyController.createRepasLog)
);

/**
 * @route   GET /api/v1/baby/repas
 * @desc    Get repas logs (query: enfant, start_date, end_date, today)
 * @access  Private
 */
router.get(
  '/repas',
  asyncHandler(babyController.getRepasLogs)
);

/**
 * @route   PATCH /api/v1/baby/repas/:id
 * @desc    Update repas log
 * @access  Private
 */
router.patch(
  '/repas/:id',
  validate(updateRepasLogSchema),
  asyncHandler(babyController.updateRepasLog)
);

/**
 * @route   DELETE /api/v1/baby/repas/:id
 * @desc    Delete repas log
 * @access  Private
 */
router.delete(
  '/repas/:id',
  asyncHandler(babyController.deleteRepasLog)
);

// ======================
// COUCHES ROUTES
// ======================

/**
 * @route   POST /api/v1/baby/couches
 * @desc    Create couche log
 * @access  Private
 */
router.post(
  '/couches',
  validate(createCoucheLogSchema),
  asyncHandler(babyController.createCoucheLog)
);

/**
 * @route   GET /api/v1/baby/couches
 * @desc    Get couche logs (query: enfant, start_date, end_date, today)
 * @access  Private
 */
router.get(
  '/couches',
  asyncHandler(babyController.getCoucheLogs)
);

/**
 * @route   DELETE /api/v1/baby/couches/:id
 * @desc    Delete couche log
 * @access  Private
 */
router.delete(
  '/couches/:id',
  asyncHandler(babyController.deleteCoucheLog)
);

// ======================
// BIEN-ÊTRE ROUTES
// ======================

/**
 * @route   POST /api/v1/baby/bien-etre
 * @desc    Create bien-être log
 * @access  Private
 */
router.post(
  '/bien-etre',
  validate(createBienEtreLogSchema),
  asyncHandler(babyController.createBienEtreLog)
);

/**
 * @route   GET /api/v1/baby/bien-etre
 * @desc    Get bien-être logs (query: enfant, start_date, end_date)
 * @access  Private
 */
router.get(
  '/bien-etre',
  asyncHandler(babyController.getBienEtreLogs)
);

/**
 * @route   DELETE /api/v1/baby/bien-etre/:id
 * @desc    Delete bien-être log
 * @access  Private
 */
router.delete(
  '/bien-etre/:id',
  asyncHandler(babyController.deleteBienEtreLog)
);

export default router;
