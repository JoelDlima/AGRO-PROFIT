# Google OAuth Setup Guide

## Your Credentials Template

**Client ID:**
```
YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

**Client Secret:**
```
YOUR_GOOGLE_CLIENT_SECRET
```

**Supabase Callback URL:**
```
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
```

---

## Step 1: Google Cloud Console Setup

Go to: [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)

### Authorized JavaScript origins:
Add these URLs:
```
http://localhost:8080
http://localhost:5173
https://YOUR_PROJECT_ID.supabase.co
```

### Authorized redirect URIs:
Add these URLs:
```
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
http://localhost:8080/auth
http://localhost:5173/auth
```

Click **SAVE** at the bottom.

---

## Step 2: Supabase Configuration

Go to: Supabase Dashboard → Authentication → Providers

1. Find **Google** in the providers list
2. Click to expand it
3. Toggle **Enable Sign in with Google** to ON
4. Fill in:
   - **Client ID (for OAuth):** `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
   - **Client Secret (for OAuth):** `YOUR_GOOGLE_CLIENT_SECRET`
5. Click **Save**

---

## Step 3: Test

1. Start development server: `npm run dev`
2. Open `http://localhost:5173/auth`
3. Click "Continue with Google"
4. Complete Google authentication
