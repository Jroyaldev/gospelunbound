'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { CreatePostButtonProps } from '@/app/types/community';

/**
 * CreatePostButton component displays a floating action button
 * for creating new posts in the community section
 * 
 * Features:
 * - Fixed position in the bottom-right corner
 * - Only visible to logged-in users
 * - Navigates to the create post page on click
 * - Accessible with proper aria labels
 */
const CreatePostButton = ({ currentUserId }: CreatePostButtonProps): JSX.Element => {
  const router = useRouter();

  // Only show button if user is logged in
  if (!currentUserId) return <></>;

  return (
    <button 
      onClick={() => router.push('/community/create-post')}
      className="fixed bottom-6 right-6 flex items-center justify-center bg-[#4A7B61] text-white rounded-full w-14 h-14 shadow-lg hover:bg-[#3A6B51] transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A7B61] focus:ring-offset-2"
      aria-label="Create Post"
    >
      <Plus size={24} />
      <span className="sr-only">Create new post</span>
    </button>
  );
};

export default CreatePostButton;
