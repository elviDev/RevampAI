#!/usr/bin/env tsx

/**
 * Create categories and link channels to them
 */

import { query } from './src/config/database';

async function initDB() {
  const { initializeDatabase } = await import('./src/config/database');
  await initializeDatabase();
}

async function createAndLinkCategories(): Promise<void> {
  console.log('🔧 Creating categories and linking channels...\n');

  try {
    // 1. Check current categories
    console.log('📂 Current categories:');
    const existingCategoriesResult = await query(`
      SELECT id, name, description 
      FROM categories 
      ORDER BY name
    `);
    
    if (existingCategoriesResult.rows.length === 0) {
      console.log('   ❌ No categories found - will create them');
    } else {
      existingCategoriesResult.rows.forEach((cat: any) => {
        console.log(`   - ${cat.name} (ID: ${cat.id})`);
      });
    }

    // 2. Define required categories
    const requiredCategories = [
      {
        id: 'general',
        name: 'General', 
        description: 'General discussions and communications',
        icon: 'chatbubble-outline',
        color: '#6B7280'
      },
      {
        id: 'project',
        name: 'Project',
        description: 'Project-specific channels and collaboration', 
        icon: 'folder-outline',
        color: '#3B82F6'
      },
      {
        id: 'department', 
        name: 'Department',
        description: 'Department-specific communications',
        icon: 'business-outline', 
        color: '#10B981'
      },
      {
        id: 'announcement',
        name: 'Announcement',
        description: 'Important announcements and updates',
        icon: 'megaphone-outline',
        color: '#F59E0B'
      },
      {
        id: 'private',
        name: 'Private',
        description: 'Private discussions and confidential matters',
        icon: 'lock-closed-outline',
        color: '#8B5CF6'
      }
    ];

    // 3. Create categories (upsert)
    console.log('\n➕ Creating/updating categories...');
    for (const category of requiredCategories) {
      try {
        await query(`
          INSERT INTO categories (id, name, description, icon, color, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          ON CONFLICT (id) 
          DO UPDATE SET 
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            icon = EXCLUDED.icon,
            color = EXCLUDED.color,
            updated_at = NOW()
        `, [category.id, category.name, category.description, category.icon, category.color]);
        
        console.log(`   ✅ Created/updated: ${category.name}`);
      } catch (error) {
        console.log(`   ❌ Failed to create ${category.name}:`, error);
      }
    }

    // 4. Verify categories were created
    console.log('\n📂 Categories after creation:');
    const categoriesResult = await query(`
      SELECT id, name, description 
      FROM categories 
      ORDER BY name
    `);
    const categories = categoriesResult.rows;
    
    categories.forEach((cat: any) => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
    });

    // 5. Get unique channels
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
      const categoryName = categories.find((c: any) => c.id === ch.category_id)?.name || 'None';
      console.log(`   - ${ch.name} (Type: ${ch.channel_type}, Category: ${categoryName})`);
    });

    // 6. Create mapping and update channels
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
      const targetCategoryId = typeToCategoryMap[channel.channel_type];
      
      if (targetCategoryId) {
        await query(
          'UPDATE channels SET category_id = $1, updated_at = NOW() WHERE id = $2',
          [targetCategoryId, channel.id]
        );
        
        const categoryName = categories.find((c: any) => c.id === targetCategoryId)?.name || 'Unknown';
        console.log(`   ✅ Linked "${channel.name}" → ${categoryName} category`);
        updatedCount++;
      } else {
        console.log(`   ❓ No mapping for "${channel.name}" (type: ${channel.channel_type})`);
      }
    }

    // 7. Clean up duplicates
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

    // 8. Final verification
    console.log('\n📊 Final verification:');
    const finalResult = await query(`
      SELECT 
        c.name, 
        c.channel_type, 
        cat.name as category_name
      FROM channels c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.deleted_at IS NULL
      ORDER BY cat.name, c.name
    `);

    finalResult.rows.forEach((row: any) => {
      console.log(`   - ${row.name} (${row.channel_type}) → ${row.category_name || 'No Category'}`);
    });

    // 9. Show category stats
    console.log('\n📈 Category distribution:');
    const statsResult = await query(`
      SELECT 
        cat.name as category_name,
        COUNT(c.id) as channel_count
      FROM categories cat
      LEFT JOIN channels c ON cat.id = c.category_id AND c.deleted_at IS NULL
      GROUP BY cat.id, cat.name
      ORDER BY channel_count DESC, cat.name
    `);

    statsResult.rows.forEach((row: any) => {
      console.log(`   - ${row.category_name}: ${row.channel_count} channel(s)`);
    });

    console.log(`\n✅ Complete! Created categories and linked ${updatedCount} channel(s).`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  try {
    await initDB();
    await createAndLinkCategories();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}