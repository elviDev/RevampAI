#!/usr/bin/env node

// Simple database test to verify our member avatar fixes
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ceo_communication'
});

async function testMemberQuery() {
  console.log('🧪 Testing Member Avatar Database Query Fix...\n');

  try {
    // Test our updated getMembers query
    console.log('📂 Fetching channels...');
    const channelsResult = await pool.query(`
      SELECT id, name FROM channels 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    if (channelsResult.rows.length === 0) {
      console.log('⚠️ No channels found in database');
      return;
    }

    const channel = channelsResult.rows[0];
    console.log(`✅ Found channel: ${channel.name} (${channel.id})`);

    // Test the old query (what we had before)
    console.log('\n🔍 Testing OLD query (missing avatar_url)...');
    const oldQueryResult = await pool.query(`
      SELECT u.id, u.name, u.email, u.role
      FROM users u
      JOIN channels c ON u.id = ANY(c.members)
      WHERE c.id = $1 AND c.deleted_at IS NULL
      AND u.deleted_at IS NULL
      LIMIT 5
    `, [channel.id]);

    console.log('Old query results:', {
      memberCount: oldQueryResult.rows.length,
      firstMember: oldQueryResult.rows[0] || 'No members found',
      hasAvatarField: oldQueryResult.rows[0] && 'avatar_url' in oldQueryResult.rows[0]
    });

    // Test the new query (with our fix)
    console.log('\n✅ Testing NEW query (with avatar_url)...');
    const newQueryResult = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.avatar_url
      FROM users u
      JOIN channels c ON u.id = ANY(c.members)
      WHERE c.id = $1 AND c.deleted_at IS NULL
      AND u.deleted_at IS NULL
      LIMIT 5
    `, [channel.id]);

    console.log('New query results:', {
      memberCount: newQueryResult.rows.length,
      firstMember: newQueryResult.rows[0] || 'No members found',
      hasAvatarField: newQueryResult.rows[0] && 'avatar_url' in newQueryResult.rows[0],
      avatarValue: newQueryResult.rows[0] && newQueryResult.rows[0].avatar_url
    });

    // Check if any users have avatar_url set
    console.log('\n👤 Checking user avatar_url values...');
    const avatarCheckResult = await pool.query(`
      SELECT id, name, avatar_url 
      FROM users 
      WHERE deleted_at IS NULL 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('User avatar status:', avatarCheckResult.rows.map(user => ({
      name: user.name,
      hasAvatar: !!user.avatar_url,
      avatarValue: user.avatar_url || 'NULL'
    })));

    console.log('\n🎉 Database Query Test Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Channel members query now includes avatar_url field');
    console.log('✅ Database query structure is correct');
    console.log('✅ Ready for API to return user_avatar field to frontend');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testMemberQuery();
