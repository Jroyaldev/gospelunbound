import React from 'react';
import { useRouter } from 'next/navigation';
import MobilePost from './MobilePost';
import { Post } from '@/app/lib/types';
import { PostComment } from '@/app/types/database';

interface MobilePostListProps {
  posts: Post[];
  currentUserId: string | null;
  currentUser?: any; // Profile type
  onLikeToggle: (postId: string) => void;
  isLoading?: boolean;
  onToggleComments?: (postId: string) => Promise<PostComment[]>;
  onAddComment?: (postId: string, content: string) => Promise<PostComment | null>;
  onCommentLike?: (commentId: string) => Promise<void>;
  onCommentDelete?: (commentId: string) => Promise<void>;
  onPostDelete?: (postId: string) => void;
}

const MobilePostList = ({
  posts,
  currentUserId,
  currentUser,
  onLikeToggle,
  isLoading = false,
  onToggleComments,
  onAddComment,
  onCommentLike,
  onCommentDelete,
  onPostDelete
}: MobilePostListProps): JSX.Element => {
  const router = useRouter();

  const handleViewPost = (postId: string) => {
    router.push(`/community/discussions/${postId}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-8">
        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#4A7B61] border-t-transparent"></div>
        <p className="mt-3 text-sm text-[#706C66]">Loading posts...</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-[#4A7B61]/10 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4A7B61]">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <p className="text-base font-medium text-[#2C2925]">No posts yet</p>
        <p className="mt-1 text-sm text-[#706C66]">Be the first to start a discussion!</p>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {posts.map((post) => (
        <MobilePost
          key={post.id}
          post={{...post, currentUser}}
          currentUserId={currentUserId}
          onLikeToggle={onLikeToggle}
          onViewPost={handleViewPost}
          onToggleComments={onToggleComments}
          onAddComment={onAddComment}
          onCommentLike={onCommentLike}
          onCommentDelete={onCommentDelete}
          onPostDelete={onPostDelete}
        />
      ))}
    </div>
  );
};

export default MobilePostList; 