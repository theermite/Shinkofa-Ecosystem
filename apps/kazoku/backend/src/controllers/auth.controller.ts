/**
 * Auth Controller
 * © 2025 La Voie Shinkofa
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import * as UserModel from '../models/user.model';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/bcrypt';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/errorHandler';

/**
 * Register new user
 * POST /api/v1/auth/register
 */
export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password, name, role, avatar_color } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new ApiError(400, passwordValidation.message);
    }

    // Check if user already exists
    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'Un utilisateur avec cet email existe déjà');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = await UserModel.createUser(
      email,
      passwordHash,
      name,
      role || 'contributor',
      avatar_color || '#4285f4'
    );

    // Get created user
    const user = await UserModel.findUserById(userId);
    if (!user) {
      throw new ApiError(500, 'Erreur lors de la création de l\'utilisateur');
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info('New user registered', { userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar_color: user.avatar_color,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Login user
 * POST /api/v1/auth/login
 */
export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await UserModel.findUserByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Email ou mot de passe incorrect');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Email ou mot de passe incorrect');
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Generate tokens
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info('User logged in', { userId: user.id, email: user.email });

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar_color: user.avatar_color,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export async function refreshToken(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token requis');
    }

    // Verify refresh token
    const { verifyToken } = await import('../utils/jwt');
    const decoded = verifyToken(refreshToken);

    if (!decoded) {
      throw new ApiError(401, 'Refresh token invalide ou expiré');
    }

    // Generate new access token
    const newToken = generateToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    res.json({
      success: true,
      message: 'Token rafraîchi avec succès',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const userData = await UserModel.getUserWithProfile(req.user.userId);

    if (!userData) {
      throw new ApiError(404, 'Utilisateur non trouvé');
    }

    res.json({
      success: true,
      data: {
        id: userData.user.id,
        email: userData.user.email,
        name: userData.user.name,
        role: userData.user.role,
        avatar_color: userData.user.avatar_color,
        design_human_type: userData.profile?.design_human_type,
        authority: userData.profile?.authority,
      },
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Change password
 * POST /api/v1/auth/change-password
 */
export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Non authentifié');
    }

    const { current_password, new_password } = req.body;

    // Find user
    const user = await UserModel.findUserById(req.user.userId);
    if (!user) {
      throw new ApiError(404, 'Utilisateur non trouvé');
    }

    // Verify current password
    const isCurrentValid = await comparePassword(current_password, user.password_hash);
    if (!isCurrentValid) {
      throw new ApiError(400, 'Mot de passe actuel incorrect');
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(new_password);
    if (!passwordValidation.isValid) {
      throw new ApiError(400, passwordValidation.message);
    }

    // Hash new password and update
    const newHash = await hashPassword(new_password);
    await UserModel.updatePasswordHash(user.id, newHash);

    logger.info('Password changed', { userId: user.id });

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Logout user (client-side token removal)
 * POST /api/v1/auth/logout
 */
export async function logout(req: AuthRequest, res: Response): Promise<void> {
  // Note: JWT logout is handled client-side by removing token
  // This endpoint is mainly for logging purposes
  if (req.user) {
    logger.info('User logged out', { userId: req.user.userId });
  }

  res.json({
    success: true,
    message: 'Déconnexion réussie',
  });
}
