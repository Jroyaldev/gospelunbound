import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design that detects if the current viewport matches a media query
 * @param query - CSS media query string e.g., '(max-width: 768px)'
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with a default based on SSR considerations
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create a media query list
    const media = window.matchMedia(query);
    
    // Set the initial value
    setMatches(media.matches);
    
    // Define listener to update state
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    media.addEventListener('change', listener);
    
    // Clean up
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
} 