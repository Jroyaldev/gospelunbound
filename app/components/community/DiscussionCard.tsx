'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageSquare, MoreVertical, Trash, ChevronUp, ChevronDown, Send, Share2, Check } from 'lucide-react';
import { DiscussionCardProps } from '@/app/types/community';
import { PostComment } from '@/app/types/database';
import { createClient } from '@/app/lib/supabase/client';
import { toggleCommentLike } from '@/app/lib/supabase/database';

// Comment action menu component
interface CommentActionMenuProps {
  commentId: string;
  onDelete: () => void;
}

const CommentActionMenu = ({ commentId, onDelete }: CommentActionMenuProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative ml-auto" ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1 rounded-full text-[#706C66] hover:bg-gray-100 hover:text-[#4A7B61] transition-colors z-30"
        aria-label="Comment options"
      >
        <MoreVertical size={16} />
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
                setShowMenu(false);
                onDelete();
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-md"
          >
            <Trash size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Toast notification component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#4A7B61] text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <Check size={18} />
      <span>{message}</span>
    </div>
  );
};

/**
 * DiscussionCard component displays a post in the community feed
 * 
 * Features:
 * - Displays post title, content, author, and metadata
 * - Like functionality with visual feedback
 * - Inline comment viewing and interaction
 * - Post deletion for post owner
 * - Responsive design
 */
const DiscussionCard: React.FC<DiscussionCardProps> = ({
  post,
  currentUserId,
  currentUser,
  onLikeToggle,
  onDeletePost
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const isOwnPost = currentUserId === post.user_id;
  
  // Format date as "Mar 7, 2023"
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Calculate time elapsed
  const getTimeElapsed = () => {
    const postDate = new Date(post.created_at);
    const now = new Date();
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return formattedDate;
  };
  
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
  
  // Handle like button click
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set animation flag
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 500);
    
    onLikeToggle(post.id);
  };
  
  // Handle delete post
  const handleDeletePost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.') && onDeletePost) {
      onDeletePost(post.id);
    }
    
    setShowOptions(false);
  };

  // Function to fetch comments for this post
  const handleToggleComments = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If already showing comments, simply hide them
    if (showComments) {
      setShowComments(false);
      return;
    }
    
    // Show the loading state
    setIsLoadingComments(true);
    setShowComments(true);
    
    try {
      const supabase = await createClient();
      
      // Fetch comments for this post
      const { data, error } = await supabase
        .from("post_comments")
        .select(`
          *,
          profiles:user_id (id, username, full_name, avatar_url),
          comment_likes:comment_likes(count)
        `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      } else if (data) {
        // Process the data to include like counts and format it properly
        const commentsWithMetadata = await Promise.all(
          data.map(async (comment) => {
            // Format comment with proper fields
            const formattedComment = {
              ...comment,
              author: comment.profiles,
              likes: comment.comment_likes?.[0]?.count || 0,
              profiles: undefined,
              comment_likes: undefined,
              has_liked: false
            };
            
            // If user is logged in, check if they've liked this comment
            if (currentUserId) {
              try {
                const { data: likeData, error: likeError } = await supabase
                  .from('comment_likes')
                  .select('id')
                  .eq('user_id', currentUserId)
                  .eq('comment_id', comment.id)
                  .maybeSingle();
                
                if (!likeError) {
                  formattedComment.has_liked = !!likeData;
                }
              } catch (err) {
                console.error('Error checking comment like status:', err);
              }
            }
            
            return formattedComment;
          })
        );
        
        setComments(commentsWithMetadata as PostComment[]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Function to add a comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId || !commentText.trim()) return;
    
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          user_id: currentUserId,
          content: commentText.trim()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding comment:', error);
        return;
      }
      
      if (data) {
        // Add author info and add to comments
        const newComment = {
          ...data,
          has_liked: false,
          likes: 0,
          author: {
            id: currentUserId,
            username: currentUser?.username,
            full_name: currentUser?.full_name || 'User',
            avatar_url: currentUser?.avatar_url
          }
        };
        
        setComments(prev => [...prev, newComment]);
        setCommentText('');
        setToast('Comment added successfully');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Function to toggle like on a comment
  const handleCommentLike = async (commentId: string) => {
    if (!currentUserId) return;
    
    // Optimistically update UI
    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          const newLikedStatus = !comment.has_liked;
          return {
            ...comment,
            has_liked: newLikedStatus,
            likes: Math.max(0, (comment.likes || 0) + (newLikedStatus ? 1 : -1))
          };
        }
        return comment;
      })
    );
    
    try {
      // Call the database function
      await toggleCommentLike(currentUserId, commentId, true);
    } catch (error) {
      console.error('Error toggling comment like:', error);
      // If there's an error, revert changes
      handleToggleComments({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent);
    }
  };

  // Function to delete a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!currentUserId) return;
    
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUserId);
      
      if (error) {
        console.error('Error deleting comment:', error);
        return;
      }
      
      // Update comments list
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setToast('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Handle share functionality
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = window.location.origin + `/community/discussions/${post.id}`;
    
    // Try using the Web Share API first
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: 'Check out this discussion on Gospel Unbound',
        url: url
      }).catch(err => {
        console.error('Error sharing post:', err);
        copyToClipboard(url);
      });
    } else {
      copyToClipboard(url);
    }
  };

  // Helper function to copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setToast('Link copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        setToast('Failed to copy link');
      });
  };

  // Handler for navigating to post detail
  const handlePostClick = () => {
    if (!showComments) {
      window.location.href = `/community/discussions/${post.id}`;
    }
  };
  
  // Post content section - separating it out for clarity
  const PostContent = () => (
    <div className="bg-white rounded-lg border border-[#E8E6E1] shadow-sm hover:shadow-md transition-all duration-200 p-5 mb-5 relative group cursor-pointer hover:border-[#4A7B61]/30" onClick={handlePostClick}>
      <div className="flex gap-4 items-start relative">
        <img 
          src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.full_name || 'User')}`}
          alt={post.author?.full_name || 'User'}
          className="w-11 h-11 rounded-full object-cover border border-[#E8E6E1] shadow-sm"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="font-medium text-[#2C2925] truncate">{post.author?.full_name || 'User'}</span>
                <span className="text-xs text-[#706C66] px-1">·</span>
                <span className="text-xs text-[#706C66]">{getTimeElapsed()}</span>
              </div>
              
              <h3 className="text-lg font-semibold mt-2 mb-1.5 text-[#2C2925] line-clamp-2 leading-snug">{post.title}</h3>
              
              {post.content && (
                <div className="mt-1 mb-3 text-[#58534D] line-clamp-3 leading-relaxed">
                  {post.content}
                </div>
              )}
              
              {/* Category tag */}
              {post.category && (
                <div className="mt-3 mb-3">
                  <span className="text-sm px-4 py-1.5 rounded-full bg-[#E8F5EE] text-[#4A7B61] font-medium inline-block hover:bg-[#dcf0e6] transition-colors">
                    {post.category}
                  </span>
                </div>
              )}
            </div>
            
            {isOwnPost && (
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                  }}
                  className="text-[#58534D] p-1.5 rounded-full hover:bg-gray-100 relative z-20 hover:text-[#4A7B61] transition-colors"
                  aria-label="Post options"
                >
                  <MoreVertical size={18} />
                </button>
                
                {showOptions && (
                  <div 
                    ref={optionsRef}
                    className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-[#E8E6E1] z-30 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <button
                      onClick={handleDeletePost}
                      className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors rounded-md"
                    >
                      <Trash size={16} />
                      <span>Delete Post</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6 mt-4 z-20 relative">
            <button 
              onClick={handleLikeClick}
              className={`flex items-center gap-2 text-sm hover:scale-105 transition-transform ${post.has_liked ? 'text-red-500' : 'text-[#58534D] hover:text-red-500'}`}
            >
              <Heart 
                size={19} 
                fill={post.has_liked ? 'currentColor' : 'none'} 
                strokeWidth={post.has_liked ? 1.5 : 2} 
                className={isLikeAnimating ? 'animate-heartbeat' : ''}
              />
              <span>{post.likes || 0}</span>
            </button>
            
            <button
              onClick={handleToggleComments}
              className="flex items-center gap-2 text-sm text-[#58534D] hover:text-[#4A7B61] hover:scale-105 transition-all"
              aria-label={showComments ? "Hide comments" : "Show comments"}
              title={showComments ? "Hide comments" : "Show comments"}
            >
              <MessageSquare size={19} />
              <span>{post.comments || 0}</span>
              {showComments ? (
                <ChevronUp size={16} className="text-[#706C66]" />
              ) : (
                <ChevronDown size={16} className="text-[#706C66]" />
              )}
            </button>
            
            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm text-[#58534D] hover:text-[#4A7B61] hover:scale-105 transition-all"
              aria-label="Share"
              title="Share this post"
            >
              <Share2 size={18} />
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-5 pt-4 border-t border-[#E8E6E1] relative z-20 pointer-events-auto animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
              {isLoadingComments ? (
                <div className="py-6 flex justify-center items-center">
                  <div className="w-6 h-6 border-2 border-[#4A7B61] border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-sm text-[#706C66]">Loading comments...</span>
                </div>
              ) : (
                <>
                  {comments.length === 0 ? (
                    <div className="py-6 text-center text-sm text-[#706C66] bg-[#F8F7F4] rounded-md">
                      <p>No comments yet.</p>
                      <p className="mt-1 text-[#4A7B61]">Be the first to join the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-3 rounded-md hover:bg-[#F8F7F4] transition-colors">
                          <img
                            src={comment.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.author?.full_name || 'User')}
                            alt={comment.author?.full_name || 'User'}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1]"
                          />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium text-sm text-[#2C2925]">{comment.author?.full_name || 'Anonymous'}</span>
                              <span className="text-xs text-[#706C66] ml-1.5">
                                · {new Date(comment.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              
                              {/* Replace direct delete button with CommentActionMenu */}
                              {currentUserId === comment.user_id && (
                                <CommentActionMenu
                                  commentId={comment.id}
                                  onDelete={() => handleDeleteComment(comment.id)}
                                />
                              )}
                            </div>
                            <p className="text-sm text-[#2C2925] mt-1.5 mb-2 leading-relaxed">{comment.content}</p>
                            
                            <div className="flex items-center gap-3 mt-1">
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCommentLike(comment.id);
                                  return false;
                                }}
                                className={`flex items-center gap-1.5 text-xs ${comment.has_liked ? 'text-red-500' : 'text-[#706C66] hover:text-red-500'} relative z-30 hover:scale-105 transition-all`}
                                disabled={!currentUserId}
                                title={comment.has_liked ? "Unlike" : "Like"}
                              >
                                <Heart 
                                  size={14} 
                                  fill={comment.has_liked ? 'currentColor' : 'none'} 
                                  strokeWidth={comment.has_liked ? 1.5 : 2} 
                                />
                                <span>{comment.likes || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add comment form */}
                  {currentUserId && (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddComment(e);
                        return false;
                      }} 
                      className="mt-4 mb-2 flex items-center gap-3 relative z-30"
                    >
                      <img
                        src={currentUser?.avatar_url || 'https://ui-avatars.com/api/?name=User'}
                        alt="Your avatar"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1] shadow-sm"
                      />
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Add a comment..."
                          className="w-full border border-[#E8E6E1] rounded-full py-2 px-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A7B61] focus:border-[#4A7B61] bg-white hover:bg-[#F8F7F4] focus:bg-white transition-colors relative z-30"
                        />
                        <button
                          type="submit"
                          disabled={!commentText.trim()}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A7B61] disabled:text-[#A9A6A1] z-30 hover:scale-110 transition-transform disabled:hover:scale-100"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast messages */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
  
  return <PostContent />;
};

export default DiscussionCard;

// Custom share icon component
const ShareIcon = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
};
