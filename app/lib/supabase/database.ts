'use server'

import { createClient } from './server'
import { 
  Course, 
  UserCourseProgress, 
  UserLessonProgress, 
  Comment, 
  Profile,
  UpdateProfileRequest,
  CreateCommentRequest,
  UpdateLessonProgressRequest,
  CourseWithProgress,
  LessonWithProgress
} from '../types'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  return data as Profile
}

export async function updateProfile(userId: string, profile: UpdateProfileRequest): Promise<Profile | null> {
  const supabase = createClient()
  
  console.log(`Updating profile for user ${userId}`, profile);
  
  // Make sure we have required fields
  if (!profile.full_name || profile.full_name.trim() === '') {
    console.error('Full name is required for profile update')
    return null
  }
  
  // Basic server-side validation
  if (profile.username && (profile.username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(profile.username))) {
    console.error('Invalid username format')
    return null
  }
  
  if (profile.bio && profile.bio.length > 500) {
    console.error('Bio exceeds maximum length')
    return null
  }
  
  if (profile.avatar_url) {
    try {
      new URL(profile.avatar_url)
    } catch (e) {
      console.error('Invalid avatar URL format')
      return null
    }
  }
  
  // Check for username uniqueness if username is being updated
  if (profile.username) {
    const { data: existingUser, error: lookupError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', profile.username)
      .neq('id', userId)
      .single();
      
    if (lookupError && lookupError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
      console.error('Error checking username uniqueness:', lookupError)
      return null
    }
    
    if (existingUser) {
      console.error('Username already taken')
      return null
    }
  }
  
  // Add updated_at timestamp
  const updatedProfile = {
    ...profile,
    updated_at: new Date().toISOString()
  }
  
  console.log('Sending update to Supabase:', updatedProfile);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updatedProfile)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating profile:', error)
      return null
    }
    
    console.log('Profile updated successfully:', data);
    revalidatePath('/profile')
    return data as Profile
  } catch (err) {
    console.error('Exception during profile update:', err)
    return null
  }
}

// Course functions
export async function getPublishedCourses(): Promise<Course[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }
  
  return data as Course[]
}

export async function getCourseWithProgress(courseId: string, userId: string | null): Promise<CourseWithProgress | null> {
  const supabase = createClient()
  
  // Get the course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*, profiles!courses_author_id_fkey(*)')
    .eq('id', courseId)
    .eq('is_published', true)
    .single()
  
  if (courseError) {
    console.error('Error fetching course:', courseError)
    return null
  }
  
  // Count lessons
  const { count: lessonCount } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)
    .eq('is_published', true)
  
  let progress = null
  
  // Get progress if user is logged in
  if (userId) {
    const { data: progressData, error: progressError } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single()
    
    if (!progressError) {
      progress = progressData as UserCourseProgress
    }
  }
  
  return {
    ...course,
    author: course.profiles,
    lesson_count: lessonCount || 0,
    progress
  } as CourseWithProgress
}

// Lesson functions
export async function getLessonsForCourse(courseId: string, userId: string | null): Promise<LessonWithProgress[]> {
  const supabase = createClient()
  
  const { data: lessons, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .eq('is_published', true)
    .order('order_index', { ascending: true })
  
  if (lessonError) {
    console.error('Error fetching lessons:', lessonError)
    return []
  }
  
  // Get progress for all lessons if user is logged in
  if (userId) {
    const { data: progressData, error: progressError } = await supabase
      .from('user_lesson_progress')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
    
    if (!progressError && progressData) {
      // Map progress to lessons
      return lessons.map(lesson => {
        const progress = progressData.find(p => p.lesson_id === lesson.id)
        return {
          ...lesson,
          progress: progress || null
        }
      }) as LessonWithProgress[]
    }
  }
  
  return lessons.map(lesson => ({
    ...lesson,
    progress: null
  })) as LessonWithProgress[]
}

export async function updateLessonProgress(userId: string, data: UpdateLessonProgressRequest): Promise<UserLessonProgress | null> {
  const supabase = createClient()
  
  // Check if progress exists
  const { data: existingProgress, error: checkError } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', data.lesson_id)
    .maybeSingle()
  
  let result
  
  if (!existingProgress) {
    // Insert new progress
    const { data: insertedData, error: insertError } = await supabase
      .from('user_lesson_progress')
      .insert({
        user_id: userId,
        lesson_id: data.lesson_id,
        course_id: data.course_id,
        is_completed: data.is_completed,
        completed_at: data.is_completed ? new Date().toISOString() : null
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error inserting lesson progress:', insertError)
      return null
    }
    
    result = insertedData
  } else {
    // Update existing progress
    const { data: updatedData, error: updateError } = await supabase
      .from('user_lesson_progress')
      .update({
        is_completed: data.is_completed,
        last_accessed_at: new Date().toISOString(),
        completed_at: data.is_completed ? new Date().toISOString() : existingProgress.completed_at
      })
      .eq('id', existingProgress.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating lesson progress:', updateError)
      return null
    }
    
    result = updatedData
  }
  
  // This will trigger the course progress update via DB trigger
  revalidatePath(`/courses/${data.course_id}`)
  return result as UserLessonProgress
}

// Comment functions
export async function getCommentsForCourse(courseId: string): Promise<Comment[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select('*, profiles(*)')
    .eq('course_id', courseId)
    .is('parent_id', null) // Top-level comments only
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }
  
  // Get replies for top-level comments
  const commentsWithReplies = []
  
  for (const comment of data) {
    const { data: replies, error: repliesError } = await supabase
      .from('comments')
      .select('*, profiles(*)')
      .eq('parent_id', comment.id)
      .order('created_at', { ascending: true })
    
    if (!repliesError) {
      commentsWithReplies.push({
        ...comment,
        user: comment.profiles,
        replies: replies.map(reply => ({
          ...reply,
          user: reply.profiles
        }))
      })
    } else {
      commentsWithReplies.push({
        ...comment,
        user: comment.profiles,
        replies: []
      })
    }
  }
  
  return commentsWithReplies as Comment[]
}

export async function createComment(userId: string, data: CreateCommentRequest): Promise<Comment | null> {
  const supabase = createClient()
  
  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      user_id: userId,
      content: data.content,
      course_id: data.course_id || null,
      lesson_id: data.lesson_id || null,
      parent_id: data.parent_id || null
    })
    .select('*, profiles(*)')
    .single()
  
  if (error) {
    console.error('Error creating comment:', error)
    return null
  }
  
  // Update engagement metrics
  await supabase.rpc('update_user_engagement', {
    p_user_id: userId,
    p_comments_created: 1
  })
  
  // Revalidate the page to show the new comment
  if (data.course_id) {
    revalidatePath(`/courses/${data.course_id}`)
  } else if (data.lesson_id) {
    revalidatePath(`/lessons/${data.lesson_id}`)
  }
  
  return {
    ...comment,
    user: comment.profiles,
    replies: []
  } as Comment
}

export async function getUserCourseProgress(userId: string): Promise<UserCourseProgress[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('user_course_progress')
    .select('*, courses(*)')
    .eq('user_id', userId)
    .order('last_accessed_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user course progress:', error)
    return []
  }
  
  return data as UserCourseProgress[]
}

// Like functions
export async function toggleLike(userId: string, commentId: string): Promise<boolean> {
  const supabase = createClient()
  
  // Check if the user has already liked the comment
  const { data: existingLike, error: checkError } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', userId)
    .eq('comment_id', commentId)
    .maybeSingle()
  
  if (checkError) {
    console.error('Error checking like:', checkError)
    return false
  }
  
  if (existingLike) {
    // Unlike
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id)
    
    if (deleteError) {
      console.error('Error deleting like:', deleteError)
      return false
    }
    
    // Update engagement metrics (negative)
    await supabase.rpc('update_user_engagement', {
      p_user_id: userId,
      p_likes_given: -1
    })
    
    return true
  } else {
    // Like
    const { error: insertError } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        comment_id: commentId
      })
    
    if (insertError) {
      console.error('Error inserting like:', insertError)
      return false
    }
    
    // Update engagement metrics
    await supabase.rpc('update_user_engagement', {
      p_user_id: userId,
      p_likes_given: 1
    })
    
    return true
  }
}

// View tracking
export async function trackCourseView(userId: string, courseId: string): Promise<void> {
  const supabase = createClient()
  
  // Update user engagement metric
  await supabase.rpc('update_user_engagement', {
    p_user_id: userId,
    p_course_views: 1
  })
}

export async function trackLessonView(userId: string, lessonId: string, courseId: string): Promise<void> {
  const supabase = createClient()
  
  // Update user engagement metric
  await supabase.rpc('update_user_engagement', {
    p_user_id: userId,
    p_lesson_views: 1
  })
  
  // Update or create lesson progress
  const { data: existingProgress, error: checkError } = await supabase
    .from('user_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()
  
  if (!existingProgress) {
    await supabase
      .from('user_lesson_progress')
      .insert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId
      })
  } else {
    await supabase
      .from('user_lesson_progress')
      .update({
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', existingProgress.id)
  }
}
