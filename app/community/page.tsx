'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';
import { getPosts, getGroups, joinGroup, leaveGroup, togglePostLike, getProfile } from '@/app/lib/supabase/database';
import { Post, Group, Profile } from '@/app/lib/types';
import { Search, Users, MessageSquare, Heart, Pin, ChevronRight, UserPlus, Settings, Bell, Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DiscussionCardProps {
  post: Post;
  currentUserId: string | null;
  onLikeToggle: (postId: string) => void;
}

const DiscussionCard = ({ post, currentUserId, onLikeToggle }: DiscussionCardProps): JSX.Element => {
  // Format date for display
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#4A7B61]/40 hover:shadow-md transition-all p-5 sm:p-6 relative hover:translate-y-[-2px]"
    >
      <div className="flex items-start gap-3">
        <img
          src={post.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author?.full_name || 'User')}
          alt={post.author?.full_name || 'User'}
          className="w-9 h-9 rounded-full object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#2C2925]">{post.author?.full_name || 'Anonymous'}</span>
            <span className="text-xs text-[#706C66]">{formattedDate}</span>
          </div>
          
          <h3 className="text-base font-medium text-[#2C2925] mb-1 group-hover:text-[#4A7B61] transition-colors">
            {post.title}
          </h3>
          
          <p className="text-sm text-[#706C66] mb-3 line-clamp-2">
            {post.content.length > 120 ? `${post.content.substring(0, 120)}...` : post.content}
          </p>
          
          <div className="flex items-center text-xs text-[#706C66] gap-3">
            {post.category && (
              <div className="flex items-center gap-1">
                <Pin size={14} strokeWidth={1.5} className="text-[#706C66]" />
                <span>{post.category}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if (currentUserId) {
                    onLikeToggle(post.id);
                  }
                }}
                className={`flex items-center gap-1 ${currentUserId ? 'hover:text-[#E74C3C] cursor-pointer' : 'cursor-default'}`}
              >
                <Heart 
                  size={14} 
                  strokeWidth={1.5} 
                  className="text-[#706C66]" 
                  fill={post.has_liked ? "#E74C3C" : "none"}
                  color={post.has_liked ? "#E74C3C" : undefined}
                />
                <span>{post.likes || 0}</span>
              </button>
              
              <div className="flex items-center gap-1">
                <MessageSquare size={14} strokeWidth={1.5} className="text-[#706C66]" />
                <span>{post.comments || 0}</span>
              </div>
            </div>
          </div>
          
          <Link href={`/community/discussions/${post.id}`} className="absolute inset-0">
            <span className="sr-only">View discussion: {post.title}</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

interface GroupCardProps {
  group: Group;
  currentUserId: string | null;
  onMembershipToggle: (groupId: string, isMember: boolean) => void;
}

const GroupCard = ({ group, currentUserId, onMembershipToggle }: GroupCardProps): JSX.Element => {
  // Create a set of mock user avatars since we don't have actual member avatars yet
  const avatarPlaceholders = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
  ];
  
  // Use the first few avatars depending on group size
  const membersCount = group.members || 0;
  const avatarsToShow = avatarPlaceholders.slice(0, Math.min(3, Math.floor(membersCount / 50) + 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#4A7B61]/40 hover:shadow-md transition-all p-5 sm:p-6 relative hover:translate-y-[-2px]"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F8F7F2]/50 flex items-center justify-center">
          <Users size={20} strokeWidth={1.5} className="text-[#2C2925]" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-medium text-[#2C2925] group-hover:text-[#4A7B61] transition-colors">
              {group.name}
            </h3>
            <span className="text-xs text-[#706C66]">{membersCount} members</span>
          </div>
          
          <p className="text-sm text-[#706C66] mb-3 line-clamp-2">
            {group.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {avatarsToShow.map((avatar, i) => (
                <img 
                  key={i}
                  src={avatar}
                  alt="Member"
                  className="w-6 h-6 rounded-full border-2 border-[#F8F7F2] object-cover"
                />
              ))}
            </div>
            
            {currentUserId && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  onMembershipToggle(group.id, !!group.is_member);
                }}
                className={`text-xs font-medium flex items-center ${group.is_member ? 'text-red-500' : 'text-[#4A7B61]'}`}
              >
                <UserPlus 
                  size={14} 
                  strokeWidth={1.5} 
                  className={`mr-1 ${group.is_member ? 'text-red-500' : 'text-[#4A7B61]'}`} 
                />
                {group.is_member ? 'Leave group' : 'Join group'}
              </button>
            )}
          </div>
          
          <Link href={`/community/groups/${group.id}`} className="absolute inset-0">
            <span className="sr-only">View group: {group.name}</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const CreatePostButton = ({ currentUserId }: { currentUserId: string | null }): JSX.Element => {
  const router = useRouter();

  if (!currentUserId) return <></>;

  return (
    <button 
      onClick={() => router.push('/community/create-post')}
      className="fixed bottom-6 right-6 flex items-center justify-center gap-2 bg-[#4A7B61] text-white rounded-full p-4 shadow-lg hover:bg-[#3A6B51] transition-colors z-10"
    >
      <Plus size={20} strokeWidth={1.5} className="text-white" />
      <span className="hidden sm:inline-block">Create Post</span>
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
        const postsData = await getPosts(4);
        console.log('Posts data returned from getPosts:', postsData);
        if (userId) {
          const postsWithLikeStatus = await Promise.all(
            postsData.map(async (post) => {
              // Check if current user has liked this post
              const { data } = await supabase
                .from('post_likes')
                .select('id')
                .eq('user_id', userId)
                .eq('post_id', post.id)
                .single();
              
              return {
                ...post,
                has_liked: !!data
              };
            })
          );
          setPosts(postsWithLikeStatus);
        } else {
          setPosts(postsData);
        }
        
        // Fetch groups and check if current user is a member
        const groupsData = await getGroups(4);
        if (userId) {
          const groupsWithMemberStatus = await Promise.all(
            groupsData.map(async (group) => {
              // Check if current user is a member of this group
              const { data } = await supabase
                .from('group_members')
                .select('id')
                .eq('user_id', userId)
                .eq('group_id', group.id)
                .single();
              
              return {
                ...group,
                is_member: !!data
              };
            })
          );
          setGroups(groupsWithMemberStatus);
        } else {
          setGroups(groupsData);
        }
      } catch (error) {
        console.error('Error fetching community data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handlePostLikeToggle = async (postId: string) => {
    if (!currentUserId) return;
    
    try {
      // Optimistically update UI
      setPosts((prevPosts) => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const newLikeStatus = !post.has_liked;
            return {
              ...post,
              has_liked: newLikeStatus,
              likes: (post.likes || 0) + (newLikeStatus ? 1 : -1)
            };
          }
          return post;
        })
      );
      
      // Update on backend
      await togglePostLike(currentUserId, postId);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      fetchPosts();
    }
  };
  
  const handleGroupMembershipToggle = async (groupId: string, isMember: boolean) => {
    if (!currentUserId) return;
    
    try {
      // Optimistically update UI
      setGroups((prevGroups) => 
        prevGroups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              is_member: !isMember,
              members: (group.members || 0) + (isMember ? -1 : 1)
            };
          }
          return group;
        })
      );
      
      // Update on backend
      if (isMember) {
        await leaveGroup(currentUserId, groupId);
      } else {
        await joinGroup(currentUserId, groupId);
      }
    } catch (error) {
      console.error('Error toggling group membership:', error);
      // Revert optimistic update on error
      fetchGroups();
    }
  };
  
  const fetchPosts = async () => {
    try {
      const postsData = await getPosts(4);
      console.log('Posts data returned from getPosts:', postsData);
      
      if (currentUserId) {
        const supabase = await createClient();
        const postsWithLikeStatus = await Promise.all(
          postsData.map(async (post) => {
            const { data } = await supabase
              .from('post_likes')
              .select('id')
              .eq('user_id', currentUserId)
              .eq('post_id', post.id)
              .single();
            
            return {
              ...post,
              has_liked: !!data
            };
          })
        );
        setPosts(postsWithLikeStatus);
      } else {
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  
  const fetchGroups = async () => {
    try {
      const groupsData = await getGroups(4);
      if (currentUserId) {
        const supabase = await createClient();
        const groupsWithMemberStatus = await Promise.all(
          groupsData.map(async (group) => {
            const { data } = await supabase
              .from('group_members')
              .select('id')
              .eq('user_id', currentUserId)
              .eq('group_id', group.id)
              .single();
            
            return {
              ...group,
              is_member: !!data
            };
          })
        );
        setGroups(groupsWithMemberStatus);
      } else {
        setGroups(groupsData);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/community/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#2C2925]">
      <div className="w-full px-4 md:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="max-w-[90rem] mx-auto">
          {/* Header */}
          <div className="relative rounded-xl overflow-hidden mb-8 mx-4 sm:mx-6 lg:mx-8">
            <div className="absolute inset-0 bg-[#F5F0E8] opacity-70"></div>
            <div className="relative z-10 px-6 py-10 md:px-8 md:py-12">
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#2C2925] mb-2">Community</h1>
              <p className="text-sm sm:text-base text-[#706C66] max-w-md">
                Connect with others and engage in meaningful discussions about progressive Christianity
              </p>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="px-4 sm:px-6 lg:px-8">
            {/* User banner */}
            {currentUser ? (
              <div className="bg-white border border-[#E8E6E1] rounded-2xl p-5 sm:p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name || '')}`}
                      alt={currentUser.full_name || ''}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[#2C2925] font-medium">{currentUser.full_name || currentUser.username}</p>
                      <p className="text-sm text-[#706C66]">Member</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Link 
                      href="/community/notifications"
                      className="flex items-center justify-center gap-1 min-h-[44px] p-3 sm:px-4 bg-white border border-[#E8E6E1] rounded-full text-[#2C2925] hover:bg-[#F5F0E8]/50 transition-all"
                    >
                      <Bell size={16} strokeWidth={1.5} className="text-[#706C66]" />
                      <span className="hidden sm:inline-block">Notifications</span>
                    </Link>
                    <Link 
                      href="/profile"
                      className="flex items-center justify-center gap-1 min-h-[44px] p-3 sm:px-4 bg-white border border-[#E8E6E1] rounded-full text-[#2C2925] hover:bg-[#F5F0E8]/50 transition-all"
                    >
                      <Settings size={16} strokeWidth={1.5} className="text-[#706C66]" />
                      <span className="hidden sm:inline-block">Settings</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[#E8E6E1] rounded-2xl p-5 sm:p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-[#706C66]">Sign in to participate in discussions and join groups</p>
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 bg-[#4A7B61] text-white rounded-full font-medium hover:bg-[#4A7B61]/90 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
            
            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative w-full max-w-md mb-10">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} strokeWidth={1.5} className="text-[#706C66]" />
              </div>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search discussions and groups..."
                className="block w-full min-h-[44px] py-2.5 pl-10 pr-3 border border-[#E8E6E1] rounded-full bg-white text-[#2C2925] placeholder-[#706C66] focus:border-[#4A7B61] focus:ring-[#4A7B61] transition-all duration-200"
              />
            </form>
            
            {/* Loading state */}
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 size={32} className="animate-spin text-[#4A7B61]" />
              </div>
            ) : (
              <>
                {/* Recent Discussions */}
                <div className="mb-12">
                  <div className="flex justify-between items-end mb-5">
                    <h2 className="text-xl font-medium text-[#2C2925]">Recent Discussions</h2>
                    <Link 
                      href="/community/discussions"
                      className="text-sm text-[#4A7B61] flex items-center gap-1 hover:underline underline-offset-4"
                    >
                      View all
                      <ChevronRight size={14} strokeWidth={1.5} className="ml-1 text-[#4A7B61]" />
                    </Link>
                  </div>
                  
                  {posts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#E8E6E1] p-8 text-center">
                      <p className="text-[#706C66] mb-4">No discussions yet</p>
                      {currentUserId && (
                        <button
                          onClick={() => router.push('/community/create-post')}
                          className="inline-flex items-center justify-center gap-2 py-2 px-4 bg-[#4A7B61] text-white rounded-full hover:bg-[#3A6B51] transition-colors"
                        >
                          <Plus size={16} strokeWidth={1.5} />
                          Start a Discussion
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {posts.map((post) => (
                        <DiscussionCard 
                          key={post.id} 
                          post={post} 
                          currentUserId={currentUserId}
                          onLikeToggle={handlePostLikeToggle}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Groups You Might Like */}
                <div>
                  <div className="flex justify-between items-end mb-5">
                    <h2 className="text-xl font-medium text-[#2C2925]">Groups You Might Like</h2>
                    <Link 
                      href="/community/groups"
                      className="text-sm text-[#4A7B61] flex items-center gap-1 hover:underline underline-offset-4"
                    >
                      View all
                      <ChevronRight size={14} strokeWidth={1.5} className="ml-1 text-[#4A7B61]" />
                    </Link>
                  </div>
                  
                  {groups.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#E8E6E1] p-8 text-center">
                      <p className="text-[#706C66] mb-4">No groups available</p>
                      {currentUserId && (
                        <button
                          onClick={() => router.push('/community/create-group')}
                          className="inline-flex items-center justify-center gap-2 py-2 px-4 bg-[#4A7B61] text-white rounded-full hover:bg-[#3A6B51] transition-colors"
                        >
                          <Plus size={16} strokeWidth={1.5} />
                          Create a Group
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {groups.map((group) => (
                        <GroupCard 
                          key={group.id} 
                          group={group} 
                          currentUserId={currentUserId}
                          onMembershipToggle={handleGroupMembershipToggle}
                        />
                      ))}
                    </div>
                  )}
                  
                  {currentUserId && (
                    <div className="mt-8 text-center">
                      <button 
                        onClick={() => router.push('/community/create-group')}
                        className="flex items-center justify-center gap-2 min-h-[44px] py-2.5 px-6 mx-auto bg-[#4A7B61] text-white rounded-full font-medium hover:bg-[#4A7B61]/90 transition-colors"
                      >
                        <Plus size={16} strokeWidth={1.5} className="text-white" />
                        Create a New Group
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <CreatePostButton currentUserId={currentUserId} />
    </main>
  );
};

export default CommunityPage;
