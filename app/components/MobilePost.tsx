import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Send, MoreVertical, Trash2, Share2, Check } from 'lucide-react';
import { Post } from '@/app/lib/types';
import { PostComment } from '@/app/types/database';

interface MobilePostProps {
  post: Post & { currentUser?: any };
  currentUserId: string | null;
  onLikeToggle: (postId: string) => void;
  onViewPost: (postId: string) => void;
  onToggleComments?: (postId: string) => Promise<PostComment[]>;
  onAddComment?: (postId: string, content: string) => Promise<PostComment | null>;
  onCommentLike?: (commentId: string) => Promise<void>;
  onCommentDelete?: (commentId: string) => Promise<void>;
  onPostDelete?: (postId: string) => void;
}

// Define CommentActionMenu before it's used
interface CommentActionMenuProps {
  commentId: string;
  onDelete: () => void;
}

const CommentActionMenu = ({ commentId, onDelete }: CommentActionMenuProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close the menu when clicking outside
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
        className="p-1 rounded-full text-[#706C66] hover:bg-gray-100"
        aria-label="Comment options"
      >
        <MoreVertical size={16} />
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-50"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Add a PostActionMenu component for post actions
interface PostActionMenuProps {
  postId: string;
  onDelete: () => void;
}

const PostActionMenu = ({ postId, onDelete }: PostActionMenuProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close the menu when clicking outside
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
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1 rounded-full text-[#706C66] hover:bg-gray-100"
        aria-label="Post options"
      >
        <MoreVertical size={18} />
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-gray-50"
          >
            <Trash2 size={14} />
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

const MobilePost = ({ 
  post, 
  currentUserId, 
  onLikeToggle,
  onViewPost,
  onToggleComments,
  onAddComment,
  onCommentLike,
  onCommentDelete,
  onPostDelete
}: MobilePostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  // Instead of just Mar 7 format, use a smarter time display
  const getTimeElapsed = () => {
    const now = new Date();
    const created = new Date(post.created_at);
    const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      // Format date as "Mar 7"
      return new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  // For content, show content with title as first line if title exists
  const displayText = post.content || '';

  const handleToggleComments = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If no comment functionality, just view the post
    if (!onToggleComments) {
      onViewPost(post.id);
      return;
    }
    
    // If already showing comments, simply hide them
    if (showComments) {
      setShowComments(false);
      return;
    }
    
    // Show the loading state
    setIsLoadingComments(true);
    setShowComments(true); // Show container with loading indicator
    
    try {
      // Fetch the comments
      const fetchedComments = await onToggleComments(post.id);
      // Update state with fetched comments
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Don't hide comments area - show the "no comments" message instead
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId || !commentText.trim() || !onAddComment) return;
    
    try {
      const newComment = await onAddComment(post.id, commentText.trim());
      if (newComment) {
        setComments(prev => [...prev, newComment]);
        setCommentText('');
        setToast('Comment added successfully');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setToast('Failed to add comment');
    }
  };

  // Handle like button click with animation
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUserId) {
      // If the post is not yet liked, trigger animation
      if (!post.has_liked) {
        setIsLikeAnimating(true);
        setTimeout(() => {
          setIsLikeAnimating(false);
        }, 700); // Animation duration + a little buffer
      }
      // Don't update local state here, just call the parent handler
      onLikeToggle(post.id);
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

  return (
    <div className="border-b border-[#E8E6E1] px-3 py-4 hover:bg-[#FAFAFA] transition-colors">
      <div 
        className="flex gap-3 relative"
        onClick={(e) => {
          // Prevent navigation when comments are open
          if (!showComments) {
            onViewPost(post.id);
          }
        }}
      >
        {/* User avatar */}
        <img
          src={post.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author?.full_name || 'User')}
          alt={post.author?.full_name || 'User'}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1]"
        />
        
        {/* Post content */}
        <div className="flex-1 min-w-0">
          {/* Author info and date */}
          <div className="flex items-center">
            <span className="font-bold text-[15px] text-[#2C2925]">
              {post.author?.full_name || 'Anonymous'}
            </span>
            <span className="text-[#706C66] text-[14px] ml-1.5">
              · {getTimeElapsed()}
            </span>
            
            {/* Add post options menu if user is the author */}
            {currentUserId && post.author?.id === currentUserId && onPostDelete && (
              <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                <PostActionMenu 
                  postId={post.id} 
                  onDelete={() => {
                    if (onPostDelete) {
                      if (confirm('Are you sure you want to delete this post?')) {
                        onPostDelete(post.id);
                        setToast('Post deleted successfully');
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Post title & content combined */}
          {post.title && (
            <h3 className="font-bold text-[16px] mt-1 text-[#2C2925]">
              {post.title}
            </h3>
          )}
          
          {/* Post content */}
          <p className="text-[#2C2925] text-[15px] mt-1 mb-2 break-words leading-snug line-clamp-5">
            {displayText}
          </p>
          
          {/* Category tag */}
          {post.category && (
            <div className="mb-2 mt-1">
              <span className="text-sm px-4 py-1.5 rounded-full bg-[#E8F5EE] text-[#4A7B61] font-medium hover:bg-[#dcf0e6] transition-colors">
                {post.category}
              </span>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex items-center gap-6 mt-3 text-[#706C66]">
            <button 
              onClick={handleLikeClick}
              className="flex items-center gap-2 group"
              aria-label={post.has_liked ? "Unlike" : "Like"}
            >
              <div className={isLikeAnimating ? "animate-heartbeat" : ""}>
                <HeartIcon isLiked={post.has_liked} />
              </div>
              <span className={`text-base ${post.has_liked ? "text-[#E74C3C]" : "text-[#706C66] group-hover:text-[#4A7B61]"} transition-colors`}>
                {post.likes || 0}
              </span>
            </button>
            
            <button 
              onClick={handleToggleComments}
              className="flex items-center gap-2 group hover:text-[#4A7B61] transition-colors"
              aria-label="Comments"
            >
              <CommentIcon />
              <span className="text-base group-hover:text-[#4A7B61] transition-colors">{post.comments || 0}</span>
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-[#4A7B61] active:scale-95 transition-all"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-[#E8E6E1] pl-12">
          {/* Loading state */}
          {isLoadingComments ? (
            <div className="flex justify-center items-center py-4">
              <div className="w-5 h-5 border-2 border-[#4A7B61] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-3 px-4 rounded-lg bg-[#F5F5F5] text-center">
              <p className="text-[#706C66] text-sm">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-2 group">
                  <img
                    src={comment.author?.avatar_url || 'https://ui-avatars.com/api/?name=User'}
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
                      
                      {/* Add three-dot menu for comment actions if user is author */}
                      {currentUserId && comment.author?.id === currentUserId && (
                        <CommentActionMenu 
                          commentId={comment.id} 
                          onDelete={() => {
                            if (onCommentDelete && comment.id) {
                              if (confirm('Are you sure you want to delete this comment?')) {
                                // Remove comment from local state immediately
                                setComments(comments.filter(c => c.id !== comment.id));
                                // Call API to delete from database
                                onCommentDelete(comment.id).catch((error) => {
                                  console.error('Error deleting comment:', error);
                                  // If error, refetch comments
                                  if (onToggleComments) {
                                    onToggleComments(post.id).then(fetchedComments => {
                                      setComments(fetchedComments);
                                    });
                                  }
                                });
                                setToast('Comment deleted successfully');
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                    <p className="text-sm text-[#2C2925] mt-0.5 mb-1.5 break-words">{comment.content}</p>
                    <button
                      onClick={() => {
                        if (currentUserId && onCommentLike && comment.id) {
                          // Clone the current comments array
                          const updatedComments = [...comments];
                          
                          // Find the comment to update
                          const commentIndex = updatedComments.findIndex(c => c.id === comment.id);
                          if (commentIndex > -1) {
                            // Toggle has_liked and update likes count
                            const oldHasLiked = updatedComments[commentIndex].has_liked || false;
                            updatedComments[commentIndex].has_liked = !oldHasLiked;
                            updatedComments[commentIndex].likes = (updatedComments[commentIndex].likes || 0) + (oldHasLiked ? -1 : 1);
                          }
                          
                          // Update state with the new array (proper React pattern)
                          setComments(updatedComments);
                          
                          // Call the API to update the database
                          onCommentLike(comment.id).catch((error) => {
                            console.error('Error toggling comment like:', error);
                            // Revert to previous state if API call fails
                            setComments(comments);
                          });
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs text-[#706C66] hover:text-[#4A7B61] transition-colors"
                    >
                      <HeartIcon isLiked={comment.has_liked} />
                      <span>{comment.likes || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Add comment form */}
          {currentUserId && onAddComment && (
            <form onSubmit={handleSubmitComment} className="mt-4 mb-2 flex items-center gap-2">
              <img
                src={post.currentUser?.avatar_url || 'https://ui-avatars.com/api/?name=User'}
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1]"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full border border-[#E8E6E1] rounded-full py-2 px-4 pr-11 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A7B61] bg-[#F8F8F8] transition-all"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4A7B61] disabled:text-[#A9A6A1] hover:text-[#3A6B51] transition-colors p-1.5"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Toast message */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

// Custom heart icon that looks more like the one in the screenshot
const HeartIcon = ({ isLiked }: { isLiked?: boolean }) => {
  return isLiked ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#E74C3C" stroke="none" className="text-[#E74C3C]">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:text-[#4A7B61] transition-colors">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
};

// Custom comment icon
const CommentIcon = () => {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:text-[#4A7B61] transition-colors">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
};

export default MobilePost; 