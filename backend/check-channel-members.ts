#!/usr/bin/env tsx

/**
 * Check the current structure of channel members
 */

import { query } from './src/config/database';

async function initDB() {
  const { initializeDatabase } = await import('./src/config/database');
  await initializeDatabase();
}

async function checkChannelMembers(): Promise<void> {
  console.log('🔍 Checking channel member structures...\n');

  try {
    // Get all channels and their members
    console.log('📂 Analyzing channel member arrays...');
    const channelsResult = await query(`
      SELECT id, name, members, channel_type 
      FROM channels 
      WHERE deleted_at IS NULL
      ORDER BY name
    `);

    const channels = channelsResult.rows;
    console.log(`   ✅ Found ${channels.length} channels\n`);

    for (const channel of channels) {
      console.log(`🔍 Channel: "${channel.name}" (${channel.channel_type})`);
      console.log(`   ID: ${channel.id}`);
      
      if (channel.members) {
        console.log(`   Members Type: ${typeof channel.members}`);
        console.log(`   Members Raw: ${JSON.stringify(channel.members)}`);
        
        try {
          const parsed = typeof channel.members === 'string' 
            ? JSON.parse(channel.members) 
            : channel.members;
          console.log(`   Members Parsed: ${JSON.stringify(parsed, null, 2)}`);
          console.log(`   Members Count: ${Array.isArray(parsed) ? parsed.length : 'Not an array'}`);
        } catch (e) {
          console.log(`   Parse Error: ${e.message}`);
        }
      } else {
        console.log(`   Members: NULL/EMPTY`);
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  try {
    await initDB();
    await checkChannelMembers();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}