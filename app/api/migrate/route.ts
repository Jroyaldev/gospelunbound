import { createAdminClient } from '@/app/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// This is an admin-only endpoint to run the migration
export async function POST() {
  try {
    const supabase = await createAdminClient();
    
    // Check if the column already exists
    const { data: columnExists, error: checkError } = await supabase
      .from('post_comments')
      .select('parent_id')
      .limit(1)
      .catch(() => ({ data: null, error: { message: 'Column does not exist' } }));
    
    // If we got an error about the column not existing or if data is null, add the column
    if (checkError || !columnExists) {
      // Run the migration
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
      
      const { error: migrationError } = await supabase.rpc('exec_sql', { sql: alterTableQuery });
      
      if (migrationError) {
        console.error('Migration error:', migrationError);
        return NextResponse.json({ success: false, error: migrationError.message }, { status: 500 });
      }
      
      // Revalidate all community pages
      revalidatePath('/community');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully added parent_id column to post_comments table' 
      });
    } else {
      // Column already exists
      return NextResponse.json({ 
        success: true, 
        message: 'parent_id column already exists in post_comments table' 
      });
    }
  } catch (error) {
    console.error('Error applying migration:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 