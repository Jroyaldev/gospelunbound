'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom hook to ensure videos autoplay properly across all devices
 * @param options Optional configuration options
 * @returns A ref to be attached to the video element
 */
export function useVideoAutoplay<T extends HTMLVideoElement>(options?: {
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
}) {
  const videoRef = useRef<T>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set default options
    const { muted = true, loop = true, playsInline = true } = options || {};
    
    // Apply attributes
    video.muted = muted;
    video.loop = loop;
    video.playsInline = playsInline;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    
    // Function to attempt playback
    const attemptPlay = async () => {
      try {
        // For Safari, we need to load the video first
        if (video.readyState < 2) { // HAVE_CURRENT_DATA
          await new Promise((resolve) => {
            video.addEventListener('loadeddata', resolve, { once: true });
            video.load();
          });
        }
        
        await video.play();
      } catch (error) {
        console.warn('Video autoplay failed:', error);
        
        // If autoplay fails, try again with user interaction
        const resumePlay = async () => {
          try {
            await video.play();
            document.removeEventListener('click', resumePlay);
            document.removeEventListener('touchstart', resumePlay);
          } catch (e) {
            console.error('Video play failed after user interaction:', e);
          }
        };
        
        document.addEventListener('click', resumePlay, { once: true });
        document.addEventListener('touchstart', resumePlay, { once: true });
      }
    };
    
    // Try to play immediately
    attemptPlay();
    
    // Also try to play when the video becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            attemptPlay();
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(video);
    
    return () => {
      observer.disconnect();
      document.removeEventListener('click', attemptPlay);
      document.removeEventListener('touchstart', attemptPlay);
    };
  }, [options]);
  
  return videoRef;
} 