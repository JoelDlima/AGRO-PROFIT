# AgroProfit - Smart Mandi Price Comparison Platform
## Lenovo LEAP Program - Innovation Challenge

---

# 1. Program / Project Overview

## Introduction to the Project

**AgroProfit** is an AI-powered agricultural price comparison and decision support platform designed specifically for Indian farmers. The platform enables farmers to access real-time mandi (market) prices, compare rates across 500+ markets, track price trends, and make informed selling decisions to maximize their profits.

### Key Highlights:
- **Real-time Price Data**: Live prices from 500+ government mandis across India
- **Multi-language Support**: Available in English, Hindi, Marathi, and Konkani
- **AI-Powered Assistant**: Gemini AI chatbot for farming queries in local languages
- **Price Trend Analysis**: Historical price tracking with visual graphs
- **State-wise Price Map**: Compare prices across different Indian states
- **Export Reports**: Generate PDF/CSV reports for record-keeping

### Technology Stack:
| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| UI Framework | Tailwind CSS + Shadcn/UI |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| AI Integration | Google Gemini API |
| Authentication | Google OAuth + Phone OTP |
| Deployment | Vercel (Frontend) + Supabase (Backend) |
| Data Source | Government of India Open Data API (data.gov.in) |

## Objective of the Project

1. **Empower Farmers**: Provide farmers with real-time market intelligence to make better selling decisions
2. **Maximize Profits**: Help farmers find the best markets offering highest prices for their crops
3. **Bridge Information Gap**: Eliminate the information asymmetry between farmers and middlemen
4. **Enable Data-Driven Decisions**: Provide historical price trends for planning harvest timing
5. **Simplify Access**: Make technology accessible through multi-language support and simple UI

---

# 2. Problem Statement

## Clear Definition of the Problem Being Addressed

### The Core Problem:
**Indian farmers lose 15-25% of their potential income due to lack of real-time market price information**, leading to:

1. **Selling at Wrong Time**: Farmers often sell immediately after harvest when prices are lowest
2. **Selling at Wrong Place**: Farmers sell at nearby mandis without knowing better prices exist elsewhere
3. **Information Asymmetry**: Middlemen have price information that farmers don't have access to
4. **Language Barriers**: Most agricultural apps are in English, excluding 70% of rural farmers
5. **Complex Technology**: Existing solutions are too complicated for farmers with limited digital literacy

### Statistics Highlighting the Problem:

| Problem Area | Impact |
|--------------|--------|
| Post-harvest losses in India | ₹92,651 crore annually |
| Farmers without market price access | ~60% of small farmers |
| Price difference between mandis | Up to 40% for same crop |
| Farmers who sell to middlemen | ~85% (losing 15-30% margin) |
| Rural internet users comfortable with English | Less than 30% |

### Current Challenges Faced by Farmers:

```
┌─────────────────────────────────────────────────────────────┐
│                    FARMER'S DAILY STRUGGLE                   │
├─────────────────────────────────────────────────────────────┤
│  "Which mandi has the best price today?"                    │
│  "Should I sell now or wait for prices to rise?"            │
│  "I don't understand English apps"                          │
│  "How do I know if the middleman is giving fair price?"     │
│  "What government schemes am I eligible for?"               │
└─────────────────────────────────────────────────────────────┘
```

## Importance and Relevance of the Problem

### Why This Problem Matters:

1. **Economic Impact**: Agriculture contributes 18% to India's GDP and employs 42% of workforce
2. **Livelihood**: 120+ million farming households depend on fair crop prices
3. **Food Security**: Farmer welfare directly impacts national food security
4. **Rural Development**: Increasing farmer income drives rural economic growth
5. **Digital India Mission**: Aligns with government's vision of digital empowerment

### Relevance in Today's Context:

- **Government's eNAM Initiative**: Push for digital agricultural markets
- **PM-KISAN & Other Schemes**: Farmers need awareness about benefits
- **Climate Change**: Price volatility increasing; farmers need better planning tools
- **Mobile Penetration**: 750+ million smartphone users in India; opportunity for digital solutions
- **COVID-19 Impact**: Highlighted need for digital market access

---

# 3. Proposed Solution

## Description of the Solution

### AgroProfit - A Complete Farmer Decision Support System

```
┌────────────────────────────────────────────────────────────────┐
│                      AGROPROFIT PLATFORM                        │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │   COMPARE    │  │    TRACK     │  │   ASK AI     │         │
│   │   PRICES     │  │   TRENDS     │  │  ASSISTANT   │         │
│   │  500+ Mandis │  │  7-14 Days   │  │  In Hindi    │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │  STATE MAP   │  │   EXPORT     │  │  COMMUNITY   │         │
│   │  Price View  │  │   REPORTS    │  │    FORUM     │         │
│   │  All India   │  │  PDF/CSV     │  │   Discuss    │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### Core Features:

#### 1. Real-Time Price Comparison
- Live prices from 500+ government mandis
- Filter by crop, state, and sort by best price or nearest location
- Shows price range (min/max/modal) for each market
- Distance calculation from farmer's location

#### 2. Price Trend Analysis
- Historical price graphs (7-day and 14-day views)
- Visual indicators for rising/falling/stable trends
- Helps farmers decide optimal selling time

#### 3. AI-Powered Chatbot (Gemini Integration)
- Voice input support for farmers who can't type
- Answers in Hindi, Marathi, Konkani, and English
- Provides advice on:
  - Best selling time and place
  - Crop diseases and solutions
  - Government schemes eligibility
  - Weather impact on prices

#### 4. State-wise Price Map
- Visual comparison of prices across all Indian states
- Helps identify high-paying markets in other states

#### 5. Export Price Reports
- Generate PDF reports with price data
- CSV export for record-keeping
- Shareable with other farmers

#### 6. Multi-Language Support
- English, Hindi (हिंदी), Marathi (मराठी), Konkani (कोंकणी)
- Complete UI translation including all labels and messages

## Justification for Choosing This Approach

### Why Web-Based Progressive Web App (PWA)?

| Approach | Pros | Cons | Our Choice |
|----------|------|------|------------|
| Native Android App | Better performance | Requires download, storage | ❌ |
| SMS-based System | Works on feature phones | Limited functionality | ❌ |
| **Web App (PWA)** | **No download, works offline, cross-platform** | **Needs internet for first load** | ✅ |

### Why These Technology Choices?

1. **React + TypeScript**: Fast, reliable, maintainable code
2. **Supabase**: Free tier sufficient for MVP, easy scaling
3. **Government API**: Authentic, reliable data source
4. **Gemini AI**: Best multilingual support, free tier available
5. **Vercel Deployment**: Free hosting, automatic deployments

### Why Multi-Language First?

- 70% of rural India doesn't use English
- Voice input removes typing barrier
- Local language builds trust with farmers

---

# 4. Project Implementation

## Methodology and Implementation Details

### Development Methodology: Agile with User-Centric Design

```
┌─────────────────────────────────────────────────────────────┐
│                   DEVELOPMENT PHASES                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Phase 1          Phase 2          Phase 3          Phase 4  │
│  ┌──────┐        ┌──────┐        ┌──────┐        ┌──────┐   │
│  │Research│  →   │Design │   →   │Develop│   →   │Deploy │   │
│  │& Plan │       │  UI   │       │& Test │       │& Scale│   │
│  └──────┘        └──────┘        └──────┘        └──────┘   │
│                                                               │
│  - User research  - Wireframes    - Frontend      - Vercel   │
│  - API study      - Component     - Backend       - Supabase │
│  - Tech stack     - Translations  - Integration   - Monitor  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│                    (React + Tailwind CSS)                        │
│         Vercel Edge Network - Global CDN Distribution            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Authentication │  │  PostgreSQL DB  │  │ Edge Functions  │  │
│  │  Google OAuth   │  │  - profiles     │  │  - gemini-chat  │  │
│  │  Phone OTP      │  │  - price_history│  │  - weather      │  │
│  │                 │  │  - mandi_cache  │  │  - fetch-prices │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL APIs                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Government     │  │   Gemini AI     │  │   OpenWeather   │  │
│  │  data.gov.in    │  │   (Google)      │  │     API         │  │
│  │  Mandi Prices   │  │   Chatbot       │  │   Weather Data  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Core Tables

profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  state TEXT,
  crops TEXT[],
  preferred_language TEXT DEFAULT 'en'
)

price_history (
  id SERIAL PRIMARY KEY,
  commodity TEXT,
  state TEXT,
  market TEXT,
  modal_price NUMERIC,
  recorded_date DATE,
  -- Used for trend graphs
)

mandi_prices_cache (
  id SERIAL PRIMARY KEY,
  commodity TEXT,
  state TEXT,
  market TEXT,
  modal_price NUMERIC,
  fetched_at TIMESTAMP,
  -- Used for real-time price display
)
```

### API Security Implementation

```
┌─────────────────────────────────────────────────────────────┐
│              SECURE API ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (Browser)                                          │
│       │                                                       │
│       │ (No API keys exposed)                                │
│       ▼                                                       │
│  Supabase Edge Function                                      │
│       │                                                       │
│       │ (API keys stored as secrets)                         │
│       ▼                                                       │
│  External APIs (Gemini, Weather, Govt)                       │
│                                                               │
│  ✅ Keys never visible in browser                            │
│  ✅ Rate limiting at edge function level                     │
│  ✅ Request validation before forwarding                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Automated Data Collection (Cron Job)

```sql
-- Runs every 12 hours automatically
SELECT cron.schedule(
  'sync-mandi-prices',
  '30 0,12 * * *',  -- 6 AM and 6 PM IST
  $$ 
    SELECT net.http_post(
      url := '.../sync-prices-cron',
      headers := '{"Authorization": "Bearer ..."}'
    );
  $$
);

-- Syncs all 34 crops:
-- Vegetables, Fruits, Grains, Pulses
-- Stores in price_history for trend analysis
```

---

# 5. Project Explanation

## Detailed Walkthrough of the Project

### User Journey Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                       USER JOURNEY                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  1. LANDING PAGE                                                  │
│     ┌─────────────────────────────────────────┐                   │
│     │  "Get Better Prices 💰"                 │                   │
│     │  [GIF: Price Checking Demo]             │                   │
│     │  [GIF: Trend Graph Demo]                │                   │
│     │  [GIF: AI Chatbot Demo]                 │                   │
│     │                                          │                   │
│     │  [Start Now - Free] Button              │                   │
│     └─────────────────────────────────────────┘                   │
│                         │                                          │
│                         ▼                                          │
│  2. AUTHENTICATION                                                │
│     ┌─────────────────────────────────────────┐                   │
│     │  [Continue with Google]                 │                   │
│     │         OR                              │                   │
│     │  [Login with Phone + OTP]               │  ← For farmers    │
│     │   without Gmail                         │                   │
│     └─────────────────────────────────────────┘                   │
│                         │                                          │
│                         ▼                                          │
│  3. DASHBOARD                                                     │
│     ┌─────────────────────────────────────────┐                   │
│     │  "Namaste, [Name]!"                     │                   │
│     │                                          │                   │
│     │  Weather: 28°C, Partly Cloudy           │                   │
│     │  My Crops: Tomato, Onion, Wheat         │                   │
│     │                                          │                   │
│     │  Top Markets Today:                     │                   │
│     │  - Azadpur: ₹2500/q (Tomato)           │                   │
│     │  - Lasalgaon: ₹3200/q (Onion)          │                   │
│     └─────────────────────────────────────────┘                   │
│                         │                                          │
│           ┌─────────────┼─────────────┐                           │
│           ▼             ▼             ▼                           │
│  4A. PRICES      4B. TRENDS      4C. AI HELP                     │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                       │
│  │Compare  │    │ Graph   │    │ Chat    │                       │
│  │500+     │    │ 7-14    │    │ Voice   │                       │
│  │Markets  │    │ Days    │    │ Hindi   │                       │
│  └─────────┘    └─────────┘    └─────────┘                       │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Feature Screenshots & Descriptions

#### Feature 1: Price Comparison
```
┌─────────────────────────────────────────────────────────────┐
│  Compare Prices                                              │
│  Find the best market to sell your crops                     │
├─────────────────────────────────────────────────────────────┤
│  Select Crop: [🍅 Tomato          ▼]                        │
│                                                               │
│  Markets: 200    Highest: ₹15000    Avg: ₹3594              │
│                                                               │
│  Sort By: [Best Price] [Nearest] | [Per Quintal] [Per Kg]   │
├─────────────────────────────────────────────────────────────┤
│  ⭐ Kamakhyanagar APMC          [Best Price]                │
│     Dhenkanal, Odisha | 639km                               │
│     Modal: ₹15000  |  Range: ₹15000-₹15000                  │
│     Current: ₹15000/quintal  +317% vs avg    [Trends →]     │
├─────────────────────────────────────────────────────────────┤
│  ⭐ Azadpur Mandi                                            │
│     Delhi | 45km                                             │
│     Modal: ₹12500  |  Range: ₹10000-₹15000                  │
│     Current: ₹12500/quintal  +247% vs avg    [Trends →]     │
└─────────────────────────────────────────────────────────────┘
```

#### Feature 2: Price Trends
```
┌─────────────────────────────────────────────────────────────┐
│  Price Trends                                                │
│  Track price movements and plan your sales                   │
├─────────────────────────────────────────────────────────────┤
│  Select Crop: [🍅 Tomato ▼]    Time: [7 Days] [14 Days]     │
├─────────────────────────────────────────────────────────────┤
│  Current Price    Highest      Lowest       Average         │
│     ₹3727         ₹3806        ₹3271        ₹3601           │
│     per kg        in period    in period    in period       │
│     ↗ +14%                                                   │
├─────────────────────────────────────────────────────────────┤
│                   🍅 Tomato Price Trend                      │
│                   Last 14 days modal prices                  │
│                                                               │
│  ₹4000 ┤                          ╭──────╮                   │
│        │                    ╭────╯      │                    │
│  ₹3500 ┤              ╭────╯            ╰────╮               │
│        │         ╭───╯                       ╰──             │
│  ₹3000 ┤    ╭───╯                                            │
│        │───╯                                                  │
│  ₹2500 ┼────┬────┬────┬────┬────┬────┬────┬────┬────        │
│        Dec 6  8   10   12   14   16   18   20                │
└─────────────────────────────────────────────────────────────┘
```

#### Feature 3: AI Assistant
```
┌─────────────────────────────────────────────────────────────┐
│  ✨ AI Assistant                                             │
│  Ask anything about farming, prices, or schemes              │
├─────────────────────────────────────────────────────────────┤
│  Quick Questions:                                            │
│  [Where should I sell tomatoes today?]                       │
│  [Best time to sell onions this week?]                       │
│  [Tell me about PM-KISAN scheme]                             │
├─────────────────────────────────────────────────────────────┤
│  🤖 Namaste!                                                 │
│                                                               │
│  I'm AgroProfit AI, your farming assistant. I can help:     │
│                                                               │
│  • Market Prices - Compare mandi rates                       │
│  • Selling Advice - Best time and place to sell              │
│  • Crop Information - Varieties and best practices           │
│  • Weather Impact - How weather affects your decisions       │
│  • Government Schemes - Available benefits and subsidies     │
│                                                               │
│  Please ask me anything specific about your farming needs!   │
├─────────────────────────────────────────────────────────────┤
│  [Ask about prices, farming tips, schemes...] [🎤] [➤]      │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Language Support Demo

| Screen Element | English | Hindi | Marathi | Konkani |
|----------------|---------|-------|---------|---------|
| Welcome | Namaste | नमस्ते | नमस्कार | नमस्कार |
| Check Prices | Check Prices | भाव देखें | भाव पहा | भाव पळयात |
| Start Free | Start Free | शुरू करें | मोफत सुरू करा | फुकट सुरू करात |
| Get Better Prices | Get Better Prices | अच्छे दाम पाएं | चांगले भाव मिळवा | बरे भाव मेळयात |

---

# 6. Future Scope

## Possible Future Enhancements and Advancements

### Short-Term Roadmap (3-6 Months)

| Feature | Description | Impact |
|---------|-------------|--------|
| **Offline Mode** | Cache prices for areas with poor connectivity | Reach 30% more farmers |
| **SMS Alerts** | Price alerts via SMS for feature phones | Include non-smartphone users |
| **Weather Integration** | Detailed weather forecasts with farming advice | Better harvest planning |
| **Transport Cost Calculator** | Include transport costs in price comparison | More accurate profit calculation |
| **More Languages** | Add Tamil, Telugu, Kannada, Bengali | Expand to South & East India |

### Medium-Term Roadmap (6-12 Months)

```
┌─────────────────────────────────────────────────────────────┐
│                    FUTURE FEATURES                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. AI PRICE PREDICTION                                      │
│     ┌─────────────────────────────────────────┐             │
│     │  "Based on weather and market trends,   │             │
│     │   tomato prices expected to rise 15%    │             │
│     │   in next 7 days. Consider waiting."    │             │
│     └─────────────────────────────────────────┘             │
│                                                               │
│  2. BUYER-SELLER MARKETPLACE                                 │
│     ┌─────────────────────────────────────────┐             │
│     │  Direct connection between farmers      │             │
│     │  and buyers, eliminating middlemen      │             │
│     └─────────────────────────────────────────┘             │
│                                                               │
│  3. CROP ADVISORY                                            │
│     ┌─────────────────────────────────────────┐             │
│     │  - Disease detection from photos        │             │
│     │  - Pest management recommendations      │             │
│     │  - Fertilizer and irrigation advice     │             │
│     └─────────────────────────────────────────┘             │
│                                                               │
│  4. FINANCIAL SERVICES                                       │
│     ┌─────────────────────────────────────────┐             │
│     │  - Crop insurance integration           │             │
│     │  - Micro-loans for farmers              │             │
│     │  - Digital payment solutions            │             │
│     └─────────────────────────────────────────┘             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Long-Term Vision (1-3 Years)

1. **Satellite Imagery Integration**
   - Crop health monitoring
   - Yield prediction
   - Soil analysis

2. **Blockchain for Traceability**
   - Farm-to-table tracking
   - Premium pricing for verified organic produce
   - Export quality certification

3. **IoT Sensor Integration**
   - Soil moisture sensors
   - Weather stations
   - Automated irrigation advice

4. **Government Integration**
   - Direct benefit transfer integration
   - eNAM (National Agriculture Market) API
   - Automatic scheme enrollment

### Scalability Plan

```
Current State → 6 Months → 12 Months → 24 Months
     ↓              ↓           ↓           ↓
  1 State      5 States    All India    International
 (Maharashtra)  (Western)   (28 States)  (Nepal, Bangladesh)
     ↓              ↓           ↓           ↓
  100 Users    10K Users   100K Users    1M Users
```

---

# 7. Conclusion & Summary

## Key Learnings

### Technical Learnings

1. **Full-Stack Development**
   - React + TypeScript for type-safe frontend
   - Supabase for scalable backend
   - Edge Functions for secure API handling

2. **API Integration**
   - Government Open Data API usage
   - AI (Gemini) integration for multilingual support
   - Weather API integration

3. **Security Best Practices**
   - API keys hidden in Edge Functions
   - Row Level Security (RLS) in database
   - Secure authentication with OAuth + OTP

4. **DevOps & Deployment**
   - CI/CD with GitHub + Vercel
   - Automated cron jobs with pg_cron
   - Database migrations management

### Business/Domain Learnings

1. **User-Centric Design**
   - Farmers prefer simple, visual interfaces
   - Multi-language is essential, not optional
   - Voice input removes typing barriers

2. **Agricultural Domain Knowledge**
   - Mandi system and APMC structure
   - Price volatility patterns
   - Government schemes landscape

3. **Real-World Impact**
   - Technology can bridge information gaps
   - Small improvements can have large economic impact
   - Accessibility is key for rural adoption

## Project Summary

### What We Built
A comprehensive agricultural decision support platform that helps Indian farmers:
- ✅ Compare prices across 500+ mandis in real-time
- ✅ Track price trends to plan optimal selling time
- ✅ Get AI-powered advice in their local language
- ✅ Access government scheme information
- ✅ Generate exportable price reports

### Problem Solved
Bridged the information gap between farmers and markets, enabling data-driven selling decisions that can increase farmer income by 15-25%.

### Impact Potential
```
┌─────────────────────────────────────────────────────────────┐
│                    POTENTIAL IMPACT                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  👨‍🌾 Target Users: 120 million+ farming households          │
│                                                               │
│  💰 Potential Income Increase: ₹15,000-25,000/farmer/year   │
│                                                               │
│  🌍 Addressable Market: ₹40+ lakh crore agricultural output │
│                                                               │
│  📱 Accessibility: Works on any smartphone with internet     │
│                                                               │
│  🗣️ Languages: 4 (expandable to 22 official languages)      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Final Thoughts

> *"The Indian farmer is the backbone of our nation. By giving them access to real-time market information in their own language, we're not just building an app – we're empowering millions of families to make better decisions and improve their livelihoods."*

---

## Live Demo

🌐 **Website**: https://agro-profit-pro.vercel.app

📱 **Scan to Access**:
[QR Code would go here]

---

## Team

**Project Name**: AgroProfit  
**Program**: Lenovo LEAP Innovation Challenge  
**Technology Partner**: Lenovo  

---

*Thank you for your attention!*

**Questions?**
