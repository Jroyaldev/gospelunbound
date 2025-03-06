import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PATHS } from './app/lib/supabase/auth-config'

// Array of routes that should only be accessible to authenticated users
const protectedRoutes = [
  '/profile',
  '/settings',
  // Add other protected routes here
]

// Routes that are only accessible to unauthenticated users
const authRoutes = [
  PATHS.SIGN_IN,
  PATHS.SIGN_UP,
  '/auth/reset-password',
]

export async function middleware(request: NextRequest) {
  // Create a response object to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if there's a session
  const { data: { session } } = await supabase.auth.getSession()
  const pathname = request.nextUrl.pathname

  // Handle protected routes (require authentication)
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      // Redirect to sign-in if trying to access protected route without auth
      const redirectUrl = new URL(PATHS.SIGN_IN, request.url)
      redirectUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Handle auth routes (should not be accessible when authenticated)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (session) {
      // Redirect to homepage if trying to access auth routes while logged in
      return NextResponse.redirect(new URL(PATHS.SIGN_IN_REDIRECT, request.url))
    }
  }

  return response
}
