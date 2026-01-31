/**
 * Family Hub Backend Server
 * © 2025 La Voie Shinkofa
 */

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { testConnection } from './config/database';
import { validateJwtConfig } from './config/jwt';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import taskRoutes from './routes/task.routes';
import mealRoutes from './routes/meal.routes';
import shoppingRoutes from './routes/shopping.routes';
import babyRoutes from './routes/baby.routes';
import crisisRoutes from './routes/crisis.routes';
import recipeRoutes from './routes/recipe.routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// ======================
// MIDDLEWARE
// ======================

// Security
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Force UTF-8 encoding in all responses
app.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ======================
// ROUTES
// ======================

// Health check
app.get('/health', async (_req, res) => {
  const dbHealth = await require('./config/database').healthCheck();

  res.json({
    success: true,
    message: 'Family Hub API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbHealth.healthy ? 'connected' : 'disconnected',
    databaseLatency: `${dbHealth.latency}ms`,
  });
});

// API routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/events`, eventRoutes);
app.use(`${API_PREFIX}/tasks`, taskRoutes);
app.use(`${API_PREFIX}/meals`, mealRoutes);
app.use(`${API_PREFIX}/shopping`, shoppingRoutes);
app.use(`${API_PREFIX}/baby`, babyRoutes);
app.use(`${API_PREFIX}/crisis`, crisisRoutes);
app.use(`${API_PREFIX}/recipes`, recipeRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// ======================
// SERVER INITIALIZATION
// ======================

async function startServer() {
  try {
    // Validate configuration
    validateJwtConfig();
    logger.info('✅ JWT configuration valid');

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Family Hub API started successfully`);
      logger.info(`📡 Server running on http://localhost:${PORT}`);
      logger.info(`🔧 API endpoint: http://localhost:${PORT}${API_PREFIX}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  const { closePool } = await import('./config/database');
  await closePool();
  process.exit(0);
});

// Start server
startServer();

export default app;
