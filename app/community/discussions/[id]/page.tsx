'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Send, MoreVertical, Trash } from 'lucide-react';
import { getPost, getPostComments, createPostComment, togglePostLike, isPostLikedByUser, getProfile, deletePost } from '@/app/lib/supabase/database';
import { useAuth } from '@/app/context/auth-context';
import type { Post, PostComment, UserProfile } from '@/app/types/database';
import { createClient } from '@/app/lib/supabase/client';

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const postId = Array.isArray(id) ? id[0] : id as string;
  
  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const postData = await getPost(postId, user ? user.id : undefined);
        setPost(postData);
        
        if (postData) {
          const commentsData = await getPostComments(postId);
          // Using type assertion to match types
          setComments(commentsData as unknown as PostComment[]);
          
          if (user && postData.has_liked !== undefined) {
            setHasLiked(postData.has_liked);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [postId, user, authLoading]);
  
  // Check if user is the author of the post
  const isOwnPost = user && post && post.author?.id === user.id;

  const handleLikeToggle = async () => {
    if (!user) return;
    
    // Optimistically update UI
    setHasLiked(!hasLiked);
    if (post) {
      setPost({
        ...post,
        likes: (post.likes || 0) + (hasLiked ? -1 : 1)
      });
    }
    
    try {
      // Skip revalidation to prevent page refresh, since we're already updating the UI optimistically
      await togglePostLike(user.id, postId, true);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert the optimistic update
      setHasLiked(hasLiked);
      if (post) {
        setPost({
          ...post,
          likes: (post.likes || 0) + (hasLiked ? 0 : -1)
        });
      }
    }
  };
  
  const handleDeletePost = async () => {
    if (!user || !post || !postId) return;
    
    try {
      const success = await deletePost(user.id, postId);
      if (success) {
        // Redirect to community page
        router.push('/community');
      } else {
        console.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    
    try {
      const newComment = await createPostComment(user.id, {
        post_id: postId,
        content: commentText.trim()
      });
      
      if (newComment) {
        // Using type assertion to handle the type mismatch
        setComments(prev => [...prev, newComment as unknown as PostComment]);
        setCommentText('');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="h-32 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="mb-6">The post you're looking for might have been removed or doesn't exist.</p>
        <Link href="/community" className="text-[#4A7B61] font-medium hover:text-[#58534D] transition-colors no-underline px-4 py-2 rounded-full bg-[#F8F7F2]">
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F7F2] min-h-screen pb-16">
      {/* Header with back button */}
      <div className="relative rounded-b-2xl overflow-hidden mb-6 border-b border-[#4A7B61]/20">
        <div className="absolute inset-0 bg-[#4A7B61]/15"></div>
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 relative z-10">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/community')} 
              className="inline-flex items-center text-[#2C2925] hover:text-[#4A7B61] transition-colors mr-4"
              aria-label="Back to community"
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
              <span className="ml-2 font-medium">Back</span>
            </button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#4A7B61]/30 border-t-[#4A7B61] rounded-full animate-spin"></div>
        </div>
      ) : !post ? (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-2xl font-semibold text-[#2C2925] mb-4">Post not found</h1>
          <p className="text-[#706C66] mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Link href="/community" className="inline-flex items-center px-4 py-2 bg-[#4A7B61] text-white rounded-full hover:bg-[#3A6B51] transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Community
          </Link>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Post content */}
          <div className="bg-white rounded-xl border border-[#E8E6E1] p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author?.full_name || 'User')}
                  alt={post.author?.full_name || 'User'}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1]"
                />
                
                <div>
                  <div className="font-medium">{post.author?.full_name || 'Anonymous'}</div>
                  <div className="text-sm text-[#706C66]">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              
              {isOwnPost && (
                <div className="relative">
                  <button 
                    onClick={() => setShowOptions(!showOptions)}
                    className="text-[#706C66] hover:text-[#4A7B61] transition-colors p-2 rounded-full hover:bg-[#4A7B61]/15"
                    aria-label="Post options"
                  >
                    <MoreVertical size={16} className="text-[#58534D]" />
                  </button>
                  
                  {showOptions && (
                    <div 
                      ref={optionsRef}
                      className="absolute right-0 top-8 bg-white shadow-md rounded-md py-1 z-10 min-w-[140px] border border-[#E8E6E1]"
                    >
                      <button
                        onClick={handleDeletePost}
                        className="flex items-center w-full px-4 py-3 text-sm text-left text-red-600 hover:bg-[#4A7B61]/10"
                      >
                        <Trash size={16} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {post.category && (
              <div className="mb-3">
                <span className="inline-block text-xs px-3 py-1 bg-[#4A7B61]/15 rounded-full text-[#4A7B61] font-medium border border-[#4A7B61]/20">{post.category}</span>
              </div>
            )}
            
            <h1 className="text-2xl font-semibold mb-4 text-[#2C2925]">{post.title}</h1>
            
            <div className="text-[#2C2925] mb-6 whitespace-pre-wrap">
              {post.content}
            </div>
            
            <div className="flex items-center pt-4 border-t border-[#E8E6E1]/60">
              <button 
                onClick={handleLikeToggle}
                disabled={!user}
                className="flex items-center mr-6 hover:text-[#E74C3C] transition-colors group"
              >
                <Heart 
                  size={18} 
                  className={`${hasLiked ? "text-[#E74C3C] fill-[#E74C3C]" : "text-[#706C66] group-hover:text-[#E74C3C]/70"} mr-2`}
                  strokeWidth={hasLiked ? 0 : 2}
                />
                <span className={`${hasLiked ? "text-[#E74C3C]" : "text-[#706C66] group-hover:text-[#E74C3C]/70"}`}>{post.likes || 0} likes</span>
              </button>
              
              <div className="text-[#706C66]">
                {comments.length} comments
              </div>
            </div>
          </div>
          
          {/* Comments section */}
          <div className="bg-white rounded-xl border border-[#E8E6E1] p-6">
            <h2 className="text-lg font-semibold mb-6 text-[#2C2925]">Comments</h2>
            
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4A7B61]/15 text-[#4A7B61] mb-4">
                  <Send size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-[#2C2925] mb-2">No comments yet</h3>
                <p className="text-[#706C66] mb-4">Be the first to join the conversation</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-[#E8E6E1]/60 pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <img
                        src={comment.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.author?.full_name || 'User')}
                        alt={comment.author?.full_name || 'User'}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1]"
                      />
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-sm text-[#2C2925]">{comment.author?.full_name || 'Anonymous'}</span>
                          <span className="text-xs text-[#706C66]">
                            {new Date(comment.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="text-[#58534D] whitespace-pre-wrap text-sm">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add comment form */}
            {user ? (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3 text-[#2C2925]">Add a comment</h3>
                <form onSubmit={handleSubmitComment}>
                  <div className="relative">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full border border-[#E8E6E1] rounded-lg p-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A7B61] focus:border-[#4A7B61] resize-none min-h-[100px]"
                    ></textarea>
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="absolute right-2 bottom-2 text-[#4A7B61] hover:text-[#3A6B51] transition-colors disabled:text-[#A9A6A1] disabled:cursor-not-allowed p-2"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-[#4A7B61]/15 rounded-lg text-center">
                <Link href="/auth/signin" className="font-medium text-[#4A7B61] hover:underline">
                  Sign in to join the conversation
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 