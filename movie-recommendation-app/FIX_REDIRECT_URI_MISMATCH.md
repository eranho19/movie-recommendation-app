# Fix "redirect_uri_mismatch" Error

## The Problem

Error 400: `redirect_uri_mismatch` means the redirect URI in your OAuth request doesn't match what's configured in Google Cloud Console.

## Important: Supabase Uses Its Own Redirect URI

When using Supabase for OAuth, **Supabase handles the OAuth flow** and uses its own redirect URI format:
- `https://[your-project-ref].supabase.co/auth/v1/callback`

You need to add **BOTH** redirect URIs to Google Cloud Console:
1. Supabase's redirect URI (required for OAuth to work)
2. Your app's callback URI (for the final redirect to your app)

## Quick Fix

You need to add redirect URIs in **Google Cloud Console**:
1. Supabase's redirect URI: `https://[your-project-ref].supabase.co/auth/v1/callback`
2. Your app's callback: `http://localhost:4000/auth/callback` (for development)

## Step 1: Check What Your App Is Using

Your app is configured to use: `http://localhost:4000/auth/callback`

Make sure your dev server is running on port 4000 (check `package.json` - it should have `-p 4000`).

## Step 2: Find Your Supabase Project Reference

1. Go to Supabase Dashboard
2. Look at your project URL - it will be something like: `https://fznxqovwfxdcbzhjzaxj.supabase.co`
3. The project reference is: `fznxqovwfxdcbzhjzaxj` (the part before `.supabase.co`)
4. Your Supabase redirect URI will be: `https://fznxqovwfxdcbzhjzaxj.supabase.co/auth/v1/callback`

**Or check the error message** - it shows the exact URI: `https://fznxqovwfxdcbzhjzaxj.supabase.co/auth/v1/callback`

## Step 3: Fix Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your **OAuth 2.0 Client ID** (the one you created for this app)
5. Under **Authorized redirect URIs**, you need to add:

### Required: Supabase Redirect URI
- Click **"+ ADD URI"**
- Add your Supabase redirect URI: `https://[your-project-ref].supabase.co/auth/v1/callback`
- Example: `https://fznxqovwfxdcbzhjzaxj.supabase.co/auth/v1/callback`
- **Important**: 
  - Use `https://` (not `http://`)
  - Must include `/auth/v1/callback` at the end
  - No trailing slash

### Optional: Your App Callback (for development)
- Click **"+ ADD URI"** again
- Add: `http://localhost:4000/auth/callback`
- **Important**: 
  - Use `http://` (not `https://` for localhost)
  - Use port `4000` (not 3000)
  - No trailing slash

6. Click **"SAVE"** at the bottom
7. **Wait 1-2 minutes** for changes to propagate

## Step 3: Fix Supabase URL Configuration

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Check **Site URL**: Should be `http://localhost:4000`
3. Under **Redirect URLs**, make sure you have:
   - `http://localhost:4000/auth/callback`
4. If not, click **"+ Add URL"** and add it
5. Click **"Save"**

## Step 4: Verify Everything Matches

The redirect URI must be **EXACTLY** the same in all places:

✅ **App Code**: `http://localhost:4000/auth/callback`
✅ **Google Cloud Console**: `http://localhost:4000/auth/callback`
✅ **Supabase URL Config**: `http://localhost:4000/auth/callback`

### Common Mistakes:

❌ `http://localhost:4000/auth/callback/` (trailing slash)
❌ `https://localhost:4000/auth/callback` (https instead of http)
❌ `http://localhost:3000/auth/callback` (wrong port)
❌ `http://127.0.0.1:4000/auth/callback` (using IP instead of localhost)
❌ Extra spaces or typos

## Step 5: Clear Cache and Try Again

1. **Clear browser cache** for localhost
2. **Restart your dev server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
3. **Try Google sign-in again**

## Step 6: If Still Not Working

### Check Your Actual Port

1. Look at your terminal where `npm run dev` is running
2. Check what port it says (should be 4000)
3. If it's different, update all redirect URIs to match

### Check Browser Console

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try Google sign-in
4. Look for the OAuth request
5. Check what redirect_uri it's sending

### Verify Google Cloud Console Settings

1. Make sure you're editing the **correct** OAuth Client ID
2. Check that you clicked **"SAVE"** after adding the URI
3. Wait a few minutes for changes to propagate (sometimes takes 1-2 minutes)

## Production Setup

When you deploy to production, you'll need to:

1. Add production redirect URI to Google Cloud Console:
   - `https://yourdomain.com/auth/callback`

2. Update Supabase:
   - Site URL: `https://yourdomain.com`
   - Redirect URL: `https://yourdomain.com/auth/callback`

## Quick Checklist

- [ ] Google Cloud Console has `http://localhost:4000/auth/callback`
- [ ] Supabase URL Config has `http://localhost:4000/auth/callback`
- [ ] No trailing slashes
- [ ] Using `http://` not `https://` for localhost
- [ ] Using port 4000 (not 3000)
- [ ] Clicked "SAVE" in both places
- [ ] Cleared browser cache
- [ ] Restarted dev server

## Still Having Issues?

If it's still not working after following all steps:

1. **Double-check the exact error** in browser console
2. **Verify the redirect URI** being sent (check Network tab)
3. **Try creating a new OAuth Client ID** in Google Cloud Console
4. **Make sure OAuth consent screen is configured** (required before OAuth works)
