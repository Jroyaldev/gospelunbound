'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';
import { createPost, getProfile } from '@/app/lib/supabase/database';
import { Profile } from '@/app/lib/types';
import { ArrowLeft } from 'lucide-react';

const CreatePostPage = (): JSX.Element => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Simplified categories
  const categories = [
    'Biblical Interpretation',
    'Faith & Science',
    'Social Justice',
    'Theology',
    'Prayer & Spirituality',
    'Church & Community',
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
      // Create post without tags
      const result = await createPost(currentUserId, {
        title,
        content,
        category: category || undefined,
        tags: [], // Empty tags array
      });
      
      if (result) {
        router.push('/community');
      } else {
        setError('Failed to create post. Please try again later.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError(`An unexpected error occurred. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-3 border-[#4A7B61] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F8F7F2] to-white pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-10">
        {/* Back button */}
        <div className="mb-6 sm:mb-8 flex justify-start">
          <Link 
            href="/community"
            className="inline-flex items-center text-[#58534D] px-4 py-2 rounded-full bg-white hover:bg-[#F5F4F2] transition-colors shadow-sm border border-[#E8E6E1]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Link>
        </div>
        
        {/* Main card */}
        <div className="bg-white rounded-xl border border-[#E8E6E1] p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl sm:text-2xl font-semibold text-[#2C2925] mb-8 text-center">Create Discussion</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#2C2925] mb-2 flex items-center">
                Title <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-[#E8E6E1] rounded-lg focus:ring-2 focus:ring-[#4A7B61]/20 focus:border-[#4A7B61] shadow-sm transition-all"
                placeholder="What do you want to discuss?"
                required
              />
            </div>
            
            {/* Category dropdown */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#2C2925] mb-2 flex items-center">
                Category <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="appearance-none w-full px-4 py-3 border border-[#E8E6E1] rounded-lg focus:ring-2 focus:ring-[#4A7B61]/20 focus:border-[#4A7B61] shadow-sm bg-white pr-10 transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#706C66]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Content field */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-[#2C2925] mb-2 flex items-center">
                Content <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-[#E8E6E1] rounded-lg focus:ring-2 focus:ring-[#4A7B61]/20 focus:border-[#4A7B61] shadow-sm transition-all resize-none"
                placeholder="Share your thoughts, questions, or ideas..."
                required
              />
            </div>
            
            {/* Form buttons */}
            <div className="flex justify-between pt-4">
              <Link
                href="/community"
                className="inline-flex items-center justify-center px-6 py-3 bg-white border border-[#E8E6E1] rounded-full text-[#58534D] hover:bg-[#F5F4F2] transition-all shadow-sm font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-8 py-3 bg-[#4A7B61] text-white rounded-full font-medium hover:bg-[#3A6B51] transition-all disabled:opacity-70 shadow-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </div>
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