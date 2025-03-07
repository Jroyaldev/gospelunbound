'use client';

import { useEffect } from 'react';

export default function LayoutEffect() {
  useEffect(() => {
    // Handle sidebar layout
    if (window.innerWidth >= 1024) {
      document.body.classList.add('has-sidebar');
    }

    // Optional: Add resize listener to update the class if window is resized
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        document.body.classList.add('has-sidebar');
      } else {
        document.body.classList.remove('has-sidebar');
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // This component doesn't render anything
  return null;
} 