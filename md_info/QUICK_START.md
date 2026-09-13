# ⚡ Quick Start Checklist for AgroProfit

## 🎯 Goal: Get Your App Running in 30 Minutes

---

## ✅ Step 1: Verify Prerequisites (5 minutes)

### Required Software
- [ ] Node.js installed (v18+)
  - Check: `node --version`
  - Install from: https://nodejs.org/

- [ ] npm or bun installed
  - Check: `npm --version`

- [ ] Git installed
  - Check: `git --version`

### Repository Ready
- [ ] Project cloned to your machine
- [ ] Terminal/Command Prompt open in project folder
- [ ] Code editor open (VS Code recommended)

---

## ✅ Step 2: Install Dependencies (3 minutes)

```bash
# Run this command in your project folder
npm install
```

**Expected:** Should see "added X packages" message

**If error:** Try `npm install --legacy-peer-deps`

---

## ✅ Step 3: Set Up Environment Variables (5 minutes)

### Create .env file
```bash
# Copy the example file
cp .env.example .env
```

### Edit .env file
Open `.env` in your editor and verify these are present:

```env
# ✅ Already configured - no changes needed
VITE_SUPABASE_PROJECT_ID="vkroiucdsnpeaiksenzm"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGci..."
VITE_SUPABASE_URL="https://vkroiucdsnpeaiksenzm.supabase.co"

# 🔑 Add these keys (get them in next steps)
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
VITE_DATA_GOV_API_KEY="YOUR_DATA_GOV_API_KEY_HERE"
```

---

## ✅ Step 4: Get API Keys (10 minutes)

### A. Google Gemini API Key (5 minutes)

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the key
5. Paste in `.env` as `VITE_GEMINI_API_KEY="your-actual-key"`

**Status:** 
- [ ] Key obtained
- [ ] Added to .env file
- [ ] No quotes or spaces around key

---

### B. Data.gov.in API Key (5 minutes)

1. Go to: https://data.gov.in/user/register
2. Fill registration form:
   - Name: [Your name]
   - Email: [Your email]
   - Organization: "Student" or "Individual"
   - Purpose: "Agricultural Research"
3. Verify email (check spam folder)
4. Login at: https://data.gov.in/user/login
5. Go to: My Profile → API Key
6. Copy your API key
7. Paste in `.env` as `VITE_DATA_GOV_API_KEY="your-actual-key"`

**Status:**
- [ ] Account created
- [ ] Email verified
- [ ] Key obtained
- [ ] Added to .env file

---

## ✅ Step 5: Start Development Server (2 minutes)

```bash
npm run dev
```

**Expected output:**
```
VITE v5.x.x ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Status:**
- [ ] Server started without errors
- [ ] Can open http://localhost:5173

**If port 5173 is busy:**
Server will use next available port (5174, 5175, etc.)

---

## ✅ Step 6: Test the Application (5 minutes)

### Test 1: Landing Page
- [ ] Open http://localhost:5173
- [ ] See hero section with "AgroProfit" title
- [ ] Scroll down to see features
- [ ] Click "Get Started" button

**Expected:** Should navigate to /auth page

---

### Test 2: Authentication
- [ ] On /auth page, see "Sign in with Google" button
- [ ] Click the button
- [ ] Sign in with Google account
- [ ] After signin, redirected to /dashboard

**Expected:** Dashboard shows "Welcome, [Your Name]"

**If Google signin fails:**
- Check browser console for errors
- Verify Supabase URL in .env is correct
- Try in incognito/private window

---

### Test 3: Profile Page
- [ ] Click on profile/avatar in navbar
- [ ] Should see profile form
- [ ] Try updating your name
- [ ] Add phone number
- [ ] Select state (e.g., "Maharashtra")
- [ ] Add crops (type and press Enter)
- [ ] Click "Save Changes"

**Expected:** Green toast message "Profile updated successfully"

---

### Test 4: AI Chatbot
- [ ] Navigate to "AI Assistant" page
- [ ] See welcome message from bot
- [ ] Type: "What's the tomato price?"
- [ ] Press Enter or click Send
- [ ] Wait 2-3 seconds

**Expected:** 
- With Gemini key: Real AI response
- Without key: Helpful fallback response

**If shows error:**
- Check .env has `VITE_GEMINI_API_KEY`
- Restart dev server after adding key
- Check browser console

---

### Test 5: Price Comparison
- [ ] Navigate to "Price Comparison" page
- [ ] See crop dropdown selector
- [ ] Select a crop (e.g., "Tomato")
- [ ] See list of markets with prices

**Current Behavior:**
- With Data.gov.in key: Real market data
- Without key: Mock/sample data (still functional!)

---

### Test 6: Language Switching
- [ ] Look for floating globe icon (bottom right)
- [ ] Click it to open language selector
- [ ] Try switching to Hindi (हिंदी)
- [ ] UI text should change
- [ ] Switch back to English

**Expected:** Language changes instantly

---

### Test 7: Dark Mode
- [ ] Click theme toggle in navbar
- [ ] Toggle between light and dark mode
- [ ] All colors should adjust properly

**Expected:** Theme persists across page reloads

---

## ✅ Step 7: Verify Everything Works

### Final Checklist

**Core Features:**
- [ ] Can sign in with Google
- [ ] Dashboard loads with user data
- [ ] Profile can be edited and saved
- [ ] Chatbot responds to messages
- [ ] Price comparison page shows data
- [ ] Language switching works
- [ ] Theme toggle works
- [ ] Navigation between pages works

**Performance:**
- [ ] Pages load quickly (< 2 seconds)
- [ ] No console errors (except API key warnings if missing)
- [ ] Smooth animations
- [ ] Responsive on mobile size (try resizing browser)

---

## 🎉 Success!

If all tests pass, your AgroProfit app is ready!

---

## 🐛 Troubleshooting

### Problem: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install --legacy-peer-deps
```

---

### Problem: "Cannot find module" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Problem: Port 5173 already in use

**Solution:**
```bash
# Vite will auto-use next available port
# Or kill process on port 5173:
# Windows:
netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

---

### Problem: Supabase errors

**Solution:**
1. Verify `.env` has correct Supabase URL
2. Check Supabase dashboard is accessible
3. Verify Google OAuth is enabled in Supabase
4. Try signing out and back in

---

### Problem: Chatbot not responding

**Solution:**
1. Add Gemini API key to `.env`
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Clear browser cache
4. Check browser console for errors

---

### Problem: No real market prices

**Solution:**
1. This is okay! App works with mock data
2. To get real data: Add Data.gov.in API key
3. Restart server after adding key
4. Wait 30 seconds for API call

---

## 📚 Next Steps

### After Basic Setup:

1. **Read Documentation:**
   - [ ] `SETUP_GUIDE.md` - Complete setup details
   - [ ] `API_INTEGRATION.md` - How APIs work
   - [ ] `PROJECT_SUMMARY.md` - Full project overview

2. **Customize:**
   - [ ] Update colors in `tailwind.config.ts`
   - [ ] Add more crops in `src/data/mockData.ts`
   - [ ] Modify translations in `src/lib/translations.ts`

3. **Deploy:**
   - [ ] Push to GitHub
   - [ ] Deploy to Netlify (see SETUP_GUIDE.md)
   - [ ] Add environment variables in deployment platform

4. **Enhance:**
   - [ ] Add more languages
   - [ ] Integrate weather API
   - [ ] Build mobile app with Capacitor

---

## 🎯 Time Breakdown

If you follow this guide:

- ✅ Prerequisites: 5 min
- ✅ Install: 3 min
- ✅ Environment setup: 5 min
- ✅ Get API keys: 10 min
- ✅ Start server: 2 min
- ✅ Test features: 5 min

**Total: ~30 minutes**

---

## 🆘 Still Stuck?

1. Check browser console (F12 → Console tab)
2. Check terminal for error messages
3. Read `SETUP_GUIDE.md` for detailed info
4. Review error messages carefully
5. Search error message on Google/Stack Overflow

---

## ✨ Pro Tips

### Development:
- Use VS Code with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin

### Browser:
- Use Chrome/Edge DevTools
- Check Network tab for API calls
- Use React DevTools extension

### Git:
```bash
# Save your work frequently
git add .
git commit -m "Your message"
git push
```

---

**Ready to build amazing features? You got this! 🚀**

---

Last updated: December 8, 2025
