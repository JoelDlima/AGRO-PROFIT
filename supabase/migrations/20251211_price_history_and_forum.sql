-- ============================================
-- PRICE HISTORY TABLE (for 15-day trends)
-- ============================================

CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT,
  market TEXT NOT NULL,
  modal_price DECIMAL(10,2) NOT NULL,
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX idx_price_history_commodity ON price_history(commodity);
CREATE INDEX idx_price_history_date ON price_history(recorded_date DESC);
CREATE INDEX idx_price_history_composite ON price_history(commodity, state, recorded_date DESC);

-- Unique constraint to prevent duplicate entries per day
CREATE UNIQUE INDEX idx_price_history_unique ON price_history(commodity, state, market, recorded_date);

-- RLS Policies (public read access)
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON price_history
  FOR SELECT USING (true);

-- Cleanup old data (keep only 15 days)
CREATE OR REPLACE FUNCTION cleanup_old_price_history()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM price_history
  WHERE recorded_date < CURRENT_DATE - INTERVAL '15 days';
END;
$$;

-- ============================================
-- COMMUNITY FORUM TABLES
-- ============================================

-- Forum Posts
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'price-discussion', 'crop-advice', 'weather', 'schemes', 'general'
  crop TEXT, -- Optional: related crop
  state TEXT, -- Optional: user's state
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Comments
CREATE TABLE IF NOT EXISTS forum_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum Likes
CREATE TABLE IF NOT EXISTS forum_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_like_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Indexes for forum
CREATE INDEX idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_user ON forum_comments(user_id);
CREATE INDEX idx_forum_likes_user ON forum_likes(user_id);
CREATE UNIQUE INDEX idx_forum_likes_unique_post ON forum_likes(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX idx_forum_likes_unique_comment ON forum_likes(user_id, comment_id) WHERE comment_id IS NOT NULL;

-- RLS Policies for Forum
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;

-- Posts: Anyone can read, authenticated users can create
CREATE POLICY "Enable read access for all users" ON forum_posts
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON forum_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for post owners" ON forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for post owners" ON forum_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Comments: Anyone can read, authenticated users can create
CREATE POLICY "Enable read access for all users" ON forum_comments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON forum_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for comment owners" ON forum_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for comment owners" ON forum_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Likes: Users can manage their own likes
CREATE POLICY "Enable read access for all users" ON forum_likes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON forum_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for like owners" ON forum_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS FOR FORUM
-- ============================================

-- Update comment count when comment is added/removed
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_post_comment_count
AFTER INSERT OR DELETE ON forum_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Update like count when like is added/removed
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.post_id IS NOT NULL THEN
      UPDATE forum_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      UPDATE forum_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.post_id IS NOT NULL THEN
      UPDATE forum_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE forum_comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON forum_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_forum_posts_updated_at
BEFORE UPDATE ON forum_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_forum_comments_updated_at
BEFORE UPDATE ON forum_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
