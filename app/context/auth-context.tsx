'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { PATHS, SUPABASE_AUTH_OPTIONS } from '../lib/supabase/auth-config'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean, message?: string }>
  signUp: (email: string, password: string) => Promise<{ success: boolean, message?: string }>
}

// Create the context with a default non-undefined value to avoid the type issue
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false })
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Ensure a user profile exists for the authenticated user
  const ensureUserProfile = async (user: User) => {
    try {
      const supabase = createClient();
      
      // Check if a profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking profile existence:', checkError);
        return;
      }
      
      // If no profile exists, create one
      if (!existingProfile) {
        console.log('Creating new profile for user:', user.id);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email,
            full_name: user.email?.split('@')[0] || 'New User',
            avatar_url: null,
            bio: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Error creating user profile:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  };

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        setSession(session)
        ensureUserProfile(session.user);
      }
      setIsLoading(false)
    })
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setSession(session)
        ensureUserProfile(session.user);
      } else {
        setUser(null)
        setSession(null)
      }
      setIsLoading(false)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign out function
  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(PATHS.SIGN_IN)
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { success: false, message: error.message }
      }
      
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message || 'Unknown error occurred' }
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: SUPABASE_AUTH_OPTIONS
      })
      
      if (error) {
        return { success: false, message: error.message }
      }
      
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message || 'Unknown error occurred' }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signOut,
    signIn,
    signUp
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
