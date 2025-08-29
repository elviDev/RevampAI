#!/usr/bin/env tsx

/**
 * Direct database update script for channel categories
 * Uses the existing database connection from the running backend
 */

import { query } from './src/config/database';

// Initialize the database connection using the same config as the backend
async function initDB() {
  // Import and initialize the config
  const { initializeDatabase } = await import('./src/config/database');
  await initializeDatabase();
}

interface Channel {
  id: string;
  name: string;
  channel_type: string;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

async function fixChannelCategoriesDirect(): Promise<void> {
  console.log('🔧 Starting direct database channel category fix...\n');

  try {
    // 1. Check current categories
    console.log('📂 Current categories:');
    const categoriesResult = await query<Category>('SELECT id, name FROM channel_categories ORDER BY name');
    const categories = categoriesResult.rows;
    
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
    });

    // 2. Check current channels
    console.log('\n📋 Current channels:');
    const channelsResult = await query<Channel>('SELECT id, name, channel_type, category_id FROM channels ORDER BY name');
    const channels = channelsResult.rows;
    
    channels.forEach(ch => {
      const categoryName = categories.find(c => c.id === ch.category_id)?.name || 'None';
      console.log(`   - ${ch.name} (Type: ${ch.channel_type}, Category: ${categoryName})`);
    });

    // 3. Create category mapping
    const categoryMapping: Record<string, string> = {};
    
    // Define the mappings
    const typeToCategoryMap: Record<string, string> = {
      'announcement': 'announcement',
      'department': 'department',
      'project': 'project',
      'initiative': 'project', // initiatives are project-like
      'temporary': 'general',
      'emergency': 'announcement'
    };

    // Build mapping using exact category IDs
    for (const [channelType, categoryName] of Object.entries(typeToCategoryMap)) {
      const category = categories.find(c => c.id === categoryName || c.name.toLowerCase() === categoryName.toLowerCase());
      if (category) {
        categoryMapping[channelType] = category.id;
        console.log(`\n🔗 Mapping: ${channelType} → ${category.name} (${category.id})`);
      }
    }

    // 4. Update channels
    console.log('\n🔄 Updating channel categories...');
    let updatedCount = 0;

    for (const channel of channels) {
      const targetCategoryId = categoryMapping[channel.channel_type];
      
      if (targetCategoryId && targetCategoryId !== channel.category_id) {
        // Update the channel directly in the database
        await query(
          'UPDATE channels SET category_id = $1, updated_at = NOW() WHERE id = $2',
          [targetCategoryId, channel.id]
        );
        
        const categoryName = categories.find(c => c.id === targetCategoryId)?.name || 'Unknown';
        console.log(`   ✅ Updated "${channel.name}" → ${categoryName} category`);
        updatedCount++;
      } else if (targetCategoryId === channel.category_id) {
        console.log(`   ⚪ "${channel.name}" already has correct category`);
      } else {
        console.log(`   ❓ No mapping found for "${channel.name}" (type: ${channel.channel_type})`);
      }
    }

    // 5. Verify changes
    console.log('\n📊 Final verification:');
    const finalChannelsResult = await query<{
      id: string;
      name: string;
      channel_type: string;
      category_id: string | null;
      category_name: string | null;
    }>(`
      SELECT 
        c.id, 
        c.name, 
        c.channel_type, 
        c.category_id,
        cat.name as category_name
      FROM channels c
      LEFT JOIN channel_categories cat ON c.category_id = cat.id
      ORDER BY c.name
    `);

    finalChannelsResult.rows.forEach(row => {
      console.log(`   - ${row.name} (${row.channel_type}) → ${row.category_name || 'No Category'}`);
    });

    // 6. Show category distribution
    console.log('\n📈 Category distribution:');
    const distributionResult = await query<{
      category_name: string | null;
      channel_count: number;
    }>(`
      SELECT 
        COALESCE(cat.name, 'Uncategorized') as category_name,
        COUNT(c.id) as channel_count
      FROM channels c
      LEFT JOIN channel_categories cat ON c.category_id = cat.id
      GROUP BY cat.name
      ORDER BY channel_count DESC, category_name
    `);

    distributionResult.rows.forEach(row => {
      console.log(`   - ${row.category_name}: ${row.channel_count} channel(s)`);
    });

    console.log(`\n✅ Fix completed! Updated ${updatedCount} channel(s).`);

  } catch (error) {
    console.error('❌ Error during database fix:', error);
    throw error;
  }
}

async function main() {
  try {
    await initDB();
    await fixChannelCategoriesDirect();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}