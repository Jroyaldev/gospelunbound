/**
 * Supabase Auth Error Handling
 * 
 * This file provides error handling utilities for Supabase authentication.
 */

// Types of auth errors that could occur
export enum AuthErrorType {
  InvalidCredentials = 'invalid_credentials',
  UserNotFound = 'user_not_found',
  EmailNotConfirmed = 'email_not_confirmed',
  PasswordResetRequired = 'password_reset_required',
  RateLimitExceeded = 'rate_limit_exceeded',
  ServerError = 'server_error',
  Unknown = 'unknown_error',
}

// Error message mapping for user-friendly messages
export const AUTH_ERROR_MESSAGES: Record<AuthErrorType, string> = {
  [AuthErrorType.InvalidCredentials]: 'Invalid email or password. Please try again.',
  [AuthErrorType.UserNotFound]: 'No account found with this email address.',
  [AuthErrorType.EmailNotConfirmed]: 'Please confirm your email address before signing in.',
  [AuthErrorType.PasswordResetRequired]: 'Your password needs to be reset. Check your email or use the forgot password option.',
  [AuthErrorType.RateLimitExceeded]: 'Too many attempts. Please try again later.',
  [AuthErrorType.ServerError]: 'Service unavailable. Please try again later.',
  [AuthErrorType.Unknown]: 'An unexpected error occurred. Please try again.',
};

/**
 * Get a user-friendly error message from a Supabase auth error
 */
export function getAuthErrorMessage(error: any): string {
  // Check if it's a Supabase error with a message
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    // Map error message to error type
    if (message.includes('invalid login credentials')) {
      return AUTH_ERROR_MESSAGES[AuthErrorType.InvalidCredentials];
    }
    
    if (message.includes('user not found')) {
      return AUTH_ERROR_MESSAGES[AuthErrorType.UserNotFound];
    }
    
    if (message.includes('email not confirmed')) {
      return AUTH_ERROR_MESSAGES[AuthErrorType.EmailNotConfirmed];
    }
    
    if (message.includes('too many requests')) {
      return AUTH_ERROR_MESSAGES[AuthErrorType.RateLimitExceeded];
    }
    
    if (message.includes('server error') || message.includes('service unavailable')) {
      return AUTH_ERROR_MESSAGES[AuthErrorType.ServerError];
    }
  }
  
  // Default to unknown error
  return AUTH_ERROR_MESSAGES[AuthErrorType.Unknown];
} 