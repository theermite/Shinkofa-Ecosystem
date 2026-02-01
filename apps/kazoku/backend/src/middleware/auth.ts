/**
 * Authentication Middleware
 * © 2025 La Voie Shinkofa
 */

import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';

/**
 * Middleware to verify JWT token
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Token non fourni',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Token invalide ou expiré',
      });
      return;
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Erreur d\'authentification',
    });
  }
}

/**
 * Middleware to check user role
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Non authentifié',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Accès refusé - permissions insuffisantes',
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user is admin
 */
export function isAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Accès administrateur requis',
    });
    return;
  }
  next();
}

/**
 * Middleware to check if user can access resource
 * (resource owner or admin)
 */
export function canAccessResource(userIdField: string = 'user_id') {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Non authentifié',
      });
      return;
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];

    // Admin can access all resources
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // User can only access their own resources
    if (req.user.userId !== resourceUserId) {
      res.status(403).json({
        success: false,
        error: 'Accès refusé - ressource non autorisée',
      });
      return;
    }

    next();
  };
}

/**
 * Helper function to check resource ownership
 * Can be called from controllers to verify ownership
 * Returns true if user owns the resource or is admin
 */
export function checkOwnership(
  userId: string,
  resourceOwnerId: string,
  userRole: UserRole
): boolean {
  // Admin can access all resources
  if (userRole === 'admin') {
    return true;
  }
  // User can only access their own resources
  return userId === resourceOwnerId;
}
