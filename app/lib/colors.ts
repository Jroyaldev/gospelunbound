/**
 * Sophisticated Color System for Gospel Unbound
 * 
 * This file provides consistent access to the color variables defined in globals.css
 * following a refined, adult-oriented palette with natural, subdued tones.
 */

// Helper function to generate RGB and HSL CSS variables
export const rgbVar = (name: string) => `rgb(var(--${name}))`;
export const rgbVarWithOpacity = (name: string, opacity: number) => 
  `rgba(var(--${name}), ${opacity})`;

// Color System
export const colors = {
  // Primary Brand Colors
  primary: {
    DEFAULT: rgbVar('color-primary'),
    dark: rgbVar('color-primary-dark'),
    light: rgbVar('color-primary-light'),
    opacity: (opacity: number) => rgbVarWithOpacity('color-primary', opacity),
  },
  accent: {
    DEFAULT: rgbVar('color-accent'),
    dark: rgbVar('color-accent-dark'),
    light: rgbVar('color-accent-light'),
    opacity: (opacity: number) => rgbVarWithOpacity('color-accent', opacity),
  },
  // Neutral System
  background: rgbVar('color-background'),
  surface: rgbVar('color-surface'),
  border: rgbVar('color-border'),
  text: {
    DEFAULT: rgbVar('color-text'),
    muted: rgbVar('color-text-muted'),
    opacity: (opacity: number) => rgbVarWithOpacity('color-text', opacity),
  },
  // Functional States
  info: rgbVar('color-info'),
  success: rgbVar('color-success'),
  warning: rgbVar('color-warning'),
  error: rgbVar('color-error'),
  // Fixed Colors
  white: '#FFFFFF',
  black: '#000000',
};

// CSS Color Variables
export const cssColors = {
  // Primary Brand
  primary: {
    DEFAULT: '#4A7B61', // Hero Green
    dark: '#3D644E',
    light: '#6E9C85',
  },
  accent: {
    DEFAULT: '#675C52', // Refined Taupe
    dark: '#4D453D',
    light: '#887D73',
  },
  // Neutral System
  background: '#F8F7F2', // Light Background
  surface: '#FFFFFF',    // Pure White
  border: '#E8E6E1',     // Subtle Border
  text: {
    DEFAULT: '#2C2925',  // Charcoal
    muted: '#706C66',    // Muted Text
  },
  // Functional States
  info: '#4A7B61',       // Same as primary
  success: '#5E8C73',    // Light Green
  warning: '#A69374',    // Muted Gold
  error: '#8F5849',      // Muted Rust
};

// For use in Tailwind classes where color names don't match CSS variables
export const colorMap = {
  // Maps legacy color names to new strategic colors
  heroGreen: '#4A7B61',
  deepGreen: '#3D644E',
  refinedTaupe: '#675C52',
  deepTaupe: '#4D453D',
  lightBackground: '#F8F7F2',
  subtleBorder: '#E8E6E1',
  charcoal: '#2C2925',
};

export default colors;
