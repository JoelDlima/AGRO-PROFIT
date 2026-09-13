# 🌾 AgroProfit - Intelligent Crop Market & Profit Optimization Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-green)](https://supabase.com/)

> Empowering Indian farmers with data-driven decisions through real-time market intelligence and AI-powered recommendations.

**🚀 Live Demo**: https://agro-profit-pro.vercel.app  
**📚 Full Documentation**: [md_info/COMPLETE_DOCUMENTATION.md](md_info/COMPLETE_DOCUMENTATION.md)

---

## 📖 Overview

**AgroProfit** is a comprehensive web platform designed to help Indian farmers maximize their crop selling profits. By integrating real government market data, AI-powered assistance, and multi-language support, we're bridging the information gap that costs farmers significant income.

### 🎯 The Problem
- 50%+ of India's workforce is in agriculture
- Farmers lack access to real-time mandi prices
- Dependence on middlemen leads to below-market sales
- Price information scattered across complex portals
- No simple tool for comparing markets and making decisions

### 💡 Our Solution
Transform raw agricultural data into actionable, farmer-friendly advice through:
- **Real-time price comparison** across multiple mandis
- **AI-powered recommendations** for best selling strategies  
- **Multi-language support** (English, Hindi, Marathi, Konkani)
- **Personalized dashboard** with user's crops and preferences
- **Simple, mobile-friendly** interface for rural communities

---

## ✨ Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 **Google Auth** | Secure authentication with auto-profile creation | ✅ Live |
| 📊 **Price Comparison** | Compare mandi prices across markets (sort by price/distance) | ✅ Live |
| 🤖 **AI Assistant** | Groq-powered chatbot for farming queries | ✅ Live |
| 📈 **Price Trends** | Historical price charts with 7-14 day data | ✅ Live |
| 🌐 **Multi-Language** | 4 languages with 420+ translations | ✅ Live |
| 👤 **User Profiles** | Personalized crop tracking and preferences | ✅ Live |
| 🌙 **Dark Mode** | Dark theme as default | ✅ Live |
| 📱 **Responsive** | Works on mobile, tablet, and desktop | ✅ Live |
| 💬 **Community Forum** | Share experiences, like and comment | ✅ Live |
| ⏰ **Auto Price Sync** | Automatic 12-hour price updates via cron | ✅ Live |


```bash
# Clone repository
git clone https://github.com/JoelDlima/agro-profit-pro.git
cd agro-profit-pro

# Install dependencies
npm install

# Create .env file (see below)

# Start development server
npm run dev
```

Open http://localhost:8080

---

## 🔧 Environment Setup

Create `.env` file in root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_OPENWEATHER_API_KEY=your_openweather_key  # Optional
```

---

## 📚 Documentation

All documentation has been organized in the **`md_info/`** folder:

- **[COMPLETE_DOCUMENTATION.md](md_info/COMPLETE_DOCUMENTATION.md)** - Full setup, deployment, and architecture guide
- **[SUPABASE_SETUP.md](md_info/SUPABASE_SETUP.md)** - Database schema and RLS policies
- **[CRON_SETUP.md](md_info/CRON_SETUP.md)** - Automatic price syncing configuration
- **[API_DETAILS.md](md_info/API_DETAILS.md)** - Government API, Groq AI, OpenWeather integration
- **[GOOGLE_OAUTH_SETUP.md](md_info/GOOGLE_OAUTH_SETUP.md)** - Authentication setup guide
- **[FORUM_AND_TRENDS_GUIDE.md](md_info/FORUM_AND_TRENDS_GUIDE.md)** - Feature implementation details
- **[PRESENTATION_GUIDE.md](md_info/PRESENTATION_GUIDE.md)** - Demo walkthrough

---

## 🛠️ Tech Stack

**Frontend**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui  
**Backend**: Supabase (PostgreSQL + Edge Functions + Auth)  
**APIs**: Government Mandi API, Groq AI, OpenWeather  
**Deployment**: Vercel (auto-deploy on push)

---

## 🏗️ Architecture

- **7 Database Tables**: profiles, mandi_prices_cache, price_history, forum_posts, forum_comments, forum_likes, auth.users
- **3 Edge Functions**: fetch-mandi-prices, fetch-rainfall, sync-prices-cron
- **Cron Jobs**: Automatic 12-hour price syncing (6 AM & 6 PM IST)
- **34 Crops**: Vegetables, Fruits, Grains, Pulses
- **200+ Markets**: Real-time government data

---

## 🚀 Deployment

Deployed on **Vercel**: https://agro-profit-pro.vercel.app

Auto-deploys on every GitHub push to `main` branch.

See [COMPLETE_DOCUMENTATION.md](md_info/COMPLETE_DOCUMENTATION.md) for detailed deployment steps.

---

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 🤝 Contributing

Contributions are welcome! Please submit a Pull Request or open an Issue.

---

## 📄 License

MIT License - Free for educational and commercial use

---

**Made with ❤️ for Indian Farmers** 🌾

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
