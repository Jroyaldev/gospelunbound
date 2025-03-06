'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/auth-context'
import { getProfile, updateProfile } from '@/app/lib/supabase/database'
import { testSupabaseConnection, testProfileUpdate } from '@/app/lib/supabase/test-connection'
import { createClient } from '@/app/lib/supabase/client'
import { Profile, UpdateProfileRequest } from '@/app/lib/types'
import Link from 'next/link'
import { ArrowLeft, Save, X, User, Upload, Check, AlertCircle, Loader2, Database, BadgeAlert } from 'lucide-react'

// Fix for TypeScript linter errors
// Convert components to any type as a workaround
const TypedLink = Link as any;
const TypedArrowLeft = ArrowLeft as any;
const TypedSave = Save as any;
const TypedX = X as any;
const TypedUser = User as any;
const TypedCheck = Check as any;
const TypedAlertCircle = AlertCircle as any;
const TypedLoader2 = Loader2 as any;
const TypedDatabase = Database as any;
const TypedBadgeAlert = BadgeAlert as any;
const TypedUpload = Upload as any;

// Only enable in development mode
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export default function EditProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    username: '',
    full_name: '',
    bio: '',
    avatar_url: '',
  })
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const router = useRouter()
  
  // Debug state for testing Supabase connection
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  const testConnection = async () => {
    if (!IS_DEVELOPMENT) return;
    
    setIsTesting(true);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: 'Error testing connection', error });
    } finally {
      setIsTesting(false);
    }
  };
  
  const testUpdate = async () => {
    if (!IS_DEVELOPMENT || !user?.id) return;
    
    setIsTesting(true);
    try {
      const result = await testProfileUpdate(user.id);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: 'Error testing profile update', error });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      if (user?.id) {
        try {
          setIsLoadingProfile(true)
          const userProfile = await getProfile(user.id)
          setProfile(userProfile)
          setFormData({
            username: userProfile?.username || '',
            full_name: userProfile?.full_name || '',
            bio: userProfile?.bio || '',
            avatar_url: userProfile?.avatar_url || '',
          })
          
          if (userProfile?.avatar_url) {
            setAvatarPreview(userProfile.avatar_url);
          }
        } catch (error) {
          console.error('Error loading profile:', error)
          setError('Failed to load profile data')
        } finally {
          setIsLoadingProfile(false)
        }
      }
    }

    if (!authLoading) {
      if (!user) {
        router.push('/auth/sign-in')
      } else {
        loadProfile()
      }
    }
  }, [user, authLoading, router])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Username is optional, but if provided, validate it
    if (formData.username) {
      if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters'
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
        errors.username = 'Username can only contain letters, numbers, underscores and hyphens'
      }
    }
    
    // Display name validation
    if (!formData.full_name || formData.full_name.trim() === '') {
      errors.full_name = 'Display name is required'
    }
    
    // Bio validation
    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less'
    }
    
    // Avatar validation only needed if using URL
    if (formData.avatar_url && !avatarFile && !isValidUrl(formData.avatar_url)) {
      errors.avatar_url = 'Please enter a valid URL'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    console.log(`Form field updated: ${name} = ${value}`);
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      console.log('Updated form data:', updated);
      return updated;
    })
    setIsDirty(true)
    
    // Clear field-specific error when user corrects
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      })
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setFieldErrors(prev => ({
          ...prev,
          avatar: 'File size must be less than 2MB'
        }));
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFieldErrors(prev => ({
          ...prev,
          avatar: 'File must be an image'
        }));
        return;
      }
      
      setAvatarFile(file);
      setIsDirty(true);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear any existing URL
      setFormData(prev => ({
        ...prev,
        avatar_url: ''
      }));
      
      // Clear field errors
      if (fieldErrors.avatar) {
        setFieldErrors(prev => ({
          ...prev,
          avatar: ''
        }));
      }
    }
  };

  const uploadAvatarToSupabase = async (): Promise<string | null> => {
    if (!avatarFile || !user?.id) return null;
    
    try {
      const supabase = createClient();
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      console.log(`Uploading avatar to Supabase: ${fileName}`);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Error uploading avatar:', error);
        throw new Error('Failed to upload avatar');
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      console.log(`Avatar uploaded successfully. Public URL: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error('Error in avatar upload:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      if (user?.id) {
        // Use the entire form data without filtering out empty values
        // This ensures all fields are properly updated
        let dataToUpdate: UpdateProfileRequest = {
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url
        };
        
        // If we have a file to upload, do it first
        if (avatarFile) {
          const avatarUrl = await uploadAvatarToSupabase();
          if (avatarUrl) {
            dataToUpdate.avatar_url = avatarUrl;
          } else {
            throw new Error('Failed to upload profile image');
          }
        }
        
        console.log('Submitting profile update with data:', dataToUpdate);
        const updatedProfile = await updateProfile(user.id, dataToUpdate);
        
        if (updatedProfile) {
          setProfile(updatedProfile);
          setSuccess(true);
          setIsDirty(false);
          // Show success for 2 seconds then redirect
          setTimeout(() => router.push('/profile'), 2000);
        } else {
          // Handle specific errors
          if (dataToUpdate.username) {
            // If username is the issue, mark it as taken
            setFieldErrors(prev => ({
              ...prev,
              username: 'This username is already taken or invalid'
            }));
            throw new Error('Username issue');
          } else {
            console.error('Profile update returned null. Check if full_name is being sent correctly:', dataToUpdate);
            setFieldErrors(prev => ({
              ...prev,
              full_name: 'Display name is required'
            }));
            throw new Error('Failed to update profile');
          }
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Only set generic error if no specific field errors were set
      if (Object.values(fieldErrors).every(err => !err)) {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingProfile) {
    return (
      <div className="container max-w-2xl py-12 mx-auto">
        <div className="flex flex-col items-center justify-center">
          <TypedLoader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <TypedLink 
          href="/profile"
          className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
        >
          <TypedArrowLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </TypedLink>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center">
          <TypedCheck className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>Profile updated successfully! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <TypedAlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="border rounded-lg p-6 flex flex-col items-center">
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted mb-4">
            {avatarPreview ? (
              <div className="h-full w-full">
                <img 
                  src={avatarPreview} 
                  alt="Profile avatar preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    setAvatarPreview('');
                    setFieldErrors({
                      ...fieldErrors,
                      avatar: 'Image failed to load, please try another'
                    });
                  }}
                />
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <TypedUser className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="w-full space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Profile Picture
            </label>
            
            {/* File Upload Button */}
            <div className="flex justify-center">
              <label className="relative cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md inline-flex items-center">
                <TypedUpload className="h-4 w-4 mr-2" />
                <span>Upload Image</span>
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            {fieldErrors.avatar && (
              <p className="mt-1 text-sm text-red-600 text-center">{fieldErrors.avatar}</p>
            )}
            
            <div className="flex items-center justify-center">
              <span className="text-xs text-muted-foreground text-center">
                Or use an image URL:
              </span>
            </div>
            
            <input
              type="url"
              id="avatar_url"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleChange}
              className={`block w-full rounded-md border ${fieldErrors.avatar_url ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'} bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-1`}
              placeholder="https://example.com/your-avatar.jpg"
              disabled={!!avatarFile}
            />
            {fieldErrors.avatar_url && !avatarFile && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.avatar_url}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground text-center">
              Upload a square image for best results. Max size: 2MB.
            </p>
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-6">
          {/* Full Name / Display Name - Most important field */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-1.5">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`block w-full rounded-md border ${fieldErrors.full_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'} bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-1`}
              placeholder="Your name as displayed to others"
              required
            />
            {fieldErrors.full_name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.full_name}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              This is how your name will appear to other users
            </p>
          </div>

          {/* Username - Less prominent, optional */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1.5">
              Username <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`block w-full rounded-md border ${fieldErrors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'} bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-1`}
              placeholder="Your unique username (optional)"
            />
            {fieldErrors.username && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              A unique identifier for your account. Letters, numbers, underscores and hyphens only.
            </p>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-1.5">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className={`block w-full rounded-md border ${fieldErrors.bio ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-primary'} bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-1`}
              placeholder="Tell us about yourself..."
            ></textarea>
            {fieldErrors.bio && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.bio}</p>
            )}
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-muted-foreground">
                Share a brief description about yourself
              </span>
              <span className={`${formData.bio && formData.bio.length > 450 ? (formData.bio.length > 500 ? 'text-red-600' : 'text-amber-600') : 'text-muted-foreground'}`}>
                {formData.bio ? formData.bio.length : 0}/500
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <TypedLink
            href="/profile"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <TypedX className="h-4 w-4 mr-2" />
            Cancel
          </TypedLink>
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <TypedLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <TypedSave className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Debug Panel - visible only in development */}
      {IS_DEVELOPMENT && (
        <div className="mt-10 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="text-sm text-muted-foreground flex items-center"
            >
              <TypedBadgeAlert className="h-4 w-4 mr-1" />
              {showDebugPanel ? 'Hide' : 'Show'} Debug Panel (Dev Only)
            </button>
          </div>
          
          {showDebugPanel && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="text-sm font-medium mb-3">Supabase Connection Testing</h3>
              
              <div className="flex space-x-3 mb-4">
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={isTesting}
                  className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
                >
                  <TypedDatabase className="h-4 w-4 mr-1" />
                  Test Connection
                </button>
                
                <button
                  type="button"
                  onClick={testUpdate}
                  disabled={isTesting || !user?.id}
                  className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
                >
                  <TypedUser className="h-4 w-4 mr-1" />
                  Test Profile Update
                </button>
              </div>
              
              {isTesting && (
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <TypedLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running test...
                </div>
              )}
              
              {testResult && (
                <div className={`p-3 rounded-md text-sm ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <div className="font-medium mb-1">{testResult.message}</div>
                  {testResult.data && (
                    <pre className="text-xs mt-1 max-h-40 overflow-auto">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 