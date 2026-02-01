/**
 * Rate Limiter Middleware
 * © 2025 La Voie Shinkofa
 */

import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    error: 'Trop de requêtes, veuillez réessayer plus tard',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * Strict rate limiter for authentication routes
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: {
    success: false,
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * Rate limiter for create/update operations
 * 30 requests per minute per IP
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 write operations per minute
  message: {
    success: false,
    error: 'Trop d\'opérations d\'écriture, veuillez réessayer dans une minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn(`Write rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});
