#!/usr/bin/env node

// Script to apply the post_comments parent_id migration
// Usage: node scripts/apply-migration.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: Missing Supabase environment variables');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
    process.exit(1);
  }
  
  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('Checking if parent_id column exists in post_comments table...');
  
  // Try to select the parent_id column to check if it exists
  try {
    await supabase
      .from('post_comments')
      .select('parent_id')
      .limit(1);
    
    console.log('✅ parent_id column already exists. No migration needed.');
    return;
  } catch (error) {
    // Column doesn't exist, proceed with migration
    console.log('parent_id column does not exist. Running migration...');
    
    // SQL migration to add parent_id column
    const alterTableQuery = `
      -- Add parent_id column to post_comments table for enabling nested replies
      ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES post_comments(id);
      
      -- Create an index to improve query performance for finding replies
      CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_id);
      
      -- Ensure we have a proper foreign key constraint
      ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS post_comments_parent_id_fkey;
      ALTER TABLE post_comments ADD CONSTRAINT post_comments_parent_id_fkey
          FOREIGN KEY (parent_id) REFERENCES post_comments(id) ON DELETE CASCADE;
    `;
    
    try {
      // Execute the SQL via Supabase RPC
      const { error } = await supabase.rpc('exec_sql', { sql: alterTableQuery });
      
      if (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
      }
      
      console.log('✅ Migration successful! parent_id column has been added to post_comments table.');
    } catch (rpcError) {
      console.error('❌ Error executing SQL:', rpcError.message);
      console.log('');
      console.log('Possible solutions:');
      console.log('1. Create an RPC function that can execute SQL:');
      console.log(`   CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;`);
      console.log('2. Run the migration manually in the Supabase SQL editor:');
      console.log(alterTableQuery);
      process.exit(1);
    }
  }
}

// Run the migration
applyMigration().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 