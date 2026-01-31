/**
 * JWT Configuration
 * © 2025 La Voie Shinkofa
 */

import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  issuer: 'family-hub-shinkofa',
  audience: 'family-hub-users',
};

/**
 * Validate JWT configuration
 */
export function validateJwtConfig(): boolean {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error(
        'JWT_SECRET must be at least 32 characters in production'
      );
    }
  }
  return true;
}
