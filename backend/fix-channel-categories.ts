#!/usr/bin/env tsx

/**
 * Script to fix channel category associations in the database
 * This will ensure channels are properly linked to their categories
 */

import { Pool } from 'pg';
import { config } from './src/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ceo_platform_dev'
});

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Channel {
  id: string;
  name: string;
  channel_type: string;
  category_id: string | null;
}

async function fixChannelCategories() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting channel category fix...');

    // 1. First, check existing categories
    console.log('\n1. Checking existing categories...');
    const categoriesResult = await client.query<Category>('SELECT id, name, description FROM channel_categories ORDER BY name');
    const categories = categoriesResult.rows;
    
    console.log('📂 Found categories:');
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
    });

    // 2. Check existing channels and their category associations
    console.log('\n2. Checking existing channels...');
    const channelsResult = await client.query<Channel>('SELECT id, name, channel_type, category_id FROM channels ORDER BY name');
    const channels = channelsResult.rows;
    
    console.log('📋 Found channels:');
    channels.forEach(ch => {
      console.log(`   - ${ch.name} (Type: ${ch.channel_type}, Category ID: ${ch.category_id || 'NULL'})`);
    });

    // 3. Create category mapping based on channel types
    const categoryMapping: Record<string, string> = {};
    
    // Find category IDs by name (case-insensitive)
    const findCategoryId = (categoryName: string): string | null => {
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes(categoryName.toLowerCase()) ||
        categoryName.toLowerCase().includes(cat.name.toLowerCase())
      );
      return category?.id || null;
    };

    // Map channel types to category names
    const typeToCategoryMap = {
      'announcement': 'announcement',
      'department': 'department', 
      'project': 'project',
      'initiative': 'project', // initiatives are project-like
      'temporary': 'general',
      'emergency': 'announcement', // emergency channels are announcement-like
      'general': 'general'
    };

    // Build the mapping
    for (const [channelType, categoryName] of Object.entries(typeToCategoryMap)) {
      const categoryId = findCategoryId(categoryName);
      if (categoryId) {
        categoryMapping[channelType] = categoryId;
        console.log(`   ✅ ${channelType} → ${categoryName} (${categoryId})`);
      } else {
        console.log(`   ❌ No category found for: ${categoryName}`);
      }
    }

    // 4. Update channels with proper category associations
    console.log('\n3. Updating channel category associations...');
    let updatedCount = 0;
    
    for (const channel of channels) {
      const targetCategoryId = categoryMapping[channel.channel_type];
      
      if (targetCategoryId && targetCategoryId !== channel.category_id) {
        await client.query(
          'UPDATE channels SET category_id = $1, updated_at = NOW() WHERE id = $2',
          [targetCategoryId, channel.id]
        );
        
        const categoryName = categories.find(c => c.id === targetCategoryId)?.name || 'Unknown';
        console.log(`   ✅ Updated "${channel.name}" → ${categoryName} category`);
        updatedCount++;
      } else if (targetCategoryId === channel.category_id) {
        console.log(`   ⚪ "${channel.name}" already has correct category`);
      } else {
        console.log(`   ❌ No mapping found for "${channel.name}" (type: ${channel.channel_type})`);
      }
    }

    // 5. Verify the changes
    console.log('\n4. Verifying changes...');
    const updatedChannelsResult = await client.query(`
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
    
    console.log('📋 Updated channel-category associations:');
    updatedChannelsResult.rows.forEach(row => {
      console.log(`   - ${row.name} (${row.channel_type}) → ${row.category_name || 'No Category'}`);
    });

    // 6. Show category statistics
    console.log('\n5. Category statistics:');
    const statsResult = await client.query(`
      SELECT 
        cat.name as category_name,
        COUNT(c.id) as channel_count
      FROM channel_categories cat
      LEFT JOIN channels c ON cat.id = c.category_id
      GROUP BY cat.id, cat.name
      ORDER BY channel_count DESC, cat.name
    `);

    statsResult.rows.forEach(row => {
      console.log(`   - ${row.category_name}: ${row.channel_count} channels`);
    });

    console.log(`\n✅ Fix completed! Updated ${updatedCount} channel(s).`);
    
  } catch (error) {
    console.error('❌ Error fixing channel categories:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the fix
async function main() {
  try {
    await fixChannelCategories();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  main();
}