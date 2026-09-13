# Google OAuth Setup Guide for AgroProfit

This guide explains how to connect Google Login between Google Cloud Console and Supabase.

---

## 1. Google Cloud Credentials Template

- **Client ID:**
  ```text
  YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
  ```
- **Client Secret:**
  ```text
  YOUR_GOOGLE_CLIENT_SECRET
  ```

---

## 2. Step 1: Configure Google Cloud Console

Go to: [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)

1. Create or select your OAuth 2.0 Client ID.
2. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173`
   - `http://localhost:8080`
   - `https://your-project-id.supabase.co`
3. Under **Authorized redirect URIs**, add your Supabase callback URI:
   - `https://your-project-id.supabase.co/auth/v1/callback`
   - `http://localhost:5173/onboarding`
   - `http://localhost:5173/auth`
4. Click **SAVE**.

---

## 3. Step 2: Enable Google in Supabase Dashboard

Go to: Supabase Dashboard → Authentication → Providers → Google

1. Find **Google** in the list of Auth Providers.
2. Toggle **Enable Sign in with Google** to **ON**.
3. Fill in:
   - **Client ID (for OAuth):** `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
   - **Client Secret (for OAuth):** `YOUR_GOOGLE_CLIENT_SECRET`
4. Click **Save**.

---

## 4. Step 3: Configure Redirect URLs in Supabase

Go to: Supabase Dashboard → Authentication → URL Configuration

1. Set **Site URL** to:
   `http://localhost:5173` (or your deployed Vercel domain)
2. Under **Redirect URLs**, add:
   - `http://localhost:5173/**`
   - `http://localhost:5173/onboarding`
   - `https://your-production-domain.vercel.app/**`
3. Click **Save**.
