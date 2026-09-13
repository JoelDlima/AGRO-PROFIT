import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  TrendingUp, 
  Users,
  Pin,
  Calendar,
  MapPin,
  Trash2
} from "lucide-react";
import { 
  getForumPosts, 
  createForumPost, 
  togglePostLike,
  hasUserLikedPost,
  deletePost,
  type ForumPost 
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
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [selectedCrop, setSelectedCrop] = useState("none");
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  useEffect(() => {
    if (posts.length > 0 && user) {
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
        title: "Error",
        description: "Failed to load forum posts",
        variant: "destructive",
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
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create a post",
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createForumPost(
        title, 
        content, 
        category, 
        selectedCrop && selectedCrop !== 'none' ? selectedCrop : undefined,
        profile?.state || undefined
      );
      toast({
        title: "Post created!",
        description: "Your post has been published to the community",
      });
      setDialogOpen(false);
      setTitle("");
      setContent("");
      setCategory("general");
      setSelectedCrop("none");
      await loadPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      console.error("Error creating post:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(postId: string) {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
      });
      return;
    }

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
            ? { ...p, likes_count: p.likes_count + (isLiked ? 1 : -1) }
            : p
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  }
  async function handleDelete(postId: string) {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deletePost(postId);
      toast({
        title: "Post deleted",
        description: "Your post has been removed",
      });
      // Remove post from local state
      setPosts((prev) => prev.filter((p) => p.id !== postId));
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Community Forum
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Connect with farmers, share insights, and learn together
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create a New Post</DialogTitle>
                <DialogDescription>
                  Share your thoughts, ask questions, or start a discussion
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="What's on your mind?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
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
                      <SelectItem value="none">None</SelectItem>
                      {crops.map((crop) => (
                        <SelectItem key={crop.id} value={crop.name}>
                          {crop.icon} {crop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your thoughts, experiences, or questions..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost} disabled={submitting}>
                  {submitting ? "Publishing..." : "Publish Post"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
                className="hover:shadow-lg transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Author Avatar */}
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback>
                        {post.user?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {post.is_pinned && (
                              <Pin className="h-4 w-4 text-primary" />
                            )}
                            <h3 className="font-semibold text-foreground">
                              {post.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{post.user?.full_name || "Anonymous"}</span>
                            {post.state && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
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
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {CATEGORIES.find((c) => c.value === post.category)
                              ?.label || post.category}
                          </Badge>
                          {post.crop && (
                            <Badge variant="outline">{post.crop}</Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-foreground line-clamp-2 mb-3">
                        {post.content}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post.id);
                          }}
                        >
                          <ThumbsUp
                            className={`h-4 w-4 mr-1 ${
                              likedPosts.has(post.id)
                                ? "fill-primary text-primary"
                                : ""
                            }`}
                          />
                          {post.likes_count}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.comments_count}
                        </Button>
                        {user && post.user_id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(post.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>
    </AppLayout>
  );
}
