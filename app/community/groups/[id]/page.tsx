'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  Tag, 
  Lock, 
  Globe, 
  Settings, 
  Loader2, 
  Edit, 
  MessageSquare,
  Send,
  X,
  LogOut,
  MoreVertical,
  UserPlus,
  ChevronDown,
  FileText,
  User
} from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { 
  getGroup, 
  getGroupMembers, 
  joinGroup, 
  leaveGroup,
  isGroupMember,
  getGroupPosts,
  createGroupPost,
  deletePost,
  togglePostLike
} from '@/app/lib/supabase/database';
import { Group, Profile, Post, CreatePostRequest } from '@/app/lib/types';
import { GroupMember } from '@/app/types/community';
import GroupMembers from '@/app/components/community/GroupMembers';
import PostCard from '@/app/components/community/PostCard';
import LoadingState from '@/app/components/LoadingState';
import { setupGroupPostsTable, testCreateGroupPost, testFetchGroupPosts } from '@/app/testing/test-group-posts';

const GroupDebugPanel = ({ groupId, userId }: { groupId: string; userId: string | null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  
  const resetState = () => {
    setResult(null);
    setError(null);
    setPosts([]);
  };
  
  const runTableSetup = async () => {
    setIsLoading(true);
    resetState();
    
    try {
      const success = await setupGroupPostsTable();
      setResult(`Table setup approach: ${success ? 'successful' : 'failed'}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error: ${errorMessage}`);
      console.error("Full error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const runCreateTest = async () => {
    if (!userId) {
      setError('No user ID available');
      return;
    }
    
    setIsLoading(true);
    resetState();
    
    try {
      console.log(`Creating test post for group ${groupId} by user ${userId}`);
      const post = await testCreateGroupPost(userId, groupId);
      
      if (post) {
        setResult(`Post created successfully. ID: ${post.id}`);
        console.log("Post details:", post);
      } else {
        setError('Failed to create post - null response received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error: ${errorMessage}`);
      console.error("Full error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const runFetchTest = async () => {
    setIsLoading(true);
    resetState();
    
    try {
      console.log(`Fetching posts for group ${groupId}`);
      const fetchedPosts = await testFetchGroupPosts(groupId);
      
      setResult(`Found ${fetchedPosts.length} posts`);
      setPosts(fetchedPosts);
      
      // Also try using the main function
      const mainPosts = await getGroupPosts(groupId);
      console.log(`Main getGroupPosts found ${mainPosts.length} posts:`, mainPosts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Error: ${errorMessage}`);
      console.error("Full error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 my-4">
      <h3 className="font-bold mb-2">Debug Panel (Dev Only)</h3>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <button 
          onClick={runTableSetup}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Setup Table
        </button>
        <button 
          onClick={runCreateTest}
          disabled={isLoading || !userId}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Test Create Post
        </button>
        <button 
          onClick={runFetchTest}
          disabled={isLoading}
          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Test Fetch Posts
        </button>
      </div>
      
      {isLoading && <div className="text-gray-600">Loading...</div>}
      
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded mb-2 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="p-2 bg-white border border-gray-200 rounded mb-2">
          <strong>Result:</strong> {result}
        </div>
      )}
      
      {posts.length > 0 && (
        <div className="p-2 bg-white border border-gray-200 rounded mt-2">
          <h4 className="font-medium mb-2">Posts Found:</h4>
          <div className="max-h-64 overflow-y-auto text-sm">
            {posts.map((post, index) => (
              <div key={post.id} className="mb-2 pb-2 border-b border-gray-100">
                <div><strong>{index + 1}. {post.title}</strong></div>
                <div className="text-xs text-gray-600">ID: {post.id}</div>
                <div className="text-xs text-gray-600">
                  By: {post.author?.username || 'Unknown'} at {new Date(post.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const GroupDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;
  
  // State variables
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'members'>('posts');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: ''
  });
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  
  // Fetch group data
  const fetchGroupData = useCallback(async () => {
    if (!groupId) return;
    
    setIsLoading(true);
    try {
      const groupData = await getGroup(groupId);
      if (!groupData) {
        router.push('/community');
        return;
      }
      
      setGroup(groupData);
    } catch (error) {
      console.error('Error fetching group:', error);
    } finally {
      setIsLoading(false);
    }
  }, [groupId, router]);
  
  // Fetch members
  const fetchMembers = useCallback(async () => {
    if (!groupId) return;
    
    setIsMembersLoading(true);
    try {
      const membersData = await getGroupMembers(groupId);
      setMembers(membersData);
      
      // Check if current user is an admin
      if (currentUserId) {
        const userMember = membersData.find(m => m.user_id === currentUserId);
        setIsAdmin(userMember?.role === 'admin');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsMembersLoading(false);
    }
  }, [groupId, currentUserId]);
  
  // Fetch posts
  const fetchPosts = useCallback(async () => {
    if (!groupId) return [];
    
    setIsPostsLoading(true);
    try {
      console.log(`Fetching posts for group: ${groupId}`);
      
      // First try to get posts using the main function
      let postsData = await getGroupPosts(groupId, 20, 0, currentUserId || undefined);
      console.log(`Retrieved ${postsData.length} posts from getGroupPosts`);
      
      // If we got no posts, try the test function as a backup
      if (postsData.length === 0) {
        console.log("No posts found, trying test function as backup");
        postsData = await testFetchGroupPosts(groupId);
        console.log(`Retrieved ${postsData.length} posts from testFetchGroupPosts`);
      }
      
      // Log the actual posts data to help debug
      console.log("Posts data:", postsData);
      
      // Make sure to set state even if array is empty
      setPosts(postsData);
      
      return postsData;
    } catch (error) {
      console.error('Error fetching group posts:', error);
      setPosts([]); // Set to empty array on error
    } finally {
      setIsPostsLoading(false);
    }
  }, [groupId, currentUserId]);
  
  // Check authentication and membership status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        
        setCurrentUserId(userId);
        
        if (userId && groupId) {
          // Check if user is a member
          const memberStatus = await isGroupMember(userId, groupId);
          setIsMember(memberStatus);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    
    checkAuth();
  }, [groupId]);
  
  // Add a useEffect to log posts whenever they change
  useEffect(() => {
    console.log('Posts state updated:', posts);
    
    // If posts array changed from empty to having items, ensure the UI updates
    if (posts.length > 0 && activeTab === 'posts') {
      console.log('Posts loaded, ensuring UI update');
    }
  }, [posts, activeTab]);
  
  // Update the initial data load to fetch data more aggressively
  useEffect(() => {
    // Load data with immediate and delayed fetch for posts
    fetchGroupData();
    fetchMembers();
    
    // First immediate fetch
    fetchPosts();
    
    // Second delayed fetch to ensure data is loaded
    const timer = setTimeout(() => {
      console.log('Performing delayed posts fetch');
      fetchPosts();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [fetchGroupData, fetchMembers, fetchPosts]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle join/leave group
  const handleToggleMembership = async () => {
    if (!currentUserId || !groupId) return;
    
    setIsJoining(true);
    try {
      if (isMember) {
        // Leave group
        await leaveGroup(currentUserId, groupId);
        setIsMember(false);
        setIsAdmin(false);
      } else {
        // Join group
        await joinGroup(currentUserId, groupId);
        setIsMember(true);
        // Refresh members to get updated role
        await fetchMembers();
      }
    } catch (error) {
      console.error('Error toggling membership:', error);
    } finally {
      setIsJoining(false);
    }
  };
  
  // Toggle settings menu
  const toggleSettingsMenu = () => {
    setShowSettingsMenu(!showSettingsMenu);
    if (showSettingsMenu) {
      setConfirmLeave(false);
    }
  };
  
  // Handle leave group with confirmation
  const handleLeaveGroup = async () => {
    if (!currentUserId || !groupId) return;
    
    if (confirmLeave) {
      setIsJoining(true);
      try {
        await leaveGroup(currentUserId, groupId);
        setIsMember(false);
        setIsAdmin(false);
        setShowSettingsMenu(false);
        setConfirmLeave(false);
      } catch (error) {
        console.error('Error leaving group:', error);
      } finally {
        setIsJoining(false);
      }
    } else {
      setConfirmLeave(true);
    }
  };
  
  // Handle new post submission
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId || !groupId) {
      setPostError('User ID or Group ID is missing');
      return;
    }
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setPostError('Title and content are required');
      return;
    }
    
    setIsSubmittingPost(true);
    setPostError(null);
    
    try {
      console.log(`Creating post in group ${groupId} by user ${currentUserId}`);
      console.log(`Post data: ${JSON.stringify(newPost)}`);
      
      const postRequest: CreatePostRequest = {
        title: newPost.title.trim(),
        content: newPost.content.trim()
      };
      
      // Try using the test function first since it's simpler
      const createdPost = await testCreateGroupPost(currentUserId, groupId);
      
      if (createdPost) {
        console.log('Post created successfully:', createdPost);
        
        // Format the post for display in the UI
        const formattedPost = {
          ...createdPost,
          author: currentUser, // Add the current user as the author
          likes_count: 0, // Initialize likes count
        };
        
        // Add new post to the list
        console.log('Adding post to UI:', formattedPost);
        setPosts(prevPosts => [formattedPost, ...prevPosts]);
        
        // Clear form
        setNewPost({
          title: '',
          content: ''
        });
        setShowNewPostForm(false);
        
        // Force a complete refresh of posts after a slight delay
        setTimeout(() => {
          fetchPosts();
        }, 500);
      } else {
        console.error('Failed to create post - null response received');
        setPostError('Failed to create post. Please try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error creating post:', error);
      console.error('Error details:', errorMessage);
      setPostError(`Error: ${errorMessage}`);
    } finally {
      setIsSubmittingPost(false);
    }
  };
  
  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    if (!currentUserId) return;
    
    try {
      await deletePost(currentUserId, postId);
      // Update posts list
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };
  
  // Handle member removal
  const handleRemoveMember = async (userId: string) => {
    if (!currentUserId || !groupId || !isAdmin) return;
    
    try {
      const supabase = await createClient();
      
      // Delete the group member record
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error removing member:', error);
        return;
      }
      
      // Update the members list
      setMembers(prev => prev.filter(member => member.user_id !== userId));
    } catch (error) {
      console.error('Exception in handleRemoveMember:', error);
    }
  };
  
  // Handle member role change
  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!currentUserId || !groupId || !isAdmin) return;
    
    try {
      const supabase = await createClient();
      
      // Update the group member role
      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('group_id', groupId)
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error changing member role:', error);
        return;
      }
      
      // Update the members list
      setMembers(prev => prev.map(member => 
        member.user_id === userId 
          ? { ...member, role: newRole as 'admin' | 'moderator' | 'member' } 
          : member
      ));
    } catch (error) {
      console.error('Exception in handleChangeRole:', error);
    }
  };
  
  // Add a function to handle post likes
  const handlePostLike = async (postId: string) => {
    if (!currentUserId) return;
    
    try {
      console.log(`Toggling like for post ${postId} by user ${currentUserId}`);
      
      // Find the post to toggle like
      const postToUpdate = posts.find(post => post.id === postId);
      if (!postToUpdate) {
        console.error(`Post with ID ${postId} not found in state`);
        return;
      }
      
      // Cast to access like properties safely
      const postAny = postToUpdate as any;
      const hasLiked = postAny.user_has_liked || false;
      const likesCount = postAny.likes_count || 0;
      
      // Optimistic update - update UI immediately
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            user_has_liked: !hasLiked,
            likes_count: hasLiked ? Math.max(0, likesCount - 1) : likesCount + 1
          } as any;
        }
        return post;
      }));
      
      // Actual API call
      await togglePostLike(currentUserId, postId);
      
      // Force a re-render by creating a new array
      setTimeout(() => {
        setPosts(prevPosts => [...prevPosts]);
      }, 100);
    } catch (error) {
      console.error('Error toggling post like:', error);
      // Revert on error by re-fetching
      fetchPosts();
    }
  };
  
  // Function to view post comments
  const handleViewComments = (postId: string) => {
    if (!postId) return;
    // Navigate to the post detail page with the group context
    router.push(`/community/posts/${postId}?groupId=${groupId}`);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#4A7B61]" />
      </div>
    );
  }
  
  // Group not found
  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F7F2] px-4">
        <h1 className="text-2xl font-medium text-[#2C2925] mb-4">Group not found</h1>
        <p className="text-[#58534D] mb-6">
          The group you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/community"
          className="inline-flex items-center px-5 py-2.5 bg-[#4A7B61] text-white rounded-lg hover:bg-[#3A6B51] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Community
        </Link>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F8F7F2] to-[#F4F2ED]">
      {/* Header with background */}
      <div className="relative">
        {/* Group cover image or gradient */}
        <div className="h-48 w-full bg-gradient-to-r from-[#4A7B61]/90 to-[#3A6B51]/90 relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('/images/pattern.svg')]"></div>
          
          {/* Back button - fixed position for easy navigation */}
          <div className="absolute top-4 left-4 z-10">
            <Link
              href="/community/groups"
              className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md text-[#2C2925] hover:bg-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="sr-only">Back to Groups</span>
            </Link>
          </div>
        </div>
        
        {/* Group info card - overlapping the cover image */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
          <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] overflow-hidden p-6">
            {/* Group header with title and actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#2C2925] mb-1">
                  {group?.name || 'Loading...'}
                </h1>
                <p className="text-[#706C66] flex items-center">
                  <Users className="w-4 h-4 mr-1.5 text-[#4A7B61]" />
                  <span>{members?.length || 0} members</span>
                  {group && group.is_private && (
                    <span className="ml-3 flex items-center text-[#706C66]">
                      <Lock className="w-4 h-4 mr-1" />
                      Private
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {!isMember ? (
                  <button
                    onClick={handleToggleMembership}
                    disabled={isJoining}
                    className="px-5 py-2.5 bg-[#4A7B61] text-white rounded-lg shadow-sm hover:bg-[#3A6B51] focus:ring-2 focus:ring-[#4A7B61]/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Group
                      </>
                    )}
                  </button>
                ) : (
                  <div className="relative">
                    <button
                      onClick={toggleSettingsMenu}
                      className="px-4 py-2.5 border border-[#E8E6E1] bg-white text-[#2C2925] rounded-lg hover:bg-[#F8F7F2] focus:ring-2 focus:ring-[#4A7B61]/20 transition-all flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2 text-[#706C66]" />
                      <span className="hidden sm:inline">Group Settings</span>
                      <span className="sm:hidden">Settings</span>
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </button>
                    
                    {showSettingsMenu && (
                      <div className="absolute right-0 top-full mt-2 bg-white border border-[#E8E6E1] rounded-lg shadow-md z-10 w-48 py-1 text-sm">
                        {isAdmin && (
                          <Link
                            href={`/community/groups/${groupId}/edit`}
                            className="w-full text-left px-4 py-2.5 hover:bg-[#F4F2ED] flex items-center text-[#2C2925]"
                          >
                            <Settings className="w-4 h-4 mr-2 text-[#706C66]" />
                            Edit Group Settings
                          </Link>
                        )}
                        
                        {/* Leave group option */}
                        <button
                          onClick={handleLeaveGroup}
                          className={`w-full text-left px-4 py-2.5 flex items-center ${
                            confirmLeave
                              ? 'bg-red-50 text-red-600'
                              : 'hover:bg-[#F4F2ED] text-[#2C2925]'
                          }`}
                        >
                          <LogOut className={`w-4 h-4 mr-2 ${
                            confirmLeave ? 'text-red-500' : 'text-[#706C66]'
                          }`} />
                          {confirmLeave ? 'Confirm Leave Group' : 'Leave Group'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Description and topics */}
            <div className="prose prose-slate max-w-none mb-6">
              <p className="text-[#58534D]">{group?.description}</p>
              
              {group?.topics && group?.topics.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="inline-block px-2.5 py-1 text-xs bg-[#F4F2ED] text-[#706C66] rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Tabs navigation */}
            <div className="border-b border-[#E8E6E1] mb-6">
              <div className="flex space-x-1 overflow-x-auto scrollbar-hide -mb-px">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'posts'
                      ? 'border-[#4A7B61] text-[#4A7B61]'
                      : 'border-transparent text-[#706C66] hover:text-[#2C2925] hover:border-[#E8E6E1]'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`px-4 py-3 font-medium text-sm border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'members'
                      ? 'border-[#4A7B61] text-[#4A7B61]'
                      : 'border-transparent text-[#706C66] hover:text-[#2C2925] hover:border-[#E8E6E1]'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Members
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab content */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* New post button - only visible if member */}
            {isMember && !showNewPostForm && (
              <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-4 mb-6 flex justify-between items-center">
                <div className="flex items-center flex-grow">
                  <div className="w-10 h-10 rounded-full bg-[#F4F2ED] flex items-center justify-center text-[#706C66] mr-3">
                    {currentUser?.avatar_url ? (
                      <Image
                        src={currentUser.avatar_url}
                        alt={currentUser.username || 'You'}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <button
                    onClick={() => setShowNewPostForm(true)}
                    className="bg-[#F8F7F2] rounded-lg px-4 py-2.5 text-[#706C66] text-left flex-grow hover:bg-[#F4F2ED] text-sm"
                  >
                    Start a conversation in {group?.name}...
                  </button>
                </div>
                <button
                  onClick={() => setShowNewPostForm(true)}
                  className="ml-3 p-2.5 bg-[#4A7B61] text-white rounded-lg shadow-sm hover:bg-[#3A6B51] transition-all hidden sm:flex items-center"
                >
                  <Edit className="w-4 h-4" />
                  <span className="sr-only">Create Post</span>
                </button>
              </div>
            )}
            
            {/* Rest of the post form and content */}
            {showNewPostForm && (
              <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-6 relative mb-6">
                <button
                  onClick={() => setShowNewPostForm(false)}
                  className="absolute top-3 right-3 text-[#706C66] hover:text-[#2C2925]"
                >
                  <X className="w-5 h-5" />
                  <span className="sr-only">Close</span>
                </button>
                
                <h2 className="text-lg font-medium mb-4">Create New Post</h2>
                
                {postError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {postError}
                  </div>
                )}
                
                <form onSubmit={handleCreatePost}>
                  <div className="mb-4">
                    <label htmlFor="post-title" className="block text-sm font-medium text-[#2C2925] mb-1">
                      Title
                    </label>
                    <input
                      id="post-title"
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg focus:ring-[#4A7B61] focus:border-[#4A7B61]"
                      placeholder="Post title"
                    />
                  </div>
                  
                  <div className="mb-5">
                    <label htmlFor="post-content" className="block text-sm font-medium text-[#2C2925] mb-1">
                      Content
                    </label>
                    <textarea
                      id="post-content"
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      rows={5}
                      className="w-full px-3 py-2 border border-[#E8E6E1] rounded-lg focus:ring-[#4A7B61] focus:border-[#4A7B61]"
                      placeholder="Write your post content here..."
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowNewPostForm(false)}
                      className="px-4 py-2 text-[#58534D] hover:text-[#2C2925] mr-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingPost}
                      className="inline-flex items-center px-4 py-2 bg-[#4A7B61] text-white rounded-lg hover:bg-[#3A6B51] transition-colors disabled:opacity-50"
                    >
                      {isSubmittingPost ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Post
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Posts content */}
            {isPostsLoading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] overflow-hidden animate-pulse">
                    <div className="p-4 border-b border-[#E8E6E1] flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#E8E6E1] mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-[#E8E6E1] rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-[#E8E6E1] rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="h-5 bg-[#E8E6E1] rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-[#E8E6E1] rounded w-full mb-2"></div>
                      <div className="h-4 bg-[#E8E6E1] rounded w-full mb-2"></div>
                      <div className="h-4 bg-[#E8E6E1] rounded w-2/3"></div>
                    </div>
                    <div className="px-4 py-3 bg-[#F8F7F2] border-t border-[#E8E6E1] flex">
                      <div className="w-16 h-8 bg-[#E8E6E1] rounded-md mr-3"></div>
                      <div className="w-16 h-8 bg-[#E8E6E1] rounded-md"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div 
                    key={post.id} 
                    className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] overflow-hidden transition-all hover:shadow-md"
                  >
                    <PostCard
                      post={post}
                      currentUserId={currentUserId}
                      onToggleLike={handlePostLike}
                      onDelete={handleDeletePost}
                      onViewComments={handleViewComments}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] p-8 text-center">
                <div className="max-w-md mx-auto">
                  <FileText className="w-12 h-12 text-[#CAC6BF] mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-[#2C2925] mb-2">No posts yet</h3>
                  <p className="text-[#706C66] mb-6">
                    {isMember
                      ? 'Be the first to start a conversation in this group!'
                      : 'Join the group to see and create posts.'}
                  </p>
                  {isMember && (
                    <button
                      onClick={() => setShowNewPostForm(true)}
                      className="inline-flex items-center px-5 py-2.5 bg-[#4A7B61] text-white rounded-lg shadow hover:bg-[#3A6B51] transition-all"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Create First Post
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'members' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#E8E6E1] overflow-hidden">
            <GroupMembers
              members={members}
              isLoading={isMembersLoading}
              groupId={groupId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onRemoveMember={handleRemoveMember}
              onChangeMemberRole={handleChangeRole}
            />
          </div>
        )}
      </div>
      
      {/* Floating action button for mobile - only visible if member */}
      {isMember && !showNewPostForm && activeTab === 'posts' && (
        <div className="fixed bottom-6 right-6 sm:hidden z-20">
          <button
            onClick={() => setShowNewPostForm(true)}
            className="w-14 h-14 rounded-full bg-[#4A7B61] text-white shadow-lg flex items-center justify-center hover:bg-[#3A6B51] transition-all"
          >
            <Edit className="w-6 h-6" />
            <span className="sr-only">Create Post</span>
          </button>
        </div>
      )}
      
      {/* Debug panel (development only) - keep existing code */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <GroupDebugPanel groupId={groupId} userId={currentUserId} />
      </div>
    </main>
  );
};

export default GroupDetailPage; 