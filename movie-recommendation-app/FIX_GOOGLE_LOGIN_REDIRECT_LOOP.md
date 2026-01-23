# Fix: Google Login Redirect Loop Issue

## The Problem

After clicking "Allow" on the Google consent screen, you're redirected back to the Google login screen instead of your app. This happens because Google doesn't recognize Supabase's redirect URI as authorized.

## Why This Happens

When using Supabase for OAuth, the flow works like this:

1. User clicks "Sign in with Google" → App redirects to Supabase
2. Supabase redirects to Google sign-in
3. **Google redirects back to Supabase**: `https://[project-ref].supabase.co/auth/v1/callback` ← **This must be authorized in Google Cloud Console**
4. Supabase processes the OAuth response
5. Supabase redirects to your app: `http://localhost:4000/auth/callback`
6. Your app handles the final redirect

**The issue**: Step 3 fails because Google doesn't have Supabase's redirect URI in its authorized list.

## The Fix (2 Steps)

### Step 1: Add Supabase Redirect URI to Google Cloud Console

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Select your project** (the one you're using for OAuth)
3. **Navigate to**: **APIs & Services** → **Credentials**
4. **Click on your OAuth 2.0 Client ID** (the one configured for this app)
5. **Under "Authorized redirect URIs"**, click **"+ ADD URI"**
6. **Add this exact URI** (replace `fznxqovwfxdcbzhjzaxj` with your actual Supabase project reference if different):
   ```
   https://fznxqovwfxdcbzhjzaxj.supabase.co/auth/v1/callback
   ```
   **Important**:
   - Use `https://` (not `http://`)
   - Must include `/auth/v1/callback` at the end
   - No trailing slash
   - Replace `fznxqovwfxdcbzhjzaxj` with YOUR Supabase project reference if different
7. **Click "SAVE"** at the bottom
8. **Wait 1-2 minutes** for changes to propagate

### Step 2: Verify Supabase URL Configuration

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project**
3. **Navigate to**: **Authentication** → **URL Configuration**
4. **Check "Site URL"**: Should be `http://localhost:4000`
5. **Under "Redirect URLs"**, make sure you have:
   - `http://localhost:4000/auth/callback`
6. **If missing**, click **"+ Add URL"** and add it
7. **Click "Save"**

## How to Find Your Supabase Project Reference

There are **3 easy ways** to find your Supabase project reference:

### Method 1: Check Your Browser Address Bar (Easiest)

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project** (click on it if you have multiple projects)
3. **Look at the browser address bar** - you'll see a URL like:
   ```
   https://supabase.com/dashboard/project/fznxqovwfxdcbzhjzaxj
   ```
   OR
   ```
   https://app.supabase.com/project/fznxqovwfxdcbzhjzaxj
   ```
4. **The project reference is the last part** of the URL: `fznxqovwfxdcbzhjzaxj`

### Method 2: Check Your Project URL

1. **Go to Supabase Dashboard** → **Settings** → **API**
2. **Look for "Project URL"** - it will show:
   ```
   https://fznxqovwfxdcbzhjzaxj.supabase.co
   ```
3. **The project reference is the part before `.supabase.co`**: `fznxqovwfxdcbzhjzaxj`

### Method 3: Check Your Environment Variables

1. **Open your `.env.local` file** in the `movie-recommendation-app` folder
2. **Look for `NEXT_PUBLIC_SUPABASE_URL`** - it will be something like:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://fznxqovwfxdcbzhjzaxj.supabase.co
   ```
3. **The project reference is the part between `https://` and `.supabase.co`**: `fznxqovwfxdcbzhjzaxj`

### Example

If your project reference is `fznxqovwfxdcbzhjzaxj`, then your Supabase redirect URI will be:
```
https://fznxqovwfxdcbzhjzaxj.supabase.co/auth/v1/callback
```

## Complete Checklist

Before testing, verify:

- [ ] Added Supabase redirect URI to Google Cloud Console: `https://[project-ref].supabase.co/auth/v1/callback`
- [ ] Used `https://` (not `http://`) for Supabase URI
- [ ] No trailing slash on the Supabase URI
- [ ] Clicked "SAVE" in Google Cloud Console
- [ ] Waited 1-2 minutes after saving
- [ ] Site URL in Supabase is set to: `http://localhost:4000`
- [ ] Redirect URL in Supabase includes: `http://localhost:4000/auth/callback`
- [ ] Clicked "Save" in Supabase

## Test the Fix

1. **Clear your browser cache** (or use incognito mode)
2. **Restart your dev server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
3. **Go to**: `http://localhost:4000`
4. **Click "Sign in with Google"**
5. **Click "Allow"** on the Google consent screen
6. **You should now be redirected to your app** (not back to Google login)

## Still Not Working?

### Check These Common Issues:

1. **Wrong Supabase Project Reference**
   - Double-check the project reference in the redirect URI
   - It must match exactly what's in your Supabase Dashboard URL

2. **Changes Haven't Propagated**
   - Wait 2-3 minutes after saving in Google Cloud Console
   - Google's changes can take a few minutes to propagate

3. **Browser Cache**
   - Clear browser cache completely
   - Or use incognito/private browsing mode

4. **Wrong OAuth Client ID**
   - Make sure you're editing the correct OAuth Client ID in Google Cloud Console
   - The one that matches the Client ID in Supabase

5. **OAuth Consent Screen Not Configured**
   - Make sure your OAuth consent screen is fully configured
   - Go to: **APIs & Services** → **OAuth consent screen**
   - Complete all required steps

6. **Check Browser Console**
   - Open browser DevTools (F12)
   - Check the Console tab for any error messages
   - Check the Network tab to see what redirects are happening

## Production Setup

When you deploy to production, you'll also need to add:

- **In Google Cloud Console**: Your production callback URL (e.g., `https://yourdomain.com/auth/callback`)
- **In Supabase**: Your production Site URL and Redirect URLs

But the Supabase redirect URI (`https://[project-ref].supabase.co/auth/v1/callback`) is the same for both development and production.

## Summary

The key fix is adding Supabase's redirect URI to Google Cloud Console. This is the missing piece that causes the redirect loop. Once added, Google will successfully redirect to Supabase, which will then redirect to your app.
