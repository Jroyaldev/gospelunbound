// Database Types for Gospel Unbound

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  author_id: string;
  level: 'beginner' | 'intermediate' | 'advanced' | null;
  duration_minutes: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  content: string | null;
  order_index: number;
  duration_minutes: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type UserCourseProgress = {
  id: string;
  user_id: string;
  course_id: string;
  started_at: string;
  last_accessed_at: string;
  completed_at: string | null;
  completion_percentage: number;
  courses?: Course;
};

export type UserLessonProgress = {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  started_at: string;
  last_accessed_at: string;
  completed_at: string | null;
  is_completed: boolean;
};

export type Comment = {
  id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  course_id: string | null;
  lesson_id: string | null;
  created_at: string;
  updated_at: string;
  // Client-side only properties
  user?: Profile;
  replies?: Comment[];
  likes_count?: number;
  has_liked?: boolean;
};

export type Like = {
  id: string;
  user_id: string;
  comment_id: string;
  created_at: string;
};

export type UserEngagement = {
  id: string;
  user_id: string;
  date: string;
  course_views: number;
  lesson_views: number;
  comments_created: number;
  likes_given: number;
  total_time_spent_minutes: number;
};

// Community types

export type Post = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string | null;
  image_url: string | null;
  is_pinned: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  // Client-side properties
  author?: Profile;
  likes?: number;
  comments?: number;
  has_liked?: boolean;
};

export type PostComment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  // Client-side properties
  author?: Profile;
  replies?: PostComment[];
};

export type PostLike = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  category: string | null;
  created_by_user_id: string;
  is_private: boolean;
  topics: string[];
  created_at: string;
  updated_at: string;
  // Client-side properties
  creator?: Profile;
  members?: number;
  is_member?: boolean;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  user?: Profile;
};

// Expanded types with related data

export type CourseWithProgress = Course & {
  progress?: UserCourseProgress;
  author?: Profile;
  lesson_count?: number;
};

export type LessonWithProgress = Lesson & {
  progress?: UserLessonProgress;
};

// Request and response types for API endpoints

export type UpdateProfileRequest = {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
};

export type CreateCommentRequest = {
  content: string;
  course_id?: string;
  lesson_id?: string;
  parent_id?: string;
};

export type UpdateLessonProgressRequest = {
  lesson_id: string;
  course_id: string;
  is_completed: boolean;
};

// Community request types

export type CreatePostRequest = {
  title: string;
  content: string;
  category?: string;
  image_url?: string;
  is_pinned?: boolean;
  tags?: string[] | string;
};

export type CreatePostCommentRequest = {
  post_id: string;
  content: string;
  parent_id?: string;
};

export type CreateGroupRequest = {
  name: string;
  description: string;
  image_url?: string;
  category?: string;
  is_private?: boolean;
  topics?: string[] | string;
};

// Analytics types

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year';

export type AnalyticsData = {
  total_users: number;
  active_users: number;
  course_views: number;
  average_engagement_time: number;
  completion_rate: number;
  growth_rate: number;
};

export type UserGrowthData = {
  date: string;
  count: number;
};

export type EngagementData = {
  date: string;
  score: number;
};

export type AgeDemographics = {
  age_group: string;
  percentage: number;
};

export type CoursePerformance = {
  id: string;
  title: string;
  views: number;
  completions: number;
  engagement_score: number;
};
