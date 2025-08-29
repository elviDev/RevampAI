const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ceo_platform_dev'
});

async function checkUserExistence() {
  try {
    console.log('🔍 Checking all user data for alex.ceo@company.com...');
    
    // Check with all conditions
    console.log('\n1. Basic query - find any user with this email:');
    const basicResult = await pool.query(`
      SELECT id, email, name, role, created_at, updated_at, deleted_at, email_verified
      FROM users 
      WHERE email = 'alex.ceo@company.com'
    `);
    console.log('Results:', basicResult.rows);

    // Check with LOWER()
    console.log('\n2. Case-insensitive query:');
    const lowerResult = await pool.query(`
      SELECT id, email, name, role, created_at, updated_at, deleted_at, email_verified
      FROM users 
      WHERE LOWER(email) = LOWER('alex.ceo@company.com')
    `);
    console.log('Results:', lowerResult.rows);

    // Check deleted
    console.log('\n3. Including deleted users:');
    const deletedResult = await pool.query(`
      SELECT id, email, name, role, created_at, updated_at, deleted_at, email_verified
      FROM users 
      WHERE LOWER(email) = LOWER('alex.ceo@company.com')
    `);
    console.log('Results:', deletedResult.rows);

    // Check all users
    console.log('\n4. All users in database:');
    const allUsers = await pool.query(`
      SELECT id, email, name, role, deleted_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log('All users:');
    allUsers.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) [${user.deleted_at ? 'DELETED' : 'ACTIVE'}]`);
    });

    // Check for similar emails
    console.log('\n5. Similar emails:');
    const similarResult = await pool.query(`
      SELECT id, email, name, role, deleted_at
      FROM users 
      WHERE email ILIKE '%alex%' OR email ILIKE '%ceo%'
    `);
    console.log('Similar emails:', similarResult.rows);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkUserExistence();