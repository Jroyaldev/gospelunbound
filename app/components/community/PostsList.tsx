'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { PostsListProps } from '@/app/types/community';
import { MessageSquare, RefreshCw } from 'lucide-react';

// Import components
import DiscussionCard from './DiscussionCard';

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
      <div className="space-y-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] overflow-hidden animate-pulse">
            <div className="p-4 border-b border-[#E8E6E1] flex items-center">
              <div className="w-10 h-10 rounded-full bg-[#E8E6E1] mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-[#E8E6E1] rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-[#E8E6E1] rounded w-1/4"></div>
              </div>
            </div>
            <div className="p-4">
              <div className="h-5 bg-[#E8E6E1] rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-[#E8E6E1] rounded w-full mb-2"></div>
              <div className="h-4 bg-[#E8E6E1] rounded w-full mb-2"></div>
              <div className="h-4 bg-[#E8E6E1] rounded w-2/3"></div>
            </div>
            <div className="px-4 py-3 bg-[#F8F7F2] border-t border-[#E8E6E1] flex">
              <div className="w-16 h-8 bg-[#E8E6E1] rounded-md mr-3"></div>
              <div className="w-16 h-8 bg-[#E8E6E1] rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // If no posts, show empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-8 text-center">
        <div className="max-w-md mx-auto">
          <MessageSquare className="w-12 h-12 text-[#CAC6BF] mx-auto mb-4" />
          <h3 className="text-xl font-medium text-[#2C2925] mb-3">No discussions yet</h3>
          <p className="text-[#706C66] mb-6">
            {currentUserId 
              ? 'Be the first to start a discussion in the community!'
              : 'Join the community to view and participate in discussions.'}
          </p>
          {currentUserId ? (
            <a
              href="/community/create-post"
              className="inline-flex items-center px-5 py-2.5 bg-[#4A7B61] text-white rounded-lg shadow hover:bg-[#3A6B51] transition-all"
            >
              Start a discussion
            </a>
          ) : (
            <a 
              href="/auth/signin?redirect=/community"
              className="inline-flex items-center px-5 py-2.5 bg-[#4A7B61] text-white rounded-lg shadow hover:bg-[#3A6B51] transition-all"
            >
              Sign in to join discussions
            </a>
          )}
        </div>
      </div>
    );
  }
  
  // Render the list of posts
  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] overflow-hidden transition-all hover:shadow-md"
        >
          <DiscussionCard
            post={post}
            currentUserId={currentUserId}
            currentUser={currentUser}
            onLikeToggle={onLikeToggle}
            onDeletePost={onDeletePost}
          />
        </div>
      ))}
    </div>
  );
};

export default PostsList;
