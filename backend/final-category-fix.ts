#!/usr/bin/env tsx

/**
 * Final category fix with proper created_by field
 */

import { query } from './src/config/database';
import { randomUUID } from 'crypto';

async function initDB() {
  const { initializeDatabase } = await import('./src/config/database');
  await initializeDatabase();
}

async function finalCategoryFix(): Promise<void> {
  console.log('🔧 Final category fix with created_by field...\n');

  try {
    // 1. Get the CEO user ID to use as created_by
    console.log('👑 Finding CEO user...');
    const ceoResult = await query(`
      SELECT id, name, email 
      FROM users 
      WHERE role = 'ceo' 
      LIMIT 1
    `);
    
    if (ceoResult.rows.length === 0) {
      throw new Error('No CEO user found in database');
    }
    
    const ceoUser = ceoResult.rows[0];
    console.log(`   ✅ Found CEO: ${ceoUser.name} (${ceoUser.id})`);

    // 2. Create categories with proper created_by field
    const categoriesData = [
      {
        name: 'General',
        description: 'General discussions and communications',
        type: 'general',
        color: '#6B7280',
        icon: 'chatbubble-outline'
      },
      {
        name: 'Project', 
        description: 'Project-specific channels and collaboration',
        type: 'project',
        color: '#3B82F6',
        icon: 'folder-outline'
      },
      {
        name: 'Department',
        description: 'Department-specific communications',
        type: 'department',
        color: '#10B981',
        icon: 'business-outline'
      },
      {
        name: 'Announcement',
        description: 'Important announcements and updates',
        type: 'announcement',
        color: '#F59E0B',
        icon: 'megaphone-outline'
      },
      {
        name: 'Private',
        description: 'Private discussions and confidential matters',
        type: 'private',
        color: '#8B5CF6',
        icon: 'lock-closed-outline'
      }
    ];

    console.log('\n➕ Creating categories...');
    const categoryMapping = new Map<string, string>(); // type -> uuid

    for (const categoryData of categoriesData) {
      const categoryId = randomUUID();
      
      try {
        await query(`
          INSERT INTO categories (
            id, name, description, color, icon, 
            sort_order, priority_level, is_system_category, is_active, 
            visibility, allowed_roles, metadata, approval_required,
            channel_count, active_channel_count, 
            created_at, updated_at, created_by, version
          )
          VALUES (
            $1, $2, $3, $4, $5, 
            0, 1, false, true, 
            'public', ARRAY['ceo', 'manager', 'staff'], '{}', false,
            0, 0,
            NOW(), NOW(), $6, 1
          )
          ON CONFLICT (id) DO NOTHING
        `, [
          categoryId, 
          categoryData.name, 
          categoryData.description, 
          categoryData.color, 
          categoryData.icon,
          ceoUser.id
        ]);
        
        categoryMapping.set(categoryData.type, categoryId);
        console.log(`   ✅ ${categoryData.name} → ${categoryId}`);
      } catch (error) {
        console.log(`   ❌ Failed to create ${categoryData.name}:`, error);
      }
    }

    // 3. Verify categories
    console.log('\n📂 Created categories:');
    const categoriesResult = await query(`
      SELECT id, name, description, color
      FROM categories 
      WHERE deleted_at IS NULL
      ORDER BY name
    `);
    
    categoriesResult.rows.forEach((cat: any) => {
      console.log(`   - ${cat.name} (${cat.id}) - ${cat.color}`);
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

    // 5. Link channels to categories
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
        console.log(`   ✅ "${channel.name}" → ${categoryName}`);
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

    // 7. Update category channel counts
    console.log('\n📊 Updating category channel counts...');
    await query(`
      UPDATE categories 
      SET 
        channel_count = subq.total_count,
        active_channel_count = subq.active_count,
        updated_at = NOW()
      FROM (
        SELECT 
          cat.id as category_id,
          COUNT(c.id) as total_count,
          COUNT(CASE WHEN c.status = 'active' THEN 1 END) as active_count
        FROM categories cat
        LEFT JOIN channels c ON cat.id = c.category_id AND c.deleted_at IS NULL
        GROUP BY cat.id
      ) subq
      WHERE categories.id = subq.category_id
    `);

    // 8. Final verification  
    console.log('\n📊 Final result:');
    const finalResult = await query(`
      SELECT 
        c.name as channel_name, 
        c.channel_type, 
        cat.name as category_name,
        cat.color as category_color
      FROM channels c
      LEFT JOIN categories cat ON c.category_id = cat.id
      WHERE c.deleted_at IS NULL
      ORDER BY cat.name NULLS LAST, c.name
    `);

    finalResult.rows.forEach((row: any) => {
      console.log(`   - ${row.channel_name} (${row.channel_type}) → ${row.category_name || 'No Category'} ${row.category_color || ''}`);
    });

    // 9. Show final category distribution
    console.log('\n📈 Final category distribution:');
    const distributionResult = await query(`
      SELECT 
        cat.name as category_name,
        cat.color,
        cat.channel_count,
        cat.active_channel_count
      FROM categories cat
      WHERE cat.deleted_at IS NULL
      ORDER BY cat.channel_count DESC, cat.name
    `);

    distributionResult.rows.forEach((row: any) => {
      console.log(`   - ${row.category_name} ${row.color}: ${row.channel_count} total (${row.active_channel_count} active)`);
    });

    console.log(`\n✅ Complete! Created categories and linked ${updatedCount} channel(s).`);
    console.log('\n🎉 Categories are now properly set up for frontend filtering!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  try {
    await initDB();
    await finalCategoryFix();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}