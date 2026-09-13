# AgroProfit - Complete Documentation

**Smart Agriculture Platform for Indian Farmers**
- Live Demo: https://agro-profit-pro.vercel.app
- GitHub: https://github.com/JoelDlima/agro-profit-pro

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Setup Guide](#setup-guide)
3. [API Integration](#api-integration)
4. [Deployment](#deployment)
5. [Features](#features)
6. [Architecture](#architecture)

---

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Google OAuth credentials
- Gemini API key

### Installation
```bash
git clone https://github.com/JoelDlima/agro-profit-pro.git
cd agro-profit-pro
npm install
```

### Environment Setup
Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_OPENWEATHER_API_KEY=your_openweather_key (optional)
```

### Run Locally
```bash
npm run dev
```
Open http://localhost:8080

---

## Setup Guide

### 1. Supabase Database Setup

#### Required Tables

**profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  state TEXT,
  crops TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**mandi_prices_cache**
```sql
CREATE TABLE mandi_prices_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity VARCHAR(100),
  state VARCHAR(100),
  district VARCHAR(100),
  market VARCHAR(200),
  modal_price DECIMAL(10, 2),
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  arrival_date DATE,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(commodity, market, district, state, arrival_date)
);
```

**price_history**
```sql
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity TEXT,
  state TEXT,
  market TEXT,
  modal_price DECIMAL(10,2),
  recorded_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(commodity, state, market, recorded_date)
);
```

**forum_posts, forum_comments, forum_likes**
```sql
-- See full schema in Database section below
```

#### RLS Policies (IMPORTANT)

```sql
-- Allow public inserts for price tables (needed for background sync)
CREATE POLICY "Enable insert for all users" ON price_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON mandi_prices_cache
  FOR INSERT WITH CHECK (true);

-- Forum policies (user-specific)
CREATE POLICY "Enable insert for authenticated users only" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 2. Edge Functions

Deploy these functions to Supabase:

**fetch-mandi-prices** (bypasses CORS)
```typescript
// Located in: supabase/functions/fetch-mandi-prices/index.ts
// Fetches prices from government API
// Deploy: Manual via Supabase Dashboard → Functions
```

**sync-prices-cron** (automatic 12-hour sync)
```typescript
// Located in: supabase/functions/sync-prices-cron/index.ts
// Syncs all 34 crops automatically
// Deploy: Manual via Supabase Dashboard → Functions
```

### 3. Cron Job Setup

Enable pg_cron in Supabase:
1. Go to Database → Cron Jobs
2. Enable pg_cron extension
3. Create job:

```sql
SELECT cron.schedule(
  'sync-mandi-prices',
  '30 0,12 * * *',  -- 6 AM & 6 PM IST
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/sync-prices-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);
```

### 4. Google OAuth

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized origins:
   - http://localhost:8080
   - https://your-domain.vercel.app
4. Add redirect URIs:
   - https://YOUR_PROJECT.supabase.co/auth/v1/callback
   - https://your-domain.vercel.app/auth/callback
5. Copy Client ID and Secret to Supabase:
   - Supabase → Authentication → Providers → Google
   - Enable and paste credentials

---

## API Integration

### Government Mandi API
- **Source**: data.gov.in
- **Access**: Public (no key required)
- **Method**: Via Supabase Edge Function (bypasses CORS)
- **Rate Limit**: 1 req/sec recommended
- **Data**: 200+ markets, 34 crops, real-time prices

### OpenWeather API
- **Source**: openweathermap.org
- **Free Tier**: 1000 calls/day
- **Data**: Temperature, rainfall, humidity
- **Setup**: Get API key → add to `.env`

### Gemini AI
- **Source**: Google AI Studio
- **Free Tier**: 60 requests/min
- **Usage**: Chatbot, price recommendations
- **Setup**: Get API key → add to `.env`

### Data Flow
```
App Startup → backgroundSyncAllCrops()
  ↓
Supabase Edge Function (fetch-mandi-prices)
  ↓
Government API (data.gov.in)
  ↓
Store in mandi_prices_cache & price_history
  ↓
Display in Price Comparison & Trends
```

---

## Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Vercel**
   - Go to vercel.com/new
   - Import GitHub repo
   - Framework: Vite
   - Root: ./
   - Build: npm run build
   - Output: dist

3. **Add Environment Variables**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
VITE_OPENWEATHER_API_KEY
```

4. **Deploy** → Auto-deploys on every push

5. **Post-Deployment**
   - Update Google OAuth with Vercel URL
   - Update Supabase redirect URLs
   - Add Vercel URL to Site URL in Supabase

### Auto-Deploy Workflow
```
Local Changes → Git Push → GitHub
                    ↓
                 Vercel Auto-Build
                    ↓
               Live in ~2 minutes
```

---

## Features

### Core Features

**1. Price Comparison**
- Real-time prices from 200+ mandis
- Sort by price or distance
- View per quintal or per kg
- Filter by crop and state
- Distance calculation from user location

**2. Price Trends**
- 7-14 day historical charts
- Daily average price calculation
- Percentage change indicators
- Best time to sell recommendations
- Data accumulates over 2-3 days

**3. Community Forum**
- Create posts with categories
- Like and comment system
- Delete own posts
- Filter by crop, category, state
- Real-time updates

**4. AI Chatbot**
- Gemini-powered assistance
- Access to cached price data
- Multilingual support (Hindi, English)
- Farming advice and recommendations
- Government scheme information

**5. Dashboard**
- Quick price overview
- Market insights
- Weather widget
- Personalized crop prices
- Forum activity feed

### Technical Features

- **Background Price Sync**: Automatic 12-hour updates
- **Smart Caching**: 12-hour freshness check
- **Location Services**: GPS-based distance calculation
- **Dark Mode**: Default theme with toggle
- **Responsive**: Mobile-first design
- **PWA-Ready**: Can be installed as app

---

## Architecture

### Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + shadcn/ui
- React Router v6
- Recharts (graphs)

**Backend**
- Supabase (PostgreSQL + Auth)
- Edge Functions (Deno)
- Row Level Security (RLS)
- pg_cron (scheduled tasks)

**APIs**
- Government Mandi API (prices)
- Google Gemini (AI chatbot)
- OpenWeather (weather data)

### Database Schema

**Tables**: 7 total
1. profiles (user data)
2. mandi_prices_cache (latest prices, 7-day retention)
3. price_history (trends, 15-day retention)
4. forum_posts
5. forum_comments
6. forum_likes
7. auth.users (Supabase managed)

### Project Structure
```
agro-profit-pro/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # Route pages
│   ├── services/       # API clients
│   ├── hooks/          # React hooks
│   └── lib/            # Utils & translations
├── supabase/
│   ├── functions/      # Edge functions
│   └── migrations/     # SQL migrations
├── public/             # Static assets
└── md_info/            # Documentation
```

---

## Troubleshooting

### Common Issues

**403 Forbidden on Price Sync**
- Fix: Run RLS policy updates (see Setup Guide)
- Cause: Background sync needs public insert permissions

**Google OAuth 404**
- Fix: Wait 5 minutes after updating OAuth settings
- Fix: Add `vercel.json` with SPA rewrite rules
- Fix: Clear browser cache

**Trends Not Showing**
- Cause: Need 2-3 days of data accumulation
- Fix: Wait for automatic syncs or manually trigger
- Check: Database has entries in price_history table

**Cron Job Not Running**
- Fix: Enable pg_cron extension first
- Fix: Deploy Edge Function before creating cron
- Check: View cron.job_run_details for errors

---

## Development

### Available Scripts
```bash
npm run dev          # Start dev server (localhost:8080)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Adding New Crops
1. Update `src/data/mockData.ts`
2. Add to crops array with icon
3. Background sync picks up automatically

### Modifying Sync Interval
Edit cron schedule in Supabase:
```sql
'30 0,12 * * *'  -- Current: 6 AM & 6 PM
'0 * * * *'      -- Every hour
'0 0 * * *'      -- Daily at midnight
```

---

## Credits

- **Government Data**: data.gov.in
- **AI**: Google Gemini
- **Weather**: OpenWeather
- **Icons**: Lucide React
- **UI Components**: shadcn/ui

---

## License

MIT License - Feel free to use for educational/commercial purposes

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/JoelDlima/agro-profit-pro/issues
- Check documentation in `md_info/` folder

---

**Made with ❤️ for Indian Farmers** 🌾
