import React from 'react';

declare global {
  namespace React {
    // Extend ReactNode to include Element type
    interface ReactPortal {
      children?: ReactNode;
    }
  }
}

export {}; 