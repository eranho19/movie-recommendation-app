# Fix Supabase OAuth Redirect URI Error

## The Error

"You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy."

The error shows: `redirect_uri=https://fznxqovwfxdcbzhjzaxj.supabase.co/auth/v1/callback`

## Why This Happens

When using Supabase for OAuth, **Supabase handles the OAuth flow** with Google. Supabase uses its own redirect URI format:
- `https://[your-project-ref].supabase.co/auth/v1/callback`

This URI **must be added** to Google Cloud Console's Authorized redirect URIs.

## Quick Fix (2 Steps)

### Step 1: Get Your Supabase Redirect URI

From the error message, your Supabase redirect URI is:
```
https://fznxqovwfxdcbzhjzaxj.supabase.co/auth/v1/callback
```

**Or find it yourself:**
1. Go to Supabase Dashboard
2. Your project URL is: `https://fznxqovwfxdcbzhjzaxj.supabase.co`
3. Your redirect URI is: `https://fznxqovwfxdcbzhjzaxj.supabase.co/auth/v1/callback`

### Step 2: Add to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your **OAuth 2.0 Client ID**
5. Under **Authorized redirect URIs**, click **"+ ADD URI"**
6. Add exactly: `https://fznxqovwfxdcbzhjzaxj.supabase.co/auth/v1/callback`
   - Replace `fznxqovwfxdcbzhjzaxj` with YOUR project reference if different
7. Click **"SAVE"**
8. **Wait 1-2 minutes** for changes to take effect

## Complete Setup (All Redirect URIs)

For a complete setup, add **both** redirect URIs:

### 1. Supabase Redirect URI (REQUIRED)
```
https://fznxqovwfxdcbzhjzaxj.supabase.co/auth/v1/callback
```
- This is what Supabase uses to handle the OAuth flow
- **Must be added** or OAuth won't work

### 2. Your App Callback (Optional, for development)
```
http://localhost:4000/auth/callback
```
- This is where Supabase redirects after successful OAuth
- Only needed if you want to test the full flow locally

## How It Works

1. User clicks "Sign in with Google"
2. App redirects to Supabase OAuth endpoint
3. Supabase redirects to Google sign-in
4. Google redirects back to: `https://[project].supabase.co/auth/v1/callback` ← **Must be in Google Console**
5. Supabase processes the OAuth response
6. Supabase redirects to your app: `http://localhost:4000/auth/callback`
7. Your app handles the final redirect

## Verification Checklist

- [ ] Added Supabase redirect URI to Google Cloud Console
- [ ] URI format: `https://[project-ref].supabase.co/auth/v1/callback`
- [ ] Used `https://` (not `http://`)
- [ ] No trailing slash
- [ ] Clicked "SAVE" in Google Cloud Console
- [ ] Waited 1-2 minutes after saving
- [ ] Cleared browser cache
- [ ] Tried Google sign-in again

## Still Not Working?

1. **Double-check the URI** - Copy it exactly from the error message
2. **Verify you're editing the correct OAuth Client ID** in Google Cloud Console
3. **Make sure you clicked SAVE** - Changes don't apply until saved
4. **Wait longer** - Sometimes takes 2-3 minutes to propagate
5. **Check OAuth consent screen** - Must be configured before OAuth works
6. **Try incognito mode** - Rules out browser cache issues

## Production Setup

When deploying to production, you'll also need to add:
- `https://yourdomain.com/auth/callback` (your production callback)

But the Supabase redirect URI (`https://[project].supabase.co/auth/v1/callback`) is the same for both development and production.
