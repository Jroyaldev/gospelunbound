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
  getUserGroupMemberships
} from '@/app/lib/supabase/database';
import { Post, Profile } from '@/app/lib/types';
import type { Group as DatabaseGroup } from '@/app/lib/types';
import { Group as UIGroup } from '@/app/types/community';
import useIsMobile from '../hooks/useIsMobile';

// Import components
import MobileCommunityView from '../components/MobileCommunityView';
import SearchBar from '../components/community/SearchBar';
import CommunityTabs from '../components/community/CommunityTabs';
import PostsList from '../components/community/PostsList';
import GroupsList from '../components/community/GroupsList';
import CreatePostButton from '../components/community/CreatePostButton';

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl font-bold text-[#2C2925] mb-6">Community</h1>
      
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
      
      {/* Content based on active tab */}
      {activeTab === 'discussions' && (
        <PostsList
          posts={filteredPosts}
          isLoading={isLoadingPosts}
          currentUserId={currentUserId}
          currentUser={currentUser}
          onLikeToggle={handlePostLikeToggle}
          onDeletePost={handleDeletePost}
        />
      )}
      
      {activeTab === 'groups' && (
        <GroupsList
          groups={filteredGroups}
          isLoading={isLoadingGroups}
                      currentUserId={currentUserId}
          onToggleMembership={handleGroupMembershipToggle}
        />
      )}
      
      <CreatePostButton currentUserId={currentUserId} />
    </div>
  );
};

export default CommunityPage;
