/**
 * Auth Middleware Tests
 * © 2025 La Voie Shinkofa
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, checkOwnership } from '../../src/middleware/auth';
import { generateToken } from '../../src/utils/jwt';
import { AuthRequest, UserRole } from '../../src/types';

// Setup test environment
beforeAll(() => {
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = '1h';
});

describe('Auth Middleware', () => {
  describe('authenticate', () => {
    it('should reject request without authorization header', () => {
      const req = {
        headers: {},
      } as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token non fourni',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      } as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept request with valid token', () => {
      const token = generateToken({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'admin' as UserRole,
      });

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe('test-user-id');
    });
  });

  describe('authorize', () => {
    it('should reject unauthenticated request', () => {
      const req = {} as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject user with wrong role', () => {
      const req = {
        user: {
          userId: 'test-id',
          email: 'test@example.com',
          role: 'viewer' as UserRole,
        },
      } as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow user with correct role', () => {
      const req = {
        user: {
          userId: 'test-id',
          email: 'test@example.com',
          role: 'admin' as UserRole,
        },
      } as AuthRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('checkOwnership', () => {
    it('should return true for admin', () => {
      const result = checkOwnership('user-1', 'user-2', 'admin');
      expect(result).toBe(true);
    });

    it('should return true for owner', () => {
      const result = checkOwnership('user-1', 'user-1', 'contributor');
      expect(result).toBe(true);
    });

    it('should return false for non-owner', () => {
      const result = checkOwnership('user-1', 'user-2', 'contributor');
      expect(result).toBe(false);
    });
  });
});
