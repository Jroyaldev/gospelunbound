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
export async function getPosts(
  limit: number = 10,
  offset: number = 0,
  category?: string,
): Promise<Post[]> {
  const supabase = await createClient();

  try {
    // Try the original query with the count functions
    let query = supabase
      .from("posts")
      .select(
        `
        *,
        profiles:user_id (id, username, full_name, avatar_url),
        like_count:count_post_likes(*),
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
      // If error is related to count functions, fall back to a simpler query
      if (error.code === 'PGRST200' && 
         (error.message.includes('count_post_likes') || error.message.includes('post_comments'))) {
        console.error("Error with count functions, falling back to simple query:", error);
        
        // Fallback query without the count functions
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
        
        // For each post, get the counts separately
        const postsWithCounts = await Promise.all(
          fallbackResult.data.map(async (post) => {
            // Get like count
            const { count: likeCount, error: likeCountError } = await supabase
              .from("post_likes")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id);
            
            // Get comment count
            const { count: commentCount, error: commentCountError } = await supabase
              .from("post_comments")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id);
              
            return {
              ...post,
              author: post.profiles,
              likes: likeCountError ? 0 : (likeCount || 0),
              comments: commentCountError ? 0 : (commentCount || 0),
              profiles: undefined,
            };
          })
        );
        
        return postsWithCounts as Post[];
      }
      
      console.error("Error fetching posts:", error);
      return [];
    }

    return data.map((post) => ({
      ...post,
      author: post.profiles,
      likes: post.like_count,
      comments: post.comments?.[0]?.count || 0,
      profiles: undefined,
      like_count: undefined,
    })) as Post[];
  } catch (e) {
    console.error("Exception in getPosts:", e);
    return [];
  }
}

export async function getPost(postId: string): Promise<Post | null> {
  const supabase = await createClient();

  try {
    // Try the original query with the count functions
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        profiles:user_id (id, username, full_name, avatar_url),
        like_count:count_post_likes(*),
        comments:post_comments(count)
      `,
      )
      .eq("id", postId)
      .single();

    if (error) {
      // If error is related to count functions, fall back to a simpler query
      if (error.code === 'PGRST200' && 
         (error.message.includes('count_post_likes') || error.message.includes('post_comments'))) {
        console.error("Error with count functions, falling back to simple query:", error);
        
        // Fallback query without the count function
        const fallbackResult = await supabase
          .from("posts")
          .select(
            `
            *,
            profiles:user_id (id, username, full_name, avatar_url)
          `,
          )
          .eq("id", postId)
          .single();
        
        if (fallbackResult.error) {
          console.error("Error in fallback query:", fallbackResult.error);
          return null;
        }
        
        // Get the counts separately
        const { count: likeCount, error: likeCountError } = await supabase
          .from("post_likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId);
        
        // Get comment count
        const { count: commentCount, error: commentCountError } = await supabase
          .from("post_comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId);
        
        return {
          ...fallbackResult.data,
          author: fallbackResult.data.profiles,
          likes: likeCountError ? 0 : (likeCount || 0),
          comments: commentCountError ? 0 : (commentCount || 0),
          profiles: undefined,
        } as Post;
      }
      
      console.error("Error fetching post:", error);
      return null;
    }

    return {
      ...data,
      author: data.profiles,
      likes: data.like_count,
      comments: data.comments?.[0]?.count || 0,
      profiles: undefined,
      like_count: undefined,
    } as Post;
  } catch (e) {
    console.error("Exception in getPost:", e);
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

export async function togglePostLike(
  userId: string,
  postId: string,
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

    revalidatePath("/community");
    revalidatePath(`/community/discussions/${postId}`);
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
export async function getPostComments(postId: string): Promise<PostComment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("post_comments")
    .select(
      `
      *,
      profiles:user_id (id, username, full_name, avatar_url),
      comment_likes:comment_likes(count)
    `,
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching post comments:", error);
    return [];
  }

  return data.map((comment) => ({
    ...comment,
    author: comment.profiles,
    likes: comment.comment_likes?.[0]?.count || 0,
    profiles: undefined,
    comment_likes: undefined,
  })) as PostComment[];
}

export async function createPostComment(
  userId: string,
  comment: CreatePostCommentRequest,
): Promise<PostComment | null> {
  const supabase = await createClient();

  if (!comment.content || !comment.post_id) {
    console.error("Comment content and post_id are required");
    return null;
  }

  // Insert the comment
  const { data: newComment, error } = await supabase
    .from("post_comments")
    .insert({
      user_id: userId,
      post_id: comment.post_id,
      content: comment.content,
      parent_id: comment.parent_id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating comment:", error);
    return null;
  }

  // Update user engagement metrics
  try {
    await supabase.rpc("update_user_engagement", {
      p_user_id: userId,
      p_comments_created: 1,
    });
  } catch (err) {
    console.error("Error updating user engagement:", err);
  }

  // Fetch the user profile to include with the comment
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Error fetching user profile:", profileError);
  }

  // Revalidate paths to update UI
  revalidatePath(`/community/discussions/${comment.post_id}`);
  revalidatePath('/community');
  
  // Return the comment with author profile data
  return {
    ...newComment,
    author: profileError ? undefined : profileData,
  } as PostComment;
}

export async function deletePostComment(
  userId: string,
  commentId: string,
): Promise<boolean> {
  const supabase = await createClient();

  // First get the comment to know which post to revalidate
  const { data: comment, error: fetchError } = await supabase
    .from("post_comments")
    .select("post_id, user_id")
    .eq("id", commentId)
    .single();

  if (fetchError) {
    console.error("Error fetching comment:", fetchError);
    return false;
  }
  
  // Verify the user owns this comment
  if (comment.user_id !== userId) {
    console.error("User does not own this comment");
    return false;
  }

  // Find all replies to this comment
  const { data: replies, error: repliesError } = await supabase
    .from("post_comments")
    .select("id")
    .eq("parent_id", commentId);

  if (repliesError) {
    console.error("Error fetching replies:", repliesError);
    // Continue anyway to at least delete the original comment
  } else if (replies && replies.length > 0) {
    // Delete all replies
    const { error: deleteRepliesError } = await supabase
      .from("post_comments")
      .delete()
      .in("id", replies.map(reply => reply.id));

    if (deleteRepliesError) {
      console.error("Error deleting replies:", deleteRepliesError);
      // Continue anyway to at least delete the original comment
    }
  }

  // Delete the original comment
  const { error } = await supabase
    .from("post_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Error deleting comment:", error);
    return false;
  }

  // Revalidate paths to update UI
  revalidatePath(`/community/discussions/${comment.post_id}`);
  revalidatePath('/community');
  return true;
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
        member_count:count_group_members(*)
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
      if (error.code === 'PGRST200' && error.message.includes('count_group_members')) {
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
      members: group.member_count,
      profiles: undefined,
      member_count: undefined,
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
        member_count:count_group_members(*)
      `,
      )
      .eq("id", groupId)
      .single();

    if (error) {
      // If error is related to count_group_members, fall back to a simpler query
      if (error.code === 'PGRST200' && error.message.includes('count_group_members')) {
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
      members: data.member_count,
      profiles: undefined,
      member_count: undefined,
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
export async function toggleCommentLike(
  userId: string,
  commentId: string,
): Promise<boolean> {
  const supabase = await createClient();

  // Check if like exists
  const { data: existingLike, error: checkError } = await supabase
    .from("comment_likes")
    .select("id")
    .eq("user_id", userId)
    .eq("comment_id", commentId)
    .single();

  try {
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

    // Revalidate paths
    const { data: comment } = await supabase
      .from("post_comments")
      .select("post_id")
      .eq("id", commentId)
      .single();
    
    if (comment) {
      revalidatePath(`/community/discussions/${comment.post_id}`);
      revalidatePath('/community');
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
