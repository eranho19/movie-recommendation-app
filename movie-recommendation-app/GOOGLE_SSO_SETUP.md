# Google SSO & Authentication Setup Guide

This guide will help you set up Google Single Sign-On (SSO) and email/password authentication for the movie recommendation app.

## Prerequisites

- A Supabase account and project
- A Google Cloud Console account (for Google OAuth)

## Step 1: Enable Google OAuth in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and click to enable it
5. You'll need to configure Google OAuth credentials (see Step 2)

## Step 2: Set Up Google OAuth Credentials

### 2.1 Create OAuth Credentials in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: "Let Me Set You Up"
     - User support email: Your email
     - Developer contact: Your email
   - Click **Save and Continue** through the scopes (default is fine)
   - Add test users if needed (for development)
   - Click **Save and Continue** to finish

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Movie App OAuth"
   - Authorized JavaScript origins:
     - `http://localhost:4000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:4000/auth/callback` (for development)
     - `https://yourdomain.com/auth/callback` (for production)
   - Click **Create**
   - **Copy the Client ID and Client Secret** (you'll need these)

### 2.2 Add Credentials to Supabase

1. Go back to Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Paste your **Client ID** and **Client Secret** from Google Cloud Console
3. Click **Save**

## Step 3: Enable Email/Password Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Email** and make sure it's enabled
3. (Optional) Configure email templates in **Authentication** → **Email Templates**

## Step 4: Configure Redirect URLs

Make sure your Supabase project has the correct redirect URLs:

1. Go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `http://localhost:4000` (development) or your production URL
   - **Redirect URLs**: 
     - `http://localhost:4000/auth/callback`
     - `https://yourdomain.com/auth/callback` (for production)

## Step 5: Update Environment Variables

Make sure your `.env.local` file has your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-key
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
```

## Step 6: Test the Authentication

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:4000`
   - You should be redirected to `/login`

3. Test Google Sign-In:
   - Click "Continue with Google"
   - You should be redirected to Google's sign-in page
   - After signing in, you'll be redirected back to the app

4. Test Email/Password:
   - Enter an email and password
   - Click "Sign Up" to create an account
   - Or click "Sign In" if you already have an account

## Troubleshooting

### "Supabase is not configured" Error

- Check that your `.env.local` file has the correct Supabase URL and anon key
- Restart your development server after updating `.env.local`

### Google OAuth Not Working

- Verify your redirect URIs match exactly in both Google Cloud Console and Supabase
- Make sure you've enabled the Google provider in Supabase
- Check that your Client ID and Client Secret are correct
- For development, make sure you're using `http://localhost:4000` (not 3000)

### Email/Password Not Working

- Make sure Email provider is enabled in Supabase
- Check Supabase logs for any errors
- Verify your email templates are configured (if using custom emails)

### Redirect Loop

- Make sure your Site URL in Supabase matches your app URL
- Check that the `/auth/callback` route is accessible
- Verify your redirect URLs are correctly configured

## Security Notes

- Never commit your `.env.local` file to version control
- Use environment variables in production
- Keep your Google OAuth Client Secret secure
- Regularly rotate your API keys and secrets
- Enable Row Level Security (RLS) in Supabase for your tables

## Production Deployment

When deploying to production:

1. Update Google OAuth redirect URIs to include your production domain
2. Update Supabase Site URL and Redirect URLs
3. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
4. Test the authentication flow in production

## Features Implemented

✅ Google Single Sign-On (SSO)
✅ Email/Password Authentication
✅ User Session Management
✅ Protected Routes (requires login)
✅ Login/Logout Functionality
✅ User Profile Display in Header
✅ Automatic Redirect to Login
✅ Automatic Redirect to Home After Login
