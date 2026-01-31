/**
 * User Routes
 * © 2025 La Voie Shinkofa
 */

import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  validate,
  updateUserSchema,
  createUserProfileSchema,
  updateUserProfileSchema,
} from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private (all authenticated users)
 */
router.get(
  '/',
  asyncHandler(userController.getAllUsers)
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(userController.getUserById)
);

/**
 * @route   PATCH /api/v1/users/:id
 * @desc    Update user
 * @access  Private (admin or self)
 */
router.patch(
  '/:id',
  validate(updateUserSchema),
  asyncHandler(userController.updateUser)
);

/**
 * @route   POST /api/v1/users/:id/profile
 * @desc    Create user profile
 * @access  Private (admin or self)
 */
router.post(
  '/:id/profile',
  validate(createUserProfileSchema),
  asyncHandler(userController.createUserProfile)
);

/**
 * @route   PATCH /api/v1/users/:id/profile
 * @desc    Update user profile
 * @access  Private (admin or self)
 */
router.patch(
  '/:id/profile',
  validate(updateUserProfileSchema),
  asyncHandler(userController.updateUserProfile)
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Deactivate user (soft delete)
 * @access  Private (admin only)
 */
router.delete(
  '/:id',
  isAdmin,
  asyncHandler(userController.deactivateUser)
);

export default router;
