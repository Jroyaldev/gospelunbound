'use client';

import { useEffect, RefObject } from 'react';

/**
 * Custom hook to ensure videos autoplay properly across all devices
 * @param videoRef A React ref object to attach to the video element
 * @param options Optional configuration options
 */
export function useVideoAutoplay(
  videoRef: RefObject<HTMLVideoElement>,
  options?: {
    muted?: boolean;
    loop?: boolean;
    playsInline?: boolean;
  }
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set default options
    const config = {
      muted: options?.muted !== false, // Default to true
      loop: options?.loop !== false, // Default to true
      playsInline: options?.playsInline !== false, // Default to true
    };

    // Apply settings
    video.muted = config.muted;
    video.loop = config.loop;
    video.playsInline = config.playsInline;
    
    // Function to attempt playback
    const attemptPlay = async () => {
      try {
        if (video.paused) {
          await video.play();
        }
      } catch (error) {
        console.log('Autoplay prevented: ', error);
      }
    };
    
    // Try to play immediately
    attemptPlay();
    
    // Setup event listeners for user interaction to enable play
    const playOnUserInteraction = () => {
      attemptPlay();
      // Remove event listeners after first interaction
      document.removeEventListener('click', playOnUserInteraction);
      document.removeEventListener('touchstart', playOnUserInteraction);
      document.removeEventListener('keydown', playOnUserInteraction);
    };
    
    document.addEventListener('click', playOnUserInteraction);
    document.addEventListener('touchstart', playOnUserInteraction);
    document.addEventListener('keydown', playOnUserInteraction);
    
    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        attemptPlay();
      } else {
        video.pause();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add listener for when video can play
    video.addEventListener('canplay', attemptPlay);
    
    // Cleanup function
    return () => {
      document.removeEventListener('click', playOnUserInteraction);
      document.removeEventListener('touchstart', playOnUserInteraction);
      document.removeEventListener('keydown', playOnUserInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      video.removeEventListener('canplay', attemptPlay);
    };
  }, [videoRef, options]);
}