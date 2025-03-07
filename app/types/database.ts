// User types
export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Post types
export interface Post {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  category: string | null;
  likes?: number;
  comments?: number;
  author?: UserProfile;
  has_liked?: boolean;
}

export interface CreatePostRequest {
  title: string;
  content?: string;
  category?: string;
}

// Comment types
export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id?: string;
  author?: UserProfile;
  likes?: number;
  has_liked?: boolean;
}

export interface CreatePostCommentRequest {
  post_id: string;
  content: string;
  parent_id?: string;
}

// Group types
export interface Group {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  category: string | null;
  members?: number;
  is_member?: boolean;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  category?: string;
  image_url?: string;
}

// Engagement metrics
export interface UserEngagementMetrics {
  user_id: string;
  posts_created: number;
  comments_created: number;
  likes_given: number;
  groups_joined: number;
  course_views: number;
  resource_views: number;
  last_active_at: string;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  published: boolean;
  author_id: string;
  category: string | null;
  duration_minutes: number | null;
  difficulty: string | null;
}

export interface UserCourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  completed: boolean;
  last_accessed_at: string;
  courses?: Course;
} 