'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';
import { getPosts, getGroups, joinGroup, leaveGroup, togglePostLike, getProfile, getPostComments, createPostComment, toggleCommentLike } from '@/app/lib/supabase/database';
import { Post, Group, Profile } from '@/app/lib/types';
import { PostComment } from '@/app/types/database';
import { Search, Heart, MessageSquare, Plus, Send, X, ChevronDown, ChevronUp, MessageCircle, Reply } from 'lucide-react';

interface DiscussionCardProps {
  post: Post;
  currentUserId: string | null;
  currentUser: Profile | null;
  onLikeToggle: (postId: string) => void;
}

interface CommentItemProps {
  comment: PostComment;
  currentUserId: string | null;
  onLikeToggle: (commentId: string) => void;
  isParentComment?: boolean;
}

// Create a separate CommentItem component for better organization
const CommentItem = ({ 
  comment, 
  currentUserId, 
  onLikeToggle,
  isParentComment = true
}: CommentItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const commentContent = comment.content || '';
  const isLongComment = commentContent.length > 200;
  
  const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className={`flex items-start gap-2 p-2 rounded-md transition-colors ${isParentComment ? 'hover:bg-[#F8F7F2]' : 'ml-8 mt-2 border-l-2 border-[#E8E6E1] pl-3'}`}>
      <img
        src={comment.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.author?.full_name || 'User')}
        alt={comment.author?.full_name || 'User'}
        className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1"
      />
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-[#2C2925]">{comment.author?.full_name || 'Anonymous'}</span>
          <span className="text-xs text-[#706C66]">{formattedDate}</span>
        </div>
        <div className="text-sm text-[#706C66] whitespace-pre-wrap mt-1">
          {isLongComment && !isExpanded
            ? `${commentContent.substring(0, 200)}...` 
            : commentContent}
            
          {isLongComment && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-1 text-[#6B8068] hover:text-[#4A7B61] font-medium text-xs"
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

const DiscussionCard = ({ post, currentUserId, currentUser, onLikeToggle }: DiscussionCardProps): JSX.Element => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
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

  return (
    <div className="py-5 border-b border-[#E8E6E1]/60">
      <div className="flex items-start gap-3">
        <img
          src={post.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author?.full_name || 'User')}
          alt={post.author?.full_name || 'User'}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#2C2925]">{post.author?.full_name || 'Anonymous'}{post.author?.username === 'jonny' && ' (2)'}</span>
            <span className="text-xs text-[#706C66]">{formattedDate}</span>
          </div>
          
          <h3 className="text-base font-medium text-[#2C2925] mb-1.5">
            {post.title}
          </h3>
          
          {post.content && (
            <p className="text-sm text-[#706C66] mb-3">
              {post.content}
            </p>
          )}
          
          <div className="flex items-center space-x-5 mt-1">
            {post.category && (
              <span className="text-sm text-[#706C66]">{post.category}</span>
            )}
            
            <div className="flex items-center ml-auto">
              <button 
                onClick={() => {
                  if (currentUserId) {
                    onLikeToggle(post.id);
                  }
                }}
                className="flex items-center mr-4"
              >
                <Heart 
                  size={16} 
                  className={`${post.has_liked ? "text-[#E74C3C] fill-[#E74C3C]" : "text-[#706C66]"}`}
                />
                <span className="text-xs ml-1 text-[#706C66]">{post.likes || 0}</span>
              </button>
              
              <button 
                onClick={toggleComments}
                className="flex items-center"
              >
                <MessageSquare size={16} className="text-[#706C66]" />
                <span className="text-xs ml-1 text-[#706C66]">{commentCount}</span>
                {showComments ? (
                  <ChevronUp size={16} className="ml-1 text-[#706C66]" />
                ) : (
                  <ChevronDown size={16} className="ml-1 text-[#706C66]" />
                )}
              </button>
            </div>
          </div>
          
          {/* Comments section */}
          {showComments && (
            <div className="mt-4 pl-2 border-l-2 border-[#E8E6E1] animate-fadeIn">
              {isLoadingComments ? (
                <div className="py-3 text-center">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#6B8068] border-t-transparent"></div>
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
                      />
                    ))}
                  </div>
                  {hasMoreComments && (
                    <>
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#FFFFFF] to-transparent pointer-events-none" aria-hidden="true"></div>
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none" aria-hidden="true">
                        <div className="px-2 py-1 bg-[#F5F4F2] rounded-full text-xs text-[#706C66] shadow-sm">
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
                        className="w-full border border-[#E8E6E1] rounded-lg p-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#6B8068] resize-none min-h-[60px]"
                        autoFocus
                      ></textarea>
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6B8068] hover:text-[#4A7B61] transition-colors disabled:text-[#A9A6A1] disabled:cursor-not-allowed"
                        aria-label="Send comment"
                        title="Send comment"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mt-3 mb-1 p-2 bg-[#F5F4F2] rounded-lg text-center text-sm">
                  <Link href="/auth/signin" className="text-[#6B8068] font-medium hover:underline">
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
    <div className="py-5 border-b border-[#E8E6E1]/60 relative">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-medium text-[#2C2925] mb-1">{group.name}</h3>
          <p className="text-sm text-[#706C66]">{membersCount} {membersCount === 1 ? 'member' : 'members'}</p>
        </div>
        
        {currentUserId && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onMembershipToggle(group.id, !!group.is_member);
            }}
            className={`text-xs font-medium px-3 py-1 rounded-full border ${
              group.is_member 
                ? 'border-red-300 text-red-500 hover:bg-red-50' 
                : 'border-[#4A7B61]/30 text-[#4A7B61] hover:bg-[#4A7B61]/10'
            }`}
          >
            {group.is_member ? 'Leave' : 'Join'}
          </button>
        )}
      </div>
      
      <Link href={`/community/groups/${group.id}`} className="absolute inset-0">
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
      className="fixed bottom-6 right-6 flex items-center justify-center bg-[#4A7B61] text-white rounded-full w-12 h-12 shadow-md hover:bg-[#3A6B51] transition-colors z-10"
      aria-label="Create Post"
    >
      <Plus size={20} />
    </button>
  );
};

const CommunityPage = (): JSX.Element => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'discussions' | 'groups'>('discussions');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
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
    console.log('Searching for:', searchTerm);
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[780px] mx-auto px-4">
        <div className="flex items-center justify-between py-6">
          <h1 className="text-xl font-medium text-[#2C2925]">Community</h1>
          
          <div className="relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                className="w-[220px] pl-9 pr-4 py-2 bg-[#F8F7F2] rounded-md text-sm focus:outline-none"
              />
              <Search size={15} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C66]" />
              <button type="submit" className="sr-only">Search</button>
            </form>
          </div>
        </div>
        
        <div className="flex border-b border-[#4A7B61]/20 mb-4">
          <button 
            onClick={() => setActiveTab('discussions')}
            className={`text-sm font-medium py-2 px-8 transition-colors border-b-2 ${
              activeTab === 'discussions' 
                ? 'text-[#4A7B61] border-[#4A7B61]' 
                : 'text-[#706C66] border-transparent'
            }`}
          >
            Discussions
          </button>
          <button 
            onClick={() => setActiveTab('groups')}
            className={`text-sm font-medium py-2 px-8 transition-colors border-b-2 ${
              activeTab === 'groups' 
                ? 'text-[#4A7B61] border-[#4A7B61]' 
                : 'text-[#706C66] border-transparent'
            }`}
          >
            Groups
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 border-2 border-[#4A7B61] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'discussions' && (
              <div>
                {posts.length > 0 ? (
                  <div>
                    {posts.map((post) => (
                      <DiscussionCard 
                        key={post.id} 
                        post={post} 
                        currentUserId={currentUserId} 
                        currentUser={currentUser} 
                        onLikeToggle={handlePostLikeToggle} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-sm text-[#706C66] mb-4">No discussions yet</p>
                    {currentUserId && (
                      <button
                        onClick={() => router.push('/community/create-post')}
                        className="px-4 py-2 bg-[#4A7B61] text-white text-sm rounded-full"
                      >
                        Start a discussion
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'groups' && (
              <div>
                {groups.length > 0 ? (
                  <div>
                    {groups.map((group) => (
                      <GroupCard 
                        key={group.id} 
                        group={group} 
                        currentUserId={currentUserId} 
                        onMembershipToggle={handleGroupMembershipToggle} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-sm text-[#706C66] mb-4">No groups available</p>
                    {currentUserId && (
                      <button
                        onClick={() => router.push('/community/create-group')}
                        className="px-4 py-2 bg-[#4A7B61] text-white text-sm rounded-full"
                      >
                        Create a group
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      <CreatePostButton currentUserId={currentUserId} />
    </div>
  );
};

export default CommunityPage;
