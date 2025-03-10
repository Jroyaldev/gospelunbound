"use server";

import { createClient } from "./server";
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
  LessonWithProgress,
  Post,
  CreatePostRequest,
  Group,
  CreateGroupRequest,
  PostComment,
  CreatePostCommentRequest,
} from "../types";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data as Profile;
}

export async function updateProfile(
  userId: string,
  profile: UpdateProfileRequest,
): Promise<Profile | null> {
  const supabase = await createClient();

  console.log(`Updating profile for user ${userId}`, profile);

  // Make sure we have required fields
  if (!profile.full_name || profile.full_name.trim() === "") {
    console.error("Full name is required for profile update");
    return null;
  }

  // Basic server-side validation
  if (
    profile.username &&
    (profile.username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(profile.username))
  ) {
    console.error("Invalid username format");
    return null;
  }

  if (profile.bio && profile.bio.length > 500) {
    console.error("Bio exceeds maximum length");
    return null;
  }

  if (profile.avatar_url) {
    try {
      new URL(profile.avatar_url);
    } catch (e) {
      console.error("Invalid avatar URL format");
      return null;
    }
  }

  // Check for username uniqueness if username is being updated
  if (profile.username) {
    const { data: existingUser, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", profile.username)
      .neq("id", userId)
      .single();

    if (lookupError && lookupError.code !== "PGRST116") {
      // PGRST116 is the error code for no rows returned
      console.error("Error checking username uniqueness:", lookupError);
      return null;
    }

    if (existingUser) {
      console.error("Username already taken");
      return null;
    }
  }

  // Add updated_at timestamp
  const updatedProfile = {
    ...profile,
    updated_at: new Date().toISOString(),
  };

  console.log("Sending update to Supabase:", updatedProfile);

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updatedProfile)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }

    console.log("Profile updated successfully:", data);
    revalidatePath("/profile");
    return data as Profile;
  } catch (err) {
    console.error("Exception during profile update:", err);
    return null;
  }
}

// Course functions
export async function getPublishedCourses(): Promise<Course[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }

  return data as Course[];
}

export async function getCourseWithProgress(
  courseId: string,
  userId: string | null,
): Promise<CourseWithProgress | null> {
  const supabase = await createClient();

  // Get the course
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("*, profiles!courses_author_id_fkey(*)")
    .eq("id", courseId)
    .eq("is_published", true)
    .single();

  if (courseError) {
    console.error("Error fetching course:", courseError);
    return null;
  }

  // Count lessons
  const { count: lessonCount } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId)
    .eq("is_published", true);

  let progress = null;

  // Get progress if user is logged in
  if (userId) {
    const { data: progressData, error: progressError } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("course_id", courseId)
      .eq("user_id", userId)
      .single();

    if (!progressError) {
      progress = progressData as UserCourseProgress;
    }
  }

  return {
    ...course,
    author: course.profiles,
    lesson_count: lessonCount || 0,
    progress,
  } as CourseWithProgress;
}

// Lesson functions
export async function getLessonsForCourse(
  courseId: string,
  userId: string | null,
): Promise<LessonWithProgress[]> {
  const supabase = await createClient();

  const { data: lessons, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .order("order_index", { ascending: true });

  if (lessonError) {
    console.error("Error fetching lessons:", lessonError);
    return [];
  }

  // Get progress for all lessons if user is logged in
  if (userId) {
    const { data: progressData, error: progressError } = await supabase
      .from("user_lesson_progress")
      .select("*")
      .eq("course_id", courseId)
      .eq("user_id", userId);

    if (!progressError && progressData) {
      // Map progress to lessons
      return lessons.map((lesson) => {
        const progress = progressData.find((p) => p.lesson_id === lesson.id);
        return {
          ...lesson,
          progress: progress || null,
        };
      }) as LessonWithProgress[];
    }
  }

  return lessons.map((lesson) => ({
    ...lesson,
    progress: null,
  })) as LessonWithProgress[];
}

export async function updateLessonProgress(
  userId: string,
  data: UpdateLessonProgressRequest,
): Promise<UserLessonProgress | null> {
  const supabase = await createClient();

  // Check if progress exists
  const { data: existingProgress, error: checkError } = await supabase
    .from("user_lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", data.lesson_id)
    .maybeSingle();

  let result;

  if (!existingProgress) {
    // Insert new progress
    const { data: insertedData, error: insertError } = await supabase
      .from("user_lesson_progress")
      .insert({
        user_id: userId,
        lesson_id: data.lesson_id,
        course_id: data.course_id,
        is_completed: data.is_completed,
        completed_at: data.is_completed ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting lesson progress:", insertError);
      return null;
    }

    result = insertedData;
  } else {
    // Update existing progress
    const { data: updatedData, error: updateError } = await supabase
      .from("user_lesson_progress")
      .update({
        is_completed: data.is_completed,
        last_accessed_at: new Date().toISOString(),
        completed_at: data.is_completed
          ? new Date().toISOString()
          : existingProgress.completed_at,
      })
      .eq("id", existingProgress.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating lesson progress:", updateError);
      return null;
    }

    result = updatedData;
  }

  // This will trigger the course progress update via DB trigger
  revalidatePath(`/courses/${data.course_id}`);
  return result as UserLessonProgress;
}

// Comment functions
export async function getCommentsForCourse(
  courseId: string,
): Promise<Comment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(*)")
    .eq("course_id", courseId)
    .is("parent_id", null) // Top-level comments only
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  // Get replies for top-level comments
  const commentsWithReplies = [];

  for (const comment of data) {
    const { data: replies, error: repliesError } = await supabase
      .from("comments")
      .select("*, profiles(*)")
      .eq("parent_id", comment.id)
      .order("created_at", { ascending: true });

    if (!repliesError) {
      commentsWithReplies.push({
        ...comment,
        user: comment.profiles,
        replies: replies.map((reply) => ({
          ...reply,
          user: reply.profiles,
        })),
      });
    } else {
      commentsWithReplies.push({
        ...comment,
        user: comment.profiles,
        replies: [],
      });
    }
  }

  return commentsWithReplies as Comment[];
}

export async function createComment(
  userId: string,
  data: CreateCommentRequest,
): Promise<Comment | null> {
  const supabase = await createClient();

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      user_id: userId,
      content: data.content,
      course_id: data.course_id || null,
      lesson_id: data.lesson_id || null,
      parent_id: data.parent_id || null,
    })
    .select("*, profiles(*)")
    .single();

  if (error) {
    console.error("Error creating comment:", error);
    return null;
  }

  // Update engagement metrics
  await supabase.rpc("update_user_engagement", {
    p_user_id: userId,
    p_comments_created: 1,
  });

  // Revalidate the page to show the new comment
  if (data.course_id) {
    revalidatePath(`/courses/${data.course_id}`);
  } else if (data.lesson_id) {
    revalidatePath(`/lessons/${data.lesson_id}`);
  }

  return {
    ...comment,
    user: comment.profiles,
    replies: [],
  } as Comment;
}

export async function getUserCourseProgress(
  userId: string,
): Promise<UserCourseProgress[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_course_progress")
    .select("*, courses(*)")
    .eq("user_id", userId)
    .order("last_accessed_at", { ascending: false });

  if (error) {
    console.error("Error fetching user course progress:", error);
    return [];
  }

  return data as UserCourseProgress[];
}

// Like functions
export async function toggleLike(
  userId: string,
  commentId: string,
): Promise<boolean> {
  const supabase = await createClient();

  // Check if the user has already liked the comment
  const { data: existingLike, error: checkError } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", userId)
    .eq("comment_id", commentId)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking like:", checkError);
    return false;
  }

  if (existingLike) {
    // Unlike
    const { error: deleteError } = await supabase
      .from("likes")
      .delete()
      .eq("id", existingLike.id);

    if (deleteError) {
      console.error("Error deleting like:", deleteError);
      return false;
    }

    // Update engagement metrics (negative)
    await supabase.rpc("update_user_engagement", {
      p_user_id: userId,
      p_likes_given: -1,
    });

    return true;
  } else {
    // Like
    const { error: insertError } = await supabase.from("likes").insert({
      user_id: userId,
      comment_id: commentId,
    });

    if (insertError) {
      console.error("Error inserting like:", insertError);
      return false;
    }

    // Update engagement metrics
    await supabase.rpc("update_user_engagement", {
      p_user_id: userId,
      p_likes_given: 1,
    });

    return true;
  }
}

// View tracking
export async function trackCourseView(
  userId: string,
  courseId: string,
): Promise<void> {
  const supabase = await createClient();

  // Update user engagement metric
  await supabase.rpc("update_user_engagement", {
    p_user_id: userId,
    p_course_views: 1,
  });
}

export async function trackLessonView(
  userId: string,
  lessonId: string,
  courseId: string,
): Promise<void> {
  const supabase = await createClient();

  // Update user engagement metric
  await supabase.rpc("update_user_engagement", {
    p_user_id: userId,
    p_lesson_views: 1,
  });

  // Update or create lesson progress
  const { data: existingProgress, error: checkError } = await supabase
    .from("user_lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (!existingProgress) {
    await supabase.from("user_lesson_progress").insert({
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
    });
  } else {
    await supabase
      .from("user_lesson_progress")
      .update({
        last_accessed_at: new Date().toISOString(),
      })
      .eq("id", existingProgress.id);
  }
}

// Community functions

// Posts
/**
 * Fetches posts with optimized query strategy to reduce database calls
 * Returns array of posts with author details, like counts, and comment counts
 */
export async function getPosts(
  limit: number = 10,
  offset: number = 0,
  category?: string,
  userId?: string,
): Promise<Post[]> {
  const supabase = await createClient();

  try {
    // Main query with all post data, author profiles, and counts
    let query = supabase
      .from("posts")
      .select(
        `
        *,
        profiles:user_id (id, username, full_name, avatar_url),
        post_likes(count),
        comments:post_comments(count)
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      // Optimized fallback approach - get posts and counts in batch operations
      console.error("Error with count functions, using optimized fallback:", error);
      
      // 1. Get base posts data
      let fallbackQuery = supabase
        .from("posts")
        .select(
          `
          *,
          profiles:user_id (id, username, full_name, avatar_url)
        `,
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (category) {
        fallbackQuery = fallbackQuery.eq("category", category);
      }

      const fallbackResult = await fallbackQuery;
      
      if (fallbackResult.error) {
        console.error("Error in fallback query:", fallbackResult.error);
        return [];
      }
      
      if (!fallbackResult.data.length) {
        return [];
      }
      
      // 2. Extract all post IDs for batch operations
      const postIds = fallbackResult.data.map(post => post.id);
      
      // 3. Get all likes counts in one query
      const { data: allLikes, error: likesError } = await supabase
        .from("post_likes")
        .select("post_id, id")
        .in("post_id", postIds);
        
      // 4. Get all comments counts in one query  
      const { data: allComments, error: commentsError } = await supabase
        .from("post_comments")
        .select("post_id, id")
        .in("post_id", postIds);
        
      // 5. If user is logged in, get all their likes in one query
      let userLikes: Record<string, boolean> = {};
      if (userId) {
        const { data: userLikesData, error: userLikesError } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", userId)
          .in("post_id", postIds);
          
        if (!userLikesError && userLikesData) {
          userLikes = userLikesData.reduce((acc, like) => {
            acc[like.post_id] = true;
            return acc;
          }, {} as Record<string, boolean>);
        }
      }
      
      // 6. Count likes and comments by post_id
      const likesByPostId: Record<string, number> = {};
      const commentsByPostId: Record<string, number> = {};
      
      if (!likesError && allLikes) {
        allLikes.forEach(like => {
          likesByPostId[like.post_id] = (likesByPostId[like.post_id] || 0) + 1;
        });
      }
      
      if (!commentsError && allComments) {
        allComments.forEach(comment => {
          commentsByPostId[comment.post_id] = (commentsByPostId[comment.post_id] || 0) + 1;
        });
      }
      
      // 7. Combine all data
      const postsWithAll = fallbackResult.data.map(post => ({
        ...post,
        author: post.profiles,
        likes: likesByPostId[post.id] || 0,
        comments: commentsByPostId[post.id] || 0,
        has_liked: !!userLikes[post.id],
        profiles: undefined,
      }));
      
      return postsWithAll as Post[];
    }

    // Process the successful result
    const processedPosts = await Promise.all(
      data.map(async (post) => {
        // Check if current user has liked this post
        let hasLiked = false;
        if (userId) {
          hasLiked = await isPostLikedByUser(userId, post.id);
        }

        return {
          ...post,
          author: post.profiles,
          likes: post.post_likes?.length ? post.post_likes[0].count : 0,
          comments: post.comments?.length ? post.comments[0].count : 0,
          has_liked: hasLiked,
          profiles: undefined,
          post_likes: undefined,
        };
      }),
    );

    return processedPosts as Post[];
  } catch (error) {
    console.error("Error in getPosts:", error);
    return [];
  }
}

/**
 * Get all comments for a post
 */
export async function getPostComments(postId: string): Promise<PostComment[]> {
  const supabase = await createClient();
  
  try {
    const { data: comments, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    
    return comments || [];
  } catch (error) {
    console.error('Error in getPostComments:', error);
    return [];
  }
}

/**
 * Get a post by ID with full details
 */
export async function getPost(
  postId: string,
  currentUserId?: string
): Promise<Post | null> {
  const supabase = await createClient();
  
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url)
      `)
      .eq('id', postId)
      .single();
    
    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }
    
    // Get like count
    const { count: likesCount, error: countError } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    
    if (countError) {
      console.error('Error counting likes:', countError);
    }
    
    // Check if current user has liked this post
    let userHasLiked = false;
    
    if (currentUserId) {
      const { data: likeData, error: likeError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .maybeSingle();
      
      if (likeError) {
        console.error('Error checking if user liked post:', likeError);
      } else {
        userHasLiked = !!likeData;
      }
    }
    
    // Return post with like data
    return {
      ...post,
      likes_count: likesCount || 0,
      user_has_liked: userHasLiked
    };
  } catch (error) {
    console.error('Error in getPost:', error);
    return null;
  }
}

export async function createPost(
  userId: string,
  post: CreatePostRequest,
): Promise<Post | null> {
  const supabase = await createClient();

  // Add validation here
  if (!post.title || !post.content) {
    console.error("Post title and content are required");
    return null;
  }

  // Handle tags if provided
  const tags = post.tags
    ? Array.isArray(post.tags)
      ? post.tags
      : post.tags.split(",").map((tag) => tag.trim())
    : [];

  try {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId, // Ensure this matches the profile id UUID format
        title: post.title,
        content: post.content,
        category: post.category,
        image_url: post.image_url,
        is_pinned: post.is_pinned || false,
        tags: tags,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      console.error("Error details:", JSON.stringify(error));
      console.error("Input data:", { userId, post });
      return null;
    }

    // Update user engagement metrics
    try {
      await supabase.rpc("update_user_engagement", {
        p_user_id: userId,
        p_comments_created: 1,
        p_course_views: 0,
        p_lesson_views: 0,
        p_likes_given: 0,
        p_time_spent_minutes: 0,
      });
    } catch (err) {
      console.error("Error updating user engagement:", err);
      console.error(
        "Error details:",
        err instanceof Error ? err.message : String(err),
      );
    }

    revalidatePath("/community");
    return data as Post;
  } catch (e) {
    console.error("Exception during post creation:", e);
    return null;
  }
}

export async function updatePost(
  userId: string,
  postId: string,
  post: Partial<CreatePostRequest>,
): Promise<Post | null> {
  const supabase = await createClient();

  // Handle tags if provided
  let updateData: any = { ...post };
  if (post.tags) {
    updateData.tags = Array.isArray(post.tags)
      ? post.tags
      : post.tags.split(",").map((tag) => tag.trim());
  }

  // Add updated_at timestamp
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", postId)
    .eq("user_id", userId) // Ensure user owns this post
    .select()
    .single();

  if (error) {
    console.error("Error updating post:", error);
    return null;
  }

  revalidatePath("/community");
  revalidatePath(`/community/discussions/${postId}`);
  return data as Post;
}

export async function deletePost(
  userId: string,
  postId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId); // Ensure user owns this post

  if (error) {
    console.error("Error deleting post:", error);
    return false;
  }

  revalidatePath("/community");
  return true;
}

/**
 * Toggle like on a post
 * @param userId - ID of the user performing the like action
 * @param postId - ID of the post being liked or unliked  
 * @param skipRevalidation - Whether to skip path revalidation (default: false)
 * @returns True if the operation was successful, false otherwise
 */
export async function togglePostLike(
  userId: string,
  postId: string,
  skipRevalidation: boolean = false
): Promise<boolean> {
  const supabase = await createClient();

  // Check if like exists
  const { data: existingLike, error: checkError } = await supabase
    .from("post_likes")
    .select("id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .single();

  try {
    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("id", existingLike.id);

      if (error) throw error;
    } else {
      // Like
      const { error } = await supabase.from("post_likes").insert({
        user_id: userId,
        post_id: postId,
      });

      if (error) throw error;

      // Update user engagement metrics
      await supabase.rpc("update_user_engagement", {
        p_user_id: userId,
        p_likes_given: 1,
      });
    }

    // Only revalidate if not skipped (allows for client-side handling without refresh)
    if (!skipRevalidation) {
      revalidatePath("/community");
      revalidatePath(`/community/discussions/${postId}`);
    }
    return true;
  } catch (err) {
    console.error("Error toggling post like:", err);
    return false;
  }
}

export async function isPostLikedByUser(
  userId: string,
  postId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("post_likes")
    .select("id")
    .eq("user_id", userId)
    .eq("post_id", postId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is the error code for no rows returned
    console.error("Error checking if post is liked:", error);
  }

  return !!data;
}

// Post Comments
export interface CommentData {
  post_id: string;
  content: string;
}

/**
 * Create a new comment on a post
 */
export async function createPostComment(
  userId: string,
  commentData: CommentData
): Promise<PostComment | null> {
  const supabase = await createClient();
  
  try {
    // Get user profile for author data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!profile) {
      console.error('User profile not found');
      return null;
    }
    
    // Insert the comment
    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        user_id: userId,
        post_id: commentData.post_id,
        content: commentData.content,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating comment:', error);
      return null;
    }
    
    // Return with author info included
    return { 
      ...comment, 
      author: {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      } 
    };
  } catch (error) {
    console.error('Error in createPostComment:', error);
    return null;
  }
}

/**
 * Delete a comment from a post
 */
export async function deletePostComment(
  userId: string,
  commentId: string
): Promise<boolean> {
  const supabase = await createClient();
  
  try {
    // First check if user is the comment owner
    const { data: comment, error: checkError } = await supabase
      .from('post_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();
    
    if (checkError || !comment) {
      console.error('Error fetching comment to delete:', checkError);
      return false;
    }
    
    // Only allow deletion if user is the comment author
    if (comment.user_id !== userId) {
      console.error('User not authorized to delete this comment');
      return false;
    }
    
    // Delete the comment
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);
    
    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deletePostComment:', error);
    return false;
  }
}

// Groups
export async function getGroups(
  limit: number = 10,
  offset: number = 0,
  category?: string,
): Promise<Group[]> {
  const supabase = await createClient();

  try {
    // Try the original query with the count_group_members function
    let query = supabase
      .from("groups")
      .select(
        `
        *,
        profiles:created_by_user_id (id, username, full_name, avatar_url),
        group_members(count)
      `,
      )
      .eq("is_private", false) // Only get public groups in the main listing
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      // If error is related to count_group_members, fall back to a simpler query
      if (error.code === 'PGRST200' && error.message.includes('group_members')) {
        console.error("Error with count_group_members, falling back to simple query:", error);
        
        // Fallback query without the count function
        let fallbackQuery = supabase
          .from("groups")
          .select(
            `
            *,
            profiles:created_by_user_id (id, username, full_name, avatar_url)
          `,
          )
          .eq("is_private", false)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (category) {
          fallbackQuery = fallbackQuery.eq("category", category);
        }

        const fallbackResult = await fallbackQuery;
        
        if (fallbackResult.error) {
          console.error("Error in fallback query:", fallbackResult.error);
          return [];
        }
        
        // For each group, get the count of members separately
        const groupsWithMembers = await Promise.all(
          fallbackResult.data.map(async (group) => {
            const { count, error: countError } = await supabase
              .from("group_members")
              .select("*", { count: "exact", head: true })
              .eq("group_id", group.id);
              
            return {
              ...group,
              creator: group.profiles,
              members: countError ? 0 : (count || 0),
              profiles: undefined,
            };
          })
        );
        
        return groupsWithMembers as Group[];
      }
      
      console.error("Error fetching groups:", error);
      return [];
    }

    return data.map((group) => ({
      ...group,
      creator: group.profiles,
      members: group.group_members?.[0]?.count || 0,
      profiles: undefined,
      group_members: undefined,
    })) as Group[];
  } catch (e) {
    console.error("Exception in getGroups:", e);
    return [];
  }
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const supabase = await createClient();

  try {
    // Try the original query with the count_group_members function
    const { data, error } = await supabase
      .from("groups")
      .select(
        `
        *,
        profiles:created_by_user_id (id, username, full_name, avatar_url),
        group_members(count)
      `,
      )
      .eq("id", groupId)
      .single();

    if (error) {
      // If error is related to count_group_members, fall back to a simpler query
      if (error.code === 'PGRST200' && error.message.includes('group_members')) {
        console.error("Error with count_group_members, falling back to simple query:", error);
        
        // Fallback query without the count function
        const fallbackResult = await supabase
          .from("groups")
          .select(
            `
            *,
            profiles:created_by_user_id (id, username, full_name, avatar_url)
          `,
          )
          .eq("id", groupId)
          .single();
        
        if (fallbackResult.error) {
          console.error("Error in fallback query:", fallbackResult.error);
          return null;
        }
        
        // Get the count of members separately
        const { count, error: countError } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", groupId);
        
        return {
          ...fallbackResult.data,
          creator: fallbackResult.data.profiles,
          members: countError ? 0 : (count || 0),
          profiles: undefined,
        } as Group;
      }
      
      console.error("Error fetching group:", error);
      return null;
    }

    return {
      ...data,
      creator: data.profiles,
      members: data.group_members?.[0]?.count || 0,
      profiles: undefined,
      group_members: undefined,
    } as Group;
  } catch (e) {
    console.error("Exception in getGroup:", e);
    return null;
  }
}

export async function createGroup(
  userId: string,
  group: CreateGroupRequest,
): Promise<Group | null> {
  const supabase = await createClient();

  if (!group.name || !group.description) {
    console.error("Group name and description are required");
    return null;
  }

  // Handle topics if provided
  const topics = group.topics
    ? Array.isArray(group.topics)
      ? group.topics
      : group.topics.split(",").map((topic) => topic.trim())
    : [];

  try {
    // First, check if the 'category' column exists in the groups table
    const { error: schemaError } = await supabase
      .from("groups")
      .select("category")
      .limit(1);

    const hasCategory = !schemaError || !schemaError.message.includes("category");

    // Basic group data to insert
    const groupData: any = {
      name: group.name,
      description: group.description,
      image_url: group.image_url,
      created_by_user_id: userId,
      is_private: group.is_private || false,
      topics: topics,
    };

    // Only add category if the column exists
    if (hasCategory && group.category) {
      groupData.category = group.category;
    }

    const { data: newGroup, error } = await supabase
      .from("groups")
      .insert(groupData)
      .select()
      .single();

    if (error) {
      console.error("Error creating group:", error);
      console.error("Error details:", JSON.stringify(error));
      console.error("Input data:", { userId, group });
      return null;
    }

    // Automatically add creator as an admin member
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: newGroup.id,
      user_id: userId,
      role: "admin",
    });

    if (memberError) {
      console.error("Error adding creator as group member:", memberError);
      console.error("Error details:", JSON.stringify(memberError));
    }

    revalidatePath("/community");
    return newGroup as Group;
  } catch (e) {
    console.error("Exception during group creation:", e);
    return null;
  }
}

export async function joinGroup(
  userId: string,
  groupId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from("group_members").insert({
    group_id: groupId,
    user_id: userId,
  });

  if (error) {
    console.error("Error joining group:", error);
    return false;
  }

  revalidatePath("/community");
  revalidatePath(`/community/groups/${groupId}`);
  return true;
}

export async function leaveGroup(
  userId: string,
  groupId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error leaving group:", error);
    return false;
  }

  revalidatePath("/community");
  revalidatePath(`/community/groups/${groupId}`);
  return true;
}

export async function isGroupMember(
  userId: string,
  groupId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("group_members")
    .select("id")
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is the error code for no rows returned
    console.error("Error checking group membership:", error);
  }

  return !!data;
}

export async function getGroupMembers(groupId: string): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
      *,
      profiles:user_id (id, username, full_name, avatar_url)
    `,
    )
    .eq("group_id", groupId);

  if (error) {
    console.error("Error fetching group members:", error);
    return [];
  }

  return data.map((member) => ({
    ...member,
    user: member.profiles,
    profiles: undefined,
  }));
}

// Comment Likes
/**
 * Toggle like on a comment
 * @param userId - ID of the user performing the like action
 * @param commentId - ID of the comment being liked or unliked
 * @param skipRevalidation - Whether to skip path revalidation (default: false)
 * @returns True if the operation was successful, false otherwise
 */
export async function toggleCommentLike(
  userId: string,
  commentId: string,
  skipRevalidation: boolean = false
): Promise<boolean> {
  const supabase = await createClient();

  try {
    // Check if like exists
    const { data: existingLike, error: checkError } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("user_id", userId)
      .eq("comment_id", commentId)
      .single();

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from("comment_likes")
        .delete()
        .eq("id", existingLike.id);

      if (error) throw error;
    } else {
      // Like
      const { error } = await supabase.from("comment_likes").insert({
        user_id: userId,
        comment_id: commentId,
      });

      if (error) throw error;
    }

    // Revalidate paths only if not skipped
    if (!skipRevalidation) {
      // Get post_id for this comment (either direct comment or reply)
      const { data: comment } = await supabase
        .from("post_comments")
        .select("post_id")
        .eq("id", commentId)
        .single();
      
      if (comment) {
        revalidatePath(`/community/discussions/${comment.post_id}`);
        revalidatePath('/community');
      }
    }
    
    return true;
  } catch (err) {
    console.error("Error toggling comment like:", err);
    return false;
  }
}

export async function isCommentLikedByUser(
  userId: string,
  commentId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("user_id", userId)
    .eq("comment_id", commentId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is the error code for no rows returned
    console.error("Error checking if comment is liked:", error);
  }

  return !!data;
}

/**
 * Optimized function to check if a user is a member of multiple groups in one query
 * Returns a Set of group IDs the user is a member of
 */
export async function getUserGroupMemberships(userId: string, groupIds: string[]): Promise<Set<string>> {
  if (!userId || !groupIds.length) {
    return new Set();
  }

  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId)
      .in("group_id", groupIds);
      
    if (error) {
      console.error("Error getting user group memberships:", error);
      return new Set();
    }
    
    return new Set(data.map(membership => membership.group_id));
  } catch (error) {
    console.error("Error in getUserGroupMemberships:", error);
    return new Set();
  }
}

/**
 * Get posts for a specific group
 */
export async function getGroupPosts(
  groupId: string,
  limit: number = 10,
  offset: number = 0,
  userId?: string
): Promise<Post[]> {
  console.log(`[getGroupPosts] Fetching posts for group: ${groupId} (userId: ${userId || 'guest'})`);
  const supabase = await createClient();
  
  try {
    // Get the group name first
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .single();
    
    if (groupError) {
      console.error('[getGroupPosts] Error fetching group:', groupError);
      return [];
    }
    
    // Build the query based on title containing group name in brackets
    // or category matching the group name
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url)
      `)
      .or(`title.ilike.%[${group.name}]%, category.eq.${group.name}`)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    const { data: posts, error } = await query;
    
    if (error) {
      console.error('[getGroupPosts] Error fetching posts:', error);
      return [];
    }
    
    console.log(`[getGroupPosts] Retrieved ${posts?.length || 0} raw posts for group: ${groupId}`);
    
    // We need to get likes count and comments count for each post
    // And check if the current user has liked each post
    if (!posts || posts.length === 0) {
      return [];
    }
    
    const postIds = posts.map(post => post.id);
    
    // Get likes for all posts and count them ourselves
    const { data: allLikes, error: likesError } = await supabase
      .from('post_likes')
      .select('post_id')
      .in('post_id', postIds);
    
    if (likesError) {
      console.error('[getGroupPosts] Error getting likes data:', likesError);
    }
    
    // Count likes for each post
    const likesCountMap: Record<string, number> = {};
    if (allLikes) {
      for (const like of allLikes) {
        likesCountMap[like.post_id] = (likesCountMap[like.post_id] || 0) + 1;
      }
    }
    
    // Get comments for all posts and count them ourselves
    const { data: allComments, error: commentsError } = await supabase
      .from('post_comments')
      .select('post_id')
      .in('post_id', postIds);
    
    if (commentsError) {
      console.error('[getGroupPosts] Error getting comments data:', commentsError);
    }
    
    // Count comments for each post
    const commentsCountMap: Record<string, number> = {};
    if (allComments) {
      for (const comment of allComments) {
        commentsCountMap[comment.post_id] = (commentsCountMap[comment.post_id] || 0) + 1;
      }
    }
    
    // If we have a userId, get which posts they've liked
    let userLikesMap: Record<string, boolean> = {};
    
    if (userId) {
      const { data: userLikes, error: userLikesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .in('post_id', postIds)
        .eq('user_id', userId);
      
      if (userLikesError) {
        console.error('[getGroupPosts] Error getting user likes:', userLikesError);
      } else {
        userLikesMap = (userLikes || []).reduce((acc, item) => {
          acc[item.post_id] = true;
          return acc;
        }, {} as Record<string, boolean>);
      }
    }
    
    // Enhance each post with likes, comments, and user_has_liked
    const enhancedPosts = posts.map(post => ({
      ...post,
      likes_count: likesCountMap[post.id] || 0,
      comments_count: commentsCountMap[post.id] || 0,
      user_has_liked: userLikesMap[post.id] || false
    }));
    
    console.log(`[getGroupPosts] Returning ${enhancedPosts.length} enhanced posts with likes and comments counts`);
    return enhancedPosts;
  } catch (error) {
    console.error('[getGroupPosts] Exception in getGroupPosts:', error);
    return [];
  }
}

// Create a post in a group
export async function createGroupPost(
  userId: string,
  groupId: string,
  post: CreatePostRequest,
): Promise<Post | null> {
  const supabase = await createClient();

  try {
    // Check if user is a member of the group
    const isMember = await isGroupMember(userId, groupId);
    if (!isMember) {
      console.error("User is not a member of the group");
      return null;
    }

    // Get the group name
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("name")
      .eq("id", groupId)
      .single();

    if (groupError) {
      console.error("Error fetching group:", groupError);
      return null;
    }

    // Create post with group info in title and category
    const { data: newPost, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        title: `[${group.name}] ${post.title}`,
        content: post.content,
        image_url: post.image_url,
        category: group.name, // Use group name as category for easy filtering
        tags: post.tags,
      })
      .select()
      .single();

    if (postError) {
      console.error("Error creating post:", postError);
      return null;
    }

    // Get the post with profile info
    const { data: fullPost, error: getError } = await supabase
      .from("posts")
      .select(
        `
        *,
        profiles:user_id (id, username, full_name, avatar_url)
      `
      )
      .eq("id", newPost.id)
      .single();

    if (getError) {
      console.error("Error retrieving created post:", getError);
      return newPost as Post; // Return basic post if we can't get the full one
    }

    revalidatePath(`/community/groups/${groupId}`);
    
    return {
      ...fullPost,
      author: fullPost.profiles,
      profiles: undefined,
    } as Post;
  } catch (e) {
    console.error("Exception in createGroupPost:", e);
    return null;
  }
}

// Enhanced getGroups function with additional filtering options
export async function getGroupsWithFilters(
  limit: number = 20,
  offset: number = 0,
  filters: {
    category?: string;
    search?: string;
    sort?: 'newest' | 'popular' | 'alphabetical';
    topics?: string[];
  } = {},
): Promise<Group[]> {
  const supabase = await createClient();

  try {
    // Build the query with all common parts
    let query = supabase
      .from("groups")
      .select(
        `
        *,
        profiles:created_by_user_id (id, username, full_name, avatar_url),
        group_members(count)
      `,
      )
      .eq("is_private", false); // Only get public groups in the main listing

    // Apply category filter if provided
    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    // Apply search filter if provided
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    // Apply topics filter if provided
    if (filters.topics && filters.topics.length > 0) {
      // This uses the contains operator for array fields
      query = query.contains('topics', filters.topics);
    }

    // Apply sorting
    if (filters.sort === 'alphabetical') {
      query = query.order("name", { ascending: true });
    } else if (filters.sort === 'popular') {
      // First fetch the data without sorting by popularity
      // We'll manually sort by member count after
      query = query.order("created_at", { ascending: false });
    } else {
      // Default to newest
      query = query.order("created_at", { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching groups with filters:", error);
      return [];
    }

    // Transform the data
    const transformedGroups = data.map((group) => ({
      ...group,
      creator: group.profiles,
      members: group.group_members?.[0]?.count || 0,
      profiles: undefined,
      group_members: undefined,
    })) as Group[];

    // If sorting by popularity, we need to sort manually
    if (filters.sort === 'popular') {
      return transformedGroups.sort((a, b) => (b.members || 0) - (a.members || 0));
    }

    return transformedGroups;
  } catch (e) {
    console.error("Exception in getGroupsWithFilters:", e);
    return [];
  }
}

// Get recommended groups for a user based on their interests and activity
export async function getRecommendedGroups(
  userId: string,
  limit: number = 5
): Promise<Group[]> {
  const supabase = await createClient();

  try {
    // Get user's groups to exclude them
    const { data: userGroups, error: userGroupsError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    if (userGroupsError) {
      console.error("Error fetching user groups:", userGroupsError);
      return [];
    }

    const userGroupIds = userGroups.map(g => g.group_id);

    // Get public groups not joined by the user, ordered by member count
    const { data, error } = await supabase
      .from("groups")
      .select(
        `
        *,
        profiles:created_by_user_id (id, username, full_name, avatar_url),
        group_members(count)
      `,
      )
      .eq("is_private", false)
      .not('id', 'in', `(${userGroupIds.join(',')})`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recommended groups:", error);
      return [];
    }

    // Transform the data
    const recommendedGroups = data.map((group) => ({
      ...group,
      creator: group.profiles,
      members: group.group_members?.[0]?.count || 0,
      profiles: undefined,
      group_members: undefined,
    })) as Group[];

    // Sort by member count (popularity)
    return recommendedGroups.sort((a, b) => (b.members || 0) - (a.members || 0));
  } catch (e) {
    console.error("Exception in getRecommendedGroups:", e);
    return [];
  }
}

/**
 * Check if a post belongs to a specific group
 */
export async function isPostInGroup(
  postId: string,
  groupId: string
): Promise<boolean> {
  const supabase = await createClient();
  
  try {
    // Get the group name
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .single();
    
    if (groupError || !group) {
      console.error('Error fetching group:', groupError);
      return false;
    }
    
    // Get the post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('title, category')
      .eq('id', postId)
      .single();
    
    if (postError || !post) {
      console.error('Error fetching post:', postError);
      return false;
    }
    
    // Check if the post title contains the group name in brackets
    // or if the category matches the group name
    const groupNameInTitle = post.title.includes(`[${group.name}]`);
    const categoryIsGroup = post.category === group.name;
    
    return groupNameInTitle || categoryIsGroup;
  } catch (error) {
    console.error('Error in isPostInGroup:', error);
    return false;
  }
}
