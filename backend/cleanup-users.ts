import { initializeDatabase, getPool } from './src/config/database';

async function cleanupUsers() {
  try {
    console.log('📋 Initializing database connection...');
    await initializeDatabase();
    
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      console.log('🧹 Removing non-working CEO and manager users...');
      
      // Remove CEO users that don't work
      const ceoResult = await client.query(`
        DELETE FROM users 
        WHERE role = 'ceo' 
        AND email IN ('ceo@seeddata.com', 'testceo@test.com')
        RETURNING email, name;
      `);
      
      console.log(`Removed ${ceoResult.rows.length} non-working CEO users:`);
      ceoResult.rows.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`);
      });

      // Try to fix the managers by resetting their passwords
      console.log('\n🔧 Resetting manager passwords...');
      
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('TempPass123!', 12);
      
      const managerResult = await client.query(`
        UPDATE users 
        SET password_hash = $1, updated_at = NOW()
        WHERE role = 'manager' 
        AND email IN ('sarah.manager@seeddata.com', 'mike.manager@seeddata.com', 'lisa.manager@seeddata.com')
        RETURNING email, name, department, job_title;
      `, [passwordHash]);
      
      console.log(`Updated ${managerResult.rows.length} manager passwords:`);
      managerResult.rows.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.department} - ${user.job_title}`);
      });

      console.log('\n✅ Database cleanup completed');
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error cleaning up users:', error);
    throw error;
  }
}

cleanupUsers().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Failed:', error);
  process.exit(1);
});