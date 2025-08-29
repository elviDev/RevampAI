#!/usr/bin/env tsx

import { query } from './src/config/database';

async function initDB() {
  const { initializeDatabase } = await import('./src/config/database');
  await initializeDatabase();
}

async function checkUsers(): Promise<void> {
  try {
    await initDB();
    
    console.log('👥 Current users in database:');
    const result = await query(`
      SELECT id, email, name, role, email_verified, created_at
      FROM users 
      WHERE role = 'ceo' 
      ORDER BY created_at DESC
    `);
    
    result.rows.forEach((user: any, index) => {
      console.log(`${index + 1}. ${user.name} (${user.role})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Verified: ${user.email_verified}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUsers();