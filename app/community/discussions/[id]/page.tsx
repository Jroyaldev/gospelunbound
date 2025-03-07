'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Send } from 'lucide-react';
import { getPost, getPostComments, createPostComment, togglePostLike, isPostLikedByUser, getProfile } from '@/app/lib/supabase/database';
import { useAuth } from '@/app/context/auth-context';
import type { Post, PostComment, UserProfile } from '@/app/types/database';
import { createClient } from '@/app/lib/supabase/client';

export default function PostPage() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const postId = Array.isArray(id) ? id[0] : id as string;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const profile = await getProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    if (!authLoading && user) {
      fetchUserProfile();
    }
  }, [user, authLoading]);

  useEffect(() => {
    const fetchPostData = async () => {
      setIsLoading(true);
      try {
        if (postId) {
          const postData = await getPost(postId);
          setPost(postData);

          const commentsData = await getPostComments(postId);
          setComments(commentsData);
          
          if (user) {
            const liked = await isPostLikedByUser(user.id, postId);
            setHasLiked(liked);
          }
        }
      } catch (error) {
        console.error('Error fetching post data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (postId && !authLoading) {
      fetchPostData();
    }
  }, [postId, user, authLoading]);

  const handleLikeToggle = async () => {
    if (!user || !post) return;
    
    // Optimistic update
    setHasLiked(!hasLiked);
    setPost((prev: Post | null) => {
      if (!prev) return null;
      return {
        ...prev,
        likes: (prev.likes || 0) + (hasLiked ? -1 : 1)
      };
    });
    
    try {
      if (postId) {
        await togglePostLike(user.id, postId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on failure
      setHasLiked(!hasLiked);
      setPost((prev: Post | null) => {
        if (!prev) return null;
        return {
          ...prev,
          likes: (prev.likes || 0) + (hasLiked ? 1 : -1)
        };
      });
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim() || !post || !postId) return;
    
    try {
      const newComment = await createPostComment(user.id, {
        post_id: postId,
        content: commentText.trim()
      });
      
      if (newComment) {
        // Ensure we have author data even if the API didn't return it
        const commentWithAuthor = {
          ...newComment,
          author: newComment.author || {
            id: user.id,
            username: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        };
        
        setComments(prev => [...prev, commentWithAuthor]);
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
        <Link href="/community" className="text-blue-600 hover:underline">
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/community" className="flex items-center text-[#58534D] mb-6">
        <ArrowLeft size={16} className="mr-2" />
        Back to Community
      </Link>
      
      <div className="border-b border-[#E8E6E1] pb-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
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
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Comments</h2>
        
        {comments.length === 0 ? (
          <div className="text-[#706C66] mb-6">No comments yet. Be the first to comment!</div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-[#E8E6E1]/60 pb-4">
                <div className="flex items-start gap-3">
                  <img
                    src={comment.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.author?.full_name || 'User')}
                    alt={comment.author?.full_name || 'User'}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{comment.author?.full_name || 'Anonymous'}</span>
                      <span className="text-xs text-[#706C66]">
                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="text-[#2C2925] whitespace-pre-wrap">
                      {comment.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add comment form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mt-6">
          <div className="flex items-start gap-3">
            <img
              src={userProfile?.avatar_url || user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User')}&background=random`}
              alt={userProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            
            <div className="flex-1 relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full border border-[#E8E6E1] rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#6B8068] resize-none min-h-[100px]"
                required
              ></textarea>
              
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-3 bottom-3 text-[#6B8068] disabled:text-[#A9A6A1] disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-6 p-4 bg-[#F5F4F2] rounded-lg text-center">
          <p className="mb-2">Sign in to join the conversation</p>
          <Link href="/auth/signin" className="text-[#6B8068] font-medium hover:underline">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
} 