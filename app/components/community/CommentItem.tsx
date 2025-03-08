'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart, MoreVertical, Trash, Reply } from 'lucide-react';
import { CommentItemProps } from '@/app/types/community';

/**
 * CommentItem component displays a comment in a discussion thread
 * 
 * Features:
 * - Supports parent and child comments with visual hierarchy
 * - Expandable text for long comments
 * - Like functionality
 * - Reply functionality
 * - Delete option for comment owners
 * - Nested replies with proper indentation
 */
const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  currentUserId, 
  onLikeToggle,
  onDeleteComment,
  onReply,
  isParentComment = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [localLiked, setLocalLiked] = useState(comment.has_liked || false);
  const [localLikeCount, setLocalLikeCount] = useState(comment.likes || 0);
  const commentContent = comment.content || '';
  const isLongComment = commentContent.length > 200;
  const isOwnComment = currentUserId === comment.user_id;
  const optionsRef = useRef<HTMLDivElement>(null);
  
  // Update local state when the comment prop changes
  useEffect(() => {
    setLocalLiked(comment.has_liked || false);
    setLocalLikeCount(comment.likes || 0);
  }, [comment.has_liked, comment.likes]);
  
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
  
  // Format date as "Mar 7"
  const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  // Handle like button click with immediate visual feedback
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Update local state immediately for better UX
    const newLikedStatus = !localLiked;
    setLocalLiked(newLikedStatus);
    setLocalLikeCount(prev => prev + (newLikedStatus ? 1 : -1));
    
    // Call the parent handler
    onLikeToggle(comment.id);
    
    // Log for debugging
    console.log(`Like toggled for comment ${comment.id}. New status: ${newLikedStatus}`);
  };

  // Handle delete comment
  const handleDeleteComment = (e: React.MouseEvent) => {
    e.preventDefault();
    onDeleteComment(comment.id);
    setShowOptions(false);
  };

  // Handle reply submission
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim() && onReply) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyForm(false);
    }
  };
  
  return (
    <div className={`flex gap-3 ${!isParentComment ? 'pl-6 border-l border-[#E8E6E1] ml-3' : ''}`}>
      <img 
        src={comment.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.author?.full_name || 'User')}
        alt={comment.author?.full_name || 'User'}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1]"
      />
      
      <div className="flex-1 min-w-0 overflow-hidden max-w-full">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="font-medium text-sm text-[#2C2925] truncate">{comment.author?.full_name || 'User'}</span>
              <span className="text-xs text-[#706C66] flex-shrink-0">{formattedDate}</span>
            </div>
            
            <div className="mt-1 text-[15px] text-[#58534D] break-words break-all w-full">
              {isLongComment && !isExpanded ? (
                <>
                  {commentContent.slice(0, 200)}...
                  <button 
                    onClick={() => setIsExpanded(true)}
                    className="text-[#4A7B61] text-sm hover:underline focus:outline-none ml-1"
                  >
                    See more
                  </button>
                </>
              ) : (
                commentContent
              )}
              
              {isLongComment && isExpanded && (
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="block text-[#4A7B61] text-sm hover:underline focus:outline-none mt-1"
                >
                  See less
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-1.5">
              <button 
                onClick={handleLikeClick}
                className={`flex items-center gap-1 text-xs ${localLiked ? 'text-red-500' : 'text-[#706C66] hover:text-[#4A7B61]'}`}
                disabled={!currentUserId}
              >
                <Heart size={14} fill={localLiked ? 'currentColor' : 'none'} />
                <span>{localLikeCount}</span>
              </button>
              
              {onReply && currentUserId && (
                <button 
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 text-xs text-[#706C66] hover:text-[#4A7B61]"
                >
                  <Reply size={14} />
                  <span>Reply</span>
                </button>
              )}
            </div>
            
            {/* Reply form */}
            {showReplyForm && onReply && (
              <form onSubmit={handleReplySubmit} className="mt-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-2 border border-[#E8E6E1] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#4A7B61] focus:border-[#4A7B61] min-h-[60px]"
                />
                <div className="flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyText('');
                      setShowReplyForm(false);
                    }}
                    className="px-3 py-1 text-xs text-[#706C66] hover:text-[#4A7B61]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-3 py-1 text-xs bg-[#4A7B61] text-white rounded-md hover:bg-[#3A6B51] disabled:bg-[#A9A6A1] disabled:cursor-not-allowed"
                  >
                    Reply
                  </button>
                </div>
              </form>
            )}
          </div>
          
          {isOwnComment && (
            <div className="relative mt-1">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="text-[#706C66] p-1 rounded-full hover:bg-gray-100"
                aria-label="Comment options"
              >
                <MoreVertical size={16} />
              </button>
              
              {showOptions && (
                <div 
                  ref={optionsRef}
                  className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-[#E8E6E1] z-10"
                >
                  <button
                    onClick={handleDeleteComment}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Replies section */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onLikeToggle={onLikeToggle}
                onDeleteComment={onDeleteComment}
                onReply={onReply}
                isParentComment={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
