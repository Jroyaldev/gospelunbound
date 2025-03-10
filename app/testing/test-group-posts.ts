/**
 * This is a test script to check if group posts are working correctly.
 * It uses a direct approach to associate posts with groups.
 */
import { createClient } from "@/app/lib/supabase/client";

export const setupGroupPostsTable = async () => {
  console.log("Using an alternative approach without table creation");
  return true; // Always return success since we'll use the fallback method
};

export const testCreateGroupPost = async (userId: string, groupId: string) => {
  const supabase = await createClient();
  
  console.log(`Testing post creation for user ${userId} in group ${groupId}`);
  
  // First check if user is a member of the group
  const { data: membership, error: membershipError } = await supabase
    .from("group_members")
    .select("*")
    .eq("user_id", userId)
    .eq("group_id", groupId)
    .maybeSingle();
    
  if (membershipError || !membership) {
    console.error("User is not a member of the group:", membershipError || "No membership found");
    return null;
  }
  
  // Get the group name
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("name")
    .eq("id", groupId)
    .single();
    
  if (groupError || !group) {
    console.error("Error fetching group:", groupError || "No group found");
    return null;
  }
  
  console.log("Found group:", group.name);
  
  // Create a test post with group name in title and as category
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      title: `[${group.name}] Test Post ${new Date().toISOString().substring(11, 19)}`,
      content: `This is a test post for the group ${group.name}. Created at ${new Date().toISOString()}`,
      user_id: userId,
      category: group.name // Use group name as category for filtering
    })
    .select()
    .single();
    
  if (postError || !post) {
    console.error("Failed to create post:", postError || "No post returned");
    return null;
  }
  
  console.log("Created post:", post);
  return post;
};

export const testFetchGroupPosts = async (groupId: string) => {
  const supabase = await createClient();
  
  console.log(`Testing post fetching for group ${groupId}`);
  
  // Get the group name for filtering
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("name")
    .eq("id", groupId)
    .single();
    
  if (groupError || !group) {
    console.error("Error fetching group:", groupError || "No group found");
    return [];
  }
  
  console.log("Fetching posts for group:", group.name);
  
  // Get posts that match the group name in title or category
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (id, username, full_name, avatar_url)
    `)
    .or(`title.ilike.%[${group.name}]%,category.eq.${group.name}`);
    
  if (postsError) {
    console.error("Error fetching posts:", postsError);
    return [];
  }
  
  console.log(`Found ${posts.length} posts for group ${group.name}`);
  return posts.map(post => ({
    ...post,
    author: post.profiles,
    profiles: undefined
  }));
}; 