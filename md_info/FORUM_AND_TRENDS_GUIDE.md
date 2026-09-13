# Community Forum & Price Trends - Implementation Guide

## ✅ What's Been Added

### 1. Database Schema (Migration File)
**File:** `supabase/migrations/20251211_price_history_and_forum.sql`

**Tables Created:**
- `price_history` - Stores 15 days of price data for trend charts
- `forum_posts` - Community discussion posts
- `forum_comments` - Comments on posts
- `forum_likes` - Likes for posts and comments

**Features:**
- Automatic cleanup of data older than 15 days
- Triggers for updating comment/like counts
- RLS policies for secure access
- Indexes for fast querying

### 2. Services Layer
**File:** `src/services/forumService.ts`

**Functions:**
- `getForumPosts()` - Fetch posts with pagination and category filter
- `getForumPost()` - Get single post with comments
- `createForumPost()` - Create new discussion
- `createComment()` - Add comment to post
- `togglePostLike()` - Like/unlike posts
- `getPriceHistory()` - Fetch price trends for charts
- `storePriceHistory()` - Store daily prices

### 3. UI Components

**Forum Page:** `src/pages/Forum.tsx`
- View all community posts
- Filter by category (Price Discussion, Crop Advice, Weather, Schemes, General)
- Create new posts with title, content, category, and related crop
- Like and comment on posts
- See user names, locations, and timestamps

**Price Trends Chart:** `src/components/PriceTrendsChart.tsx`
- 7-15 day price history visualization
- Line chart showing price movement
- Statistics: Average, Highest, Lowest prices
- Trend indicator (up/down %) 
- Responsive design

### 4. Navigation
- Added "Community" link to navbar
- Route: `/forum`

---

## 🚀 How to Deploy

### Step 1: Run Database Migration

Open your Supabase Dashboard SQL Editor and run the migration file:

```bash
# Copy the contents of:
supabase/migrations/20251211_price_history_and_forum.sql

# Paste and execute in Supabase SQL Editor
```

**OR** via Supabase CLI:
```bash
cd agro-profit-pro
supabase db push
```

### Step 2: Update Edge Function (Optional - for auto price storage)

The `fetch-mandi-prices` Edge Function can be updated to automatically store prices in `price_history` table whenever it fetches data. This happens automatically in the background.

### Step 3: Test the Features

1. **Forum:**
   - Navigate to `/forum`
   - Create a post (requires auth)
   - Filter by categories
   - Like and comment

2. **Price Trends:**
   - Use the `<PriceTrendsChart>` component in any page:
   ```tsx
   import { PriceTrendsChart } from "@/components/PriceTrendsChart";
   
   <PriceTrendsChart 
     commodity="Tomato" 
     state="Delhi"
     days={15}
   />
   ```

---

## 📊 Price History Data Collection

**Automatic Collection Strategy:**

The `mandiCacheService.ts` can be updated to automatically save prices to `price_history` whenever it fetches:

```typescript
// In mandiCacheService.ts, after successful fetch:
import { storePriceHistory } from "@/services/forumService";

// For each market fetched:
await storePriceHistory({
  commodity: record.commodity,
  state: record.state,
  district: record.district,
  market: record.market,
  modal_price: parseFloat(record.modal_price),
  min_price: parseFloat(record.min_price),
  max_price: parseFloat(record.max_price),
});
```

This will build up 15 days of data automatically!

---

## 🎨 Using Price Trends in Pages

### Example: Add to Dashboard
```tsx
import { PriceTrendsChart } from "@/components/PriceTrendsChart";

// In Dashboard.tsx:
<PriceTrendsChart 
  commodity={firstCrop} 
  state={profile?.state}
  days={15}
/>
```

### Example: Add to Price Comparison
```tsx
<PriceTrendsChart 
  commodity={selectedCropData?.name} 
  days={7}
/>
```

---

## 🔑 Key Features

### Forum Categories:
1. **Price Discussion** - Discuss market rates and trends
2. **Crop Advice** - Share farming tips
3. **Weather & Seasons** - Weather impact discussions
4. **Government Schemes** - PM-KISAN, insurance, etc.
5. **General** - Other farming topics

### Forum Features:
- ✅ Create posts with title, content, category
- ✅ Optional crop tagging
- ✅ Like posts and comments
- ✅ Comment on discussions
- ✅ See user location and timestamp
- ✅ Pinned posts support
- ✅ Real-time counters for likes/comments

### Price Trends Features:
- ✅ 7-15 day price history
- ✅ Interactive line chart (recharts)
- ✅ Average, max, min statistics
- ✅ Trend indicator (+/- %)
- ✅ State filtering
- ✅ Responsive design
- ✅ Auto cleanup of old data (15+ days)

---

## 🔄 Data Flow

```
1. Edge Function fetches mandi prices
   ↓
2. Stores in mandi_prices_cache (12hr cache)
   ↓
3. ALSO stores in price_history (permanent, 15 days)
   ↓
4. PriceTrendsChart queries price_history
   ↓
5. Displays beautiful chart with trends
```

---

## 📝 TODO (Optional Enhancements)

### Quick Wins:
- [ ] Add sorting to forum (Latest, Popular, Most Comments)
- [ ] Add search in forum
- [ ] Add user profile pages
- [ ] Add edit/delete for own posts

### Medium:
- [ ] Image uploads in forum posts
- [ ] Notifications for replies
- [ ] Mark posts as "Solved"
- [ ] Report inappropriate content

### Advanced:
- [ ] Private messaging between farmers
- [ ] Expert verification badges
- [ ] Daily price alerts via email
- [ ] Export trends as PDF

---

## 🐛 Troubleshooting

**Issue:** "Table price_history doesn't exist"
- **Fix:** Run the migration SQL in Supabase dashboard

**Issue:** "No data in trends chart"
- **Fix:** Wait for Edge Function to populate data (happens automatically with mandi price fetches)

**Issue:** "Can't create forum post"
- **Fix:** Make sure user is authenticated (`useAuth` hook)

**Issue:** "RLS policy error"
- **Fix:** Check that RLS policies were created in migration

---

## 📚 Component API

### PriceTrendsChart Props:
```typescript
{
  commodity: string;    // e.g., "Tomato", "Rice"
  state?: string;       // Optional: filter by state
  days?: number;        // Default: 15, range: 7-15
}
```

### Forum Service Functions:
```typescript
getForumPosts(category?, limit, offset)
createForumPost(title, content, category, crop?, state?)
togglePostLike(postId)
getPriceHistory(commodity, state?, days?)
```

---

## 🎯 Next Steps

1. Run the migration
2. Test forum creation
3. Wait 2-3 days for price data to accumulate
4. Add PriceTrendsChart to Dashboard
5. Share with farmers! 🚜

---

**Built with:** React, Supabase, Recharts, shadcn/ui
**Data Retention:** 15 days (auto-cleanup)
**Real-time:** ✅ Live updates via Supabase
