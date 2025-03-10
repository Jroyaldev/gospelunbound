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
    <div className="bg-white mb-4 rounded-xl border border-[#E8E6E1] shadow-sm overflow-hidden">
      {/* Post header with user info */}
      <div className="p-4 flex items-center justify-between border-b border-[#E8E6E1]">
        <div className="flex items-center">
          {/* User avatar */}
          <div className="w-10 h-10 rounded-full bg-[#F4F2ED] overflow-hidden mr-3">
            {post.author?.avatar_url ? (
              <img 
                src={post.author.avatar_url} 
                alt={post.author.username || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#E8E6E1] text-[#706C66]">
                {post.author?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          
          {/* User name and post time */}
          <div>
            <div className="font-medium text-[#2C2925]">
              {post.author?.full_name || post.author?.username || 'Anonymous'}
            </div>
            <div className="text-xs text-[#706C66]">{getTimeElapsed()}</div>
          </div>
        </div>
        
        {/* Post actions menu */}
        {currentUserId === post.user_id && onPostDelete && (
          <PostActionMenu postId={post.id} onDelete={() => onPostDelete(post.id)} />
        )}
      </div>
      
      {/* Post content */}
      <div className="p-4" onClick={() => onViewPost(post.id)}>
        {/* Post title - if exists */}
        {post.title && (
          <h3 className="text-lg font-semibold text-[#2C2925] mb-2">{post.title}</h3>
        )}
        
        {/* Post text - show full content with proper formatting */}
        <div className="text-[#58534D] whitespace-pre-line">
          {displayText}
        </div>
        
        {/* Post metrics - likes and comments count */}
        <div className="flex items-center mt-4 text-xs text-[#706C66]">
          <div className="flex items-center">
            <HeartIcon isLiked={post.has_liked} />
            <span className="ml-1">{post.likes || 0}</span>
          </div>
          <div className="mx-2">•</div>
          <div className="flex items-center">
            <CommentIcon />
            <span className="ml-1">{comments.length} comments</span>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="border-t border-[#E8E6E1] flex">
        <button
          onClick={handleLikeClick}
          className={`flex-1 py-3 flex items-center justify-center gap-2 ${
            post.has_liked 
              ? 'text-red-500 font-medium' 
              : 'text-[#706C66]'
          } transition-colors active:bg-[#F8F7F2]`}
        >
          <HeartIcon 
            isLiked={post.has_liked} 
            className={`${isLikeAnimating ? 'animate-heartbeat' : ''}`} 
          />
          <span>Like</span>
        </button>
        
        <button
          onClick={handleToggleComments}
          className="flex-1 py-3 flex items-center justify-center gap-2 text-[#706C66] transition-colors active:bg-[#F8F7F2]"
        >
          <CommentIcon />
          <span>Comment</span>
        </button>
        
        <button
          onClick={handleShare}
          className="flex-1 py-3 flex items-center justify-center gap-2 text-[#706C66] transition-colors active:bg-[#F8F7F2]"
        >
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>
      
      {/* Comments section */}
      {showComments && (
        <div className="bg-[#F8F7F2] border-t border-[#E8E6E1] p-4">
          {/* Comment form */}
          {currentUserId && onAddComment && (
            <form onSubmit={handleSubmitComment} className="mb-4">
              <div className="flex">
                <div className="w-8 h-8 rounded-full bg-[#F4F2ED] overflow-hidden mr-2 shrink-0">
                  {post.currentUser?.avatar_url ? (
                    <img 
                      src={post.currentUser.avatar_url} 
                      alt={post.currentUser.username || 'You'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#E8E6E1] text-[#706C66]">
                      {post.currentUser?.username?.charAt(0)?.toUpperCase() || 'Y'}
                    </div>
                  )}
                </div>
                
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-white border border-[#E8E6E1] rounded-full pl-4 pr-12 py-2 text-sm focus:outline-none focus:border-[#4A7B61] focus:ring-1 focus:ring-[#4A7B61]"
                  />
                  
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#4A7B61] p-1 rounded-full disabled:opacity-50 disabled:text-[#706C66]"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </form>
          )}
          
          {/* Comments list */}
          {isLoadingComments ? (
            <div className="flex justify-center items-center py-6">
              <div className="w-5 h-5 border-2 border-[#4A7B61] border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-[#706C66]">Loading comments...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-[#706C66]">No comments yet</p>
              <p className="text-xs text-[#706C66] mt-1">Be the first to comment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex">
                    {/* Comment author avatar */}
                    <div className="w-8 h-8 rounded-full bg-[#F4F2ED] overflow-hidden mr-2 shrink-0">
                      {comment.author?.avatar_url ? (
                        <img 
                          src={comment.author.avatar_url} 
                          alt={comment.author.username || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#E8E6E1] text-[#706C66]">
                          {comment.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="bg-[#F8F7F2] rounded-lg p-2 mb-1">
                        <div className="font-medium text-sm text-[#2C2925]">
                          {comment.author?.full_name || comment.author?.username || 'Anonymous'}
                        </div>
                        <div className="text-sm text-[#58534D]">{comment.content}</div>
                      </div>
                      
                      <div className="flex items-center text-xs text-[#706C66] pl-2">
                        <button
                          onClick={() => onCommentLike && onCommentLike(comment.id)}
                          className={`mr-3 ${comment.has_liked ? 'text-red-500' : ''}`}
                        >
                          Like
                        </button>
                        {/* Timestamp */}
                        <span className="text-xs">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        
                        {/* Delete option - only for comment author */}
                        {currentUserId === comment.user_id && onCommentDelete && (
                          <div className="ml-auto">
                            <CommentActionMenu 
                              commentId={comment.id} 
                              onDelete={() => onCommentDelete(comment.id)} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Toast notifications */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

// Add this CSS animation to globals.css or add it inline here
// @keyframes heartbeat {
//   0% { transform: scale(1); }
//   25% { transform: scale(1.3); }
//   50% { transform: scale(1); }
//   75% { transform: scale(1.3); }
//   100% { transform: scale(1); }
// }

// Update these icon components to be more modern
const HeartIcon = ({ isLiked, className = '' }: { isLiked?: boolean, className?: string }) => (
  <svg 
    className={`w-5 h-5 ${className}`} 
    fill={isLiked ? 'currentColor' : 'none'} 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
    />
  </svg>
);

const CommentIcon = () => (
  <svg 
    className="w-5 h-5" 
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
);

export default MobilePost; 