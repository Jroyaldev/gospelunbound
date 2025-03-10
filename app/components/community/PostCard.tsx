'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { MoreVertical, Heart, MessageSquare, Trash, AlertCircle, Share2, BookmarkPlus } from 'lucide-react';
import { Post } from '@/app/lib/types';

interface PostCardProps {
  post: Post & {
    user_has_liked?: boolean;
    likes_count?: number;
    comments_count?: number;
  };
  currentUserId: string | null;
  onToggleLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onViewComments?: (postId: string) => void;
}

/**
 * PostCard Component
 * 
 * Displays a post in the community with the following features:
 * - Author avatar and name
 * - Post title and content
 * - Likes and comments count
 * - Like action
 * - Delete option for author
 * - Timestamp formatting
 */
const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  currentUserId, 
  onToggleLike, 
  onDelete,
  onViewComments 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  
  // Handle missing data gracefully
  const safePost = {
    ...post,
    author: post.author || { 
      username: 'Unknown', 
      full_name: 'Unknown User',
      avatar_url: null,
      id: '',
    },
    user_id: post.user_id || '',
    created_at: post.created_at || new Date().toISOString(),
    likes_count: post.likes_count || 0,
    user_has_liked: post.user_has_liked || false,
    comments_count: post.comments_count || 0
  };
  
  const isAuthor = currentUserId === safePost.user_id;
  
  // Format the date safely with relative time
  const formattedDate = (() => {
    try {
      const postDate = new Date(safePost.created_at);
      const now = new Date();
      const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        if (diffInHours < 1) {
          const minutes = Math.floor(diffInHours * 60);
          return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        }
        const hours = Math.floor(diffInHours);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return format(postDate, 'MMM d, yyyy');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  })();
  
  const handleToggleLike = () => {
    setIsLikeAnimating(true);
    onToggleLike(safePost.id);
    
    // Reset animation state after a short delay
    setTimeout(() => {
      setIsLikeAnimating(false);
    }, 600);
  };
  
  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(safePost.id);
      setConfirmDelete(false);
      setShowActions(false);
    } else {
      setConfirmDelete(true);
    }
  };
  
  const truncateContent = (content: string, maxLength: number = 300) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Handle comment link interaction
  const handleCommentsClick = (e: React.MouseEvent) => {
    if (onViewComments) {
      e.preventDefault();
      onViewComments(safePost.id);
    }
  };

  return (
    <div className="overflow-hidden transition-all">
      {/* Post header with author info */}
      <div className="p-4 border-b border-[#E8E6E1] flex items-center justify-between">
        <div className="flex items-center">
          {/* Author avatar with hover effect */}
          <Link 
            href={`/profile/${safePost.author?.username || '#'}`}
            className="block w-11 h-11 rounded-full overflow-hidden bg-[#F4F2ED] mr-3 transition-transform hover:scale-105 focus:scale-105 ring-offset-2 focus:ring-2 focus:ring-[#4A7B61]"
          >
            {safePost.author?.avatar_url ? (
              <Image 
                src={safePost.author.avatar_url} 
                alt={safePost.author.username || 'User'} 
                width={44} 
                height={44}
                className="object-cover w-full h-full transition-opacity hover:opacity-90"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#E8E6E1] text-[#706C66] font-medium">
                {safePost.author?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </Link>
          
          {/* Author name and post date */}
          <div>
            <Link 
              href={`/profile/${safePost.author?.username || '#'}`}
              className="font-medium text-[#2C2925] hover:text-[#4A7B61] transition-colors"
            >
              {safePost.author?.full_name || safePost.author?.username || 'Anonymous'}
            </Link>
            <p className="text-xs text-[#706C66] flex items-center">
              <span>{formattedDate}</span>
              
              {/* Show a dot separator and the reading time for posts */}
              <span className="mx-1.5">·</span>
              <span>
                {Math.max(1, Math.ceil(safePost.content.length / 1000))} min read
              </span>
            </p>
          </div>
        </div>
        
        {/* Post actions dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-full hover:bg-[#F4F2ED] active:bg-[#E8E6E1] text-[#706C66] transition-colors"
          >
            <MoreVertical size={18} className="transition-transform hover:rotate-90" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-[#E8E6E1] rounded-lg shadow-lg z-10 w-48 overflow-hidden animate-fadeIn">
              {isAuthor ? (
                <button
                  onClick={handleDeleteClick}
                  className={`w-full text-left px-4 py-2.5 hover:bg-[#F4F2ED] flex items-center ${
                    confirmDelete ? 'text-red-600 bg-red-50' : 'text-[#2C2925]'
                  }`}
                >
                  {confirmDelete ? (
                    <>
                      <AlertCircle size={16} className="mr-2 text-red-500" />
                      Confirm Delete
                    </>
                  ) : (
                    <>
                      <Trash size={16} className="mr-2 text-[#706C66]" />
                      Delete Post
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-[#F4F2ED] flex items-center text-[#2C2925]">
                    <Share2 size={16} className="mr-2 text-[#706C66]" />
                    Share Post
                  </button>
                  <button className="w-full text-left px-4 py-2.5 hover:bg-[#F4F2ED] flex items-center text-[#2C2925]">
                    <BookmarkPlus size={16} className="mr-2 text-[#706C66]" />
                    Save Post
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Post content */}
      <div className="p-5">
        <Link 
          href={`/community/posts/${safePost.id}`}
          className="block group cursor-pointer"
        >
          <h3 className="text-lg font-semibold text-[#2C2925] mb-3 group-hover:text-[#4A7B61] transition-colors">
            {safePost.title}
          </h3>
          <div className="text-[#58534D] whitespace-pre-line prose prose-sm max-w-none">
            {truncateContent(safePost.content)}
          </div>
          
          {/* Show "Read more" if content is truncated */}
          {safePost.content.length > 300 && (
            <span className="text-[#4A7B61] text-sm font-medium inline-block mt-2 group-hover:underline">
              Read more
            </span>
          )}
        </Link>
        
        {/* Mobile-optimized counts - visible only on smaller screens */}
        <div className="mt-4 flex items-center md:hidden">
          <div className="flex items-center text-[#706C66] mr-4">
            <Heart 
              size={16} 
              className={safePost.user_has_liked ? 'fill-red-500 text-red-500' : ''}
            />
            <span className="ml-1.5 text-xs">{safePost.likes_count}</span>
          </div>
          <div className="flex items-center text-[#706C66]">
            <MessageSquare size={16} />
            <span className="ml-1.5 text-xs">{safePost.comments_count}</span>
          </div>
        </div>
      </div>
      
      {/* Post footer with actions */}
      <div className="px-4 py-3 bg-[#F8F7F2] flex items-center justify-between border-t border-[#E8E6E1]">
        <div className="flex items-center post-actions">
          <button
            onClick={handleToggleLike}
            className={`flex items-center mr-4 px-3 py-2 rounded-md transition-all ${
              safePost.user_has_liked 
                ? 'text-red-500 hover:bg-red-50 active:bg-red-100' 
                : 'text-[#706C66] hover:bg-[#E8E6E1] active:bg-[#D8D6D1]'
            }`}
            aria-label={safePost.user_has_liked ? "Unlike post" : "Like post"}
          >
            <Heart 
              size={20} 
              className={`transition-all ${isLikeAnimating ? 'scale-125' : 'scale-100'} ${safePost.user_has_liked ? 'fill-red-500' : ''}`} 
            />
            <span className={`ml-2 text-sm font-medium hidden md:inline ${isLikeAnimating && safePost.user_has_liked ? 'animate-pulse' : ''}`}>
              {safePost.likes_count}
            </span>
            <span className="ml-2 text-sm font-medium md:hidden">
              Like
            </span>
          </button>
          
          {/* Use Link for SEO but override with click handler when provided */}
          {onViewComments ? (
            <button
              onClick={handleCommentsClick}
              className="flex items-center px-3 py-2 rounded-md text-[#706C66] hover:bg-[#E8E6E1] active:bg-[#D8D6D1] transition-colors"
              aria-label="View comments"
            >
              <MessageSquare size={20} />
              <span className="ml-2 text-sm font-medium hidden md:inline">{safePost.comments_count}</span>
              <span className="ml-2 text-sm font-medium md:hidden">Comment</span>
            </button>
          ) : (
            <Link
              href={`/community/posts/${safePost.id}`}
              className="flex items-center px-3 py-2 rounded-md text-[#706C66] hover:bg-[#E8E6E1] active:bg-[#D8D6D1] transition-colors"
              aria-label="View comments"
            >
              <MessageSquare size={20} />
              <span className="ml-2 text-sm font-medium hidden md:inline">{safePost.comments_count}</span>
              <span className="ml-2 text-sm font-medium md:hidden">Comment</span>
            </Link>
          )}
          
          {/* Share button */}
          <button
            className="flex items-center px-3 py-2 rounded-md text-[#706C66] hover:bg-[#E8E6E1] active:bg-[#D8D6D1] transition-colors ml-1 hidden sm:flex"
            aria-label="Share post"
          >
            <Share2 size={18} />
            <span className="ml-2 text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard; 