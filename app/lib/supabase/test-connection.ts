import { createClient } from './client'

/**
 * Test function to verify Supabase connection and profile operations
 * This can be used in development to ensure the Supabase setup is working
 */
export async function testSupabaseConnection() {
  try {
    const supabase = createClient()
    
    // Test authentication connection
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('Auth connection error:', authError)
      return { success: false, message: 'Failed to connect to Supabase Auth', error: authError }
    }
    
    // Test database connection with public data
    const { data: courses, error: dbError } = await supabase
      .from('courses')
      .select('id, title')
      .limit(1)
    
    if (dbError) {
      console.error('Database connection error:', dbError)
      return { success: false, message: 'Failed to connect to Supabase Database', error: dbError }
    }
    
    return {
      success: true,
      message: 'Successfully connected to Supabase',
      data: {
        auth: session ? 'Authenticated' : 'Not authenticated',
        db: courses ? `Retrieved ${courses.length} courses` : 'No courses found'
      }
    }
  } catch (error) {
    console.error('Unexpected error testing Supabase connection:', error)
    return { success: false, message: 'Unexpected error testing connection', error }
  }
}

/**
 * Test function to verify profile updates are saving correctly
 * Requires an authenticated user
 */
export async function testProfileUpdate(userId: string) {
  try {
    const supabase = createClient()
    
    // Get current profile
    const { data: currentProfile, error: getError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (getError) {
      console.error('Error getting profile:', getError)
      return { success: false, message: 'Failed to get profile', error: getError }
    }
    
    // Create a test timestamp
    const testTimestamp = new Date().toISOString()
    
    // Update profile with test data
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        bio: `Test bio update at ${testTimestamp}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating profile:', updateError)
      return { success: false, message: 'Failed to update profile', error: updateError }
    }
    
    // Verify the update was saved
    const { data: verifiedProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('bio, updated_at')
      .eq('id', userId)
      .single()
    
    if (verifyError) {
      console.error('Error verifying profile update:', verifyError)
      return { success: false, message: 'Failed to verify profile update', error: verifyError }
    }
    
    const updateSuccessful = verifiedProfile.bio.includes(testTimestamp)
    
    // Restore original profile data
    if (currentProfile) {
      await supabase
        .from('profiles')
        .update({
          bio: currentProfile.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    }
    
    return {
      success: updateSuccessful,
      message: updateSuccessful 
        ? 'Profile update test successful' 
        : 'Profile update test failed - changes were not saved',
      data: {
        original: currentProfile,
        updated: updatedProfile,
        verified: verifiedProfile
      }
    }
  } catch (error) {
    console.error('Unexpected error testing profile update:', error)
    return { success: false, message: 'Unexpected error testing profile update', error }
  }
} 