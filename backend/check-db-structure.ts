#!/usr/bin/env tsx

/**
 * Check current database structure
 */

import { query } from './src/config/database';

async function initDB() {
  const { initializeDatabase } = await import('./src/config/database');
  await initializeDatabase();
}

async function checkDBStructure(): Promise<void> {
  console.log('🔍 Checking database structure...\n');

  try {
    // 1. List all tables
    console.log('📋 All tables in database:');
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    tablesResult.rows.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });

    // 2. Check channels table structure
    console.log('\n📊 Channels table structure:');
    const channelsStructure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'channels' 
      ORDER BY ordinal_position
    `);
    
    channelsStructure.rows.forEach((row: any) => {
      console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
    });

    // 3. Check current channels data
    console.log('\n📋 Current channels:');
    const channelsResult = await query(`
      SELECT id, name, channel_type, category_id 
      FROM channels 
      ORDER BY name
    `);
    
    channelsResult.rows.forEach((row: any) => {
      console.log(`   - ${row.name} (Type: ${row.channel_type}, Category ID: ${row.category_id || 'NULL'})`);
    });

    // 4. Check if there are any category-related tables
    console.log('\n🔍 Looking for category-related tables:');
    const categoryTablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%categor%'
      ORDER BY table_name
    `);
    
    if (categoryTablesResult.rows.length > 0) {
      categoryTablesResult.rows.forEach((row: any) => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('   ❌ No category tables found');
    }

    // 5. Check migrations table to see what's been applied
    console.log('\n🔄 Applied migrations:');
    try {
      const migrationsResult = await query(`
        SELECT migration_name, applied_at 
        FROM _migrations 
        ORDER BY applied_at DESC 
        LIMIT 10
      `);
      
      migrationsResult.rows.forEach((row: any) => {
        console.log(`   - ${row.migration_name} (${row.applied_at})`);
      });
    } catch (error) {
      console.log('   ❓ Cannot access migrations table');
    }

  } catch (error) {
    console.error('❌ Error checking database structure:', error);
    throw error;
  }
}

async function main() {
  try {
    await initDB();
    await checkDBStructure();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}