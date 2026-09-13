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

// Initial realistic community discussions for farmers
const SEED_POSTS: ForumPost[] = [
  {
    id: "seed_post_1",
    user_id: "seed_farmer_1",
    title: "Tomato Mandi Prices surging in Kolar & Madanapalle (₹3,200/qtl)",
    content: "Modal prices for hybrid tomatoes in Kolar APMC crossed ₹3,200 per quintal this morning due to sudden supply deficits from neighboring districts. Highly recommend harvesting ripe batches now before arrivals increase next Monday.",
    category: "price-discussion",
    crop: "Tomato",
    state: "Karnataka",
    likes_count: 18,
    comments_count: 2,
    is_pinned: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: {
      full_name: "Ramesh Gowda",
      state: "Karnataka",
    },
  },
  {
    id: "seed_post_2",
    user_id: "seed_farmer_2",
    title: "Effective organic management for Chilli Leaf Curl virus (Murda rog)",
    content: "For thrips and whiteflies causing leaf curl in chilli, spraying neem oil (10,000 ppm @ 3ml/L) along with sour buttermilk spray (50ml/L) every 7 days gives 80%+ control. Avoid excess nitrogen fertilizer during flowering stage.",
    category: "crop-advice",
    crop: "Chilli",
    state: "Gujarat",
    likes_count: 34,
    comments_count: 1,
    is_pinned: false,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    user: {
      full_name: "Suresh Patel",
      state: "Gujarat",
    },
  },
  {
    id: "seed_post_3",
    user_id: "seed_farmer_3",
    title: "Pre-monsoon showers alert for Western Maharashtra & Belagavi",
    content: "IMD radar shows heavy localized rain and gusty winds over Nashik, Pune, and Belagavi over the next 48 hours. Please cover open storage sheds and ensure proper furrow drainage in onion and potato fields.",
    category: "weather",
    crop: "Onion",
    state: "Maharashtra",
    likes_count: 22,
    comments_count: 1,
    is_pinned: false,
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    user: {
      full_name: "Anand Shinde",
      state: "Maharashtra",
    },
  },
  {
    id: "seed_post_4",
    user_id: "seed_farmer_4",
    title: "PM-Kisan 18th Installment: Check your e-KYC & Land Seeding status",
    content: "Farmers whose recent PM-Kisan installment was delayed should verify their Aadhaar bank account linking on the PM-Kisan portal. Ensure NPCI DBT mapping is active in your bank branch to avoid automatic payment rejections.",
    category: "schemes",
    crop: "Wheat",
    state: "Uttar Pradesh",
    likes_count: 41,
    comments_count: 1,
    is_pinned: false,
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    user: {
      full_name: "Kavita Devi",
      state: "Uttar Pradesh",
    },
  },
];

const SEED_COMMENTS: Record<string, ForumComment[]> = {
  seed_post_1: [
    {
      id: "comment_1_1",
      post_id: "seed_post_1",
      user_id: "user_seed_c1",
      content: "Confirmed from Madanapalle as well! Grade-A tomatoes are fetching ₹3,350 today.",
      likes_count: 4,
      created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      user: { full_name: "Venkat Reddy" },
    },
    {
      id: "comment_1_2",
      post_id: "seed_post_1",
      user_id: "user_seed_c2",
      content: "How are the transport rates per crate from Chintamani to Kolar?",
      likes_count: 1,
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      user: { full_name: "Manjunath K" },
    },
  ],
  seed_post_2: [
    {
      id: "comment_2_1",
      post_id: "seed_post_2",
      user_id: "user_seed_c3",
      content: "Sour buttermilk spray also helps with powdery mildew. Great advice!",
      likes_count: 5,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      user: { full_name: "Bhavin Shah" },
    },
  ],
  seed_post_3: [
    {
      id: "comment_3_1",
      post_id: "seed_post_3",
      user_id: "user_seed_c4",
      content: "Rains already started in Lasalgaon mandi. Arrivals paused for now.",
      likes_count: 2,
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      user: { full_name: "Dnyaneshwar Patil" },
    },
  ],
  seed_post_4: [
    {
      id: "comment_4_1",
      post_id: "seed_post_4",
      user_id: "user_seed_c5",
      content: "Checked my CSC center today, land seeding was missing. Updated and verified!",
      likes_count: 3,
      created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      user: { full_name: "Rajendra Yadav" },
    },
  ],
};

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
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.warn("Failed to save local posts:", e);
  }
}

function getLocalComments(postId: string): ForumComment[] {
  if (typeof window === "undefined") return SEED_COMMENTS[postId] || [];
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_PREFIX + postId);
    const local = raw ? JSON.parse(raw) : [];
    const seed = SEED_COMMENTS[postId] || [];
    return [...seed, ...local];
  } catch {
    return SEED_COMMENTS[postId] || [];
  }
}

function saveLocalComment(postId: string, comment: ForumComment) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_PREFIX + postId);
    const list: ForumComment[] = raw ? JSON.parse(raw) : [];
    list.push(comment);
    localStorage.setItem(LOCAL_COMMENTS_PREFIX + postId, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to save local comment:", e);
  }
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
 * Get all forum posts with pagination (merges Supabase + local + seed posts)
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

  // If no DB posts and no local posts, use SEED_POSTS
  let seedToInclude: ForumPost[] = [];
  if (dbPosts.length === 0) {
    seedToInclude = SEED_POSTS;
    if (category && category !== "all") {
      seedToInclude = seedToInclude.filter((p) => p.category === category);
    }
  }

  // Combine and deduplicate
  const combined = [...localPosts, ...dbPosts, ...seedToInclude];
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

  // Fallback to local posts or seed posts
  const localPosts = getLocalPosts();
  const post = localPosts.find((p) => p.id === postId) || SEED_POSTS.find((p) => p.id === postId);

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

  // Graceful local creation for demo & guest users (always succeeds)
  const localPost: ForumPost = {
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

  if (isRealUser) {
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
