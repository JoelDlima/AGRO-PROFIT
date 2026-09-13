# 🌾 AgroProfit - Complete Setup Guide

## Project Overview

**AgroProfit** is an AI-powered platform that helps Indian farmers maximize crop selling profits using real government market data and intelligent recommendations.

### Key Features
- ✅ Real-time mandi (market) price comparison
- ✅ AI-powered farming assistant (Gemini)
- ✅ Price trend analysis
- ✅ Multi-language support (English, Hindi, Marathi, Konkani)
- ✅ Supabase authentication & profiles
- ✅ Dark/Light mode
- 🔄 Government scheme information
- 🔄 Weather-based recommendations

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **bun** package manager
- **Git** - [Download](https://git-scm.com/)
- A code editor (VS Code recommended)

---

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
git clone https://github.com/JoelDlima/agro-profit-pro.git
cd agro-profit-pro
```

### Step 2: Install Dependencies

```bash
npm install
# or
bun install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Supabase (already configured)
VITE_SUPABASE_PROJECT_ID="vkroiucdsnpeaiksenzm"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-key"
VITE_SUPABASE_URL="https://vkroiucdsnpeaiksenzm.supabase.co"

# Google Gemini AI
VITE_GEMINI_API_KEY="your-gemini-api-key"

# Government Data API
VITE_DATA_GOV_API_KEY="your-data-gov-api-key"
```

### Step 4: Run the Development Server

```bash
npm run dev
# or
bun dev
```

Visit: **http://localhost:5173**

---

## 🔑 Getting API Keys

### 1. Google Gemini API Key (FREE)

**Purpose:** Powers the AI chatbot assistant

**Steps:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the key and paste it in `.env` as `VITE_GEMINI_API_KEY`

**Limits:** 
- Free tier: 60 requests/minute
- 1500 requests/day

---

### 2. Data.gov.in API Key (FREE)

**Purpose:** Fetches live mandi prices from government databases

**Steps:**
1. Visit [data.gov.in](https://data.gov.in/)
2. Click "Register" in the top right
3. Fill in your details:
   - Name
   - Email
   - Organization (can be "Individual" or "Student")
   - Purpose: "Agricultural Research" or "Education"
4. Verify your email
5. Log in and go to **"My Profile"** → **"API Key"**
6. Copy your API key
7. Paste it in `.env` as `VITE_DATA_GOV_API_KEY`

**Limits:**
- 1000 requests/day
- No credit card required

**Important URLs:**
- Registration: https://data.gov.in/user/register
- API Docs: https://data.gov.in/help/how-use-datasets-apis

---

### 3. Supabase Setup (Already Configured)

Your Supabase project is already set up! But if you need to verify:

**Project Details:**
- URL: `https://vkroiucdsnpeaiksenzm.supabase.co`
- Project Dashboard: [Supabase Console](https://supabase.com/dashboard/project/vkroiucdsnpeaiksenzm)

**Database Schema:**
The `profiles` table is already created with:
- `id` (UUID, linked to auth.users)
- `full_name` (text)
- `phone` (text)
- `state` (text)
- `crops` (text array)
- `preferred_language` (text)
- `onboarding_completed` (boolean)
- Row Level Security (RLS) enabled

**Authentication:**
- Google OAuth is configured and working
- Auto-profile creation trigger is active

---

## 📁 Project Structure

```
agro-profit-pro/
├── src/
│   ├── pages/                  # All page components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── PriceComparison.tsx # Market price comparison
│   │   ├── PriceTrends.tsx     # Historical price charts
│   │   ├── Chatbot.tsx         # AI assistant (Gemini integrated)
│   │   ├── Profile.tsx         # User profile management
│   │   ├── Landing.tsx         # Landing page
│   │   └── Auth.tsx            # Google authentication
│   │
│   ├── services/               # API integrations
│   │   ├── geminiService.ts    # Google Gemini AI
│   │   └── agmarknetService.ts # Government mandi data
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.tsx         # Authentication hook
│   │   ├── useUserProfile.tsx  # User profile management
│   │   └── useTheme.tsx        # Theme & translations
│   │
│   ├── components/             # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # shadcn/ui components
│   │
│   ├── lib/
│   │   ├── translations.ts     # Multi-language support
│   │   └── utils.ts            # Utility functions
│   │
│   └── integrations/
│       └── supabase/           # Supabase client
│
├── supabase/
│   └── migrations/             # Database migrations
│
├── .env                        # Environment variables (DO NOT COMMIT)
├── .env.example               # Template for .env
├── package.json               # Dependencies
└── vite.config.ts             # Vite configuration
```

---

## 🎯 Features Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Google OAuth | ✅ Complete | Working with auto-profile creation |
| User Profiles | ✅ Complete | Full CRUD operations |
| Multi-language | ✅ Complete | EN, HI, MR, Konkani |
| Dark/Light Mode | ✅ Complete | Persistent theme |
| AI Chatbot | ✅ Integrated | Uses Gemini API |
| Landing Page | ✅ Complete | Responsive with animations |
| Dashboard | ✅ Complete | Personalized greetings |
| Price Comparison | 🔄 Ready for API | UI complete, needs API key |
| Price Trends | 🔄 Ready for API | Charts ready, needs data |
| Government Schemes | 📝 Planned | Coming soon |
| Weather Integration | 📝 Planned | Future feature |

---

## 🧪 Testing the Application

### 1. Test Authentication
1. Go to http://localhost:5173
2. Click "Get Started"
3. Sign in with Google
4. Profile should be auto-created

### 2. Test Chatbot (Gemini AI)
1. Navigate to "AI Assistant" page
2. Try asking:
   - "What's the best price for tomatoes today?"
   - "Tell me about PM-KISAN scheme"
   - "Where should I sell onions?"

### 3. Test Profile Management
1. Go to "Profile" page
2. Update your name, phone, state
3. Add crops you grow
4. Save changes

### 4. Test Language Switching
1. Click the floating language selector (globe icon)
2. Switch between EN, HI, MR, Konkani
3. UI should update immediately

---

## 🔧 Troubleshooting

### Issue: "API Key not configured" in Chatbot

**Solution:**
1. Make sure `.env` file exists
2. Add your Gemini API key: `VITE_GEMINI_API_KEY="your-key"`
3. Restart dev server (`npm run dev`)

### Issue: No mandi prices showing

**Solution:**
1. Add Data.gov.in API key to `.env`
2. The free tier allows 1000 requests/day
3. Check browser console for errors

### Issue: Google OAuth not working

**Solution:**
1. Check Supabase dashboard → Authentication → Providers
2. Ensure Google is enabled
3. Verify redirect URLs are correct

### Issue: Database errors

**Solution:**
1. Go to Supabase dashboard
2. SQL Editor → Run migration files
3. Check Row Level Security policies

---

## 📦 Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

The build will be in the `dist/` folder.

---

## 🚀 Deployment

### Deploy to Netlify (Recommended)

1. Push your code to GitHub
2. Connect your repo to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

**Build settings:**
- Build command: `npm run build`
- Publish directory: `dist`

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Add environment variables in Vercel dashboard

---

## 🌐 API Documentation

### Agmarknet API

**Endpoint:**
```
https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
```

**Example Request:**
```
GET https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
?api-key=YOUR_KEY
&format=json
&filters[commodity]=Tomato
&filters[state]=Maharashtra
&limit=10
```

**Response:**
```json
{
  "records": [
    {
      "state": "Maharashtra",
      "district": "Nashik",
      "market": "Lasalgaon",
      "commodity": "Tomato",
      "min_price": "35",
      "max_price": "55",
      "modal_price": "45",
      "arrival_date": "2025-12-08"
    }
  ]
}
```

### Gemini API

**Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

**Example Request:**
```json
{
  "contents": [{
    "parts": [{"text": "What's the best time to sell wheat?"}]
  }]
}
```

---

## 🎓 Learning Resources

- [Supabase Docs](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Data.gov.in Help](https://data.gov.in/help)
- [React Query](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Review browser console errors
3. Check Supabase logs
4. Verify all API keys are correct
5. Open an issue on GitHub

---

## 📄 License

This project is for educational purposes. All government data is subject to data.gov.in terms of use.

---

## 🎯 Next Steps

1. **Get API Keys** (30 minutes)
   - Gemini: https://makersuite.google.com/app/apikey
   - Data.gov.in: https://data.gov.in/user/register

2. **Test Locally** (10 minutes)
   - Run `npm run dev`
   - Test all features

3. **Deploy** (15 minutes)
   - Push to GitHub
   - Deploy to Netlify/Vercel

4. **Customize** (ongoing)
   - Add more crops
   - Improve UI/UX
   - Add weather features

---

## 📊 Project Stats

- **Lines of Code:** ~3,500
- **Components:** 35+
- **Pages:** 8
- **Languages Supported:** 4
- **APIs Integrated:** 2 (Gemini, Agmarknet)

---

**Built with ❤️ for Indian Farmers**

🌾 Empowering agriculture through technology
