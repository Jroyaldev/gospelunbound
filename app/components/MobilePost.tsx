import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Send, MoreVertical, Trash2 } from 'lucide-react';
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

  // Format date as "Mar 7"
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
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
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="border-b border-[#E8E6E1] px-3 py-4">
      <div 
        className="flex gap-3"
        onClick={() => onViewPost(post.id)}
      >
        {/* User avatar */}
        <img
          src={post.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author?.full_name || 'User')}
          alt={post.author?.full_name || 'User'}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        
        {/* Post content */}
        <div className="flex-1 min-w-0">
          {/* Author info and date */}
          <div className="flex items-center">
            <span className="font-bold text-[15px] text-[#2C2925]">
              {post.author?.full_name || 'Anonymous'}
            </span>
            <span className="text-[#706C66] text-[14px] ml-1.5">
              · {formattedDate}
            </span>
            
            {/* Add post options menu if user is the author */}
            {currentUserId && post.author?.id === currentUserId && onPostDelete && (
              <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                <PostActionMenu 
                  postId={post.id} 
                  onDelete={() => {
                    if (onPostDelete) {
                      onPostDelete(post.id);
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
              <span className="text-sm px-4 py-1.5 rounded-full bg-[#E8F5EE] text-[#4A7B61] font-normal">
                {post.category}
              </span>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex items-center gap-7 mt-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (currentUserId) {
                  // Don't update local state here, just call the parent handler
                  // The parent will optimistically update the posts array
                  // which will then flow down to this component as a prop
                  onLikeToggle(post.id);
                }
              }}
              className="flex items-center gap-2"
              aria-label={post.has_liked ? "Unlike" : "Like"}
            >
              <HeartIcon isLiked={post.has_liked} />
              <span className={`text-base ${post.has_liked ? "text-[#E74C3C]" : "text-[#706C66]"}`}>
                {post.likes || 0}
              </span>
            </button>
            
            <button 
              onClick={handleToggleComments}
              className="flex items-center gap-2"
              aria-label="Comments"
            >
              <CommentIcon />
              <span className="text-base text-[#706C66]">{post.comments || 0}</span>
              {showComments ? (
                <ChevronUp size={16} className="text-[#706C66]" />
              ) : (
                <ChevronDown size={16} className="text-[#706C66]" />
              )}
            </button>
            
            <button 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
              aria-label="Share"
            >
              <ShareIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pl-14 pr-3">
          {isLoadingComments ? (
            <div className="py-3 flex justify-center">
              <div className="w-5 h-5 border-2 border-[#4A7B61] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {comments.length === 0 ? (
                <div className="py-3 text-center text-sm text-[#706C66]">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="space-y-3 mb-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <img
                        src={comment.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.author?.full_name || 'User')}
                        alt={comment.author?.full_name || 'User'}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
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
                                }
                              }}
                            />
                          )}
                        </div>
                        <p className="text-sm text-[#2C2925] mt-0.5">{comment.content}</p>
                        
                        <div className="flex items-center gap-3 mt-1">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (onCommentLike && comment.id && currentUserId) {
                                // Create a new copy of comments with the updated like status
                                const updatedComments = comments.map(c => {
                                  if (c.id === comment.id) {
                                    return {
                                      ...c,
                                      has_liked: !c.has_liked,
                                      likes: Math.max(0, (c.likes || 0) + (c.has_liked ? -1 : 1))
                                    };
                                  }
                                  return c;
                                });
                                
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
                            className="flex items-center gap-1.5 text-xs text-[#706C66]"
                          >
                            <HeartIcon isLiked={comment.has_liked} />
                            <span>{comment.likes || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add comment form */}
              {currentUserId && onAddComment && (
                <form onSubmit={handleSubmitComment} className="mt-3 mb-2 flex items-center gap-2">
                  <img
                    src={post.currentUser?.avatar_url || 'https://ui-avatars.com/api/?name=User'}
                    alt="Your avatar"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full border border-[#E8E6E1] rounded-full py-1.5 px-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A7B61] bg-[#F8F8F8]"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4A7B61] disabled:text-[#A9A6A1]"
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
  );
};

// Custom heart icon that looks more like the one in the screenshot
const HeartIcon = ({ isLiked }: { isLiked?: boolean }) => {
  return isLiked ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#E74C3C" stroke="none" className="text-[#E74C3C]">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2" className="text-[#8E8E93]">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
};

// Custom comment icon
const CommentIcon = () => {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
};

// Custom share icon
const ShareIcon = () => {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
};

export default MobilePost; 