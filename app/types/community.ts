/**
 * Types for the community section of the application
 * Centralizes all the interfaces used across community components
 */

import { Post, PostComment as BasePostComment, Profile } from '../lib/types';

/**
 * Extended PostComment type with likes and liked status
 */
export interface PostComment extends BasePostComment {
  likes?: number;
  has_liked?: boolean;
  replies?: PostComment[];
  author?: any; // Make author more flexible to prevent type issues
}

/**
 * Props for the DiscussionCard component
 */
export interface DiscussionCardProps {
  post: Post;
  currentUserId: string | null;
  currentUser: Profile | null;
  onLikeToggle: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
}

/**
 * Props for the CommentItem component
 */
export interface CommentItemProps {
  comment: PostComment;
  currentUserId: string | null;
  onLikeToggle: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onReply?: (parentId: string, content: string) => void;
  isParentComment?: boolean;
}

/**
 * Props for the GroupCard component
 */
export interface GroupCardProps {
  group: Group;
  currentUserId: string | null;
  onToggleMembership: (groupId: string) => void;
}

/**
 * Props for the CreatePostButton component
 */
export interface CreatePostButtonProps {
  currentUserId: string | null;
}

/**
 * Props for the CommunityTabs component
 */
export interface CommunityTabsProps {
  activeTab: 'discussions' | 'groups';
  onTabChange: (tab: 'discussions' | 'groups') => void;
  postsCount: number;
  groupsCount: number;
}

/**
 * Props for the SearchBar component
 */
export interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

/**
 * Props for the PostsList component
 */
export interface PostsListProps {
  posts: Post[];
  isLoading: boolean;
  currentUserId: string | null;
  currentUser: Profile | null;
  onLikeToggle: (postId: string) => void;
  onDeletePost: (postId: string) => void;
}

/**
 * Props for the GroupsList component
 */
export interface GroupsListProps {
  groups: Group[];
  isLoading: boolean;
  currentUserId: string | null;
  onToggleMembership: (groupId: string) => void;
}

/**
 * Group type extended with membership status
 */
export interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  creator_id: string;
  image_url?: string;
  member_count: number;
  is_member?: boolean;
  creator?: Profile;
}
