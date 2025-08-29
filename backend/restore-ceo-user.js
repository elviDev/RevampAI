const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ceo_platform_dev'
});

async function restoreCeoUser() {
  try {
    console.log('🔧 Restoring CEO user alex.ceo@company.com...');
    
    // Restore the CEO user by setting deleted_at to NULL
    const result = await pool.query(`
      UPDATE users 
      SET deleted_at = NULL, updated_at = NOW()
      WHERE email = 'alex.ceo@company.com'
      RETURNING id, email, name, role, deleted_at, created_at, updated_at;
    `);

    if (result.rows.length === 0) {
      console.log('❌ CEO user not found for restoration');
      return;
    }

    const user = result.rows[0];
    console.log('✅ CEO user restored successfully:');
    console.log({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      deleted_at: user.deleted_at,
      created_at: user.created_at,
      updated_at: user.updated_at
    });

    // Verify the user can be found by auth query
    console.log('\n🔍 Verifying auth query can find the user...');
    const authResult = await pool.query(`
      SELECT id, email, name, role, password_hash, email_verified,
             failed_login_attempts, account_locked_until, version,
             last_active, last_login, login_count
      FROM users
      WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL
    `, ['alex.ceo@company.com']);

    if (authResult.rows.length > 0) {
      console.log('✅ User now found by auth query');
      console.log({
        id: authResult.rows[0].id,
        email: authResult.rows[0].email,
        email_verified: authResult.rows[0].email_verified,
        hasPasswordHash: !!authResult.rows[0].password_hash
      });
    } else {
      console.log('❌ User still not found by auth query');
    }

    console.log('\n✅ CEO user restoration complete!');

  } catch (error) {
    console.error('❌ Error restoring CEO user:', error);
  } finally {
    await pool.end();
  }
}

restoreCeoUser();