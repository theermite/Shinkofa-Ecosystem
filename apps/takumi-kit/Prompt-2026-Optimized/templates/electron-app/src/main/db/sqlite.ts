/**
 * SQLite Database Setup
 */

import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

const dbPath = path.join(app.getPath('userData'), 'database.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode (better concurrency)
db.pragma('journal_mode = WAL');

export async function initializeDatabase() {
  console.log(`[DB] Database path: ${dbPath}`);

  // Run migrations
  runMigrations();

  console.log('[DB] Database initialized');
}

function runMigrations() {
  // Initial schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    );
  `);

  // Check current version
  const versionRow = db.prepare('SELECT version FROM schema_version').get() as { version: number } | undefined;
  const currentVersion = versionRow?.version || 0;

  // Apply migrations if needed
  if (currentVersion === 0) {
    db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(1);
    console.log('[DB] Applied migration: 001_initial');
  }
}
