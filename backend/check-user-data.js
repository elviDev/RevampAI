const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ceo_platform_dev'
});

async function checkUserData() {
  try {
    console.log('🔍 Checking user data...');
    
    const result = await pool.query(`
      SELECT id, email, name, role, department, job_title, phone, timezone, language_preference, email_verified, last_active, created_at, updated_at
      FROM users 
      WHERE email = 'alex.ceo@company.com'
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('❌ CEO user not found');
      return;
    }

    const user = result.rows[0];
    console.log('✅ CEO User Data:');
    console.log({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      job_title: user.job_title,
      phone: user.phone,
      timezone: user.timezone,
      language_preference: user.language_preference,
      email_verified: user.email_verified,
      last_active: user.last_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });

    // Check if all required fields are populated
    const missingFields = [];
    if (!user.department) missingFields.push('department');
    if (!user.job_title) missingFields.push('job_title');
    if (!user.phone) missingFields.push('phone');
    if (!user.timezone) missingFields.push('timezone');
    if (!user.language_preference) missingFields.push('language_preference');

    if (missingFields.length > 0) {
      console.log('⚠️  Missing fields:', missingFields);
    } else {
      console.log('✅ All fields populated!');
    }

  } catch (error) {
    console.error('❌ Error checking user data:', error);
  } finally {
    await pool.end();
  }
}

checkUserData();