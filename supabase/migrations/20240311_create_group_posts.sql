-- Create junction table for associating posts with groups
CREATE TABLE IF NOT EXISTS group_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, post_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_post_id ON group_posts(post_id);

-- Allow public read access but authenticated write access
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;

-- RLS policy for reading - anyone can read
CREATE POLICY "Anyone can read group posts" 
ON group_posts 
FOR SELECT 
USING (true);

-- RLS policy for inserting - only authenticated users can insert if they're members of the group
CREATE POLICY "Group members can link posts to their groups" 
ON group_posts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.user_id = auth.uid() 
    AND group_members.group_id = group_id
  )
);

-- RLS policy for deleting - only group admins or post owners can delete
CREATE POLICY "Owners can delete their group posts" 
ON group_posts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.user_id = auth.uid() 
    AND group_members.group_id = group_id
    AND group_members.role = 'admin'
  ) 
  OR 
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = post_id 
    AND posts.user_id = auth.uid()
  )
); 