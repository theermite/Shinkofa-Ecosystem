/**
 * User Controller
 * © 2025 La Voie Shinkofa
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import * as UserModel from '../models/user.model';
import * as UserProfileModel from '../models/userProfile.model';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';

/**
 * Get all users
 * GET /api/v1/users
 */
export async function getAllUsers(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await UserModel.getAllUsers();

    res.json({
      success: true,
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_color: user.avatar_color,
        created_at: user.created_at,
        last_login: user.last_login,
      })),
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get user by ID
 * GET /api/v1/users/:id
 */
export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const userData = await UserModel.getUserWithProfile(id);

    if (!userData) {
      throw new ApiError(404, 'Utilisateur non trouvé');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: userData.user.id,
          email: userData.user.email,
          name: userData.user.name,
          role: userData.user.role,
          avatar_color: userData.user.avatar_color,
          created_at: userData.user.created_at,
          last_login: userData.user.last_login,
        },
        profile: userData.profile,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update user
 * PATCH /api/v1/users/:id
 */
export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if user exists
    const user = await UserModel.findUserById(id);
    if (!user) {
      throw new ApiError(404, 'Utilisateur non trouvé');
    }

    // Update user
    await UserModel.updateUser(id, updates);

    logger.info('User updated', { userId: id, updates });

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Create user profile
 * POST /api/v1/users/:id/profile
 */
export async function createUserProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const profileData = req.body;

    // Check if user exists
    const user = await UserModel.findUserById(id);
    if (!user) {
      throw new ApiError(404, 'Utilisateur non trouvé');
    }

    // Check if profile already exists
    const existingProfile = await UserProfileModel.getUserProfile(id);
    if (existingProfile) {
      throw new ApiError(409, 'Un profil existe déjà pour cet utilisateur');
    }

    // Create profile
    await UserProfileModel.createUserProfile({
      user_id: id,
      ...profileData,
    });

    logger.info('User profile created', { userId: id });

    res.status(201).json({
      success: true,
      message: 'Profil créé avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Update user profile
 * PATCH /api/v1/users/:id/profile
 */
export async function updateUserProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if profile exists
    const profile = await UserProfileModel.getUserProfile(id);
    if (!profile) {
      throw new ApiError(404, 'Profil non trouvé');
    }

    // Update profile
    await UserProfileModel.updateUserProfile(id, updates);

    logger.info('User profile updated', { userId: id, updates });

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Deactivate user
 * DELETE /api/v1/users/:id
 */
export async function deactivateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await UserModel.findUserById(id);
    if (!user) {
      throw new ApiError(404, 'Utilisateur non trouvé');
    }

    // Prevent self-deactivation
    if (req.user && req.user.userId === id) {
      throw new ApiError(400, 'Impossible de désactiver son propre compte');
    }

    // Deactivate user
    await UserModel.deactivateUser(id);

    logger.info('User deactivated', { userId: id });

    res.json({
      success: true,
      message: 'Utilisateur désactivé avec succès',
    });
  } catch (error) {
    throw error;
  }
}
