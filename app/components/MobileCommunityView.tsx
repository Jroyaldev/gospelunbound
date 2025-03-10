import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Calendar, Check, Search, MessageSquare, Bell, X } from 'lucide-react';
import MobilePostHeader from './MobilePostHeader';
import MobilePostList from './MobilePostList';
import MobileFooter from './MobileFooter';
import { Post } from '@/app/lib/types';
import { Group } from '@/app/types/community';
import { PostComment } from '@/app/types/database';
import { createClient } from '@/app/lib/supabase/client';
import { toggleCommentLike as toggleCommentLikeDB, deletePostComment, deletePost } from '@/app/lib/supabase/database';
import Link from 'next/link';

interface MobileCommunityViewProps {
  posts: Post[];
  groups: Group[];
  currentUserId: string | null;
  currentUser: any; // Profile type
  isLoading?: boolean;
  isLoadingPosts?: boolean;
  isLoadingGroups?: boolean;
  onPostLikeToggle: (postId: string) => void;
  onGroupMembershipToggle: (groupId: string) => void;
  onDeletePost?: (postId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeTab?: 'discussions' | 'groups';
  onTabChange?: (tab: 'discussions' | 'groups') => void;
  postsCount: number;
  groupsCount: number;
  onToggleComments: (postId: string) => Promise<any[]>;
  onAddComment: (postId: string, content: string) => Promise<any>;
  onCommentLike: (commentId: string) => Promise<void>;
  onCommentDelete: (commentId: string) => Promise<void>;
  onPostDelete: (postId: string) => Promise<void>;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
}

const MobileCommunityView = ({
  posts,
  groups,
  currentUserId,
  currentUser,
  isLoading = false,
  isLoadingPosts = false,
  isLoadingGroups = false,
  onPostLikeToggle,
  onGroupMembershipToggle,
  onDeletePost,
  searchQuery = '',
  onSearchChange,
  activeTab: propActiveTab = 'discussions',
  onTabChange,
  postsCount,
  groupsCount,
  onToggleComments,
  onAddComment,
  onCommentLike,
  onCommentDelete,
  onPostDelete,
  isLoadingMore = false,
  hasMore = false,
  loadMore = () => {},
}: MobileCommunityViewProps): JSX.Element => {
  const [localActiveTab, setLocalActiveTab] = useState<'discussions' | 'groups'>(propActiveTab);
  const [searchVisible, setSearchVisible] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [scrolled, setScrolled] = useState(false);
  const [showActionButton, setShowActionButton] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use this activeTab consistently throughout the code
  const activeTab = onTabChange ? propActiveTab : localActiveTab;
  
  // Define the tabs for the community view
  const tabs = [
    {
      id: 'discussions',
      label: 'Discussions',
      isActive: activeTab === 'discussions',
      onClick: () => {
        setLocalActiveTab('discussions');
        if (onTabChange) onTabChange('discussions');
      }
    },
    {
      id: 'groups',
      label: 'Groups',
      isActive: activeTab === 'groups',
      onClick: () => {
        setLocalActiveTab('groups');
        if (onTabChange) onTabChange('groups');
      }
    }
  ];

  // Handle scroll events to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrolled(window.scrollY > 60);
        setShowActionButton(window.scrollY > 120);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click on the action button (create post or group)
  const handleActionButtonClick = () => {
    if (activeTab === 'discussions') {
      router.push('/community/create-post');
    } else {
      router.push('/community/groups/create');
    }
  };

  // Handle search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  // Toggle search visibility
  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (!searchVisible) {
      // Focus search input when shown
      setTimeout(() => {
        const searchInput = document.getElementById('mobileSearchInput');
        if (searchInput) searchInput.focus();
      }, 100);
    } else {
      // Clear search when hiding
      setLocalSearch('');
    }
  };

  // Function to fetch comments for a post
  const fetchComments = async (postId: string): Promise<PostComment[]> => {
    try {
      const supabase = await createClient();
      
      // Use the proper query with comment_likes count
      const { data, error } = await supabase
        .from("post_comments")
        .select(`
          *,
          profiles:user_id (id, username, full_name, avatar_url),
          comment_likes:comment_likes(count)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      
      if (!data) return [];
      
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
      
      return commentsWithMetadata as PostComment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  // Function to add a comment to a post
  const addComment = async (postId: string, content: string): Promise<PostComment | null> => {
    if (!currentUserId) return null;
    
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: content,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding comment:', error);
        return null;
      }
      
      if (!data) return null;
      
      // Add author info
      return {
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
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  };

  // Function to toggle like on a comment
  const toggleCommentLike = async (commentId: string): Promise<void> => {
    if (!currentUserId) return;
    
    try {
      // Call the database function to toggle the like with skipRevalidation
      await toggleCommentLikeDB(currentUserId, commentId, true);
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  // Function to delete a comment
  const deleteComment = async (commentId: string): Promise<void> => {
    if (!currentUserId) return;
    
    try {
      // Call the database function to delete the comment
      const success = await deletePostComment(currentUserId, commentId);
      if (!success) {
        console.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Add this function for post deletion
  const handlePostDelete = async (postId: string): Promise<void> => {
    if (!currentUserId) return;
    
    try {
      // Call the database function to delete the post
      const success = await deletePost(currentUserId, postId);
      if (success) {
        // If parent component provided a delete handler, call it
        if (onDeletePost) {
          onDeletePost(postId);
        }
      } else {
        console.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full min-h-screen max-w-full bg-gradient-to-b from-[#F8F7F2] to-[#F4F2ED] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#4A7B61]/10 blur-3xl"></div>
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#4A7B61]/10 blur-3xl"></div>

      {/* Premium header with gradient */}
      <header className={`sticky top-0 z-40 transition-all ${scrolled ? 'shadow-md py-2' : 'py-6'}`}>
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8F7F5] to-white z-0 shadow-sm"></div>
        
        {/* Background decoration elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#E8F5EE] rounded-full opacity-30"></div>
          <div className="absolute top-12 -left-12 w-24 h-24 bg-[#F0EDE7] rounded-full opacity-40"></div>
          <div className="absolute bottom-0 right-1/4 w-16 h-16 bg-[#FAFAF8] rounded-full opacity-60"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Top part of header */}
          <div className={`flex items-center justify-between transition-all ${scrolled ? 'mb-1' : 'mb-5'}`}>
            <h1 className={`transition-all font-bold text-[#2C2925] flex items-center ${scrolled ? 'text-xl' : 'text-2xl'}`}>
              Community
              {scrolled && (
                <span className="ml-2 text-sm font-normal text-[#706C66]">
                  {activeTab === 'discussions' ? `${postsCount} discussions` : `${groupsCount} groups`}
                </span>
              )}
            </h1>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleSearch}
                className="p-2 rounded-full text-[#4A7B61] hover:bg-white hover:shadow-sm transition-all"
                aria-label={searchVisible ? "Close search" : "Search"}
              >
                {searchVisible ? <X size={22} /> : <Search size={22} />}
              </button>
              
              <button 
                className="p-2 rounded-full text-[#4A7B61] hover:bg-white hover:shadow-sm transition-all"
                aria-label="Notifications"
              >
                <div className="relative">
                  <Bell size={22} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Search bar - slide in/out animation */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            searchVisible ? 'max-h-16 opacity-100 mb-4' : 'max-h-0 opacity-0'
          }`}>
            <div className="relative bg-white rounded-lg shadow-sm border border-[#E8E6E1] overflow-hidden">
              <input
                id="mobileSearchInput"
                type="text"
                placeholder={`Search ${activeTab === 'discussions' ? 'discussions' : 'groups'}...`}
                value={localSearch}
                onChange={handleSearchInput}
                className="w-full pl-4 pr-12 py-3 text-[#2C2925] placeholder-[#A9A6A1] bg-transparent focus:outline-none"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#706C66] p-1"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
          
          {/* Tab navigation with visual indicators */}
          <div className="flex rounded-xl bg-white shadow-sm border border-[#E8E6E1] overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={tab.onClick}
                className={`flex-1 py-3 relative flex flex-col items-center transition-all ${
                  tab.isActive 
                    ? 'text-[#4A7B61] font-medium'
                    : 'text-[#706C66]'
                }`}
              >
                <MessageSquare size={tab.isActive ? 22 : 20} className="mb-1 transition-all" />
                <span className="text-sm">{tab.label}</span>
                {!scrolled && <span className="text-xs mt-0.5">{tab.isActive ? (tab.id === 'discussions' ? postsCount : groupsCount) : ''}</span>}
                
                {/* Active indicator */}
                {tab.isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4A7B61]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>
      
      {/* Content area with improved spacing */}
      <div className="flex-1 px-4 py-6 overflow-y-auto overflow-x-hidden pb-28">
        {activeTab === 'discussions' ? (
          <MobilePostList 
            posts={posts}
            currentUserId={currentUserId}
            currentUser={currentUser}
            onLikeToggle={onPostLikeToggle}
            isLoading={isLoadingPosts}
            onToggleComments={onToggleComments}
            onAddComment={onAddComment}
            onCommentLike={onCommentLike}
            onCommentDelete={onCommentDelete}
            onPostDelete={onPostDelete}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            loadMore={loadMore}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 animate-fadeIn">
            {isLoadingGroups ? (
              // Enhanced loading skeletons
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-4 animate-pulse">
                    <div className="flex justify-between mb-3">
                      <div className="h-5 bg-[#E8E6E1] rounded w-1/2"></div>
                      <div className="h-4 bg-[#E8E6E1] rounded-full w-20"></div>
                    </div>
                    <div className="flex gap-3 mb-3">
                      <div className="h-3 bg-[#E8E6E1] rounded w-24"></div>
                      <div className="h-3 bg-[#E8E6E1] rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-[#E8E6E1] rounded w-full mb-2"></div>
                    <div className="h-4 bg-[#E8E6E1] rounded w-3/4 mb-3"></div>
                    <div className="flex gap-2 mb-3">
                      <div className="h-5 bg-[#E8E6E1] rounded-full w-16"></div>
                      <div className="h-5 bg-[#E8E6E1] rounded-full w-16"></div>
                    </div>
                    <div className="h-6 bg-[#E8E6E1] rounded-full w-20"></div>
              </div>
                ))}
              </>
            ) : groups.length === 0 ? (
              // Visual empty state
              <div className="text-center py-10 px-6 bg-white rounded-xl shadow-sm border border-[#E8E6E1]">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[#F4F2ED]">
                  <Users className="w-7 h-7 text-[#4A7B61]" />
                </div>
                <h3 className="text-xl font-medium text-[#2C2925] mb-2">No groups yet</h3>
                <p className="text-[#706C66] mb-6">
                  {currentUserId 
                    ? 'Create a group to start connecting with others!' 
                    : 'Join to see and create groups'}
                </p>
                {currentUserId && (
                  <button
                    onClick={() => router.push('/community/create-group')}
                    className="inline-flex items-center px-5 py-2.5 bg-[#4A7B61] text-white rounded-lg shadow hover:bg-[#3A6B51] transition-all active:scale-95"
                  >
                    <Plus size={18} className="mr-2" />
                    Create Group
                  </button>
                )}
              </div>
            ) : (
              // Enhanced group cards
              groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-[#E8E6E1] relative active:bg-[#F8F7F2] transition-all hover:shadow-md"
                  onClick={() => router.push(`/community/groups/${group.id}`)}
                >
                  {/* Group header with category badge - moved category */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#2C2925] text-lg">{group.name}</h3>
                  </div>
                  
                  {/* Category badge shown if available */}
                  {group.category && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-[#4A7B61]/10 text-[#4A7B61] font-medium">
                        {group.category}
                      </span>
                    </div>
                  )}
                  
                  {/* Group stats with enhanced styling */}
                  <div className="flex items-center gap-3 text-sm text-[#706C66] mb-3">
                    <div className="flex items-center">
                      <Users size={15} className="mr-1.5 text-[#4A7B61]" />
                      <span>{group.member_count} {group.member_count === 1 ? 'member' : 'members'}</span>
                    </div>
                    
                    {/* Date created - formatted nicely */}
                    {group.created_at && (
                      <div className="flex items-center">
                        <Calendar size={15} className="mr-1.5 text-[#4A7B61]" />
                        <span>{new Date(group.created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>
                      </div>
                    )}
                  </div>

                  {/* Group description with better spacing */}
                  <p className="text-sm text-[#58534D] mb-4">
                    {group.description}
                  </p>
                  
                  {/* Topics with improved styling */}
                  {group.topics && group.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {group.topics.slice(0, 3).map((topic, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-[#F4F2ED] text-[#706C66] rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                      {group.topics.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs bg-[#F4F2ED] text-[#706C66] rounded-full">
                          +{group.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action buttons with improved styling */}
                  {currentUserId && (
                    <div className="mt-2">
                      {group.is_member ? (
                        <span className="inline-flex items-center px-4 py-2 text-sm bg-[#4A7B61]/10 text-[#4A7B61] rounded-full border border-[#4A7B61]/20 font-medium">
                          <Check size={16} className="mr-2" />
                          Member
                        </span>
                      ) : (
                      <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent navigating to detail page
                            onGroupMembershipToggle(group.id);
                          }}
                          className="inline-flex items-center px-4 py-2 text-sm bg-[#4A7B61] text-white rounded-full shadow-sm hover:bg-[#3A6B51] transition-all active:scale-95"
                        >
                          <Plus size={16} className="mr-2" />
                          Join Group
                      </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Floating action button with improved styling and effects */}
      {currentUserId && (
        <div 
          className={`fixed bottom-24 right-4 z-30 transition-all duration-300 transform ${
            showActionButton ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <button
            onClick={handleActionButtonClick}
            className="w-14 h-14 rounded-full bg-[#4A7B61] text-white shadow-lg flex items-center justify-center hover:bg-[#3A6B51] active:scale-95 transition-all"
            aria-label={activeTab === 'discussions' ? "Create new post" : "Create new group"}
          >
            <Plus size={24} />
          </button>
        </div>
      )}
      
      {/* Fixed footer at bottom with drop shadow */}
      <div className="fixed bottom-0 left-0 right-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <MobileFooter />
      </div>
    </div>
  );
};

export default MobileCommunityView; 