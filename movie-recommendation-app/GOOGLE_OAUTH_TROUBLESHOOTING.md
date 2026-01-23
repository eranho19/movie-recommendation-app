# Google OAuth Troubleshooting Guide

## Common Errors and Solutions

### 1. "Supabase is not configured" Error

**Error Message**: "Supabase is not configured. Please check your environment variables."

**Solution**:
- Check your `.env.local` file has:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
- Restart your development server after updating `.env.local`
- Make sure there are no typos in the variable names

### 2. "redirect_uri_mismatch" Error

**Error Message**: "redirect_uri_mismatch" or "The redirect URI in the request does not match"

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, make sure you have:
   - `http://localhost:4000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
5. Also check in Supabase Dashboard:
   - Go to **Authentication** → **URL Configuration**
   - Add `http://localhost:4000/auth/callback` to Redirect URLs
6. **Important**: The URLs must match EXACTLY (including http vs https, port number, trailing slashes)

### 3. "access_denied" Error

**Error Message**: "access_denied" or "The user denied the request"

**Solution**:
- User clicked "Cancel" on the Google consent screen
- This is normal - user can try again
- If it happens repeatedly, check OAuth consent screen configuration

### 4. "invalid_client" Error

**Error Message**: "invalid_client" or "Unauthorized"

**Solution**:
- Check that Google OAuth is enabled in Supabase:
  1. Go to Supabase Dashboard → **Authentication** → **Providers**
  2. Make sure **Google** is toggled ON
  3. Verify Client ID and Client Secret are correct
- Check Google Cloud Console:
  1. Make sure OAuth consent screen is configured
  2. Verify Client ID and Client Secret match what's in Supabase

### 5. "Google provider is disabled" Error

**Error Message**: "Google provider is disabled" or similar

**Solution**:
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** in the list
3. Toggle it ON
4. Enter your Client ID and Client Secret
5. Click **Save**

### 6. "OAuth consent screen not configured" Error

**Error Message**: "OAuth consent screen is not configured"

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **OAuth consent screen**
3. Configure the consent screen:
   - Choose **External** (unless you have Google Workspace)
   - Fill in required fields:
     - App name: "Let Me Set You Up"
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes (default is fine)
   - Add test users if needed (for development)
   - Save and continue

### 7. "Port mismatch" Error

**Error Message**: Redirects to wrong port or doesn't work

**Solution**:
- Make sure you're using port **4000** (not 3000)
- Update all redirect URIs to use port 4000:
  - Google Cloud Console: `http://localhost:4000/auth/callback`
  - Supabase: `http://localhost:4000/auth/callback`
- Restart your dev server: `npm run dev`

### 8. "Session exchange failed" Error

**Error Message**: "Failed to create session" or "Session exchange error"

**Solution**:
- Check that the callback route is working
- Verify Supabase environment variables are correct
- Check browser console for detailed error messages
- Make sure you're not blocking cookies in your browser

### 9. "Network error" or "Connection refused"

**Error Message**: Network errors or connection issues

**Solution**:
- Check your internet connection
- Verify Supabase service is up: [status.supabase.com](https://status.supabase.com)
- Check firewall settings
- Try disabling browser extensions that might block requests

### 10. "Invalid credentials" Error

**Error Message**: "Invalid client credentials"

**Solution**:
- Double-check Client ID and Client Secret in Supabase
- Make sure there are no extra spaces when copying/pasting
- Regenerate credentials in Google Cloud Console if needed
- Update both Google Cloud Console and Supabase with new credentials

## Step-by-Step Verification Checklist

Use this checklist to verify your Google OAuth setup:

- [ ] Google OAuth is enabled in Supabase Dashboard
- [ ] Client ID and Client Secret are entered in Supabase
- [ ] OAuth consent screen is configured in Google Cloud Console
- [ ] Redirect URI `http://localhost:4000/auth/callback` is in Google Cloud Console
- [ ] Redirect URI `http://localhost:4000/auth/callback` is in Supabase URL Configuration
- [ ] Site URL in Supabase is set to `http://localhost:4000`
- [ ] `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `.env.local` has correct `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Development server is running on port 4000
- [ ] Browser console shows no errors

## Testing the Flow

1. **Clear browser cache and cookies** for localhost
2. **Open browser console** (F12) to see any errors
3. **Click "Continue with Google"** button
4. **Check the redirect**:
   - Should redirect to `accounts.google.com`
   - After signing in, should redirect back to `/auth/callback`
   - Then should redirect to `/` (home page)

## Getting More Details

If you're still having issues:

1. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for error messages
   - Copy any error messages you see

2. **Check Network Tab**:
   - Open Developer Tools (F12)
   - Go to Network tab
   - Try Google sign-in again
   - Look for failed requests (red)
   - Check the response for error details

3. **Check Supabase Logs**:
   - Go to Supabase Dashboard
   - Navigate to **Logs** → **Auth Logs**
   - Look for recent authentication attempts
   - Check for any error messages

4. **Check Google Cloud Console**:
   - Go to Google Cloud Console
   - Navigate to **APIs & Services** → **Credentials**
   - Check OAuth 2.0 Client IDs
   - Verify redirect URIs are correct

## Still Having Issues?

If none of the above solutions work:

1. **Share the exact error message** you're seeing
2. **Check the browser console** for detailed errors
3. **Verify your setup** using the checklist above
4. **Try in an incognito/private window** to rule out browser issues
5. **Check Supabase status** to ensure services are operational

## Quick Fixes

**Quick Fix 1**: Restart everything
```bash
# Stop your dev server (Ctrl+C)
# Clear browser cache
# Restart dev server
npm run dev
```

**Quick Fix 2**: Double-check URLs
- Make sure all URLs use `http://localhost:4000` (not 3000)
- Make sure there are no trailing slashes
- Make sure URLs match exactly in both Google and Supabase

**Quick Fix 3**: Regenerate credentials
- In Google Cloud Console, create a new OAuth Client ID
- Update Supabase with the new Client ID and Secret
- Update redirect URIs if needed
