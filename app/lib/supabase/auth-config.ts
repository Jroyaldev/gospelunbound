/**
 * Supabase Auth Configuration
 * 
 * This file contains configuration options for Supabase Authentication.
 * See: https://supabase.com/docs/reference/javascript/auth-signup
 */

// Site URL used for redirects (should match the URL configured in Supabase Dashboard)
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Auth redirect paths
export const PATHS = {
  // Where to redirect users after sign in
  SIGN_IN_REDIRECT: '/',
  
  // Where to redirect users after sign out
  SIGN_OUT_REDIRECT: '/auth/sign-in',
  
  // Where users will be redirected after clicking email confirmation link
  EMAIL_CONFIRM_REDIRECT: '/auth/sign-in',
  
  // Auth pages
  SIGN_IN: '/auth/sign-in',
  SIGN_UP: '/auth/sign-up',
}

// Supabase auth configuration options
export const SUPABASE_AUTH_OPTIONS = {
  // Customize email templates in Supabase Dashboard > Authentication > Email Templates
  emailRedirectTo: `${SITE_URL}/api/auth/callback`,

  // Additional options for sign-up
  signUpOptions: {
    // Whether to automatically confirm users (false will require email verification)
    // You should keep this as false for production
    emailConfirm: false,
    
    // You can add additional data during sign-up if needed
    data: {} as Record<string, any>,
  }
} 