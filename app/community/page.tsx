'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/app/lib/supabase/client';
import { 
  getPosts, 
  getGroups, 
  joinGroup, 
  leaveGroup, 
  togglePostLike, 
  getProfile, 
  deletePost,
  getUserGroupMemberships,
  getGroupsWithFilters
} from '@/app/lib/supabase/database';
import { Post, Profile } from '@/app/lib/types';
import type { Group as DatabaseGroup } from '@/app/lib/types';
import { Group as UIGroup } from '@/app/types/community';
import useIsMobile from '../hooks/useIsMobile';
import Link from 'next/link';
import { Plus } from 'lucide-react';

// Import components
import MobileCommunityView from '../components/MobileCommunityView';
import SearchBar from '../components/community/SearchBar';
import CommunityTabs from '../components/community/CommunityTabs';
import PostsList from '../components/community/PostsList';
import GroupsList from '../components/community/GroupsList';
import CreatePostButton from '../components/community/CreatePostButton';
import GroupExplorer from '../components/community/GroupExplorer';

/**
 * CommunityPage is the main entry point for the community section
 * 
 * Features:
 * - Tabs for discussions and groups
 * - Search functionality
 * - Create post button
 * - Responsive design with mobile-specific view
 * - Real-time data fetching
 */
const CommunityPage = (): JSX.Element => {
  // State variables
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<UIGroup[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discussions' | 'groups'>('discussions');
  const [groupFilters, setGroupFilters] = useState<{
    category?: string;
    search: string;
    sort: 'newest' | 'popular' | 'alphabetical';
    topics?: string[];
  }>({
    category: undefined,
    search: '',
    sort: 'newest',
    topics: undefined
  });
  const [hasMoreGroups, setHasMoreGroups] = useState(true);
  const [groupsOffset, setGroupsOffset] = useState(0);
  const GROUPS_LIMIT = 12;
  
  // Predefined categories for groups
  const groupCategories = [
    'Progressive Christianity',
    'Biblical Interpretation',
    'Social Justice',
    'Faith & Science',
    'Interfaith Dialogue',
    'Philosophy',
    'Theology',
    'Church History',
    'Prayer & Spirituality',
    'Study Group',
    'Local Community',
    'General Discussion'
  ];
  
  // Detect mobile screen for responsive rendering
  const isMobile = useIsMobile();
  
  /**
   * Fetch initial data: user session, profile, posts, and groups
   */
  const fetchData = useCallback(async () => {
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
        
      // Fetch posts with optimized query
        try {
          const postsData = await getPosts(20, 0, undefined, userId || undefined);
          setPosts(postsData);
        } catch (error) {
          console.error('Error fetching posts:', error);
      } finally {
        setIsLoadingPosts(false);
        }
        
      // Fetch groups with optimized membership checking
      try {
        const groupsData = await getGroups(8);
        
        if (userId) {
          // Get all group IDs
          const groupIds = groupsData.map(group => group.id);
          
          // Batch fetch membership status
          const membershipSet = await getUserGroupMemberships(userId, groupIds);
          
          // Transform database groups to UI groups with membership status
          const groupsWithMemberStatus = groupsData.map(group => ({
            id: group.id,
            name: group.name,
            description: group.description,
            created_at: group.created_at,
            updated_at: group.updated_at,
            creator_id: group.created_by_user_id,
            image_url: group.image_url || undefined,
            member_count: group.members || 0,
            is_member: membershipSet.has(group.id),
            creator: group.creator
          }));
          
          setGroups(groupsWithMemberStatus);
        } else {
          // Transform database groups to UI groups without membership status
          const transformedGroups = groupsData.map(group => ({
            id: group.id,
            name: group.name,
            description: group.description,
            created_at: group.created_at,
            updated_at: group.updated_at,
            creator_id: group.created_by_user_id,
            image_url: group.image_url || undefined,
            member_count: group.members || 0,
            creator: group.creator
          }));
          
          setGroups(transformedGroups);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setIsLoadingGroups(false);
      }
    } catch (error) {
      console.error('Error in data fetching:', error);
      setIsLoadingPosts(false);
      setIsLoadingGroups(false);
    }
  }, []);
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  /**
   * Filter posts based on search query
   */
  const filteredPosts = searchQuery
    ? posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;
  
  /**
   * Filter groups based on search query
   */
  const filteredGroups = searchQuery
    ? groups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groups;
  
  /**
   * Handle post like toggle with optimistic update
   */
  const handlePostLikeToggle = useCallback(async (postId: string) => {
    if (!currentUserId) return;
    
    // Optimistic update
    setPosts(prevPosts => 
      prevPosts.map(post => {
      if (post.id === postId) {
          const newLikeStatus = !post.has_liked;
        return {
          ...post,
            has_liked: newLikeStatus,
            likes: newLikeStatus ? (post.likes || 0) + 1 : (post.likes || 1) - 1
        };
      }
      return post;
      })
    );
    
    // API update
    try {
      // Use skipRevalidation=true and rely on optimistic updates
      await togglePostLike(currentUserId, postId, true);
      
      // No need to refetch data - the optimistic update is sufficient
      // and the change will persist in the database
    } catch (error) {
      console.error('Error toggling post like:', error);
      // Revert optimistic update on error by refreshing data
      await fetchData();
    }
  }, [currentUserId, fetchData]);
  
  /**
   * Handle group membership toggle with optimistic update
   */
  const handleGroupMembershipToggle = useCallback(async (groupId: string) => {
    if (!currentUserId) return;
    
    // Find the group
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    // Optimistic update
    setGroups(prevGroups => 
      prevGroups.map(g => {
        if (g.id === groupId) {
          const newMemberStatus = !g.is_member;
        return {
            ...g,
            is_member: newMemberStatus,
            member_count: newMemberStatus ? g.member_count + 1 : g.member_count - 1
          };
        }
        return g;
      })
    );
    
    // API update
    try {
      if (group.is_member) {
        await leaveGroup(currentUserId, groupId);
      } else {
        await joinGroup(currentUserId, groupId);
      }
    } catch (error) {
      console.error('Error toggling group membership:', error);
      // Revert optimistic update on error
      await fetchData();
    }
  }, [currentUserId, groups, fetchData]);

  /**
   * Handle post deletion
   */
  const handleDeletePost = useCallback(async (postId: string) => {
    if (!currentUserId) return;
    
    // Optimistic update
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    
    // API update
    try {
      await deletePost(currentUserId, postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      // Revert optimistic update on error
      await fetchData();
    }
  }, [currentUserId, fetchData]);
  
  /**
   * Handle search query change
   */
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  /**
   * Handle tab change
   */
  const handleTabChange = useCallback((tab: 'discussions' | 'groups') => {
    setActiveTab(tab);
  }, []);

  // Enhanced fetchGroups function using the new filters
  const fetchGroups = useCallback(async (offset = 0, replace = true) => {
    setIsLoadingGroups(true);
    try {
      const groupsData = await getGroupsWithFilters(
        GROUPS_LIMIT, 
        offset,
        {
          category: groupFilters.category,
          search: groupFilters.search,
          sort: groupFilters.sort
        }
      );
      
      if (groupsData.length < GROUPS_LIMIT) {
        setHasMoreGroups(false);
      } else {
        setHasMoreGroups(true);
      }
      
      if (currentUserId) {
        // Get all group IDs
        const groupIds = groupsData.map(group => group.id);
        
        // Batch fetch membership status
        const membershipSet = await getUserGroupMemberships(currentUserId, groupIds);
        
        // Transform database groups to UI groups with membership status
        const groupsWithMemberStatus = groupsData.map((group: any) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          created_at: group.created_at,
          updated_at: group.updated_at,
          creator_id: group.created_by_user_id,
          image_url: group.image_url || undefined,
          member_count: group.members || 0,
          is_member: membershipSet.has(group.id),
          creator: group.creator,
          category: group.category
        }));
        
        if (replace) {
          setGroups(groupsWithMemberStatus);
        } else {
          setGroups(prev => [...prev, ...groupsWithMemberStatus]);
        }
      } else {
        // Transform database groups to UI groups without membership status
        const transformedGroups = groupsData.map((group: any) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          created_at: group.created_at,
          updated_at: group.updated_at,
          creator_id: group.created_by_user_id,
          image_url: group.image_url || undefined,
          member_count: group.members || 0,
          creator: group.creator,
          category: group.category
        }));
        
        if (replace) {
          setGroups(transformedGroups);
        } else {
          setGroups(prev => [...prev, ...transformedGroups]);
        }
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [currentUserId, groupFilters, GROUPS_LIMIT]);

  // Handle group filter changes with proper typing that ensures required properties are set
  const handleGroupFilterChange = useCallback((newFilters: {
    category?: string;
    search?: string;
    sort?: 'newest' | 'popular' | 'alphabetical';
    topics?: string[];
  }) => {
    // Ensure all required properties have default values
    setGroupFilters({
      category: newFilters.category,
      search: newFilters.search ?? '',
      sort: newFilters.sort ?? 'newest',
      topics: newFilters.topics
    });
    setGroupsOffset(0);
  }, []);

  // Handle loading more groups
  const loadMoreGroups = useCallback(() => {
    const newOffset = groupsOffset + GROUPS_LIMIT;
    setGroupsOffset(newOffset);
    fetchGroups(newOffset, false);
  }, [groupsOffset, GROUPS_LIMIT, fetchGroups]);

  // Update the useEffect to use the new fetchGroups function
  useEffect(() => {
    if (activeTab === 'groups') {
      fetchGroups(0, true);
    }
  }, [activeTab, fetchGroups, groupFilters]);
  
  // Render mobile view if on a mobile device
  if (isMobile) {
    return (
      <MobileCommunityView
        posts={filteredPosts}
        groups={filteredGroups}
        currentUserId={currentUserId}
        currentUser={currentUser}
        isLoading={false}
        isLoadingPosts={isLoadingPosts}
        isLoadingGroups={isLoadingGroups}
        onPostLikeToggle={handlePostLikeToggle}
        onGroupMembershipToggle={handleGroupMembershipToggle}
        onDeletePost={handleDeletePost}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    );
  }
  
  // Desktop view
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F8F7F2] to-[#F4F2ED]">
      {/* Hero section with background */}
      <div className="relative bg-gradient-to-r from-[#4A7B61]/90 to-[#3A6B51]/90 py-16">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.svg')]"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Community</h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Connect with others, share ideas, and join discussions about progressive Christianity, faith, and spirituality.
          </p>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 -mt-8 relative z-20">
        {/* Search and navigation card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-5 mb-8 animate-slideUp">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder={activeTab === 'discussions' ? 'Search discussions...' : 'Search groups...'}
          />
          
          <CommunityTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            postsCount={posts.length}
            groupsCount={groups.length}
          />
        </div>
        
        {/* Content based on active tab */}
        <div className="animate-fadeIn">
          {activeTab === 'discussions' && (
            <>
              {currentUserId && (
                <div className="flex justify-end mb-6">
                  <Link
                    href="/community/create-post"
                    className="inline-flex items-center px-5 py-2.5 bg-[#4A7B61] text-white rounded-lg shadow-sm hover:bg-[#3A6B51] transition-all hover:shadow"
                  >
                    <Plus size={18} className="mr-2" />
                    Create Post
                  </Link>
                </div>
              )}
            
              <PostsList
                posts={filteredPosts}
                isLoading={isLoadingPosts}
                currentUserId={currentUserId}
                currentUser={currentUser}
                onLikeToggle={handlePostLikeToggle}
                onDeletePost={handleDeletePost}
              />
            </>
          )}
          
          {activeTab === 'groups' && (
            <div>
              {currentUserId && (
                <div className="flex justify-end mb-6">
                  <Link
                    href="/community/create-group"
                    className="inline-flex items-center px-5 py-2.5 bg-[#4A7B61] text-white rounded-lg shadow-sm hover:bg-[#3A6B51] transition-all hover:shadow-md"
                  >
                    <Plus size={18} className="mr-2" />
                    Create Group
                  </Link>
                </div>
              )}
              
              <GroupExplorer
                filters={groupFilters}
                onFilterChange={handleGroupFilterChange}
                groups={groups}
                isLoading={isLoadingGroups}
                currentUserId={currentUserId}
                onToggleMembership={handleGroupMembershipToggle}
                categories={groupCategories}
                hasMore={hasMoreGroups}
                onLoadMore={loadMoreGroups}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Floating create post button for mobile */}
      <CreatePostButton currentUserId={currentUserId} />
    </main>
  );
};

export default CommunityPage;
