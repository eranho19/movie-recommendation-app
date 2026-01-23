# How to Enable Google OAuth in Supabase

## Quick Fix for "provider is not enabled" Error

This error means Google OAuth is not enabled in your Supabase project. Follow these steps:

## Step 1: Enable Google Provider in Supabase

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign in to your account
   - Select your project

2. **Navigate to Authentication Settings**
   - Click on **"Authentication"** in the left sidebar
   - Click on **"Providers"** (or find it under Authentication settings)

3. **Enable Google Provider**
   - Scroll down to find **"Google"** in the list of providers
   - Toggle the switch to **ON** (enable it)
   - You'll see fields for **Client ID** and **Client Secret**

## Step 2: Get Google OAuth Credentials

You need to create OAuth credentials in Google Cloud Console:

### 2.1 Create Google Cloud Project (if you don't have one)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: "Movie App" (or any name)
5. Click **"Create"**

### 2.2 Configure OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Select **"External"** (unless you have Google Workspace)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: "Let Me Set You Up"
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"Save and Continue"**
6. On the **Scopes** page, click **"Save and Continue"** (default scopes are fine)
7. On the **Test users** page:
   - Click **"Add Users"**
   - Add your email address (and any test users)
   - Click **"Save and Continue"**
8. Review and click **"Back to Dashboard"**

### 2.3 Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Give it a name: "Movie App OAuth"
5. **Authorized JavaScript origins**:
   - Click **"+ ADD URI"**
   - Add: `http://localhost:4000`
6. **Authorized redirect URIs**:
   - Click **"+ ADD URI"**
   - Add: `http://localhost:4000/auth/callback`
7. Click **"Create"**
8. **IMPORTANT**: Copy the **Client ID** and **Client Secret** (you'll need these next)

## Step 3: Add Credentials to Supabase

1. Go back to Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** from Google Cloud Console
3. Paste your **Client Secret** from Google Cloud Console
4. Click **"Save"**

## Step 4: Configure Redirect URLs in Supabase

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:4000`
3. Under **Redirect URLs**, click **"+ Add URL"**
4. Add: `http://localhost:4000/auth/callback`
5. Click **"Save"**

## Step 5: Verify Your Setup

Check that you have:

- ✅ Google provider enabled in Supabase
- ✅ Client ID entered in Supabase
- ✅ Client Secret entered in Supabase
- ✅ OAuth consent screen configured in Google Cloud
- ✅ Redirect URI `http://localhost:4000/auth/callback` in Google Cloud
- ✅ Redirect URI `http://localhost:4000/auth/callback` in Supabase
- ✅ Site URL set to `http://localhost:4000` in Supabase

## Step 6: Test Google Sign-In

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:4000`
3. Click on **"User"** button → **"Login"**
4. Click **"Continue with Google"**
5. You should be redirected to Google's sign-in page
6. After signing in, you should be redirected back to the app

## Troubleshooting

### Still Getting "provider is not enabled" Error?

1. **Double-check** that Google is toggled ON in Supabase
2. **Refresh** the Supabase Dashboard page
3. **Wait a few seconds** after enabling (sometimes takes a moment to activate)
4. **Check** that you're looking at the correct Supabase project

### "redirect_uri_mismatch" Error?

- Make sure redirect URIs match EXACTLY in both Google Cloud and Supabase
- Use `http://localhost:4000/auth/callback` (not 3000)
- No trailing slashes

### "access_denied" Error?

- Make sure you added yourself as a test user in OAuth consent screen
- If app is in "Testing" mode, only test users can sign in

### Still Not Working?

1. Check browser console (F12) for detailed errors
2. Verify all URLs use port 4000 (not 3000)
3. Make sure you saved changes in both Google Cloud and Supabase
4. Try clearing browser cache and cookies

## Production Setup

When deploying to production:

1. Add production redirect URI to Google Cloud Console:
   - `https://yourdomain.com/auth/callback`

2. Update Supabase:
   - Site URL: `https://yourdomain.com`
   - Redirect URL: `https://yourdomain.com/auth/callback`

3. Update environment variables in your hosting platform

## Quick Reference

**Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Authentication → Providers → Google

**Google Cloud Console**: [https://console.cloud.google.com](https://console.cloud.google.com)
- APIs & Services → Credentials
- APIs & Services → OAuth consent screen

**Required Redirect URI**: `http://localhost:4000/auth/callback`
