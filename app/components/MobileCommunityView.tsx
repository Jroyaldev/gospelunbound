import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import MobilePostHeader from './MobilePostHeader';
import MobilePostList from './MobilePostList';
import MobileFooter from './MobileFooter';
import { Post } from '@/app/lib/types';
import { Group } from '@/app/types/community';
import { PostComment } from '@/app/types/database';
import { createClient } from '@/app/lib/supabase/client';
import { toggleCommentLike as toggleCommentLikeDB, deletePostComment, deletePost } from '@/app/lib/supabase/database';

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
  onTabChange
}: MobileCommunityViewProps): JSX.Element => {
  const [localActiveTab, setLocalActiveTab] = useState<'posts' | 'groups'>(propActiveTab === 'discussions' ? 'posts' : 'groups');
  const router = useRouter();
  
  // Use either the provided activeTab from props or the local state
  const activeTab = propActiveTab === 'discussions' ? 'posts' : propActiveTab === 'groups' ? 'groups' : localActiveTab;
  
  // Define the tabs for the community view
  const tabs = [
    {
      id: 'posts',
      label: 'Posts',
      isActive: activeTab === 'posts',
      onClick: () => {
        setLocalActiveTab('posts');
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

  // Handle click on the action button (create post or group)
  const handleActionButtonClick = () => {
    if (activeTab === 'posts') {
      router.push('/community/create-post');
    } else {
      router.push('/community/create-group');
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
    <div className="flex flex-col h-full max-w-full bg-white relative">
      <MobilePostHeader 
        title="Community"
        tabs={tabs}
      />
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeTab === 'posts' ? (
          <MobilePostList 
            posts={posts}
            currentUserId={currentUserId}
            currentUser={currentUser}
            onLikeToggle={onPostLikeToggle}
            isLoading={isLoadingPosts}
            onToggleComments={fetchComments}
            onAddComment={addComment}
            onCommentLike={toggleCommentLike}
            onCommentDelete={deleteComment}
            onPostDelete={handlePostDelete}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4">
            {isLoadingGroups ? (
              // Loading state for groups
              <div className="flex justify-center items-center py-10">
                <div className="w-8 h-8 border-2 border-[#4A7B61] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-[#706C66]">Loading groups...</span>
              </div>
            ) : groups.length === 0 ? (
              // Empty state for groups
              <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-[#E8E6E1]">
                <h3 className="text-lg font-medium text-[#2C2925] mb-2">No groups yet</h3>
                <p className="text-[#706C66] mb-6">
                  {currentUserId ? 'Create a group to start connecting with others!' : 'Join to see and create groups'}
                </p>
                {currentUserId && (
                  <button
                    onClick={() => router.push('/community/create-group')}
                    className="inline-flex items-center px-4 py-2 bg-[#4A7B61] text-white rounded-lg hover:bg-[#3A6B51] transition-colors"
                  >
                    <Plus size={18} className="mr-2" />
                    Create Group
                  </button>
                )}
              </div>
            ) : (
              // Groups list
              groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-[#E8E6E1]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[#2C2925]">{group.name}</h3>
                      <p className="text-sm text-[#706C66] mt-1">
                        {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                      </p>
                      <p className="text-sm text-[#58534D] mt-2 line-clamp-2">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  {currentUserId && (
                    <div className="mt-2">
                      <button
                        onClick={() => onGroupMembershipToggle(group.id)}
                        className={`text-xs px-3 py-1 rounded-full ${
                          group.is_member
                            ? 'bg-red-100 text-red-600 border border-red-200'
                            : 'bg-[#4A7B61]/15 text-[#4A7B61] border border-[#4A7B61]/20'
                        }`}
                      >
                        {group.is_member ? 'Leave' : 'Join'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Create post/group button */}
      {currentUserId && (
        <div className="fixed bottom-24 right-6 z-10">
          <button
            onClick={handleActionButtonClick}
            className="bg-[#4A7B61] text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center hover:bg-[#3A6B51] transition-colors"
            aria-label={activeTab === 'posts' ? "Create new post" : "Create new group"}
          >
            <Plus size={28} />
          </button>
        </div>
      )}
      
      {/* Fixed footer at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <MobileFooter />
      </div>
    </div>
  );
};

export default MobileCommunityView; 