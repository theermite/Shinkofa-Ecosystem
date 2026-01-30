/**
 * Configuration Management
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load package.json for version
const packagePath = join(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

export const version = packageJson.version;
export const description = packageJson.description;

export interface Config {
  logLevel: string;
  dataDir: string;
  apiUrl?: string;
}

/**
 * Load configuration from environment + defaults
 */
export function loadConfig(): Config {
  return {
    logLevel: process.env.LOG_LEVEL || 'info',
    dataDir: process.env.DATA_DIR || join(process.cwd(), '.mycli'),
    apiUrl: process.env.API_URL,
  };
}

/**
 * Get configuration value
 */
export function getConfig(): Config {
  return loadConfig();
}
