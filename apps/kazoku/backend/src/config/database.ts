/**
 * Database Configuration - MySQL Connection Pool
 * © 2025 La Voie Shinkofa
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

/**
 * MySQL Connection Pool Configuration
 */
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'family_hub',
  charset: 'utf8mb4', // UTF-8 support pour caractères accentués
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

/**
 * Create MySQL connection pool
 */
export const pool = mysql.createPool(dbConfig);

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    logger.info('✅ MySQL connection established successfully');
    logger.info(`📊 Database: ${dbConfig.database}`);
    connection.release();
    return true;
  } catch (error) {
    logger.error('❌ MySQL connection failed:', error);
    return false;
  }
}

/**
 * Execute SQL query with error handling
 */
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    logger.error('SQL Query Error:', { sql, params, error });
    throw error;
  }
}

/**
 * Close database connection pool
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    logger.info('🔌 MySQL connection pool closed');
  } catch (error) {
    logger.error('Error closing MySQL pool:', error);
    throw error;
  }
}

/**
 * Health check for database
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  latency: number;
}> {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    const latency = Date.now() - start;
    return { healthy: true, latency };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return { healthy: false, latency: -1 };
  }
}
