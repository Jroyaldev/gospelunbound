'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/auth-context'
import { getUserCourseProgress } from '@/app/lib/supabase/database'
import { UserCourseProgress, CourseWithProgress } from '@/app/lib/types'
import Link from 'next/link'
import { CheckCircle, Clock, BookOpen } from 'lucide-react'

export default function UserProgress() {
  const { user, isLoading } = useAuth()
  const [progress, setProgress] = useState<CourseWithProgress[]>([])
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)

  useEffect(() => {
    async function loadProgress() {
      if (user?.id) {
        try {
          setIsLoadingProgress(true)
          const userProgress = await getUserCourseProgress(user.id)
          
          // Transform UserCourseProgress[] to CourseWithProgress[]
          const transformedProgress: CourseWithProgress[] = userProgress.map(item => {
            if (!item.courses) return {} as CourseWithProgress;
            
            return {
              ...item.courses,
              progress: {
                id: item.id,
                user_id: item.user_id,
                course_id: item.course_id,
                started_at: item.started_at,
                last_accessed_at: item.last_accessed_at,
                completed_at: item.completed_at,
                completion_percentage: item.completion_percentage
              }
            };
          }).filter(item => item.id) as CourseWithProgress[];
          
          setProgress(transformedProgress)
        } catch (error) {
          console.error('Error loading progress:', error)
        } finally {
          setIsLoadingProgress(false)
        }
      }
    }

    if (!isLoading && user) {
      loadProgress()
    }
  }, [user, isLoading])

  if (isLoading || isLoadingProgress) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-medium mb-4">Your Progress</h3>
        <div className="flex items-center justify-center h-40">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-muted h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-muted rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-muted rounded col-span-2"></div>
                  <div className="h-2 bg-muted rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-medium mb-4">Your Progress</h3>
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-4">Sign in to track your course progress</p>
          <Link 
            href="/auth/sign-in"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (progress.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-card">
        <h3 className="text-lg font-medium mb-4">Your Progress</h3>
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-4">You haven't started any courses yet</p>
          <Link 
            href="/courses"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-medium mb-4">Your Progress</h3>
      <div className="space-y-4">
        {progress.map((course) => (
          <div key={course.id} className="border rounded-md p-3">
            <div className="flex justify-between items-start mb-2">
              <Link href={`/courses/${course.title?.toLowerCase().replace(/\s+/g, '-')}`} className="text-foreground hover:text-primary font-medium">
                {course.title}
              </Link>
              <div className="flex items-center text-sm">
                {course.progress?.completed_at ? (
                  <span className="flex items-center text-green-600 dark:text-green-500">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completed
                  </span>
                ) : (
                  <span className="flex items-center text-amber-600 dark:text-amber-500">
                    <Clock className="h-4 w-4 mr-1" />
                    In progress
                  </span>
                )}
              </div>
            </div>
            <div className="mb-2">
              <div className="h-2 w-full bg-muted rounded-full">
                <div 
                  className="h-2 bg-primary rounded-full" 
                  style={{ width: `${course.progress?.completion_percentage || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                <span>{Math.round(course.progress?.completion_percentage || 0)}% complete</span>
                <span className="flex items-center">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Last studied {new Date(course.progress?.last_accessed_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Link 
              href={`/courses/${course.title?.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs text-primary hover:underline"
            >
              Continue learning
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-4 text-right">
        <Link 
          href="/courses"
          className="text-sm text-primary hover:underline"
        >
          View all courses
        </Link>
      </div>
    </div>
  )
} 