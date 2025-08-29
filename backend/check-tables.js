const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ceo_platform_dev'
});

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...');
    
    const result = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    console.log('📋 Available tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });
    
    // Check specifically for channel_read_status
    const missingTables = [
      'channel_read_status',
      'task_dependencies',
      'task_comments',
      'file_attachments'
    ];
    
    console.log('\n🔎 Checking for missing tables:');
    for (const table of missingTables) {
      const exists = result.rows.some(row => row.tablename === table);
      console.log(`  ${table}: ${exists ? '✅ exists' : '❌ missing'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkTables();