import { supabase } from "@/integrations/supabase/client";
import { liveServicesEnabled } from "@/lib/demoConfig";

export interface ForumPost {
  storage?: "local" | "online";
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
  storage?: "local" | "online";
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

const LOCAL_POSTS_STORAGE_KEY = "agro_local_forum_posts";
const LOCAL_COMMENTS_PREFIX = "agro_local_forum_comments_";
const LOCAL_LIKES_KEY = "agro_forum_liked_posts";

function getLocalPosts(): ForumPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_POSTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPosts(posts: ForumPost[]) {
  if (typeof window === "undefined") throw new Error("Browser storage unavailable");
  localStorage.setItem(LOCAL_POSTS_STORAGE_KEY, JSON.stringify(posts));
}

function getLocalComments(postId: string): ForumComment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_PREFIX + postId);
    const local = raw ? JSON.parse(raw) : [];
    return local.map((comment: ForumComment) => ({ ...comment, storage: "local" }));
  } catch {
    return [];
  }
}

function saveLocalComment(postId: string, comment: ForumComment) {
  if (typeof window === "undefined") throw new Error("Browser storage unavailable");
  const raw = localStorage.getItem(LOCAL_COMMENTS_PREFIX + postId);
  const list: ForumComment[] = raw ? JSON.parse(raw) : [];
  list.push(comment);
  localStorage.setItem(LOCAL_COMMENTS_PREFIX + postId, JSON.stringify(list));
}

function getLocalLikedPosts(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LOCAL_LIKES_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function setLocalLikedPosts(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_LIKES_KEY, JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.warn("Failed to save liked posts:", e);
  }
}

/**
 * Get all forum posts with pagination (merges Supabase and local posts)
 */
export async function getForumPosts(
  category?: string,
  limit = 50,
  offset = 0
): Promise<ForumPost[]> {
  let dbPosts: ForumPost[] = [];

  try {
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

    if (!error && data && data.length > 0) {
      try {
        const userIds = Array.from(new Set(data.map((p: any) => p.user_id).filter(Boolean)));
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, state")
            .in("id", userIds);
          const profileMap = new Map((profiles || []).map((pr: any) => [pr.id, pr]));
          dbPosts = data.map((post: any) => ({
            ...post,
            user: profileMap.get(post.user_id) || { full_name: "Farmer", state: post.state || "India" },
          }));
        } else {
          dbPosts = data.map((p: any) => ({
            ...p,
            user: { full_name: "Farmer", state: p.state || "India" },
          }));
        }
      } catch {
        dbPosts = data.map((p: any) => ({
          ...p,
          user: { full_name: "Farmer", state: p.state || "India" },
        }));
      }
    }
  } catch (profileErr) {
    console.warn("Notice: Using local community posts:", profileErr);
  }

  // Get local/demo posts
  let localPosts = getLocalPosts();
  if (category && category !== "all") {
    localPosts = localPosts.filter((p) => p.category === category);
  }

  // Combine and deduplicate
  const combined = [...localPosts, ...dbPosts];
  const seenIds = new Set<string>();
  const uniquePosts: ForumPost[] = [];

  for (const p of combined) {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      uniquePosts.push(p);
    }
  }

  return uniquePosts.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/**
 * Get a single post with comments
 */
export async function getForumPost(postId: string) {
  try {
    const { data: post, error: postError } = await supabase
      .from("forum_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (!postError && post) {
      let postUser = { full_name: "Farmer", state: post.state || "India" };
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, state")
          .eq("id", post.user_id)
          .single();
        if (profile) postUser = profile;
      } catch (e) {}

      const { data: comments } = await supabase
        .from("forum_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      const localComments = getLocalComments(postId);
      const allComments = [...(comments || []), ...localComments];

      return {
        ...post,
        user: postUser,
        comments: allComments,
      };
    }
  } catch (e) {}

  // Fallback to local posts
  const localPosts = getLocalPosts();
  const post = localPosts.find((p) => p.id === postId);

  if (post) {
    return {
      ...post,
      comments: getLocalComments(postId),
    };
  }

  return null;
}

/**
 * Create a new forum post (works for authenticated, demo, and guest users)
 */
export async function createForumPost(
  title: string,
  content: string,
  category: string,
  crop?: string,
  state?: string,
  authorName?: string
): Promise<ForumPost> {
  let user: any = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (e) {}

  const isRealUser =
    user &&
    user.email !== "demo@agroprofit.pro" &&
    user.id !== "00000000-0000-0000-0000-000000000001";

  if (isRealUser) {
    try {
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

      if (!error && data) {
        return {
          ...data,
          user: {
            full_name: authorName || "Farmer",
            state: state || "India",
          },
        };
      }
    } catch (dbErr) {
      console.warn("DB insert error, persisting to local store:", dbErr);
    }
  }

  // Local creation for demo, guest, or unavailable remote storage.
  const localPost: ForumPost = {
    storage: "local",
    id: "local_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    user_id: user?.id || "demo_farmer_id",
    title,
    content,
    category,
    crop,
    state: state || "India",
    likes_count: 0,
    comments_count: 0,
    is_pinned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      full_name: authorName || (user?.email === "demo@agroprofit.pro" ? "Demo Farmer" : "Farmer"),
      state: state || "India",
    },
  };

  const current = getLocalPosts();
  current.unshift(localPost);
  saveLocalPosts(current);

  return localPost;
}

/**
 * Create a comment on a post (works for authenticated, demo, and guest users)
 */
export async function createComment(
  postId: string, 
  content: string,
  authorName?: string
): Promise<ForumComment> {
  let user: any = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (e) {}

  const isRealUser =
    user &&
    user.email !== "demo@agroprofit.pro" &&
    user.id !== "00000000-0000-0000-0000-000000000001";

  if (isRealUser && !postId.startsWith("local_")) {
    try {
      const { data, error } = await supabase
        .from("forum_comments")
        .insert({
          user_id: user.id,
          post_id: postId,
          content,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          ...data,
          user: {
            full_name: authorName || "Farmer",
          },
        };
      }
    } catch (e) {
      console.warn("DB comment insert failed, persisting to local store:", e);
    }
  }

  // Local / Demo comment
  const localComment: ForumComment = {
    storage: "local",
    id: "comment_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    post_id: postId,
    user_id: user?.id || "demo_farmer_id",
    content,
    likes_count: 0,
    created_at: new Date().toISOString(),
    user: {
      full_name: authorName || "Demo Farmer",
    },
  };

  saveLocalComment(postId, localComment);

  // Update comments count on local post
  const posts = getLocalPosts();
  const target = posts.find((p) => p.id === postId);
  if (target) {
    target.comments_count = (target.comments_count || 0) + 1;
    saveLocalPosts(posts);
  }

  return localComment;
}

/**
 * Toggle like on a post (works for authenticated, demo, and guest users)
 */
export async function togglePostLike(postId: string): Promise<boolean> {
  let user: any = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (e) {}

  const isRealUser =
    user &&
    user.email !== "demo@agroprofit.pro" &&
    user.id !== "00000000-0000-0000-0000-000000000001";

  if (isRealUser) {
    try {
      const { data: existing } = await supabase
        .from("forum_likes")
        .select()
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .single();

      if (existing) {
        await supabase.from("forum_likes").delete().eq("id", existing.id);
        return false;
      } else {
        await supabase.from("forum_likes").insert({ user_id: user.id, post_id: postId });
        return true;
      }
    } catch (e) {}
  }

  // Local like handling
  const likedSet = getLocalLikedPosts();
  const isLiked = likedSet.has(postId);
  if (isLiked) {
    likedSet.delete(postId);
  } else {
    likedSet.add(postId);
  }
  setLocalLikedPosts(likedSet);
  return !isLiked;
}

/**
 * Delete a forum post
 */
export async function deletePost(postId: string): Promise<void> {
  let user: any = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (e) {}

  if (user && user.email !== "demo@agroprofit.pro") {
    try {
      await supabase
        .from("forum_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);
    } catch (e) {}
  }

  // Delete from local storage
  const remaining = getLocalPosts().filter((p) => p.id !== postId);
  saveLocalPosts(remaining);
}

/**
 * Check if user has liked a post
 */
export async function hasUserLikedPost(postId: string): Promise<boolean> {
  let user: any = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (e) {}

  if (user && user.email !== "demo@agroprofit.pro") {
    try {
      const { data } = await supabase
        .from("forum_likes")
        .select()
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .single();

      if (data) return true;
    } catch (e) {}
  }

  return getLocalLikedPosts().has(postId);
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
  // Demo mode has no local price-history source. Return an empty series so
  // the trend page can show an honest "unavailable" state without a request.
  if (!liveServicesEnabled(import.meta.env)) return [];

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
