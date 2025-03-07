import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import MobilePostHeader from './MobilePostHeader';
import MobilePostList from './MobilePostList';
import MobileFooter from './MobileFooter';
import { Post, Group } from '@/app/lib/types';
import { PostComment } from '@/app/types/database';
import { createClient } from '@/app/lib/supabase/client';
import { toggleCommentLike as toggleCommentLikeDB, deletePostComment, deletePost } from '@/app/lib/supabase/database';

interface MobileCommunityViewProps {
  posts: Post[];
  groups: Group[];
  currentUserId: string | null;
  currentUser: any; // Profile type
  isLoading?: boolean;
  onLikeToggle: (postId: string) => void;
  onGroupMembershipToggle: (groupId: string, isMember: boolean) => void;
  onCreatePost?: () => void;
  onCreateGroup?: () => void;
  onPostDelete?: (postId: string) => void;
}

const MobileCommunityView = ({
  posts,
  groups,
  currentUserId,
  currentUser,
  isLoading = false,
  onLikeToggle,
  onGroupMembershipToggle,
  onCreatePost,
  onCreateGroup,
  onPostDelete
}: MobileCommunityViewProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<'posts' | 'groups'>('posts');
  const router = useRouter();
  
  // Define the tabs for the community view
  const tabs = [
    {
      id: 'posts',
      label: 'Posts',
      isActive: activeTab === 'posts',
      onClick: () => setActiveTab('posts')
    },
    {
      id: 'groups',
      label: 'Groups',
      isActive: activeTab === 'groups',
      onClick: () => setActiveTab('groups')
    }
  ];

  const handleActionButtonClick = () => {
    if (activeTab === 'posts' && onCreatePost) {
      onCreatePost();
    } else if (activeTab === 'groups' && onCreateGroup) {
      onCreateGroup();
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
        if (onPostDelete) {
          onPostDelete(postId);
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
            onLikeToggle={onLikeToggle}
            isLoading={isLoading}
            onToggleComments={fetchComments}
            onAddComment={addComment}
            onCommentLike={toggleCommentLike}
            onCommentDelete={deleteComment}
            onPostDelete={handlePostDelete}
          />
        ) : (
          <div>
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-8">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#4A7B61] border-t-transparent"></div>
                <p className="mt-3 text-sm text-[#706C66]">Loading groups...</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-[#4A7B61]/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4A7B61]">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <p className="text-base font-medium text-[#2C2925]">No groups yet</p>
                <p className="mt-1 text-sm text-[#706C66]">Create a group or check back later!</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8E6E1]">
                {groups.map((group) => (
                  <div key={group.id} className="p-4 hover:bg-[#F8F7F4]/40">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#4A7B61]/20 rounded-full flex items-center justify-center flex-shrink-0">
                        {group.image_url ? (
                          <img 
                            src={group.image_url} 
                            alt={group.name} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4A7B61]">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[15px] text-[#2C2925] truncate">{group.name}</h3>
                        <p className="text-[13px] text-[#706C66] line-clamp-1">{group.description || 'No description'}</p>
                        <div className="mt-2">
                          <button
                            onClick={() => onGroupMembershipToggle(group.id, !!group.is_member)}
                            className={`text-xs px-3 py-1 rounded-full ${
                              group.is_member
                                ? 'bg-[#4A7B61]/10 text-[#4A7B61] border border-[#4A7B61]/20'
                                : 'bg-[#4A7B61] text-white'
                            }`}
                          >
                            {group.is_member ? 'Joined' : 'Join Group'}
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-[#706C66]">
                        {group.members || 0} members
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Create post/group button */}
      {currentUserId && (activeTab === 'posts' ? onCreatePost : onCreateGroup) && (
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