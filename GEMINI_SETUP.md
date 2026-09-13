# Gemini API Key Security Setup

## ✅ What Was Changed

Your Gemini API key is now **secured** and no longer exposed in the browser! 

### Before (❌ Insecure):
```
Browser → Gemini API (API key visible in Network tab)
```

### After (✅ Secure):
```
Browser → Supabase Edge Function → Gemini API
          (API key hidden here)
```

## 🚀 Deployment Steps

### 1. Deploy the Edge Function

Run these commands in your terminal:

```powershell
cd "c:\joel\Lenovo_Agriculture_Project\agro-profit-pro"

# Login to Supabase (if not already logged in)
npx supabase login

# Link to your project
npx supabase link --project-ref oxqkzzglonsganfcouob

# Deploy the gemini-chat function
npx supabase functions deploy gemini-chat
```

### 2. Set the API Key Secret

In your terminal:

```powershell
# Replace YOUR_GEMINI_API_KEY with your actual key
npx supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

**OR** via Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project (oxqkzzglonsganfcouob)
3. Go to **Edge Functions** → **gemini-chat**
4. Click **Secrets**
5. Add: `GEMINI_API_KEY` = `your_actual_api_key`

### 3. Update Environment Variables

**Remove** this line from your `.env` file:
```env
VITE_GEMINI_API_KEY=...  # DELETE THIS LINE
```

The API key should now ONLY exist as a Supabase secret, not in your `.env` file.

### 4. Commit and Push

```powershell
git add .
git commit -m "Secure Gemini API key with edge function"
git push origin main
```

## 🧪 Testing

### Test Locally:
1. Start your dev server: `npm run dev`
2. Go to the AI Help/Chatbot page
3. Send a message
4. Check DevTools Network tab - you should see:
   - ✅ Call to `/functions/v1/gemini-chat` (your edge function)
   - ❌ NO call to `generativelanguage.googleapis.com`
   - ❌ NO API key visible anywhere

### Test on Vercel:
Once deployed, the chatbot on https://agro-profit-pro.vercel.app will automatically use the edge function.

## 📋 Verification Checklist

- [ ] Edge function deployed successfully
- [ ] GEMINI_API_KEY secret set in Supabase
- [ ] VITE_GEMINI_API_KEY removed from `.env`
- [ ] Chatbot works on localhost
- [ ] No API key visible in browser Network tab
- [ ] Changes pushed to GitHub
- [ ] Chatbot works on Vercel

## 🔒 Security Benefits

1. **API Key Hidden**: No longer visible in browser DevTools
2. **Rate Limiting**: Can add rate limiting in edge function
3. **Usage Control**: Monitor API usage via Supabase logs
4. **Cost Protection**: Edge function can validate users before calling Gemini
5. **Centralized**: Change API key in one place (Supabase secrets)

## ❓ Troubleshooting

### Chatbot returns fallback responses:
- Check if edge function deployed: Supabase Dashboard → Edge Functions
- Verify GEMINI_API_KEY secret is set
- Check edge function logs for errors

### "Edge function error" message:
- Run: `npx supabase functions serve gemini-chat`
- Check terminal for error details
- Verify Gemini API key is valid

### Works locally but not on Vercel:
- Vercel deployment is automatic, no changes needed
- Wait 2-3 minutes for Vercel deployment to complete
- Hard refresh browser (Ctrl+Shift+R)

## 🎉 Done!

Your Gemini API key is now secure. Users cannot see or steal it from the browser, and you have full control over its usage through Supabase.
