const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ceo_platform_dev'
});

async function checkSchema() {
  try {
    console.log('🔍 Checking users table schema...');
    
    const schemaResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Users table columns:');
    schemaResult.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check if specific fields exist
    const requiredFields = ['department', 'job_title', 'phone', 'timezone', 'language_preference'];
    console.log('\n🔎 Checking required fields:');
    requiredFields.forEach(field => {
      const exists = schemaResult.rows.find(col => col.column_name === field);
      console.log(`  ${field}: ${exists ? '✅ exists' : '❌ missing'}`);
    });

    // Check current user data
    console.log('\n👤 Sample user data:');
    const userData = await pool.query('SELECT * FROM users LIMIT 1');
    if (userData.rows.length > 0) {
      const user = userData.rows[0];
      console.log({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department || 'NULL',
        job_title: user.job_title || 'NULL',
        phone: user.phone || 'NULL',
        timezone: user.timezone || 'NULL',
        language_preference: user.language_preference || 'NULL',
        email_verified: user.email_verified || 'NULL',
        created_at: user.created_at || 'NULL',
        updated_at: user.updated_at || 'NULL',
        last_active: user.last_active || 'NULL'
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();