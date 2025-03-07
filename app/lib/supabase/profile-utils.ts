import { createClient } from './client';
import { Profile } from '../types';

// Client-side function to fetch user profile
export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  if (!userId) return null;
  
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data as Profile;
  } catch (error) {
    console.error('Exception fetching profile:', error);
    return null;
  }
} 