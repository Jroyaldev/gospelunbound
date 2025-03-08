'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Send, MoreVertical, Trash } from 'lucide-react';
import { getPost, getPostComments, createPostComment, togglePostLike, isPostLikedByUser, getProfile, deletePost, toggleCommentLike, deletePostComment } from '@/app/lib/supabase/database';
import { useAuth } from '@/app/context/auth-context';
import type { Post, UserProfile } from '@/app/types/database';
import { createClient } from '@/app/lib/supabase/client';
import { PostComment } from '@/app/types/community';
import CommentItem from '@/app/components/community/CommentItem';

/**
 * PostPage displays an individual discussion post with its comments
 * 
 * Features:
 * - Detailed view of a single post
 * - Comments section with ability to add/like/delete comments
 * - Post like functionality
 * - Delete option for post owner
 * - Back navigation to community page
 */
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

  /**
   * Fetch post, comments, and user data
   */
  const fetchData = useCallback(async () => {
    if (authLoading) return;
    
      setIsLoading(true);

      try {
        const postData = await getPost(postId, user ? user.id : undefined);
        setPost(postData);
        
        if (postData) {
        if (user) {
          setHasLiked(await isPostLikedByUser(user.id, postData.id));
          const profileData = await getProfile(user.id);
          setUserProfile(profileData);
        }
        
        const commentsData = await getPostComments(postData.id);
        
        // If user is logged in, check if they've liked each comment
        if (user) {
          const supabase = await createClient();
          
          // First, let's collect all comment IDs (both main comments and replies)
          const getAllCommentIds = (comments: any[]): string[] => {
            let ids: string[] = [];
            comments.forEach(comment => {
              ids.push(comment.id);
              // If we ever add nested replies, we'd collect their IDs here too
            });
            return ids;
          };
          
          const commentIds = getAllCommentIds(commentsData);
          
          // Batch query for all likes by current user
          const { data: userLikes, error } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .eq('user_id', user.id)
            .in('comment_id', commentIds);
              
          if (error) {
            console.error('Error getting comment likes:', error);
          } else {
            // Create a set of liked comment IDs for fast lookups
            const likedCommentIds = new Set(userLikes.map(like => like.comment_id));
              
            // Get comment like counts in one query - using count directly without group
            const likeCountMap: Record<string, number> = {};
              
            // Fetch counts for each comment separately since group() is causing issues
            await Promise.all(commentIds.map(async (commentId) => {
              const { count, error: countError } = await supabase
                .from('comment_likes')
                .select('*', { count: 'exact', head: true })
                .eq('comment_id', commentId);
                  
              if (!countError) {
                likeCountMap[commentId] = count || 0;
              }
            }));

            // Process all comments to add likes info
            const processCommentLikes = (comments: any[]): any[] => {
              return comments.map(comment => {
                const enhancedComment = {
                  ...comment,
                  has_liked: likedCommentIds.has(comment.id),
                  likes: likeCountMap[comment.id] || 0,
                  // If we ever add nested replies, we'd process them here
                };
                return enhancedComment;
              });
            };
            
            // Process all comments
            const processedComments = processCommentLikes(commentsData);
            
            // Organize comments with replies structure
            const parentComments: PostComment[] = [];
            const replyMap: Record<string, PostComment[]> = {};
              
            // First pass: identify all parent comments and replies
            processedComments.forEach(comment => {
              if (comment.parent_id) {
                // This is a reply
                if (!replyMap[comment.parent_id]) {
                  replyMap[comment.parent_id] = [];
                }
                replyMap[comment.parent_id].push({...comment, replies: []});
              } else {
                // This is a parent comment
                parentComments.push({...comment, replies: []});
              }
            });
              
            // Second pass: attach replies to parent comments
            parentComments.forEach(parentComment => {
              if (replyMap[parentComment.id]) {
                parentComment.replies = replyMap[parentComment.id];
              }
            });
              
            setComments(parentComments);
          }
        } else {
          // If not logged in, just organize the comments without like info
          const parentComments: PostComment[] = [];
          const replyMap: Record<string, PostComment[]> = {};
              
          commentsData.forEach(comment => {
            if (comment.parent_id) {
              // This is a reply
              if (!replyMap[comment.parent_id]) {
                replyMap[comment.parent_id] = [];
              }
              replyMap[comment.parent_id].push({...comment, replies: []} as PostComment);
            } else {
              // This is a parent comment
              parentComments.push({...comment, replies: []} as PostComment);
            }
          });
              
          // Attach replies to parent comments
          parentComments.forEach(parentComment => {
            if (replyMap[parentComment.id]) {
              parentComment.replies = replyMap[parentComment.id];
            }
          });
              
          setComments(parentComments);
          }
        }
      } catch (error) {
      console.error('Error fetching post data:', error);
      } finally {
        setIsLoading(false);
      }
  }, [authLoading, postId, user]);
    
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Handle post like toggle with optimistic update
   */
  const handleLikeToggle = async () => {
    if (!user || !post) return;
    
    // Optimistic update
    const newLikedStatus = !hasLiked;
    setHasLiked(newLikedStatus);
    setPost(prev => {
      if (!prev) return null;
      return {
        ...prev,
        likes: (prev.likes || 0) + (newLikedStatus ? 1 : -1)
      };
    });
    
    // API update
    try {
      // Use skipRevalidation=true and rely on optimistic updates instead of refetching
      await togglePostLike(user.id, post.id, true);
      
      // No need to refetch data - the optimistic update is sufficient
      // and the change will persist in the database
    } catch (error) {
      console.error('Error toggling post like:', error);
      // Revert optimistic update on error
      setHasLiked(!newLikedStatus);
      setPost(prev => {
        if (!prev) return null;
        return {
          ...prev,
          likes: (prev.likes || 0) + (newLikedStatus ? -1 : 1)
        };
      });
    }
  };

  /**
   * Handle post deletion
   */
  const handleDeletePost = async () => {
    if (!user || !post) return;
    
    try {
      await deletePost(post.id, user.id);
        router.push('/community');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  /**
   * Handle comment creation
   */
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim() || !post) return;
    
    try {
      const newComment = await createPostComment(user.id, {
        post_id: post.id,
        content: commentText.trim()
      });
      
      if (newComment) {
        // Add the new comment to the list with author info
        const commentWithAuthor = {
          ...newComment,
          has_liked: false,
          likes: 0,
          replies: [],
          author: {
            id: user.id,
            username: userProfile?.username,
            full_name: userProfile?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: userProfile?.avatar_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        };
        
        setComments(prev => [...prev, commentWithAuthor as PostComment]);
        setCommentText('');
        
        // Update post comment count
        setPost(prev => {
          if (!prev) return null;
          return {
            ...prev,
            comments: (prev.comments || 0) + 1
          };
        });
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  /**
   * Handle reply to comment
   */
  const handleReplyToComment = async (parentId: string, content: string) => {
    if (!user || !content.trim() || !post) return;
    
    try {
      const newReply = await createPostComment(user.id, {
        post_id: post.id,
        content: content.trim(),
        parent_id: parentId
      });
      
      if (newReply) {
        // Add reply with author info - use type assertion to handle author property
        const replyWithAuthor = {
          ...newReply,
          has_liked: false,
          likes: 0,
          author: {
            id: user.id,
            username: userProfile?.username,
            full_name: userProfile?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: userProfile?.avatar_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any // Use type assertion here
        } as PostComment;
        
        // Update comments with the new reply
        setComments(prevComments => {
          return prevComments.map(comment => {
            if (comment.id === parentId) {
              // Add reply to parent comment
              return {
                ...comment,
                replies: [...(comment.replies || []), replyWithAuthor]
              };
            }
            return comment;
          });
        });
        
        // Update post comment count
        setPost(prev => {
          if (!prev) return null;
          return {
            ...prev,
            comments: (prev.comments || 0) + 1
          };
        });
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  /**
   * Handle comment like toggle with optimistic update
   */
  const handleCommentLikeToggle = async (commentId: string) => {
    if (!user) return;
    
    console.log(`Toggle like for comment: ${commentId}`);
    
    // Helper to find and update comment in the nested structure
    const updateCommentLikeStatus = (comments: PostComment[], commentId: string, newLikeStatus: boolean): PostComment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          // Update this comment
          console.log(`Found comment to update: ${comment.id}, current like status: ${comment.has_liked}, new like status: ${newLikeStatus}`);
          return {
            ...comment,
            has_liked: newLikeStatus,
            likes: (comment.likes || 0) + (newLikeStatus ? 1 : -1)
          };
        } else if (comment.replies && comment.replies.length > 0) {
          // Check replies
          return {
            ...comment,
            replies: updateCommentLikeStatus(comment.replies, commentId, newLikeStatus)
          };
        }
        return comment;
      });
    };
    
    // Find the comment to update
    const findComment = (comments: PostComment[], commentId: string): PostComment | null => {
      for (const comment of comments) {
        if (comment.id === commentId) {
          return comment;
        }
        if (comment.replies) {
          const found = findComment(comment.replies, commentId);
          if (found) return found;
        }
      }
      return null;
    };
    
    const commentToUpdate = findComment(comments, commentId);
    if (!commentToUpdate) {
      console.error(`Comment with ID ${commentId} not found`);
      return;
    }
    
    const currentLikeStatus = commentToUpdate.has_liked || false;
    const newLikeStatus = !currentLikeStatus;
    
    console.log(`Toggling like for comment ${commentId}: ${currentLikeStatus} -> ${newLikeStatus}`);
    
    // Optimistic update
    setComments(prev => updateCommentLikeStatus(prev, commentId, newLikeStatus));
    
    // API update
    try {
      console.log(`Calling API to toggle like for comment ${commentId}`);
      const result = await toggleCommentLike(user.id, commentId, true);
      console.log(`API result for toggling like: ${result}`);
      
      if (!result) {
        console.error(`Error toggling comment like: API returned false`);
        // Revert optimistic update on error
        setComments(prev => updateCommentLikeStatus(prev, commentId, currentLikeStatus));
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
      // Revert optimistic update on error
      setComments(prev => updateCommentLikeStatus(prev, commentId, currentLikeStatus));
    }
  };

  /**
   * Handle comment deletion
   */
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    // Helper to filter out the deleted comment from the nested structure
    const filterDeletedComment = (comments: PostComment[], commentId: string): [PostComment[], boolean] => {
      let deleted = false;
      
      // First check if it's a top-level comment
      const filteredComments = comments.filter(comment => {
        if (comment.id === commentId) {
          deleted = true;
          return false;
        }
        return true;
      });
      
      // If not found at top level, check in replies
      if (!deleted) {
        return [comments.map(comment => {
          if (comment.replies && comment.replies.length > 0) {
            const [updatedReplies, wasDeleted] = filterDeletedComment(comment.replies, commentId);
            if (wasDeleted) {
              deleted = true;
              return { ...comment, replies: updatedReplies };
            }
          }
          return comment;
        }), deleted];
      }
      
      return [filteredComments, deleted];
    };
    
    // Optimistic update
    const [updatedComments, deleted] = filterDeletedComment(comments, commentId);
    if (deleted) {
      setComments(updatedComments);
      
      // Update post comment count
      setPost(prev => {
        if (!prev) return null;
        return {
          ...prev,
          comments: Math.max((prev.comments || 0) - 1, 0)
        };
      });
    }
    
    // API update
    try {
      await deletePostComment(user.id, commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Revert optimistic update on error
      fetchData();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A7B61]"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#2C2925] mb-2">Post not found</h2>
          <Link 
            href="/community" 
            className="inline-flex items-center text-[#4A7B61] hover:underline mt-2"
          >
            <ArrowLeft size={16} className="mr-1" />
          Back to Community
        </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Link 
        href="/community" 
        className="inline-flex items-center text-[#4A7B61] hover:underline mb-6"
      >
        <ArrowLeft size={16} className="mr-1" />
            Back to Community
          </Link>
      
      <div className="bg-white rounded-lg border border-[#E8E6E1] shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
                <img
                  src={post.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author?.full_name || 'User')}
                  alt={post.author?.full_name || 'User'}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1]"
                />
                
                <div>
                <h2 className="font-semibold text-[#2C2925]">{post.author?.full_name || 'User'}</h2>
                <p className="text-sm text-[#706C66]">
                    {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              </div>
              
            {user && post.author?.id === user.id && (
                <div className="relative">
                  <button 
                    onClick={() => setShowOptions(!showOptions)}
                  className="text-[#706C66] p-2 rounded-full hover:bg-gray-100"
                    aria-label="Post options"
                  >
                  <MoreVertical size={20} />
                  </button>
                  
                  {showOptions && (
                    <div 
                      ref={optionsRef}
                    className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-[#E8E6E1] z-10"
                    >
                      <button
                        onClick={handleDeletePost}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                      <Trash size={16} />
                      <span>Delete Post</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
          <h1 className="text-2xl font-bold text-[#2C2925] mb-4">{post.title}</h1>
          
          {post.content && (
            <div className="text-[#58534D] mb-6 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          )}
            
          <div className="flex items-center pt-4 border-t border-[#E8E6E1]">
              <button 
                onClick={handleLikeToggle}
                disabled={!user}
              className={`flex items-center gap-2 ${hasLiked ? 'text-red-500' : 'text-[#706C66]'} ${!user ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-500'}`}
            >
              <Heart size={20} fill={hasLiked ? 'currentColor' : 'none'} />
              <span>{post.likes || 0}</span>
              </button>
          </div>
        </div>
        
        <div className="border-t border-[#E8E6E1] p-6">
          <h3 className="text-lg font-semibold text-[#2C2925] mb-4">
            Comments ({post.comments || comments.length || 0})
          </h3>
          
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="flex items-start gap-3">
                      <img
                  src={userProfile?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userProfile?.full_name || 'User')}
                  alt={userProfile?.full_name || 'User'}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1]"
                      />
                      
                <div className="flex-1 relative">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-3 bg-white border border-[#E8E6E1] rounded-lg text-[#2C2925] placeholder-[#A9A6A1] focus:border-[#4A7B61] focus:ring-1 focus:ring-[#4A7B61] focus:outline-none min-h-[100px]"
                  />
                  
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                    className="mt-2 px-4 py-2 bg-[#4A7B61] text-white rounded-md hover:bg-[#3A6B51] transition-colors disabled:bg-[#A9A6A1] disabled:cursor-not-allowed flex items-center gap-2"
                    >
                    <Send size={16} />
                    <span>Post Comment</span>
                    </button>
                  </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 bg-[#F8F7F4] p-4 rounded-lg text-center">
              <p className="text-[#58534D]">
                <Link href="/auth/login" className="text-[#4A7B61] font-medium hover:underline">Sign in</Link> to join the conversation.
              </p>
            </div>
          )}
          
          {comments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-[#706C66]">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
            <div className="space-y-6">
              {comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id || null}
                  onLikeToggle={handleCommentLikeToggle}
                  onDeleteComment={handleDeleteComment}
                  onReply={user ? handleReplyToComment : undefined}
                />
              ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
} 