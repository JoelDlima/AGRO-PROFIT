import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { 
  MessageSquare, 
  ThumbsUp, 
  Plus, 
  Users,
  Pin,
  Calendar,
  MapPin,
  Trash2,
  Send,
  Sparkles
} from "lucide-react";
import { 
  getForumPosts, 
  getForumPost,
  createForumPost, 
  createComment,
  togglePostLike,
  hasUserLikedPost,
  deletePost,
  type ForumPost,
  type ForumComment
} from "@/services/forumService";
import { crops } from "@/data/mockData";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = [
  { value: "all", label: "All Discussions", icon: "💬" },
  { value: "price-discussion", label: "Price Discussion", icon: "💰" },
  { value: "crop-advice", label: "Crop Advice", icon: "🌾" },
  { value: "weather", label: "Weather & Seasons", icon: "🌧️" },
  { value: "schemes", label: "Government Schemes", icon: "📋" },
  { value: "general", label: "General", icon: "🗣️" },
];

export default function Forum() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  
  // Discussion / Comments Modal State
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [activePost, setActivePost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Form state for creating a post
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [selectedCrop, setSelectedCrop] = useState("none");
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  // Determine farmer display name
  const currentAuthorName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email === "demo@agroprofit.pro" ? "Demo Farmer" : "Farmer");
  const currentAuthorState = profile?.state || "India";

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  useEffect(() => {
    if (posts.length > 0) {
      loadLikedStatus();
    }
  }, [posts, user]);

  async function loadPosts() {
    setLoading(true);
    try {
      const data = await getForumPosts(selectedCategory);
      setPosts(data);
    } catch (error) {
      toast({
        title: "Notice",
        description: "Loaded community discussions",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadLikedStatus() {
    const liked = new Set<string>();
    for (const post of posts) {
      const isLiked = await hasUserLikedPost(post.id);
      if (isLiked) liked.add(post.id);
    }
    setLikedPosts(liked);
  }

  async function handleCreatePost() {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in both the title and content",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createForumPost(
        title.trim(), 
        content.trim(), 
        category, 
        selectedCrop && selectedCrop !== "none" ? selectedCrop : undefined,
        currentAuthorState,
        currentAuthorName
      );
      toast({
        title: "Post published! 🌾",
        description: `Your discussion is now live as ${currentAuthorName}`,
      });
      setDialogOpen(false);
      setTitle("");
      setContent("");
      setCategory("general");
      setSelectedCrop("none");
      await loadPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOpenDiscussion(post: ForumPost) {
    setActivePost(post);
    setDiscussionOpen(true);
    setLoadingComments(true);
    setNewCommentText("");
    try {
      const detail = await getForumPost(post.id);
      setComments(detail?.comments || []);
    } catch (e) {
      console.warn("Could not load comments:", e);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }

  async function handleAddComment() {
    if (!newCommentText.trim() || !activePost) return;

    setSubmittingComment(true);
    try {
      const comment = await createComment(
        activePost.id, 
        newCommentText.trim(), 
        currentAuthorName
      );
      setComments((prev) => [...prev, comment]);
      setNewCommentText("");
      
      // Update local comments count on the post card
      setPosts((prev) =>
        prev.map((p) =>
          p.id === activePost.id
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        )
      );

      toast({
        title: "Message posted!",
        description: "Your reply was shared with the community",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  }

  async function handleLike(postId: string) {
    try {
      const isLiked = await togglePostLike(postId);
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
      
      // Update local post count
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likes_count: Math.max(0, p.likes_count + (isLiked ? 1 : -1)) }
            : p
        )
      );
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deletePost(postId);
      toast({
        title: "Post deleted",
        description: "Your post has been removed",
      });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (activePost?.id === postId) {
        setDiscussionOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              Community Forum
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              Connect with farmers, share live mandi trends, and discuss crop management
            </p>
          </div>
          
          {/* New Post Button & Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[94vw] sm:max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>Create a New Discussion</DialogTitle>
                <DialogDescription>
                  Share mandi prices, ask disease diagnosis advice, or discuss farming practices
                </DialogDescription>
              </DialogHeader>
              
              {/* Author badge */}
              <div className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-lg border border-primary/20 text-xs text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-semibold">
                    {currentAuthorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>
                  Posting as <strong className="text-foreground">{currentAuthorName}</strong> ({currentAuthorState})
                </span>
                <span className="ml-auto text-[11px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Live
                </span>
              </div>

              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Tomato mandi prices surge in Kolar / How to treat leaf curl?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="crop">Related Crop (Optional)</Label>
                    <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a crop" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None / General</SelectItem>
                        {crops.map((crop) => (
                          <SelectItem key={crop.id} value={crop.name}>
                            {crop.icon} {crop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Provide details, rates, locations, or specific questions for fellow farmers..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost} disabled={submitting}>
                  {submitting ? "Publishing..." : "Publish Discussion"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className="whitespace-nowrap"
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No posts yet in this category
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  Be the first to post!
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card
                key={post.id}
                className="hover:shadow-md transition-all cursor-pointer border-border/80 hover:border-primary/40"
                onClick={() => handleOpenDiscussion(post)}
              >
                <CardContent className="p-5 md:p-6">
                  <div className="flex gap-4">
                    {/* Author Avatar */}
                    <Avatar className="h-10 w-10 shrink-0 bg-primary/10">
                      <AvatarFallback className="font-semibold text-primary">
                        {post.user?.full_name?.charAt(0) || "F"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {post.is_pinned && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-amber-500 hover:bg-amber-600">
                                <Pin className="h-2.5 w-2.5 mr-0.5" /> Pinned
                              </Badge>
                            )}
                            <h3 className="font-semibold text-foreground text-base hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                            <span className="font-medium text-foreground/80">
                              {post.user?.full_name || "Farmer"}
                            </span>
                            {post.state && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-primary" />
                                  {post.state}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(new Date(post.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {CATEGORIES.find((c) => c.value === post.category)?.label || post.category}
                          </Badge>
                          {post.crop && (
                            <Badge variant="outline" className="text-xs">
                              {post.crop}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-foreground/90 line-clamp-2 mb-3 mt-1 leading-relaxed">
                        {post.content}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post.id);
                          }}
                        >
                          <ThumbsUp
                            className={`h-3.5 w-3.5 mr-1.5 ${
                              likedPosts.has(post.id)
                                ? "fill-primary text-primary"
                                : ""
                            }`}
                          />
                          <span>{post.likes_count}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-primary font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDiscussion(post);
                          }}
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                          <span>{post.comments_count || 0} Replies</span>
                        </Button>

                        {(post.user_id === user?.id || post.id.startsWith("local_")) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(post.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Discussion / Message Dialog */}
        <Dialog open={discussionOpen} onOpenChange={setDiscussionOpen}>
          <DialogContent className="w-[94vw] sm:max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-2xl">
            {activePost && (
              <>
                <DialogHeader className="p-6 pb-3 border-b">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORIES.find((c) => c.value === activePost.category)?.label || activePost.category}
                        </Badge>
                        {activePost.crop && (
                          <Badge variant="outline" className="text-xs">
                            {activePost.crop}
                          </Badge>
                        )}
                        {activePost.state && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary" />
                            {activePost.state}
                          </span>
                        )}
                      </div>
                      <DialogTitle className="text-lg md:text-xl font-bold text-foreground leading-snug">
                        {activePost.title}
                      </DialogTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-bold">
                            {activePost.user?.full_name?.charAt(0) || "F"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">
                          {activePost.user?.full_name || "Farmer"}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(activePost.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-foreground/90 mt-3 whitespace-pre-line leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50">
                    {activePost.content}
                  </p>
                </DialogHeader>

                {/* Comments Thread */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[40vh]">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Discussion & Replies ({comments.length})
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleLike(activePost.id)}
                    >
                      <ThumbsUp
                        className={`h-3 w-3 mr-1 ${
                          likedPosts.has(activePost.id)
                            ? "fill-primary text-primary"
                            : ""
                        }`}
                      />
                      {activePost.likes_count} Likes
                    </Button>
                  </div>

                  {loadingComments ? (
                    <div className="space-y-3">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No replies yet. Be the first to share your input!
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex gap-3 text-sm p-3 rounded-lg bg-muted/40 border border-border/40"
                      >
                        <Avatar className="h-8 w-8 shrink-0 bg-primary/10">
                          <AvatarFallback className="text-xs font-semibold text-primary">
                            {comment.user?.full_name?.charAt(0) || "F"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-foreground">
                              {comment.user?.full_name || "Farmer"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Input Bar */}
                <div className="p-4 border-t bg-muted/20 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>Replying as: <strong className="text-foreground">{currentAuthorName}</strong></span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message or answer here..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={submittingComment || !newCommentText.trim()}
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4 mr-1.5" />
                      {submittingComment ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
