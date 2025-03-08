'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { PostsListProps } from '@/app/types/community';

// Import components
import DiscussionCard from './DiscussionCard';
const LoadingState = dynamic(() => import('@/app/components/LoadingState'));

/**
 * PostsList component renders a list of discussion posts
 * 
 * Features:
 * - Renders list of posts using DiscussionCard
 * - Shows loading state while fetching data
 * - Empty state message when no posts are found
 * - Handles like and delete post actions
 */
const PostsList: React.FC<PostsListProps> = ({
  posts,
  isLoading,
  currentUserId,
  currentUser,
  onLikeToggle,
  onDeletePost
}) => {
  // If loading, show loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <LoadingState key={i} />
        ))}
      </div>
    );
  }
  
  // If no posts, show empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#E8E6E1] p-6 text-center">
        <h3 className="text-lg font-medium text-[#2C2925] mb-2">No discussions yet</h3>
        <p className="text-[#58534D]">
          Be the first to start a discussion in the community!
        </p>
      </div>
    );
  }
  
  // Render the list of posts
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <DiscussionCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          currentUser={currentUser}
          onLikeToggle={onLikeToggle}
          onDeletePost={onDeletePost}
        />
      ))}
    </div>
  );
};

export default PostsList;
