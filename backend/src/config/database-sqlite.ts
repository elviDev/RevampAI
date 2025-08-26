import Database from 'better-sqlite3';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'dev.db');

// Create SQLite database instance
export const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database with required tables
export function initializeSQLiteDatabase() {
  logger.info('Initializing SQLite database...');

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      avatar TEXT,
      bio TEXT,
      company TEXT,
      position TEXT,
      phone TEXT,
      location TEXT,
      timezone TEXT DEFAULT 'UTC',
      language TEXT DEFAULT 'en',
      status TEXT DEFAULT 'active',
      is_verified BOOLEAN DEFAULT 0,
      verification_token TEXT,
      reset_password_token TEXT,
      reset_password_expires DATETIME,
      last_login DATETIME,
      login_attempts INTEGER DEFAULT 0,
      locked_until DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create channels table
  db.exec(`
    CREATE TABLE IF NOT EXISTS channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT DEFAULT 'public',
      owner_id INTEGER NOT NULL,
      avatar TEXT,
      settings TEXT DEFAULT '{}',
      is_archived BOOLEAN DEFAULT 0,
      last_activity DATETIME,
      member_count INTEGER DEFAULT 0,
      message_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create channel_members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS channel_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_read DATETIME,
      notifications_enabled BOOLEAN DEFAULT 1,
      FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(channel_id, user_id)
    )
  `);

  // Create messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      attachments TEXT DEFAULT '[]',
      metadata TEXT DEFAULT '{}',
      is_edited BOOLEAN DEFAULT 0,
      is_deleted BOOLEAN DEFAULT 0,
      reactions TEXT DEFAULT '{}',
      reply_to INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reply_to) REFERENCES messages(id) ON DELETE SET NULL
    )
  `);

  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      assigned_to INTEGER,
      assigned_by INTEGER NOT NULL,
      channel_id INTEGER,
      due_date DATETIME,
      completed_at DATETIME,
      tags TEXT DEFAULT '[]',
      attachments TEXT DEFAULT '[]',
      metadata TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL
    )
  `);

  // Delete and recreate test user for development (ensures correct password)
  db.prepare('DELETE FROM users WHERE email = ?').run('test@example.com');
  
  // Password is 'password123' hashed with bcrypt rounds 12
  db.prepare(`
    INSERT INTO users (email, password, name, role, is_verified)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'test@example.com',
    '$2a$12$yU40Hs8ervKXSZVsaO1AyeznngOsU9Vvwomdm6fOlFmm8rLvbQveK',
    'Test User',
    'admin',
    1
  );
  logger.info('Test user created: test@example.com / password123');

  logger.info('SQLite database initialized successfully');
}

// Helper function to get database connection
export function getDb() {
  return db;
}

// Close database connection
export function closeDatabase() {
  db.close();
  logger.info('Database connection closed');
}