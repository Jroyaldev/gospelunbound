'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';
import { getPosts, getGroups, joinGroup, leaveGroup, togglePostLike, getProfile, getPostComments, createPostComment, toggleCommentLike, deletePostComment, deletePost, isPostLikedByUser } from '@/app/lib/supabase/database';
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
      });
    }
  }, [comment, isOwnComment, isParentComment]);
  
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
            </div>
            
            <div className="flex items-center mt-1.5 gap-4">
              <button 
                onClick={() => onLikeToggle(comment.id)} 
                className={`flex items-center gap-1.5 text-xs text-[#706C66] hover:text-[#4A7B61] transition-colors ${comment.has_liked ? 'text-[#4A7B61] font-medium' : ''}`}
                disabled={!currentUserId}
              >
                <Heart size={14} fill={comment.has_liked ? "#4A7B61" : "none"} />
                <span>{comment.likes || 0}</span>
              </button>
              
              <button 
                onClick={() => {}} 
                className="flex items-center gap-1.5 text-xs text-[#706C66] hover:text-[#4A7B61] transition-colors"
                disabled={!currentUserId}
              >
                <Reply size={14} />
                <span>Reply</span>
              </button>
            </div>
          </div>
          
          {isOwnComment && (
            <div className="relative flex-shrink-0">
              <button 
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 text-[#706C66] hover:text-[#4A7B61] transition-colors rounded-full hover:bg-[#4A7B61]/10"
              >
                <MoreVertical size={16} />
              </button>
              
              {showOptions && (
                <div 
                  ref={optionsRef}
                  className="absolute right-0 top-7 bg-white shadow-md rounded-md py-1 z-20 min-w-[120px] border border-[#E8E6E1]"
                >
                  <button
                    onClick={() => {
                      onDeleteComment(comment.id);
                      setShowOptions(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-[#4A7B61]/10"
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
      // Skip revalidation to prevent page refresh, we're using optimistic UI updates
      await toggleCommentLike(currentUserId, commentId, true);
    } catch (error) {
      console.error('Error toggling comment like:', error);
      // Revert optimistic update on error
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          const newLikeStatus = !comment.has_liked; // Toggle back
          return {
            ...comment,
            has_liked: !newLikeStatus,
            likes: (comment.likes || 0) + (newLikeStatus ? -1 : 1)
          };
        }
        return comment;
      }));
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
    <div className="p-5 max-w-full">
      <div className="flex items-start gap-4">
        <img
          src={post.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author?.full_name || 'User')}
          alt={post.author?.full_name || 'User'}
          className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-[#E8E6E1] shadow-sm"
        />
        
        <div className="flex-1 min-w-0 overflow-hidden max-w-full community-content">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center overflow-hidden">
              <span className="text-sm font-medium text-[#2C2925] truncate">{post.author?.full_name || 'Anonymous'}{post.author?.username === 'jonny' && ' (2)'}</span>
              <span className="mx-2 text-[#E8E6E1] flex-shrink-0">•</span>
              <span className="text-xs text-[#706C66] flex-shrink-0">{formattedDate}</span>
            </div>
            
            {isOwnPost && (
              <div className="relative flex-shrink-0">
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
            <h3 className="text-lg font-semibold text-[#2C2925] mb-2.5 group-hover:text-[#4A7B61] transition-colors no-underline leading-tight text-wrap-anywhere">{post.title}</h3>
            
            {post.content && (
              <p className="text-[15px] text-[#58534D] mb-3.5 line-clamp-2 leading-relaxed no-underline text-wrap-anywhere w-full">{post.content}</p>
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
                className={`flex items-center gap-2 text-[#706C66] hover:text-[#4A7B61] transition-colors ${post.has_liked ? 'text-[#4A7B61]' : ''}`}
                disabled={!currentUserId}
              >
                <Heart size={18} 
                  fill={post.has_liked ? "#4A7B61" : "none"} 
                  className="transition-colors" 
                />
                <span className="text-sm">{post.likes || 0}</span>
              </button>
              
              <button 
                onClick={toggleComments}
                className="flex items-center gap-2 text-[#706C66] hover:text-[#4A7B61] transition-colors"
              >
                <MessageCircle size={18} className="transition-colors" />
                <span className="text-sm">{commentCount}</span>
              </button>
            </div>
          </div>
          
          {/* Comments section */}
          {showComments && (
            <div className="mt-4 relative">
              <div className="border-t border-[#E8E6E1] pt-4">
                <div 
                  ref={commentsContainerRef} 
                  className="comments-container max-h-[400px] overflow-y-auto pr-1 space-y-4"
                  onScroll={checkForMoreComments}
                >
                  {isLoadingComments ? (
                    <div className="flex justify-center items-center py-6">
                      <div className="w-5 h-5 border-2 border-[#4A7B61] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-center text-[#706C66] py-6">No comments yet. Be the first to share your thoughts!</p>
                  ) : (
                    comments.map(comment => (
                      <CommentItem 
                        key={comment.id} 
                        comment={comment} 
                        currentUserId={currentUserId}
                        onLikeToggle={handleCommentLikeToggle}
                        onDeleteComment={handleDeleteComment}
                      />
                    ))
                  )}
                </div>
                
                {/* "More comments" indicator */}
                {hasMoreComments && (
                  <div className="absolute bottom-[60px] left-0 w-full flex justify-center">
                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#E8E6E1] shadow-sm">
                      <ChevronDown size={16} className="text-[#58534D] animate-bounce" />
                    </div>
                  </div>
                )}
                
                {/* Comment input */}
                {currentUserId ? (
                  <form onSubmit={handleSubmitComment} className="mt-4 flex items-center gap-2">
                    <img
                      src={currentUser?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser?.full_name || 'User')}
                      alt={currentUser?.full_name || 'User'}
                      className="w-8 h-8 rounded-full object-cover border border-[#E8E6E1]"
                    />
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full pl-4 pr-10 py-2.5 bg-[#F8F7F4] border border-[#E8E6E1] rounded-full text-sm placeholder-[#A9A6A1] focus:border-[#4A7B61]/50 focus:outline-none focus:ring-1 focus:ring-[#4A7B61]/50 transition-all overflow-hidden text-ellipsis break-words"
                      />
                      <button 
                        type="submit"
                        disabled={!commentText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4A7B61] disabled:text-[#A9A6A1] p-1.5 rounded-full hover:bg-[#4A7B61]/10 transition-colors"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4 bg-[#F8F7F4] py-3 px-4 rounded-lg text-center">
                    <p className="text-[#58534D] text-sm">
                      <Link href="/auth/login" className="text-[#4A7B61] font-medium hover:underline">Sign in</Link> to join the conversation.
                    </p>
                  </div>
                )}
              </div>
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
        
        // Fetch posts with the userId we just got (not using the state variable which might not be updated yet)
        try {
          const postsData = await getPosts(20, 0, undefined, userId || undefined);
          setPosts(postsData);
        } catch (error) {
          console.error('Error fetching posts:', error);
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
  
  // Update the fetchPosts function to ensure it gets the current userId from state
  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      
      // Use the userId parameter in getPosts to get posts with like status
      const postsData = await getPosts(20, 0, undefined, currentUserId || undefined);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handlePostLikeToggle = async (postId: string) => {
    if (!currentUserId) return;
    
    // Find the post and get its current like status before updating
    const postToUpdate = posts.find(p => p.id === postId);
    if (!postToUpdate) return;
    
    const currentLikedStatus = postToUpdate.has_liked || false;
    
    // Optimistically update UI
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          has_liked: !currentLikedStatus,
          likes: (post.likes || 0) + (currentLikedStatus ? -1 : 1)
        };
      }
      return post;
    }));
    
    // Update in database
    try {
      // We don't need to refresh the entire community page, so we can skip revalidation
      await togglePostLike(currentUserId, postId, true);
      
      // Verify the like status changed correctly after a short delay
      // This ensures our UI is in sync with the server state
      setTimeout(async () => {
        const isLiked = await isPostLikedByUser(currentUserId, postId);
        setPosts(currentPosts => currentPosts.map(post => {
          if (post.id === postId && post.has_liked !== isLiked) {
            return {
              ...post,
              has_liked: isLiked,
              likes: (post.likes || 0) + (isLiked ? 0 : -1) // Adjust likes if needed
            };
          }
          return post;
        }));
      }, 300);
    } catch (error) {
      console.error('Error toggling post like:', error);
      // Revert optimistic update on error
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            has_liked: currentLikedStatus, // Revert to original state
            likes: (post.likes || 0) + (currentLikedStatus ? 0 : -1) // Revert likes count
          };
        }
        return post;
      }));
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
          onPostDelete={handlePostDelete}
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
              <div className="mt-6 grid gap-6 max-w-full">
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
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-full">
                {groups.length === 0 ? (
                  <div className="col-span-full text-center py-10 bg-[#F8F7F4] rounded-lg">
                    <h3 className="text-[#58534D] text-lg font-medium mb-2">No groups yet</h3>
                    <p className="text-[#706C66] mb-6">Why not create the first one?</p>
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
