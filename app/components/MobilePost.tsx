import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';
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
}

const MobilePost = ({ 
  post, 
  currentUserId, 
  onLikeToggle,
  onViewPost,
  onToggleComments,
  onAddComment,
  onCommentLike
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
                        </div>
                        <p className="text-sm text-[#2C2925] mt-0.5">{comment.content}</p>
                        
                        <div className="flex items-center gap-3 mt-1">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                if (onCommentLike && comment.id) {
                                  const wasLiked = comment.has_liked;
                                  const prevCount = comment.likes || 0;
                                  
                                  comment.has_liked = !wasLiked;
                                  comment.likes = Math.max(0, prevCount + (wasLiked ? -1 : 1));
                                  
                                  setComments([...comments]);
                                  
                                  onCommentLike(comment.id).catch(() => {
                                    comment.has_liked = wasLiked;
                                    comment.likes = prevCount;
                                    setComments([...comments]);
                                  });
                                }
                              } catch (err) {
                                console.error('Error toggling comment like:', err);
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