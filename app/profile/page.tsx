'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/auth-context'
import { getProfile, getUserCourseProgress } from '@/app/lib/supabase/database'
import { Profile, CourseWithProgress, UserCourseProgress } from '@/app/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import { User, BookOpen, PenSquare, Calendar, Loader2 } from 'lucide-react'
import { usePathname } from 'next/navigation'

// Fix for TypeScript linter errors
const TypedImage = Image as any;
const TypedUser = User as any;
const TypedBookOpen = BookOpen as any;
const TypedPenSquare = PenSquare as any;
const TypedCalendar = Calendar as any;
const TypedLoader2 = Loader2 as any;
const TypedLink = Link as any;

export default function ProfilePage() {
  const { user, signOut, isLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courses, setCourses] = useState<UserCourseProgress[]>([])
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [avatarError, setAvatarError] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function loadProfile() {
      if (user?.id) {
        try {
          setIsLoadingProfile(true)
          const userProfile = await getProfile(user.id)
          setProfile(userProfile)
          
          const userCourses = await getUserCourseProgress(user.id)
          setCourses(userCourses)
        } catch (error) {
          console.error('Error loading profile:', error)
        } finally {
          setIsLoadingProfile(false)
        }
      }
    }

    if (!isLoading) {
      if (!user) {
        router.push('/auth/sign-in')
      } else {
        loadProfile()
      }
    }
  }, [user, isLoading, router, pathname])

  if (isLoading || isLoadingProfile) {
    return (
      <div className="container max-w-4xl py-8 mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <TypedLoader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8 mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {profile?.avatar_url && !avatarError ? (
            <TypedImage 
              src={profile.avatar_url} 
              alt={profile.full_name || 'User avatar'} 
              width={96}
              height={96}
              className="object-cover h-full w-full"
              onError={() => {
                console.error('Failed to load avatar image:', profile.avatar_url);
                setAvatarError(true);
              }}
              priority
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted">
              <TypedUser className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {profile?.full_name || user?.email?.split('@')[0] || 'Your Profile'}
          </h1>
          <p className="text-muted-foreground">
            {user?.email}
          </p>
          {profile?.username && (
            <p className="text-sm text-muted-foreground mt-1">
              @{profile.username}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <TypedLink 
              href="/profile/edit" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <TypedPenSquare className="h-4 w-4 mr-2" />
              Edit Profile
            </TypedLink>
            <button 
              onClick={() => signOut()}
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {profile?.bio && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <p className="text-foreground/80">{profile.bio}</p>
        </div>
      )}

      {/* Membership Information */}
      <div className="border rounded-lg p-4 mb-8">
        <h2 className="text-xl font-semibold mb-3">Membership</h2>
        <div className="flex items-center text-sm text-muted-foreground">
          <TypedCalendar className="h-4 w-4 mr-2" />
          Member since {new Date(profile?.created_at || user?.created_at || Date.now()).toLocaleDateString()}
        </div>
      </div>

      {/* Course Progress */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
        
        {courses.length === 0 ? (
          <div className="border rounded-lg p-6 text-center">
            <TypedBookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">You haven't started any courses yet.</p>
            <TypedLink 
              href="/courses" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Browse Courses
            </TypedLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => {
              // Skip courses without course data
              if (!course.courses) return null;
              
              return (
                <div key={course.id} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">
                    <TypedLink 
                      href={`/courses/${course.courses.title?.toLowerCase().replace(/\s+/g, '-')}`} 
                      className="hover:text-primary"
                    >
                      {course.courses.title}
                    </TypedLink>
                  </h3>
                  <div className="h-2 w-full bg-muted rounded-full mb-2">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${course.completion_percentage || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{Math.round(course.completion_percentage || 0)}% complete</span>
                    {course.last_accessed_at && (
                      <span>Last studied: {new Date(course.last_accessed_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
