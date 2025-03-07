'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';
import { getPosts, getGroups, joinGroup, leaveGroup, togglePostLike, getProfile, getPostComments, createPostComment, toggleCommentLike, deletePostComment, deletePost } from '@/app/lib/supabase/database';
import { Post, Group, Profile } from '@/app/lib/types';
import { PostComment } from '@/app/types/database';
import { Search, Heart, MessageSquare, Plus, Send, X, ChevronDown, ChevronUp, MessageCircle, Reply, MoreVertical, Trash, Users } from 'lucide-react';
import MobileCommunityView from '../components/MobileCommunityView';
import useIsMobile from '../hooks/useIsMobile';

interface DiscussionCardProps {
  post: Post;
  currentUserId: string | null;
  currentUser: Profile | null;
  onLikeToggle: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
}

interface CommentItemProps {
  comment: PostComment;
  currentUserId: string | null;
  onLikeToggle: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  isParentComment?: boolean;
}

// Create a separate CommentItem component for better organization
const CommentItem = ({ 
  comment, 
  currentUserId, 
  onLikeToggle,
  onDeleteComment,
  isParentComment = true
}: CommentItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const commentContent = comment.content || '';
  const isLongComment = commentContent.length > 200;
  const isOwnComment = currentUserId === comment.user_id;
  const optionsRef = useRef<HTMLDivElement>(null);
  
  // For debugging and verification
  useEffect(() => {
    if (isOwnComment) {
      console.log(`Comment ${comment.id} by current user:`, {
        isParentComment: isParentComment,
        hasParentId: !!comment.parent_id,
        content: comment.content?.substring(0, 20) + '...'
      });
    }
  }, []);
  
  // Close options menu when clicking outside
  useEffect(() => {
    if (!showOptions) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);
  
  const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className={`flex items-start gap-2 p-2 rounded-md transition-colors ${isParentComment ? 'hover:bg-[#4A7B61]/10' : 'ml-8 mt-2 border-l-2 border-[#4A7B61]/20 pl-3'}`}>
      <img
        src={comment.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.author?.full_name || 'User')}
        alt={comment.author?.full_name || 'User'}
        className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1"
      />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-[#2C2925]">{comment.author?.full_name || 'Anonymous'}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#706C66]">{formattedDate}</span>
            {isOwnComment && (
              <div className="relative">
                <button 
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-[#706C66] hover:text-[#4A7B61] transition-colors p-1 rounded-full hover:bg-[#4A7B61]/15"
                  aria-label="Comment options"
                >
                  <MoreVertical size={16} className={isParentComment ? "text-[#58534D]" : ""} />
                </button>
                
                {showOptions && (
                  <div 
                    ref={optionsRef}
                    className="absolute right-0 top-6 bg-white shadow-md rounded-md py-1 z-10 min-w-[120px] border border-[#E8E6E1]"
                  >
                    <button
                      onClick={() => {
                        onDeleteComment(comment.id);
                        setShowOptions(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-xs text-left text-red-600 hover:bg-[#4A7B61]/10"
                    >
                      <Trash size={14} className="mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-sm text-[#706C66] whitespace-pre-wrap mt-1">
          {isLongComment && !isExpanded
            ? `${commentContent.substring(0, 200)}...` 
            : commentContent}
            
          {isLongComment && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 text-[#4A7B61] hover:text-[#3A6B51] font-medium text-xs"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
        <div className="flex items-center mt-1.5 gap-3">
          <button 
            onClick={() => currentUserId && onLikeToggle(comment.id)}
            disabled={!currentUserId}
            className="flex items-center text-xs text-[#706C66] hover:text-[#4A7B61] transition-colors"
          >
            <Heart 
              size={12} 
              className={`mr-1 ${comment.has_liked ? "text-[#E74C3C] fill-[#E74C3C]" : ""}`}
            />
            {comment.likes || 0} {comment.likes === 1 ? 'like' : 'likes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DiscussionCard = ({ post, currentUserId, currentUser, onLikeToggle, onDeletePost }: DiscussionCardProps): JSX.Element => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  // Check if user is the author of the post
  const isOwnPost = currentUserId && post.author?.id === currentUserId;
  
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
  
  // Check if comments container has scrollable content
  const checkForMoreComments = useCallback(() => {
    if (commentsContainerRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = commentsContainerRef.current;
      
      // Check if there's more content than visible area
      const hasMoreContent = scrollHeight > clientHeight;
      
      // Check if user has scrolled to the bottom
      const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      
      // Only show the indicator if there's more content AND user hasn't scrolled to bottom
      setHasMoreComments(hasMoreContent && !isScrolledToBottom);
    }
  }, []);
  
  // Add resize observer to check for scrollable content
  useEffect(() => {
    if (showComments) {
      checkForMoreComments();
      
      const resizeObserver = new ResizeObserver(() => {
        checkForMoreComments();
      });
      
      if (commentsContainerRef.current) {
        resizeObserver.observe(commentsContainerRef.current);
      }
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [showComments, comments, checkForMoreComments]);
  
  const toggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    
    setIsLoadingComments(true);
    setShowComments(true);
    
    try {
      const commentsData = await getPostComments(post.id);
      
      // If user is logged in, check if they've liked each comment
      if (currentUserId) {
        const supabase = await createClient();
        
        const commentsWithLikeStatus = await Promise.all(
          commentsData.map(async (comment) => {
            try {
              const { data, error } = await supabase
                .from('comment_likes')
                .select('id')
                .eq('user_id', currentUserId)
                .eq('comment_id', comment.id)
                .maybeSingle();
              
              if (error) {
                console.error('Error checking comment like status:', error);
                return { ...comment, has_liked: false };
              }
              
              return {
                ...comment,
                has_liked: !!data
              };
            } catch (err) {
              console.error('Error checking comment like status:', err);
              return { ...comment, has_liked: false };
            }
          })
        );
        
        setComments(commentsWithLikeStatus);
      } else {
        setComments(commentsData);
      }
      
      setCommentCount(commentsData.length);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !commentText.trim()) return;
    
    try {
      const newComment = await createPostComment(currentUserId, {
        post_id: post.id,
        content: commentText.trim()
      });
      
      if (newComment) {
        // Add has_liked = false as this is a new comment
        const commentWithAuthor = {
          ...newComment,
          has_liked: false,
          likes: 0,
          author: newComment.author || {
            id: currentUserId,
            username: currentUser?.username,
            full_name: currentUser?.full_name || 'User',
            avatar_url: currentUser?.avatar_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        };
        
        setComments(prev => [...prev, commentWithAuthor]);
        setCommentText('');
        setCommentCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };
  
  const handleCommentLikeToggle = async (commentId: string) => {
    if (!currentUserId) return;
    
    // Optimistically update UI
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const newLikeStatus = !comment.has_liked;
        return {
          ...comment,
          has_liked: newLikeStatus,
          likes: (comment.likes || 0) + (newLikeStatus ? 1 : -1)
        };
      }
      return comment;
    }));
    
    // Update in database
    try {
      await toggleCommentLike(currentUserId, commentId);
    } catch (error) {
      console.error('Error toggling comment like:', error);
      // Could revert the optimistic update here if needed
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!currentUserId) return;
    
    // Find the comment to be deleted
    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete) return;
    
    // Optimistically update UI - remove comment and any replies
    const isParentComment = !commentToDelete.parent_id;
    
    // If parent comment, remove it and all replies
    if (isParentComment) {
      const childCommentIds = comments
        .filter(c => c.parent_id === commentId)
        .map(c => c.id);
      
      // Filter out deleted comment and its replies
      setComments(comments.filter(c => c.id !== commentId && !childCommentIds.includes(c.id)));
      setCommentCount(prev => prev - 1 - childCommentIds.length);
    } else {
      // Just remove the reply
      setComments(comments.filter(c => c.id !== commentId));
      setCommentCount(prev => prev - 1);
    }
    
    // Update in database
    try {
      const success = await deletePostComment(currentUserId, commentId);
      if (!success) {
        console.error('Failed to delete comment');
        // Could reload comments here to reset state
        toggleComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Could reload comments here to reset state
      toggleComments();
    }
  };

  return (
    <div className="p-5">
      <div className="flex items-start gap-4">
        <img
          src={post.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author?.full_name || 'User')}
          alt={post.author?.full_name || 'User'}
          className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1] shadow-sm"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center">
              <span className="text-sm font-medium text-[#2C2925]">{post.author?.full_name || 'Anonymous'}{post.author?.username === 'jonny' && ' (2)'}</span>
              <span className="mx-2 text-[#E8E6E1]">•</span>
              <span className="text-xs text-[#706C66]">{formattedDate}</span>
            </div>
            
            {isOwnPost && (
              <div className="relative">
                <button 
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-[#706C66] hover:text-[#4A7B61] transition-colors p-2 rounded-full hover:bg-[#4A7B61]/15"
                  aria-label="Post options"
                >
                  <MoreVertical size={18} strokeWidth={2} className="text-[#58534D]" />
                </button>
                
                {showOptions && (
                  <div 
                    ref={optionsRef}
                    className="absolute right-0 top-8 bg-white shadow-md rounded-md py-1 z-10 min-w-[140px] border border-[#E8E6E1]"
                  >
                    <button
                      onClick={() => {
                        if (onDeletePost) {
                          onDeletePost(post.id);
                        }
                        setShowOptions(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-left text-red-600 hover:bg-[#4A7B61]/10"
                    >
                      <Trash size={16} className="mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Link 
            href={`/community/discussions/${post.id}`} 
            className="block group no-underline hover:no-underline focus:no-underline active:no-underline text-inherit"
          >
            <h3 className="text-lg font-semibold text-[#2C2925] mb-2.5 group-hover:text-[#4A7B61] transition-colors no-underline leading-tight">
              {post.title}
            </h3>
            
            {post.content && (
              <p className="text-[15px] text-[#58534D] mb-3.5 line-clamp-2 leading-relaxed no-underline">
                {post.content}
              </p>
            )}
          </Link>
          
          <div className="flex items-center mt-3.5">
            {post.category && (
              <span className="text-xs px-3.5 py-1.5 bg-[#4A7B61]/15 rounded-full text-[#4A7B61] font-medium border border-[#4A7B61]/20">{post.category}</span>
            )}
            
            <div className="flex items-center ml-auto space-x-5">
              <button 
                onClick={() => {
                  if (currentUserId) {
                    onLikeToggle(post.id);
                  }
                }}
                className="flex items-center hover:text-[#E74C3C] transition-colors group"
              >
                <Heart 
                  size={18} 
                  className={`${post.has_liked ? "text-[#E74C3C] fill-[#E74C3C]" : "text-[#706C66] group-hover:text-[#E74C3C]/70"} mr-1.5`}
                  strokeWidth={post.has_liked ? 0 : 2}
                />
                <span className={`text-xs font-medium ${post.has_liked ? "text-[#E74C3C]" : "text-[#706C66] group-hover:text-[#E74C3C]/70"}`}>{post.likes || 0}</span>
              </button>
              
              <button 
                onClick={toggleComments}
                className="flex items-center hover:text-[#4A7B61] transition-colors group"
              >
                <MessageSquare 
                  size={18} 
                  className={`text-[#706C66] mr-1.5 group-hover:text-[#4A7B61]/70`} 
                  strokeWidth={2} 
                />
                <span className="text-xs font-medium text-[#706C66] group-hover:text-[#4A7B61]/70">{commentCount}</span>
                {showComments ? (
                  <ChevronUp size={16} className="ml-1 text-[#706C66] group-hover:text-[#4A7B61]/70" strokeWidth={2} />
                ) : (
                  <ChevronDown size={16} className="ml-1 text-[#706C66] group-hover:text-[#4A7B61]/70" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
          
          {/* Comments section */}
          {showComments && (
            <div className="mt-4 pl-2 border-l-2 border-[#4A7B61]/20 animate-fadeIn">
              {isLoadingComments ? (
                <div className="py-3 text-center">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#4A7B61] border-t-transparent"></div>
                  <span className="ml-2 text-sm text-[#706C66]">Loading comments...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="py-3 text-center text-sm text-[#706C66]">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="relative">
                  <div 
                    ref={commentsContainerRef}
                    className="space-y-4 mb-4 max-h-[400px] overflow-y-auto pr-2 comments-container"
                    onScroll={checkForMoreComments}
                  >
                    {comments.map((comment) => (
                      <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                        currentUserId={currentUserId} 
                        onLikeToggle={handleCommentLikeToggle}
                        onDeleteComment={handleDeleteComment}
                        isParentComment={!comment.parent_id}
                      />
                    ))}
                  </div>
                  {hasMoreComments && (
                    <>
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FFFFFF] to-transparent pointer-events-none" aria-hidden="true"></div>
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none" aria-hidden="true">
                        <div className="px-2 py-1 bg-[#4A7B61]/15 rounded-full text-xs text-[#4A7B61] shadow-sm">
                          Scroll for more
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {/* Add comment form */}
              {currentUserId ? (
                <form onSubmit={handleSubmitComment} className="mt-4 mb-1">
                  <div className="flex items-start gap-2">
                    <img
                      src={currentUser?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser?.full_name || 'User')}
                      alt={currentUser?.full_name || 'User'}
                      className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 relative">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full border border-[#E8E6E1] rounded-lg p-2 pr-10 text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#4A7B61] resize-none min-h-[60px]"
                      ></textarea>
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4A7B61] hover:text-[#3A6B51] transition-colors disabled:text-[#A9A6A1] disabled:cursor-not-allowed"
                        aria-label="Send comment"
                        title="Send comment"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mt-3 mb-1 p-2 bg-[#4A7B61]/15 rounded-lg text-center text-sm">
                  <Link href="/auth/signin" className="text-[#4A7B61] font-medium hover:underline">
                    Sign in to add a comment
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface GroupCardProps {
  group: Group;
  currentUserId: string | null;
  onMembershipToggle: (groupId: string, isMember: boolean) => void;
}

const GroupCard = ({ group, currentUserId, onMembershipToggle }: GroupCardProps): JSX.Element => {
  const membersCount = group.members || 0;

  return (
    <div className="p-5 relative">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#2C2925] mb-2 hover:text-[#4A7B61] transition-colors leading-tight">{group.name}</h3>
          <div className="flex items-center">
            <span className="inline-flex items-center text-sm text-[#58534D]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-[#4A7B61]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <path d="M20 8v6"></path>
                <path d="M23 11h-6"></path>
              </svg>
              {membersCount} {membersCount === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>
        
        {currentUserId && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onMembershipToggle(group.id, !!group.is_member);
            }}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${
              group.is_member 
                ? 'bg-red-100/80 text-red-600 hover:bg-red-100 border border-red-200' 
                : 'bg-[#4A7B61]/15 text-[#4A7B61] hover:bg-[#4A7B61]/20 border border-[#4A7B61]/20'
            }`}
          >
            {group.is_member ? 'Leave' : 'Join'}
          </button>
        )}
      </div>
      
      <Link 
        href={`/community/groups/${group.id}`} 
        className="absolute inset-0 no-underline hover:no-underline focus:no-underline"
      >
        <span className="sr-only">View group: {group.name}</span>
      </Link>
    </div>
  );
};

const CreatePostButton = ({ currentUserId }: { currentUserId: string | null }): JSX.Element => {
  const router = useRouter();

  if (!currentUserId) return <></>;

  return (
    <button 
      onClick={() => router.push('/community/create-post')}
      className="fixed bottom-6 right-6 flex items-center justify-center bg-[#4A7B61] text-white rounded-full w-14 h-14 shadow-lg hover:bg-[#3A6B51] transition-colors"
      aria-label="Create Post"
    >
      <Plus size={24} />
      <span className="sr-only">Create new post</span>
    </button>
  );
};

const CommunityPage = (): JSX.Element => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discussions' | 'groups'>('discussions');
  
  // Use the custom hook instead of implementing our own
  const isMobile = useIsMobile();
  
  const handleCreatePost = () => {
    router.push('/community/create-post');
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingPosts(true);
      setIsLoadingGroups(true);
      try {
        const supabase = await createClient();
        
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        setCurrentUserId(userId);
        
        // Get user profile if logged in
        if (userId) {
          const profile = await getProfile(userId);
          setCurrentUser(profile);
        }
        
        // Fetch posts and check if current user liked them
        const postsData = await getPosts(20);
        console.log('Posts data returned from getPosts:', postsData);
        if (userId) {
          const postsWithLikeStatus = await Promise.all(
            postsData.map(async (post) => {
              // Check if current user has liked this post
              try {
                const { data, error } = await supabase
                  .from('post_likes')
                  .select('id')
                  .eq('user_id', userId)
                  .eq('post_id', post.id)
                  .maybeSingle();
                
                if (error) {
                  console.error('Error checking like status:', error);
                  return { ...post, has_liked: false };
                }
                
                return {
                  ...post,
                  has_liked: !!data
                };
              } catch (err) {
                console.error('Error checking post like status:', err);
                return { ...post, has_liked: false };
              }
            })
          );
          setPosts(postsWithLikeStatus);
        } else {
          setPosts(postsData);
        }
        
        // Fetch groups and check if current user is a member
        const groupsData = await getGroups(8);
        if (userId) {
          const groupsWithMemberStatus = await Promise.all(
            groupsData.map(async (group) => {
              // Check if current user is a member of this group
              try {
                const { data, error } = await supabase
                  .from('group_members')
                  .select('id')
                  .eq('user_id', userId)
                  .eq('group_id', group.id)
                  .maybeSingle();
                
                if (error) {
                  console.error('Error checking membership status:', error);
                  return { ...group, is_member: false };
                }
                
                return {
                  ...group,
                  is_member: !!data
                };
              } catch (err) {
                console.error('Error checking group membership status:', err);
                return { ...group, is_member: false };
              }
            })
          );
          setGroups(groupsWithMemberStatus);
        } else {
          setGroups(groupsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoadingPosts(false);
        setIsLoadingGroups(false);
      }
    };

    fetchData();
  }, []);

  const handlePostLikeToggle = async (postId: string) => {
    if (!currentUserId) return;
    
    // Optimistically update UI
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLikeStatus = !post.has_liked;
        return {
          ...post,
          has_liked: newLikeStatus,
          likes: (post.likes || 0) + (newLikeStatus ? 1 : -1)
        };
      }
      return post;
    }));
    
    // Update in database
    try {
      await togglePostLike(currentUserId, postId);
    } catch (error) {
      console.error('Error toggling post like:', error);
      // Revert optimistic update on error
      await fetchPosts();
    }
  };

  const handleGroupMembershipToggle = async (groupId: string, isMember: boolean) => {
    if (!currentUserId) return;
    
    // Optimistically update UI
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          is_member: !isMember,
          members: (group.members || 0) + (isMember ? -1 : 1)
        };
      }
      return group;
    }));
    
    // Update in database
    try {
      if (isMember) {
        await leaveGroup(currentUserId, groupId);
      } else {
        await joinGroup(currentUserId, groupId);
      }
    } catch (error) {
      console.error('Error toggling group membership:', error);
      // Revert optimistic update on error
      await fetchGroups();
    }
  };

  const fetchPosts = async () => {
    if (!currentUserId) return;
    
    const postsData = await getPosts(20);
    const supabase = await createClient();
    
    const postsWithLikeStatus = await Promise.all(
      postsData.map(async (post) => {
        try {
          const { data, error } = await supabase
            .from('post_likes')
            .select('id')
            .eq('user_id', currentUserId)
            .eq('post_id', post.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error checking like status:', error);
            return { ...post, has_liked: false };
          }
          
          return {
            ...post,
            has_liked: !!data
          };
        } catch (err) {
          console.error('Error checking post like status:', err);
          return { ...post, has_liked: false };
        }
      })
    );
    
    setPosts(postsWithLikeStatus);
  };

  const fetchGroups = async () => {
    if (!currentUserId) return;
    
    const groupsData = await getGroups(8);
    const supabase = await createClient();
    
    const groupsWithMemberStatus = await Promise.all(
      groupsData.map(async (group) => {
        try {
          const { data, error } = await supabase
            .from('group_members')
            .select('id')
            .eq('user_id', currentUserId)
            .eq('group_id', group.id)
            .maybeSingle();
          
          if (error) {
            console.error('Error checking membership status:', error);
            return { ...group, is_member: false };
          }
          
          return {
            ...group,
            is_member: !!data
          };
        } catch (err) {
          console.error('Error checking group membership status:', err);
          return { ...group, is_member: false };
        }
      })
    );
    
    setGroups(groupsWithMemberStatus);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
  };

  const handlePostDelete = async (postId: string) => {
    if (!currentUserId) return;
    
    // Optimistically update UI - remove post
    setPosts(posts.filter(p => p.id !== postId));
    
    // Update in database
    try {
      const success = await deletePost(currentUserId, postId);
      if (!success) {
        console.error('Failed to delete post');
        // Could reload posts here to reset state
        fetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      // Could reload posts here to reset state
      fetchPosts();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {isMobile ? (
        // Mobile View
        <MobileCommunityView
          posts={posts}
          groups={groups}
          currentUserId={currentUserId}
          currentUser={currentUser}
          isLoading={isLoadingPosts}
          onLikeToggle={handlePostLikeToggle}
          onGroupMembershipToggle={handleGroupMembershipToggle}
          onCreatePost={handleCreatePost}
          onCreateGroup={() => router.push('/community/create-group')}
        />
      ) : (
        // Desktop View (existing code)
        <div className="max-w-7xl mx-auto pt-6 pb-12">
          <div className="flex items-center justify-between px-5 sm:px-8 lg:px-10">
            {/* Header */}
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-[#2C2925]">Community</h1>
            </div>
            
            {/* Search and create post */}
            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-[#A9A6A1]" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search discussions..."
                  className="block w-full sm:w-[240px] py-2.5 pl-10 pr-3 border border-[#E8E6E1] rounded-full bg-white text-[#2C2925] placeholder-[#706C66] focus:border-[#4A7B61]/50 focus:outline-none focus:ring-1 focus:ring-[#4A7B61]/50 transition-all duration-200 min-h-[44px]"
                />
              </form>
              
              <CreatePostButton currentUserId={currentUserId} />
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mt-6 px-5 sm:px-8 lg:px-10">
            <div className="flex border-b border-[#E8E6E1]">
              <button
                onClick={() => setActiveTab('discussions')}
                className={`px-5 py-3 text-base font-medium border-b-2 ${
                  activeTab === 'discussions'
                    ? 'border-[#4A7B61] text-[#4A7B61]'
                    : 'border-transparent text-[#706C66] hover:text-[#2C2925] hover:border-[#E8E6E1]'
                } transition-colors`}
              >
                Discussions
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`px-5 py-3 text-base font-medium border-b-2 ${
                  activeTab === 'groups'
                    ? 'border-[#4A7B61] text-[#4A7B61]'
                    : 'border-transparent text-[#706C66] hover:text-[#2C2925] hover:border-[#E8E6E1]'
                } transition-colors`}
              >
                Groups
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="px-5 sm:px-8 lg:px-10">
            {isLoadingPosts ? (
              <div className="flex justify-center items-center py-16">
                <div className="w-8 h-8 border-2 border-[#4A7B61] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-[#706C66]">Loading...</span>
              </div>
            ) : activeTab === 'discussions' ? (
              <div className="mt-6 grid gap-6">
                {posts.length === 0 ? (
                  <div className="text-center py-10 bg-[#F8F7F4] rounded-lg">
                    <h3 className="text-[#58534D] text-lg font-medium mb-2">No discussions yet</h3>
                    <p className="text-[#706C66] mb-6">Be the first to start a conversation!</p>
                    <button 
                      onClick={() => router.push('/community/create-post')}
                      className="inline-flex items-center px-4 py-2 bg-[#4A7B61] text-white rounded-lg hover:bg-[#3A6B51] transition-colors"
                      disabled={!currentUserId}
                    >
                      <Plus size={18} className="mr-2" />
                      Create Post
                    </button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <DiscussionCard 
                      key={post.id} 
                      post={post} 
                      currentUserId={currentUserId}
                      currentUser={currentUser}
                      onLikeToggle={handlePostLikeToggle}
                      onDeletePost={handlePostDelete}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.length === 0 ? (
                  <div className="sm:col-span-2 lg:col-span-3 text-center py-10 bg-[#F8F7F4] rounded-lg">
                    <h3 className="text-[#58534D] text-lg font-medium mb-2">No groups available</h3>
                    <p className="text-[#706C66] mb-6">Create a new group or check back later!</p>
                    <button 
                      onClick={() => router.push('/community/create-group')}
                      className="inline-flex items-center px-4 py-2 bg-[#4A7B61] text-white rounded-lg hover:bg-[#3A6B51] transition-colors"
                      disabled={!currentUserId}
                    >
                      <Plus size={18} className="mr-2" />
                      Create Group
                    </button>
                  </div>
                ) : (
                  groups.map((group) => (
                    <GroupCard 
                      key={group.id} 
                      group={group} 
                      currentUserId={currentUserId}
                      onMembershipToggle={handleGroupMembershipToggle}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;
