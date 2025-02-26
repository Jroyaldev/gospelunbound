'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function LoadingState() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => {
      setTimeout(() => setIsLoading(false), 300); // Small delay to ensure smooth transition
    };

    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(handleComplete);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    // Clean up
    return () => {
      observer.disconnect();
    };
  }, []);

  // Reset loading state when the route changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300">
      <div className="flex flex-col items-center bg-black/40 p-8 rounded-2xl border border-white/10 shadow-2xl shadow-black/30">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-white/15"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
        </div>
        <p className="mt-5 text-base font-medium text-white/90">Loading...</p>
      </div>
    </div>
  );
} 