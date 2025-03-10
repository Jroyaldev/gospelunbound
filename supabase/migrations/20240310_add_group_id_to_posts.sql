-- Add group_id column to posts table for associating posts with groups
ALTER TABLE posts ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id);

-- Create an index to improve query performance for finding group posts
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON posts(group_id);

-- Ensure we have a proper foreign key constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_group_id_fkey;
ALTER TABLE posts ADD CONSTRAINT posts_group_id_fkey
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE; 