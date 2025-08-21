/**
 * Database layer exports
 * Centralized access to all repositories and database utilities
 */

// Base repository
export { default as BaseRepository } from './BaseRepository';
export type { BaseEntity, FilterOptions, PaginatedResult } from './BaseRepository';

// Specialized repositories
export { default as UserRepository } from './UserRepository';
export type { User, CreateUserData, UpdateUserData, UserStats } from './UserRepository';

export { default as ChannelRepository } from './ChannelRepository';
export type { Channel, CreateChannelData, ChannelWithDetails } from './ChannelRepository';

export { default as TaskRepository } from './TaskRepository';
export type { Task, CreateTaskData, TaskWithDetails, TaskFilter } from './TaskRepository';

// Repository instances for dependency injection
import UserRepository from './UserRepository';
import ChannelRepository from './ChannelRepository';
import TaskRepository from './TaskRepository';

// Create singleton instances
export const userRepository = new UserRepository();
export const channelRepository = new ChannelRepository();
export const taskRepository = new TaskRepository();

// Repository collection for easy access
export const repositories = {
  users: userRepository,
  channels: channelRepository,
  tasks: taskRepository,
} as const;

export type Repositories = typeof repositories;

// Database configuration and utilities
export {
  initializeDatabase,
  closeDatabase,
  getPool,
  query,
  transaction,
  healthCheck,
  getPoolStats,
  databaseMetrics
} from '../config/database';

// DatabaseManager class for Phase 2 compatibility
export class DatabaseManager {
  private static instance: DatabaseManager;
  
  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }
  async query(text: string, params?: any[], client?: any): Promise<any> {
    const { query } = await import('../config/database');
    return await query(text, params, client);
  }
  
  async one(text: string, params?: any[], client?: any): Promise<any> {
    const result = await this.query(text, params, client);
    if (result.rows.length === 0) {
      throw new Error('No rows returned');
    }
    return result.rows[0];
  }
  
  async many(text: string, params?: any[], client?: any): Promise<any[]> {
    const result = await this.query(text, params, client);
    return result.rows;
  }
  
  async none(text: string, params?: any[], client?: any): Promise<void> {
    await this.query(text, params, client);
  }
  
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const { transaction } = await import('../config/database');
    return await transaction(callback);
  }
}

// Migration system
export {
  runMigrations,
  rollbackLastMigration,
  getMigrationStatus,
  validateMigrations
} from './migrator';

export default repositories;