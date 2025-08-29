#!/usr/bin/env tsx

/**
 * Fix categories using proper UUIDs
 */

import { query } from './src/config/database';
import { randomUUID } from 'crypto';

async function initDB() {
  const { initializeDatabase } = await import('./src/config/database');
  await initializeDatabase();
}

async function fixWithUUIDs(): Promise<void> {
  console.log('🔧 Fixing categories with proper UUIDs...\n');

  try {
    // 1. Check categories table structure
    console.log('📊 Categories table structure:');
    const structureResult = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      ORDER BY ordinal_position
    `);
    
    structureResult.rows.forEach((row: any) => {
      console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
    });

    // 2. Create categories with proper UUIDs
    const categoriesData = [
      {
        name: 'General',
        description: 'General discussions and communications',
        type: 'general'
      },
      {
        name: 'Project', 
        description: 'Project-specific channels and collaboration',
        type: 'project'
      },
      {
        name: 'Department',
        description: 'Department-specific communications',
        type: 'department'
      },
      {
        name: 'Announcement',
        description: 'Important announcements and updates',
        type: 'announcement'
      },
      {
        name: 'Private',
        description: 'Private discussions and confidential matters',
        type: 'private'
      }
    ];

    console.log('\n➕ Creating categories with UUIDs...');
    const categoryMapping = new Map<string, string>(); // type -> uuid

    for (const categoryData of categoriesData) {
      const categoryId = randomUUID();
      
      try {
        await query(`
          INSERT INTO categories (id, name, description, created_at, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `, [categoryId, categoryData.name, categoryData.description]);
        
        categoryMapping.set(categoryData.type, categoryId);
        console.log(`   ✅ ${categoryData.name} → ${categoryId}`);
      } catch (error) {
        console.log(`   ❌ Failed to create ${categoryData.name}:`, error);
      }
    }

    // 3. Verify categories
    console.log('\n📂 Created categories:');
    const categoriesResult = await query(`
      SELECT id, name, description 
      FROM categories 
      ORDER BY name
    `);
    
    categoriesResult.rows.forEach((cat: any) => {
      console.log(`   - ${cat.name} (${cat.id})`);
    });

    // 4. Get unique channels
    console.log('\n📋 Current channels:');
    const channelsResult = await query(`
      SELECT DISTINCT ON (name) 
        id, name, channel_type, category_id 
      FROM channels 
      WHERE deleted_at IS NULL
      ORDER BY name, created_at DESC
    `);
    const channels = channelsResult.rows;
    
    channels.forEach((ch: any) => {
      console.log(`   - ${ch.name} (Type: ${ch.channel_type})`);
    });

    // 5. Link channels to categories using the mapping
    console.log('\n🔗 Linking channels to categories...');
    const typeToCategoryMap: Record<string, string> = {
      'announcement': 'announcement',
      'department': 'department',
      'project': 'project',
      'initiative': 'project', // initiatives are project-like
      'temporary': 'general'
    };

    let updatedCount = 0;
    for (const channel of channels) {
      const categoryType = typeToCategoryMap[channel.channel_type];
      const categoryId = categoryMapping.get(categoryType);
      
      if (categoryId) {
        await query(
          'UPDATE channels SET category_id = $1, updated_at = NOW() WHERE id = $2',
          [categoryId, channel.id]
        );
        
        const categoryName = categoriesData.find(c => c.type === categoryType)?.name || 'Unknown';
        console.log(`   ✅ "${channel.name}" → ${categoryName} (${categoryId})`);
        updatedCount++;
      } else {
        console.log(`   ❓ No category mapping for "${channel.name}" (type: ${channel.channel_type})`);
      }
    }

    // 6. Clean up duplicates
    console.log('\n🧹 Removing duplicate channels...');
    const duplicateCleanupResult = await query(`
      DELETE FROM channels 
      WHERE id NOT IN (
        SELECT DISTINCT ON (name) id
        FROM channels 
        WHERE deleted_at IS NULL
        ORDER BY name, created_at DESC
      )
      AND deleted_at IS NULL
    `);
    console.log(`   🗑️  Removed ${duplicateCleanupResult.rowCount} duplicate channels`);

    // 7. Final verification  
    console.log('\n📊 Final result:');
    const finalResult = await query(`
      SELECT 
        c.name, 
        c.channel_type, 
        cat.name as category_name
      FROM channels c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.deleted_at IS NULL
      ORDER BY cat.name NULLS LAST, c.name
    `);

    finalResult.rows.forEach((row: any) => {
      console.log(`   - ${row.name} (${row.channel_type}) → ${row.category_name || 'No Category'}`);
    });

    // 8. Show category distribution
    console.log('\n📈 Category distribution:');
    const distributionResult = await query(`
      SELECT 
        cat.name as category_name,
        COUNT(c.id) as channel_count
      FROM categories cat
      LEFT JOIN channels c ON cat.id = c.category_id AND c.deleted_at IS NULL
      GROUP BY cat.id, cat.name
      ORDER BY channel_count DESC, cat.name
    `);

    distributionResult.rows.forEach((row: any) => {
      console.log(`   - ${row.category_name}: ${row.channel_count} channel(s)`);
    });

    console.log(`\n✅ Success! Created categories and linked ${updatedCount} channel(s).`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  try {
    await initDB();
    await fixWithUUIDs();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}