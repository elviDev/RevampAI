const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/ceo_platform_dev'
});

async function createMissingTables() {
  try {
    console.log('🔧 Creating missing tables...');
    
    // Create channel_read_status table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS channel_read_status (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_read_message_id UUID,
        last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(channel_id, user_id)
      );
    `);
    console.log('✅ Created channel_read_status table');

    // Create task_comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      );
    `);
    console.log('✅ Created task_comments table');

    // Create file_attachments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS file_attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL, -- 'task', 'message', 'channel'
        entity_id UUID NOT NULL,
        file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
        attached_by UUID REFERENCES users(id) ON DELETE SET NULL,
        attached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(entity_type, entity_id, file_id)
      );
    `);
    console.log('✅ Created file_attachments table');

    // Create indexes for performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_channel_read_status_channel_user 
      ON channel_read_status(channel_id, user_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_task_comments_task_id 
      ON task_comments(task_id) WHERE deleted_at IS NULL;
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_file_attachments_entity 
      ON file_attachments(entity_type, entity_id);
    `);
    
    console.log('✅ Created indexes');
    console.log('🎉 All missing tables created successfully');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createMissingTables();