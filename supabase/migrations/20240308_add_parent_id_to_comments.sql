-- Add parent_id column to post_comments table for enabling nested replies
ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES post_comments(id);

-- Create an index to improve query performance for finding replies
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_id);

-- Ensure we have a proper foreign key constraint
ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS post_comments_parent_id_fkey;
ALTER TABLE post_comments ADD CONSTRAINT post_comments_parent_id_fkey
    FOREIGN KEY (parent_id) REFERENCES post_comments(id) ON DELETE CASCADE; 