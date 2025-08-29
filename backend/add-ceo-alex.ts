#!/usr/bin/env tsx

/**
 * Add Alexander Mitchell CEO to channel memberships
 */

import { query } from './src/config/database';

async function initDB() {
  const { initializeDatabase } = await import('./src/config/database');
  await initializeDatabase();
}

async function addAlexToCEOChannels(): Promise<void> {
  console.log('🔧 Adding Alexander Mitchell CEO to channel memberships...\n');

  try {
    const alexCEOId = '0cb414a1-4ae1-43e2-9334-fc38f2f720d3'; // Alexander Mitchell 

    // 1. Get all channels
    console.log('📂 Finding all channels...');
    const channelsResult = await query(`
      SELECT id, name, members, channel_type 
      FROM channels 
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    const channels = channelsResult.rows;
    console.log(`   ✅ Found ${channels.length} channels\n`);

    // 2. Add Alex to each channel
    let updatedCount = 0;
    for (const channel of channels) {
      const existingMembers = channel.members || [];
      
      // Check if Alex is already a member (simple string array format)
      const isAlreadyMember = existingMembers.includes(alexCEOId);

      if (!isAlreadyMember) {
        const updatedMembers = [...existingMembers, alexCEOId];

        await query(
          'UPDATE channels SET members = $1, updated_at = NOW() WHERE id = $2',
          [updatedMembers, channel.id]
        );

        console.log(`   ✅ Added Alex to "${channel.name}" (${channel.channel_type})`);
        updatedCount++;
      } else {
        console.log(`   ℹ️  Alex already in "${channel.name}"`);
      }
    }

    // 3. Final verification
    console.log(`\n📊 Final verification for Alex CEO (${alexCEOId}):`);
    const finalResult = await query(`
      SELECT 
        id, 
        name, 
        channel_type,
        category_id,
        CASE 
          WHEN members::text LIKE '%${alexCEOId}%' THEN 'YES' 
          ELSE 'NO' 
        END as alex_is_member
      FROM channels 
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    finalResult.rows.forEach((row: any) => {
      const status = row.alex_is_member === 'YES' ? '✅' : '❌';
      console.log(`   ${status} ${row.name} (${row.channel_type}) - Member: ${row.alex_is_member}`);
    });

    console.log(`\n🎉 Complete! Added Alex CEO to ${updatedCount} channel(s).`);
    console.log('✅ Alex can now access channels in the frontend!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  try {
    await initDB();
    await addAlexToCEOChannels();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}