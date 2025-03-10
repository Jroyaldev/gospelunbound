'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Send,
  User,
  Loader2,
  Trash,
  AlertCircle,
  Users,
  Share2,
  MoreHorizontal,
  X,
  ChevronLeft
} from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import {
  getPost,
  getProfile,
  togglePostLike,
  getPostComments,
  createPostComment,
  deletePostComment,
  isPostInGroup,
  getGroup
} from '@/app/lib/supabase/database';
import { Post, Profile, PostComment } from '@/app/lib/types';
import { Group } from '@/app/types/community';
import { format } from 'date-fns';
import { useMediaQuery } from '@/app/hooks/useMediaQuery';

// Extend the Post type to include the like properties
interface ExtendedPost extends Post {
  user_has_liked?: boolean;
  likes_count?: number;
}

// Define our own Group type that matches what's returned by getGroup
interface GroupDetails {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  // Add any other properties needed
}

const PostDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = params?.id as string;
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Check if coming from a group
  const groupIdParam = searchParams.get('groupId');
  
  // State variables
  const [post, setPost] = useState<ExtendedPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [isGroupPost, setIsGroupPost] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  
  const scrollToTopRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  
  // Handle scroll events for floating button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle outside click for share menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Fetch the post and comments
  const fetchData = useCallback(async () => {
    if (!postId) return;
    
    setIsLoading(true);
    try {
      // Get session info
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || undefined; // Use undefined instead of null
      setCurrentUserId(userId || null); // Set state as null if undefined
      
      if (userId) {
        const profile = await getProfile(userId);
        setCurrentUser(profile);
      }
      
      // Get post data
      const postData = await getPost(postId, userId) as ExtendedPost;
      if (!postData) {
        router.push('/community');
        return;
      }
      
      setPost(postData);
      setLiked(postData.user_has_liked || false);
      setLikesCount(postData.likes_count || 0);
      
      // Get comments
      const commentsData = await getPostComments(postId);
      setComments(commentsData);
      
      // Check if it's a group post
      if (groupIdParam) {
        const isInGroup = await isPostInGroup(postId, groupIdParam || '');
        if (isInGroup) {
          setIsGroupPost(true);
          const groupData = await getGroup(groupIdParam || '') as unknown as GroupDetails;
          if (groupData) {
            setGroup(groupData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
      setError('Failed to load post details');
    } finally {
      setIsLoading(false);
    }
  }, [postId, router, groupIdParam]);
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Handle like toggle
  const handleLikeToggle = async () => {
    if (!currentUserId || !postId) return;
    
    // Animation
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 800);
    
    // Optimistic update
    setLiked(!liked);
    setLikesCount(prevCount => liked ? Math.max(0, prevCount - 1) : prevCount + 1);
    
    try {
      await togglePostLike(currentUserId, postId);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setLiked(!liked);
      setLikesCount(prevCount => liked ? prevCount + 1 : Math.max(0, prevCount - 1));
    }
  };
  
  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId || !postId || !newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const comment = await createPostComment(currentUserId, {
        post_id: postId,
        content: newComment.trim()
      });
      
      if (comment) {
        setComments(prev => [...prev, comment]);
        setNewComment('');
        setShowToast('Comment added successfully');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      setError('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    if (!currentUserId) return;
    
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        const success = await deletePostComment(currentUserId, commentId);
        if (success) {
          setComments(prev => prev.filter(comment => comment.id !== commentId));
          setShowToast('Comment deleted');
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        setError('Failed to delete comment');
      }
    }
  };
  
  // Share functionality
  const handleShare = () => {
    setIsShareMenuOpen(!isShareMenuOpen);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsShareMenuOpen(false);
    setShowToast('Link copied to clipboard');
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };
  
  // Toast notification component
  const Toast = ({ message }: { message: string }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }, []);
    
    return (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#2C2925] text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fadeIn">
        <div className="flex items-center">
          <span>{message}</span>
          <button
            onClick={() => setShowToast(null)}
            className="ml-2 text-white/80 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex justify-center items-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-white shadow-sm border border-[#E8E6E1]">
            <Loader2 className="w-10 h-10 animate-spin text-[#4A7B61]" />
          </div>
          <p className="text-[#706C66] animate-pulse">Loading post...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex justify-center items-center p-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden border border-[#E8E6E1]">
          <div className="p-6 text-center">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-50 mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-[#2C2925] mb-2">Error</h2>
            <p className="text-[#706C66] mb-4">{error}</p>
            <button
              onClick={() => fetchData()}
              className="inline-flex items-center px-4 py-2 bg-[#4A7B61] text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Post not found
  if (!post) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex justify-center items-center p-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden border border-[#E8E6E1]">
          <div className="p-6 text-center">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#F4F2ED] mb-4">
              <AlertCircle className="w-8 h-8 text-[#706C66]" />
            </div>
            <h2 className="text-xl font-semibold text-[#2C2925] mb-2">Post not found</h2>
            <p className="text-[#706C66] mb-4">The post you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/community"
              className="inline-flex items-center px-4 py-2 bg-[#4A7B61] text-white rounded-lg hover:bg-[#3A6B51] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div ref={scrollToTopRef} className="min-h-screen bg-[#F9F8F6] pb-16">
      {/* Mobile header for small screens */}
      {isMobile && (
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-[#706C66]"
              aria-label="Back"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-medium text-[#2C2925] flex-1 text-center">Post Details</h1>
            <button
              onClick={handleShare}
              className="p-2 -mr-2 text-[#706C66]"
              aria-label="Share"
            >
              <Share2 size={20} />
            </button>
          </div>
        </header>
      )}
    
      <main className="max-w-3xl mx-auto px-4 pt-6">
        {/* Back navigation - desktop only */}
        {!isMobile && (
          <div className="mb-6">
            {group ? (
              <Link
                href={`/community/groups/${group.id}`}
                className="inline-flex items-center text-[#706C66] hover:text-[#4A7B61] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {group.name}
              </Link>
            ) : (
              <Link
                href="/community"
                className="inline-flex items-center text-[#706C66] hover:text-[#4A7B61] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Community
              </Link>
            )}
          </div>
        )}
        
        {/* Group context banner if applicable */}
        {isGroupPost && group && (
          <div className="bg-[#F0F9F4] border border-[#4A7B61]/20 rounded-lg p-3 mb-4 flex items-center animate-fadeIn">
            <div className="bg-[#E8F5EE] p-1.5 rounded-md mr-2">
              <Users className="w-5 h-5 text-[#4A7B61]" />
            </div>
            <span>
              This post is from the <Link href={`/community/groups/${group.id}`} className="font-medium text-[#4A7B61] hover:underline">{group.name}</Link> group
            </span>
          </div>
        )}
        
        {/* Post */}
        <div className="bg-white rounded-xl border border-[#E8E6E1] overflow-hidden mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          {/* Post header with author info */}
          <div className="p-4 md:p-5 border-b border-[#E8E6E1] flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-[#F4F2ED] mr-3">
              {post.author?.avatar_url ? (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.username || 'User'}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#E8E6E1] text-[#706C66]">
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>
            
            <div>
              <Link
                href={`/profile/${post.author?.username}`}
                className="font-medium text-[#2C2925] hover:text-[#4A7B61] transition-colors"
              >
                {post.author?.full_name || post.author?.username || 'Anonymous'}
              </Link>
              <p className="text-xs text-[#706C66]">{formatDate(post.created_at)}</p>
            </div>
            
            {/* Share button - desktop only */}
            {!isMobile && (
              <div className="ml-auto relative">
                <button
                  onClick={handleShare}
                  className="p-2 text-[#706C66] hover:text-[#4A7B61] rounded-full hover:bg-[#F8F7F5] transition-colors"
                  aria-label="Share"
                >
                  <Share2 size={20} />
                </button>
                
                {/* Share menu */}
                {isShareMenuOpen && (
                  <div 
                    ref={shareMenuRef}
                    className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg border border-[#E8E6E1] w-48 z-20 animate-fadeIn"
                  >
                    <button
                      onClick={copyToClipboard}
                      className="w-full px-4 py-3 text-left hover:bg-[#F8F7F5] transition-colors text-[#2C2925]"
                    >
                      Copy link to post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Post content */}
          <div className="p-4 md:p-6">
            {post.title && (
              <h1 className="text-xl md:text-2xl font-semibold text-[#2C2925] mb-3">{post.title}</h1>
            )}
            
            <div className="text-[#58534D] whitespace-pre-line mb-4 leading-relaxed">{post.content}</div>
            
            {/* Action buttons */}
            <div className="flex items-center mt-6 pt-4 border-t border-[#E8E6E1]">
              <button
                onClick={handleLikeToggle}
                className={`flex items-center px-4 py-2.5 rounded-md mr-4 ${
                  liked ? 'text-red-500' : 'text-[#706C66]'
                } hover:bg-[#F8F7F5] transition-colors`}
              >
                <Heart 
                  className={`w-5 h-5 mr-2 ${liked ? 'fill-red-500' : ''} ${isLikeAnimating ? 'animate-heartbeat' : ''}`} 
                />
                <span className="font-medium">{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
              </button>
              
              <div className="flex items-center px-4 py-2.5 rounded-md text-[#706C66]">
                <MessageSquare className="w-5 h-5 mr-2" />
                <span className="font-medium">{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Comments section */}
        <div className="bg-white rounded-xl border border-[#E8E6E1] overflow-hidden shadow-sm">
          <div className="p-4 md:p-5 border-b border-[#E8E6E1] flex items-center justify-between">
            <h2 className="font-medium text-[#2C2925]">Comments</h2>
            <span className="text-sm text-[#706C66]">{comments.length} total</span>
          </div>
          
          {/* Comment form */}
          {currentUserId ? (
            <div className="p-4 md:p-5 border-b border-[#E8E6E1] bg-[#FAFAF8]">
              <form onSubmit={handleSubmitComment}>
                <div className="flex">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-[#F4F2ED] mr-3 shrink-0">
                    {currentUser?.avatar_url ? (
                      <Image
                        src={currentUser.avatar_url}
                        alt={currentUser.username || 'You'}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#E8E6E1] text-[#706C66]">
                        <User className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full px-4 py-3 bg-white border border-[#E8E6E1] rounded-lg resize-none min-h-[80px] md:min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#4A7B61]/50 focus:border-[#4A7B61]"
                      required
                    />
                    
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className="absolute bottom-3 right-3 p-2 bg-[#4A7B61] text-white rounded-md disabled:opacity-50 hover:bg-[#3A6B51] transition-colors"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4 md:p-5 text-center border-b border-[#E8E6E1] bg-[#FAFAF8]">
              <Link
                href={`/auth/signin?redirect=/community/posts/${postId}`}
                className="text-[#4A7B61] hover:underline font-medium"
              >
                Sign in to leave a comment
              </Link>
            </div>
          )}
          
          {/* Comments list */}
          <div>
            {comments.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#F4F2ED] mb-4">
                  <MessageSquare className="w-7 h-7 text-[#706C66]" />
                </div>
                <p className="text-[#2C2925] font-medium mb-1">No comments yet</p>
                <p className="text-[#706C66] text-sm">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8E6E1]">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 md:p-5 hover:bg-[#FAFAF8] transition-colors">
                    <div className="flex items-start">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-[#F4F2ED] mr-3 shrink-0">
                        {comment.author?.avatar_url ? (
                          <Image
                            src={comment.author.avatar_url}
                            alt={comment.author.username || 'User'}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#E8E6E1] text-[#706C66]">
                            <User className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <Link
                              href={`/profile/${comment.author?.username}`}
                              className="font-medium text-[#2C2925] hover:text-[#4A7B61] transition-colors"
                            >
                              {comment.author?.full_name || comment.author?.username || 'Anonymous'}
                            </Link>
                            <span className="text-xs text-[#706C66] ml-2">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          
                          {currentUserId === comment.user_id && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-[#706C66] hover:text-red-500 p-1 rounded-full hover:bg-[#F4F2ED] transition-colors"
                              aria-label="Delete comment"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="text-[#58534D] leading-relaxed">{comment.content}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Scroll to top button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-white shadow-md border border-[#E8E6E1] flex items-center justify-center text-[#706C66] hover:text-[#4A7B61] hover:shadow-lg transition-all z-20 animate-fadeIn"
          aria-label="Scroll to top"
        >
          <ChevronLeft className="w-5 h-5 transform rotate-90" />
        </button>
      )}
      
      {/* Share menu for mobile */}
      {isMobile && isShareMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-t-xl p-5 animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-[#2C2925]">Share Post</h3>
              <button
                onClick={() => setIsShareMenuOpen(false)}
                className="p-1 text-[#706C66] hover:text-[#2C2925]"
              >
                <X size={20} />
              </button>
            </div>
            
            <button
              onClick={copyToClipboard}
              className="w-full py-4 flex items-center justify-center bg-[#F4F2ED] rounded-lg hover:bg-[#E8E6E1] transition-colors text-[#2C2925] font-medium"
            >
              Copy link to post
            </button>
            
            <button
              onClick={() => setIsShareMenuOpen(false)}
              className="w-full mt-3 py-4 text-center text-[#706C66]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Toast notification */}
      {showToast && <Toast message={showToast} />}
      
      {/* Add animation keyframes to globals.css or inline here */}
      <style jsx global>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(1); }
          75% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        .animate-heartbeat {
          animation: heartbeat 0.8s ease-in-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PostDetailPage; 