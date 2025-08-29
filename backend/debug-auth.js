const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ceo_platform_dev'
});

async function debugAuth() {
  try {
    console.log('🔍 Debugging auth flow for alex.ceo@company.com...');
    
    const email = 'alex.ceo@company.com';
    const password = 'TempPass123!';
    
    console.log(`\n1. Finding user by email for auth...`);
    const authQuery = `
      SELECT id, email, name, role, password_hash, email_verified,
             failed_login_attempts, account_locked_until, version,
             last_active, last_login, login_count
      FROM users
      WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL
    `;
    
    const userResult = await pool.query(authQuery, [email]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found in findByEmailForAuth query');
      console.log('Query used:', authQuery);
      console.log('Email searched:', email);
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      email_verified: user.email_verified,
      failed_login_attempts: user.failed_login_attempts,
      account_locked_until: user.account_locked_until,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash ? user.password_hash.length : 0,
      passwordHashPrefix: user.password_hash ? user.password_hash.substring(0, 15) + '...' : 'none'
    });

    console.log(`\n2. Checking account lock status...`);
    if (user.account_locked_until && user.account_locked_until > new Date()) {
      console.log('❌ Account is locked until:', user.account_locked_until);
      return;
    }
    console.log('✅ Account is not locked');

    console.log(`\n3. Verifying password...`);
    console.log('Password to check:', password);
    console.log('Hash to compare against:', user.password_hash);
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password comparison result:', isValidPassword ? '✅ VALID' : '❌ INVALID');
    
    if (!isValidPassword) {
      console.log('\n❌ Password verification failed - this explains the login error');
      
      // Try manual hash verification
      console.log('\n🔧 Trying manual hash generation...');
      const testHash = await bcrypt.hash(password, 12);
      console.log('Generated test hash:', testHash);
      
      const testComparison = await bcrypt.compare(password, testHash);
      console.log('Test comparison result:', testComparison ? '✅ VALID' : '❌ INVALID');
      
      // Check if hash looks correct
      if (!user.password_hash.startsWith('$2a$') && !user.password_hash.startsWith('$2b$')) {
        console.log('❌ Password hash format looks incorrect');
      }
      
    } else {
      console.log('✅ Password verification successful');
    }
    
    console.log(`\n4. Summary:`);
    console.log(`- User found: ✅`);
    console.log(`- Account not locked: ✅`);
    console.log(`- Password valid: ${isValidPassword ? '✅' : '❌'}`);
    
    if (!isValidPassword) {
      console.log('\n🔧 The password hash in the database is incorrect or corrupted.');
      console.log('This could have happened during one of the database updates.');
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await pool.end();
  }
}

debugAuth();