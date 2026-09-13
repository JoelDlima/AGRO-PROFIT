import { supabase } from "@/integrations/supabase/client";

export interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  crop?: string;
  state?: string;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    state: string;
  };
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  user?: {
    full_name: string;
  };
}

/**
 * Get all forum posts with pagination
 */
export async function getForumPosts(
  category?: string,
  limit = 20,
  offset = 0
): Promise<ForumPost[]> {
  let query = supabase
    .from("forum_posts")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching forum posts:", error);
    return [];
  }

  if (!data || data.length === 0) return [];

  try {
    const userIds = Array.from(new Set(data.map((p: any) => p.user_id).filter(Boolean)));
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, state")
        .in("id", userIds);
      const profileMap = new Map((profiles || []).map((pr: any) => [pr.id, pr]));
      return data.map((post: any) => ({
        ...post,
        user: profileMap.get(post.user_id) || { full_name: "Farmer", state: post.state || "India" },
      }));
    }
  } catch (profileErr) {
    console.warn("Error resolving profiles for posts:", profileErr);
  }

  return data.map((p: any) => ({
    ...p,
    user: { full_name: "Farmer", state: p.state || "India" },
  }));
}

/**
 * Get a single post with comments
 */
export async function getForumPost(postId: string) {
  const { data: post, error: postError } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    console.error("Error fetching post:", postError);
    return null;
  }

  let postUser = { full_name: "Farmer", state: post.state || "India" };
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, state")
      .eq("id", post.user_id)
      .single();
    if (profile) postUser = profile;
  } catch (e) {}

  const { data: comments, error: commentsError } = await supabase
    .from("forum_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (commentsError) {
    console.error("Error fetching comments:", commentsError);
  }

  let mappedComments = comments || [];
  try {
    const commentUserIds = Array.from(new Set((comments || []).map((c: any) => c.user_id).filter(Boolean)));
    if (commentUserIds.length > 0) {
      const { data: commentProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", commentUserIds);
      const cProfileMap = new Map((commentProfiles || []).map((cp: any) => [cp.id, cp]));
      mappedComments = (comments || []).map((c: any) => ({
        ...c,
        user: cProfileMap.get(c.user_id) || { full_name: "Farmer" },
      }));
    }
  } catch (e) {}

  return {
    ...post,
    user: postUser,
    comments: mappedComments,
  };
}

/**
 * Create a new forum post
 */
export async function createForumPost(
  title: string,
  content: string,
  category: string,
  crop?: string,
  state?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("forum_posts")
    .insert({
      user_id: user.id,
      title,
      content,
      category,
      crop,
      state,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating post:", error);
    throw error;
  }

  console.log("Post created successfully:", data);
  return data;
}

/**
 * Create a comment on a post
 */
export async function createComment(postId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("forum_comments")
    .insert({
      user_id: user.id,
      post_id: postId,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating comment:", error);
    throw error;
  }

  return data;
}

/**
 * Toggle like on a post
 */
export async function togglePostLike(postId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if already liked
  const { data: existing } = await supabase
    .from("forum_likes")
    .select()
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from("forum_likes")
      .delete()
      .eq("id", existing.id);

    if (error) throw error;
    return false; // unliked
  } else {
    // Like
    const { error } = await supabase
      .from("forum_likes")
      .insert({
        user_id: user.id,
        post_id: postId,
      });

    if (error) throw error;
    return true; // liked
  }
}

/**
 * Delete a forum post
 */
export async function deletePost(postId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("forum_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

/**
 * Check if user has liked a post
 */
export async function hasUserLikedPost(postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("forum_likes")
    .select()
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  return !!data;
}

/**
 * Get price history for a commodity
 */
export async function getPriceHistory(
  commodity: string,
  state?: string,
  days = 15
): Promise<Array<{
  id: string;
  commodity: string;
  state: string;
  district: string | null;
  market: string;
  modal_price: number;
  min_price: number | null;
  max_price: number | null;
  recorded_date: string;
  created_at: string;
}>> {
  let query = supabase
    .from("price_history")
    .select("*")
    .eq("commodity", commodity)
    .gte("recorded_date", `${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`)
    .order("recorded_date", { ascending: true });

  if (state) {
    query = query.eq("state", state);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching price history:", error);
    return [];
  }

  return data || [];
}

/**
 * Store price data for trend analysis
 */
export async function storePriceHistory(priceData: {
  commodity: string;
  state: string;
  district?: string;
  market: string;
  modal_price: number;
  min_price?: number;
  max_price?: number;
}) {
  const { error } = await supabase
    .from("price_history")
    .upsert(
      {
        ...priceData,
        recorded_date: new Date().toISOString().split('T')[0],
      },
      {
        onConflict: "commodity,state,market,recorded_date",
      }
    );

  if (error) {
    console.error("Error storing price history:", error);
    throw error;
  }
}
