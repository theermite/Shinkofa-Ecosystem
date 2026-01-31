/**
 * Crisis Protocol Routes
 * © 2025 La Voie Shinkofa
 */

import { Router } from 'express';
import * as crisisController from '../controllers/crisis.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import Joi from 'joi';
import { validate } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createCrisisProtocolSchema = Joi.object({
  person_name: Joi.string()
    .valid('Jay', 'Angélique', 'Gautier', 'Lyam', 'Théo', 'Evy', 'Nami')
    .required(),
  design_human_type: Joi.string().optional().allow(null, ''),
  crisis_type: Joi.string()
    .valid('frustration', 'surcharge', 'transition', 'rejet', 'colère', 'peur', 'autre')
    .required(),
  trigger_recognition: Joi.string().optional().allow(null, ''),
  immediate_response: Joi.string().optional().allow(null, ''),
  escalation_step1: Joi.string().optional().allow(null, ''),
  escalation_step2: Joi.string().optional().allow(null, ''),
  escalation_step3: Joi.string().optional().allow(null, ''),
  support_needs: Joi.string().optional().allow(null, ''), // JSON string
  tools_available: Joi.string().optional().allow(null, ''), // JSON string
  what_to_avoid: Joi.string().optional().allow(null, ''), // JSON string
  recovery: Joi.string().optional().allow(null, ''),
  notes: Joi.string().optional().allow(null, ''),
});

const updateCrisisProtocolSchema = Joi.object({
  design_human_type: Joi.string().optional().allow(null, ''),
  crisis_type: Joi.string()
    .valid('frustration', 'surcharge', 'transition', 'rejet', 'colère', 'peur', 'autre')
    .optional(),
  trigger_recognition: Joi.string().optional().allow(null, ''),
  immediate_response: Joi.string().optional().allow(null, ''),
  escalation_step1: Joi.string().optional().allow(null, ''),
  escalation_step2: Joi.string().optional().allow(null, ''),
  escalation_step3: Joi.string().optional().allow(null, ''),
  support_needs: Joi.string().optional().allow(null, ''),
  tools_available: Joi.string().optional().allow(null, ''),
  what_to_avoid: Joi.string().optional().allow(null, ''),
  recovery: Joi.string().optional().allow(null, ''),
  notes: Joi.string().optional().allow(null, ''),
});

/**
 * @route   POST /api/v1/crisis
 * @desc    Create crisis protocol
 * @access  Private
 */
router.post(
  '/',
  validate(createCrisisProtocolSchema),
  asyncHandler(crisisController.createCrisisProtocol)
);

/**
 * @route   GET /api/v1/crisis
 * @desc    Get all crisis protocols (optionally filter by person)
 * @query   person (optional)
 * @access  Private
 */
router.get(
  '/',
  asyncHandler(crisisController.getCrisisProtocols)
);

/**
 * @route   GET /api/v1/crisis/search
 * @desc    Get crisis protocol by person and crisis type
 * @query   person (required), crisis_type (required)
 * @access  Private
 */
router.get(
  '/search',
  asyncHandler(crisisController.getCrisisProtocolByPersonAndType)
);

/**
 * @route   GET /api/v1/crisis/:id
 * @desc    Get crisis protocol by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(crisisController.getCrisisProtocolById)
);

/**
 * @route   PATCH /api/v1/crisis/:id
 * @desc    Update crisis protocol
 * @access  Private
 */
router.patch(
  '/:id',
  validate(updateCrisisProtocolSchema),
  asyncHandler(crisisController.updateCrisisProtocol)
);

/**
 * @route   DELETE /api/v1/crisis/:id
 * @desc    Delete crisis protocol
 * @access  Private
 */
router.delete(
  '/:id',
  asyncHandler(crisisController.deleteCrisisProtocol)
);

export default router;
