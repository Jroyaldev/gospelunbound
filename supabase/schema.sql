-- Gospel Unbound Database Schema

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (handled by Supabase Auth)
-- The profiles table extends the auth.users table with additional data
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Courses 
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  author_id UUID REFERENCES profiles(id),
  level TEXT, -- 'beginner', 'intermediate', 'advanced'
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Lessons (belonging to courses)
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Course Progress
CREATE TABLE user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_percentage NUMERIC(5,2) DEFAULT 0.00,
  UNIQUE(user_id, course_id)
);

-- User Lesson Progress
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, lesson_id)
);

-- Comments (for courses, lessons, or general discussions)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For replies
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Likes (for comments)
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- User Engagement Metrics (for analytics)
CREATE TABLE user_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  course_views INTEGER DEFAULT 0,
  lesson_views INTEGER DEFAULT 0,
  comments_created INTEGER DEFAULT 0,
  likes_given INTEGER DEFAULT 0,
  total_time_spent_minutes INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Row Level Security Policies

-- Profiles: Users can read all profiles but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Courses: Anyone can view published courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published courses are viewable by everyone" 
ON courses FOR SELECT USING (is_published = true);

CREATE POLICY "Course authors can update their courses" 
ON courses FOR UPDATE USING (auth.uid() = author_id);

-- Lessons: Anyone can view published lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published lessons are viewable by everyone" 
ON lessons FOR SELECT USING (
  is_published = true AND EXISTS (
    SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.is_published = true
  )
);

-- Progress: Users can only view and update their own progress
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own course progress" 
ON user_course_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own course progress" 
ON user_course_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course progress" 
ON user_course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lesson progress" 
ON user_lesson_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" 
ON user_lesson_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress" 
ON user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comments: Anyone can view comments, but only the author can update
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" 
ON comments FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" 
ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes: Anyone can view likes, users can only like once
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" 
ON likes FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" 
ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON likes FOR DELETE USING (auth.uid() = user_id);

-- User Engagement: Only visible to the user and admins
ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own engagement metrics" 
ON user_engagement FOR SELECT USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update user_course_progress when a lesson is completed
CREATE OR REPLACE FUNCTION update_course_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  completion NUMERIC(5,2);
BEGIN
  -- Count total lessons in the course
  SELECT COUNT(*) INTO total_lessons 
  FROM lessons 
  WHERE course_id = NEW.course_id;
  
  -- Count completed lessons for the user in this course
  SELECT COUNT(*) INTO completed_lessons 
  FROM user_lesson_progress 
  WHERE user_id = NEW.user_id AND course_id = NEW.course_id AND is_completed = true;
  
  -- Calculate completion percentage
  IF total_lessons > 0 THEN
    completion := (completed_lessons::NUMERIC / total_lessons::NUMERIC) * 100;
  ELSE
    completion := 0;
  END IF;
  
  -- Update or insert user_course_progress
  INSERT INTO user_course_progress (user_id, course_id, last_accessed_at, completion_percentage)
  VALUES (NEW.user_id, NEW.course_id, NOW(), completion)
  ON CONFLICT (user_id, course_id) 
  DO UPDATE SET 
    last_accessed_at = NOW(),
    completion_percentage = completion,
    completed_at = CASE WHEN completion >= 100 THEN NOW() ELSE user_course_progress.completed_at END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating course progress when lesson progress changes
CREATE TRIGGER update_course_progress_trigger
AFTER INSERT OR UPDATE ON user_lesson_progress
FOR EACH ROW
EXECUTE FUNCTION update_course_progress();

-- Function to update user engagement metrics
CREATE OR REPLACE FUNCTION update_user_engagement(
  p_user_id UUID,
  p_course_views INTEGER DEFAULT 0,
  p_lesson_views INTEGER DEFAULT 0,
  p_comments_created INTEGER DEFAULT 0,
  p_likes_given INTEGER DEFAULT 0,
  p_time_spent_minutes INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_engagement (
    user_id, 
    date, 
    course_views, 
    lesson_views, 
    comments_created, 
    likes_given, 
    total_time_spent_minutes
  )
  VALUES (
    p_user_id, 
    CURRENT_DATE, 
    p_course_views, 
    p_lesson_views, 
    p_comments_created, 
    p_likes_given, 
    p_time_spent_minutes
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    course_views = user_engagement.course_views + p_course_views,
    lesson_views = user_engagement.lesson_views + p_lesson_views,
    comments_created = user_engagement.comments_created + p_comments_created,
    likes_given = user_engagement.likes_given + p_likes_given,
    total_time_spent_minutes = user_engagement.total_time_spent_minutes + p_time_spent_minutes;
END;
$$ LANGUAGE plpgsql;
