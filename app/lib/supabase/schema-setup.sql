-- Create comment_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Add a unique constraint to prevent multiple likes from the same user on the same comment
  UNIQUE(user_id, comment_id)
);

-- Create a function to count comment likes
CREATE OR REPLACE FUNCTION count_comment_likes(comment_likes) 
RETURNS bigint AS $$
  SELECT count(*) FROM comment_likes WHERE comment_id = $1.comment_id
$$ LANGUAGE sql STABLE;

-- Add security policies
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view like counts
CREATE POLICY "Anyone can view comment likes" 
ON comment_likes FOR SELECT 
USING (true);

-- Only authenticated users can insert their own likes
CREATE POLICY "Users can insert their own likes" 
ON comment_likes FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own likes
CREATE POLICY "Users can delete their own likes" 
ON comment_likes FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS comment_likes_comment_id_idx ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS comment_likes_user_id_idx ON comment_likes(user_id); 