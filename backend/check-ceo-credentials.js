const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ceo_platform_dev'
});

async function checkCeoCredentials() {
  try {
    console.log('🔍 Checking CEO credentials...');
    
    // Check if CEO user exists
    const userResult = await pool.query(`
      SELECT id, email, name, role, password_hash, created_at, updated_at, email_verified
      FROM users 
      WHERE email = 'alex.ceo@company.com'
    `);

    if (userResult.rows.length === 0) {
      console.log('❌ CEO user not found in database');
      return;
    }

    const user = userResult.rows[0];
    console.log('👤 CEO user found:');
    console.log({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash ? user.password_hash.length : 0,
      passwordHashPrefix: user.password_hash ? user.password_hash.substring(0, 10) + '...' : 'none',
      email_verified: user.email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at
    });

    // Test password verification
    const testPassword = 'TempPass123!';
    console.log(`\n🔑 Testing password: "${testPassword}"`);
    
    if (user.password_hash) {
      const isValid = await bcrypt.compare(testPassword, user.password_hash);
      console.log(`Password verification result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (!isValid) {
        console.log('🔧 Password hash appears to be corrupted or incorrect');
        console.log('Regenerating password hash...');
        
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(testPassword, saltRounds);
        
        const updateResult = await pool.query(`
          UPDATE users 
          SET password_hash = $1, updated_at = NOW()
          WHERE email = 'alex.ceo@company.com'
          RETURNING id, email, name
        `, [newPasswordHash]);
        
        if (updateResult.rows.length > 0) {
          console.log('✅ Password hash updated successfully');
          
          // Test again
          const finalTest = await bcrypt.compare(testPassword, newPasswordHash);
          console.log(`Final verification test: ${finalTest ? '✅ VALID' : '❌ STILL INVALID'}`);
        } else {
          console.log('❌ Failed to update password hash');
        }
      }
    } else {
      console.log('❌ No password hash found - user has no password set');
    }

  } catch (error) {
    console.error('❌ Error checking CEO credentials:', error);
  } finally {
    await pool.end();
  }
}

checkCeoCredentials();