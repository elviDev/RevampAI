const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ceo_platform_dev',
});

async function verifyUsers() {
  const client = await pool.connect();
  try {
    console.log('📋 Querying actual database users...\n');
    
    const result = await client.query(`
      SELECT 
        id,
        email, 
        name, 
        role, 
        department, 
        job_title,
        avatar_url,
        email_verified,
        created_at
      FROM users 
      WHERE email LIKE '%@seeddata.com' 
         OR email LIKE '%@company.com' 
         OR role = 'ceo'
      ORDER BY role, department, name
    `);

    console.log(`Found ${result.rows.length} users in database:\n`);
    
    const usersByRole = {
      ceo: [],
      manager: [],
      staff: []
    };

    result.rows.forEach(user => {
      usersByRole[user.role].push({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        job_title: user.job_title,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified,
        created_at: user.created_at
      });
    });

    // Display users by role
    Object.keys(usersByRole).forEach(role => {
      if (usersByRole[role].length > 0) {
        console.log(`\n🔵 ${role.toUpperCase()} USERS (${usersByRole[role].length}):`);
        usersByRole[role].forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.name}`);
          console.log(`     Email: ${user.email}`);
          console.log(`     Role: ${user.role}`);
          console.log(`     Department: ${user.department}`);
          console.log(`     Job Title: ${user.job_title}`);
          console.log(`     Email Verified: ${user.email_verified}`);
          console.log(`     ID: ${user.id}`);
          console.log('');
        });
      }
    });

    return usersByRole;
  } catch (error) {
    console.error('Error querying users:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

verifyUsers().catch(console.error);