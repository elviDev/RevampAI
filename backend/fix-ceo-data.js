const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ceo_platform_dev'
});

async function fixCeoData() {
  try {
    console.log('🔧 Fixing CEO user data...');
    
    // Update the CEO user to have complete profile data
    const result = await pool.query(`
      UPDATE users 
      SET 
        department = 'Executive',
        job_title = 'Chief Executive Officer',
        phone = '+1-555-123-4567',
        timezone = 'America/New_York',
        language_preference = 'en',
        email_verified = true,
        last_active = NOW(),
        updated_at = NOW()
      WHERE email = 'alex.ceo@company.com'
      RETURNING id, email, name, role, department, job_title, phone, timezone, language_preference, email_verified, last_active, created_at, updated_at;
    `);

    if (result.rows.length === 0) {
      console.log('❌ CEO user not found');
      return;
    }

    const user = result.rows[0];
    console.log('✅ CEO user updated:');
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

    // Also update any other users that might be missing data
    const updateOthers = await pool.query(`
      UPDATE users 
      SET 
        phone = COALESCE(phone, '+1-555-' || LPAD((RANDOM() * 9999999)::int::text, 7, '0')),
        timezone = COALESCE(timezone, 'America/New_York'),
        language_preference = COALESCE(language_preference, 'en'),
        email_verified = COALESCE(email_verified, true),
        last_active = COALESCE(last_active, NOW() - INTERVAL '1 day'),
        updated_at = NOW()
      WHERE phone IS NULL OR timezone IS NULL OR language_preference IS NULL OR last_active IS NULL
      RETURNING email, phone, timezone;
    `);

    console.log(`✅ Updated ${updateOthers.rows.length} additional users with missing data`);

  } catch (error) {
    console.error('❌ Error fixing CEO data:', error);
  } finally {
    await pool.end();
  }
}

fixCeoData();