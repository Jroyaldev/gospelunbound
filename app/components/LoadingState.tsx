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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center bg-background p-6 rounded-lg border border-border shadow-sm">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-accent animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-foreground">Loading...</p>
      </div>
    </div>
  );
}