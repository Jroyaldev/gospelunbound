import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobilePost from './MobilePost';
import { Post } from '@/app/lib/types';
import { PostComment } from '@/app/types/database';
import { Loader } from 'lucide-react';

// Simple InView implementation to avoid importing react-intersection-observer
function useInView(options = { threshold: 0, triggerOnce: false }) {
  const [inView, setInView] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: options.threshold });
    
    observer.observe(ref);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, options.threshold]);

  return { ref: setRef, inView };
}

interface MobilePostListProps {
  posts: Post[];
  currentUserId: string | null;
  currentUser?: any;
  onLikeToggle: (postId: string) => void;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
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
  isLoadingMore = false,
  hasMore = false,
  loadMore = () => {},
  onToggleComments,
  onAddComment,
  onCommentLike,
  onCommentDelete,
  onPostDelete
}: MobilePostListProps): JSX.Element => {
  const router = useRouter();

  // Create a ref that detects when the load more component is visible
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // Load more posts when bottom is reached and in view
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore, loadMore]);

  // State to track which posts have comments open
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);

  const handleViewPost = (postId: string) => {
    router.push(`/posts/${postId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#E8E6E1] shadow-sm overflow-hidden animate-pulse"
          >
            <div className="p-4 flex items-center gap-3 border-b border-[#E8E6E1]">
              <div className="w-10 h-10 rounded-full bg-[#F4F2ED]"></div>
              <div className="flex-1">
                <div className="h-4 bg-[#F4F2ED] rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-[#F4F2ED] rounded w-1/5"></div>
              </div>
            </div>
            <div className="p-4">
              <div className="h-4 bg-[#F4F2ED] rounded w-2/3 mb-3"></div>
              <div className="h-3 bg-[#F4F2ED] rounded w-full mb-2"></div>
              <div className="h-3 bg-[#F4F2ED] rounded w-full mb-2"></div>
              <div className="h-3 bg-[#F4F2ED] rounded w-4/5"></div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-3 w-16 bg-[#F4F2ED] rounded"></div>
                <div className="h-3 w-3 bg-[#F4F2ED] rounded-full"></div>
                <div className="h-3 w-16 bg-[#F4F2ED] rounded"></div>
              </div>
            </div>
            <div className="border-t border-[#E8E6E1] p-3 flex">
              <div className="flex-1 h-8 bg-[#F4F2ED] rounded-md mx-2"></div>
              <div className="flex-1 h-8 bg-[#F4F2ED] rounded-md mx-2"></div>
              <div className="flex-1 h-8 bg-[#F4F2ED] rounded-md mx-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-[#E8E6E1] shadow-sm m-4">
        <div className="w-16 h-16 bg-[#F4F2ED] rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-[#706C66]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[#2C2925] mb-2">No posts yet</h3>
        <p className="text-[#706C66] mb-6">Be the first to start a discussion in the community</p>
        <button
          onClick={() => window.location.href = '/community/create-post'}
          className="px-4 py-2 bg-[#4A7B61] text-white rounded-lg font-medium hover:bg-[#3A6B51] transition-colors shadow-sm"
        >
          Create New Post
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-0 px-4 pb-4">
      {posts.map((post) => (
        <MobilePost
          key={post.id}
          post={{...post, currentUser}}
          currentUserId={currentUserId}
          onLikeToggle={onLikeToggle}
          onViewPost={handleViewPost}
          onToggleComments={async (postId) => {
            // Toggle the comments section
            if (onToggleComments) {
              if (openCommentsPostId === postId) {
                setOpenCommentsPostId(null);
                return [];
              } else {
                setOpenCommentsPostId(postId);
                return onToggleComments(postId);
              }
            }
            return [];
          }}
          onAddComment={onAddComment}
          onCommentLike={onCommentLike}
          onCommentDelete={onCommentDelete}
          onPostDelete={onPostDelete}
        />
      ))}

      {/* Load more trigger */}
      {hasMore && (
        <div 
          ref={ref} 
          className="flex justify-center py-4"
        >
          {isLoadingMore ? (
            <div className="flex items-center justify-center p-4">
              <Loader className="w-6 h-6 text-[#4A7B61] animate-spin" />
              <span className="ml-2 text-sm text-[#706C66]">Loading more posts...</span>
            </div>
          ) : (
            <button 
              onClick={loadMore} 
              className="px-4 py-2 text-[#4A7B61] border border-[#4A7B61] rounded-full text-sm font-medium hover:bg-[#F4F8F6] active:bg-[#E8F5EE] transition-colors"
            >
              Load more posts
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MobilePostList; 