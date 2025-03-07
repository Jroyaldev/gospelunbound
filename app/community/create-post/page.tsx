'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';
import { createPost, getProfile } from '@/app/lib/supabase/database';
import { Profile } from '@/app/lib/types';
import { ArrowLeft, Loader2 } from 'lucide-react';

const CreatePostPage = (): JSX.Element => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Predefined categories for the community
  const categories = [
    'Progressive Christianity',
    'Biblical Interpretation',
    'Social Justice',
    'Faith & Science',
    'Interfaith Dialogue',
    'Philosophy',
    'Theology',
    'Church History',
    'Personal Experience',
    'Prayer & Spirituality',
    'Ethics & Morality',
    'General Discussion'
  ];

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const supabase = await createClient();
        
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        
        if (!userId) {
          // Not authenticated, redirect to sign in
          router.push('/auth/signin?redirect=/community/create-post');
          return;
        }
        
        setCurrentUserId(userId);
        
        // Get user profile
        const profile = await getProfile(userId);
        setCurrentUser(profile);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId) {
      setError('You must be signed in to create a post');
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Log the user ID to help with debugging
      console.log('Creating post with user ID:', currentUserId);
      
      const result = await createPost(currentUserId, {
        title,
        content,
        category: category || undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      });
      
      if (result) {
        router.push('/community');
      } else {
        setError('Failed to create post. There may be an issue with the database connection or permissions.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#4A7B61]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#2C2925] py-8 sm:py-10 lg:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link 
            href="/community"
            className="inline-flex items-center text-[#706C66] hover:text-[#4A7B61] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl border border-[#E8E6E1] p-6 sm:p-8">
          <h1 className="text-2xl font-medium text-[#2C2925] mb-6">Create Discussion</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-[#2C2925] mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-[#E8E6E1] rounded-lg focus:ring-[#4A7B61] focus:border-[#4A7B61]"
                placeholder="What do you want to discuss?"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-[#2C2925] mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-[#E8E6E1] rounded-lg focus:ring-[#4A7B61] focus:border-[#4A7B61]"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-6">
              <label htmlFor="tags" className="block text-sm font-medium text-[#2C2925] mb-2">
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border border-[#E8E6E1] rounded-lg focus:ring-[#4A7B61] focus:border-[#4A7B61]"
                placeholder="e.g. theology, biblical studies, social justice"
              />
              <p className="mt-1 text-sm text-[#706C66]">
                Add relevant tags to help others find your discussion
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-[#2C2925] mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-2 border border-[#E8E6E1] rounded-lg focus:ring-[#4A7B61] focus:border-[#4A7B61]"
                placeholder="Share your thoughts, questions, or ideas..."
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Link
                href="/community"
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-2 bg-white border border-[#E8E6E1] rounded-full text-[#2C2925] hover:bg-[#F5F0E8]/50 transition-all mr-3"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-2 bg-[#4A7B61] text-white rounded-full font-medium hover:bg-[#4A7B61]/90 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Discussion'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default CreatePostPage; 