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
        const postData = await getPost(postId);
        setPost(postData);
        
        if (postData) {
          const commentsData = await getPostComments(postId);
          // Using type assertion to match types
          setComments(commentsData as unknown as PostComment[]);
          
          if (user) {
            const hasLiked = await isPostLikedByUser(user.id, postId);
            setHasLiked(hasLiked);
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
      await togglePostLike(user.id, postId);
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
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6 pl-16 sm:pl-0">
        <Link 
          href="/community" 
          className="inline-flex items-center text-[#58534D] px-3 py-2 rounded-full bg-[#F8F7F2] hover:bg-[#E8E6E1] transition-colors no-underline"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Community
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-6 mb-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            <img
              src={post.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author?.full_name || 'User')}
              alt={post.author?.full_name || 'User'}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
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
                className="text-[#706C66] hover:text-[#4A7B61] transition-colors p-2 rounded-full hover:bg-[#F5F4F2]"
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
                    className="flex items-center w-full px-4 py-3 text-sm text-left text-red-600 hover:bg-gray-100"
                  >
                    <Trash size={16} className="mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-semibold mb-4">{post.title}</h1>
        
        <div className="text-[#2C2925] mb-6 whitespace-pre-wrap">
          {post.content}
        </div>
        
        <div className="flex items-center mt-4">
          <button 
            onClick={handleLikeToggle}
            disabled={!user}
            className="flex items-center mr-6"
          >
            <Heart 
              size={18} 
              className={`${hasLiked ? "text-[#E74C3C] fill-[#E74C3C]" : "text-[#706C66]"} mr-2`}
            />
            <span>{post.likes || 0} likes</span>
          </button>
          
          <div className="text-[#706C66]">
            {comments.length} comments
          </div>
        </div>
      </div>
      
      {/* Comments section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-6">
        <h2 className="text-lg font-semibold mb-6 text-[#2C2925]">Comments</h2>
        
        {comments.length === 0 ? (
          <div className="text-[#706C66] mb-6 text-center py-6 bg-[#F8F7F2]/50 rounded-lg">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-[#E8E6E1]/60 pb-4">
                <div className="flex items-start gap-3">
                  <img
                    src={comment.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.author?.full_name || 'User')}
                    alt={comment.author?.full_name || 'User'}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1]"
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{comment.author?.full_name || 'Anonymous'}</span>
                      <span className="text-xs text-[#706C66]">
                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="text-[#2C2925] whitespace-pre-wrap text-sm">
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
          <form onSubmit={handleSubmitComment} className="mt-6">
            <div className="flex items-start gap-3">
              <img
                src={userProfile?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userProfile?.full_name || user?.email?.split('@')[0] || 'User')}
                alt={userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1]"
              />
              
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-3 border border-[#E8E6E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4A7B61] focus:border-[#4A7B61] text-sm resize-none"
                  rows={3}
                ></textarea>
                
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-4 py-2 bg-[#4A7B61] text-white text-sm rounded-full disabled:opacity-50 hover:bg-[#3A6B51] transition-colors"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-6 p-4 bg-[#F8F7F2] text-center rounded-lg">
            <p className="text-[#706C66] mb-2">Sign in to join the conversation</p>
            <Link href="/auth/login" className="text-[#4A7B61] font-medium hover:text-[#58534D] transition-colors no-underline">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 