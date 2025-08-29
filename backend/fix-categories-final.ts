#!/usr/bin/env tsx

/**
 * Final fix for channel categories using the correct table names
 */

import { query } from './src/config/database';

async function initDB() {
  const { initializeDatabase } = await import('./src/config/database');
  await initializeDatabase();
}

async function fixChannelCategories(): Promise<void> {
  console.log('🔧 Starting channel category fix...\n');

  try {
    // 1. Check the categories table (not channel_categories)
    console.log('📂 Current categories:');
    const categoriesResult = await query(`
      SELECT id, name, description 
      FROM categories 
      ORDER BY name
    `);
    const categories = categoriesResult.rows;
    
    categories.forEach((cat: any) => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
    });

    // 2. Check unique channels (remove duplicates later)
    console.log('\n📋 Current channels (unique by name):');
    const channelsResult = await query(`
      SELECT DISTINCT ON (name) 
        id, name, channel_type, category_id 
      FROM channels 
      WHERE deleted_at IS NULL
      ORDER BY name, created_at DESC
    `);
    const channels = channelsResult.rows;
    
    channels.forEach((ch: any) => {
      const categoryName = categories.find((c: any) => c.id === ch.category_id)?.name || 'None';
      console.log(`   - ${ch.name} (Type: ${ch.channel_type}, Category: ${categoryName})`);
    });

    // 3. Create category mapping based on channel types
    console.log('\n🔗 Creating category mapping...');
    const categoryMapping: Record<string, string> = {};
    
    // Map channel types to category names
    const typeToCategoryMap: Record<string, string> = {
      'announcement': 'announcement',
      'department': 'department',
      'project': 'project',
      'initiative': 'project', // initiatives are project-like
      'temporary': 'general'
    };

    // Find categories and build mapping
    for (const [channelType, categoryName] of Object.entries(typeToCategoryMap)) {
      const category = categories.find((c: any) => 
        c.name.toLowerCase().includes(categoryName.toLowerCase()) ||
        c.id.toLowerCase() === categoryName.toLowerCase()
      );
      
      if (category) {
        categoryMapping[channelType] = category.id;
        console.log(`   ✅ ${channelType} → ${category.name} (${category.id})`);
      } else {
        console.log(`   ❌ No category found for: ${categoryName}`);
      }
    }

    // 4. Update channels with proper category associations
    console.log('\n🔄 Updating channel categories...');
    let updatedCount = 0;

    for (const channel of channels) {
      const targetCategoryId = categoryMapping[channel.channel_type];
      
      if (targetCategoryId && targetCategoryId !== channel.category_id) {
        await query(
          'UPDATE channels SET category_id = $1, updated_at = NOW() WHERE id = $2',
          [targetCategoryId, channel.id]
        );
        
        const categoryName = categories.find((c: any) => c.id === targetCategoryId)?.name || 'Unknown';
        console.log(`   ✅ Updated "${channel.name}" → ${categoryName} category`);
        updatedCount++;
      } else if (targetCategoryId === channel.category_id) {
        console.log(`   ⚪ "${channel.name}" already has correct category`);
      } else {
        console.log(`   ❓ No mapping found for "${channel.name}" (type: ${channel.channel_type})`);
      }
    }

    // 5. Clean up duplicate channels (keep the latest one for each name)
    console.log('\n🧹 Cleaning up duplicate channels...');
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

    // 6. Final verification
    console.log('\n📊 Final verification:');
    const finalResult = await query(`
      SELECT 
        c.name, 
        c.channel_type, 
        cat.name as category_name
      FROM channels c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.deleted_at IS NULL
      ORDER BY c.name
    `);

    finalResult.rows.forEach((row: any) => {
      console.log(`   - ${row.name} (${row.channel_type}) → ${row.category_name || 'No Category'}`);
    });

    // 7. Show category distribution
    console.log('\n📈 Category distribution:');
    const distributionResult = await query(`
      SELECT 
        COALESCE(cat.name, 'Uncategorized') as category_name,
        COUNT(c.id) as channel_count
      FROM channels c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.deleted_at IS NULL
      GROUP BY cat.name
      ORDER BY channel_count DESC, category_name
    `);

    distributionResult.rows.forEach((row: any) => {
      console.log(`   - ${row.category_name}: ${row.channel_count} channel(s)`);
    });

    console.log(`\n✅ Fix completed! Updated ${updatedCount} channel(s).`);

  } catch (error) {
    console.error('❌ Error during fix:', error);
    throw error;
  }
}

async function main() {
  try {
    await initDB();
    await fixChannelCategories();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}