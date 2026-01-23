# Fix: "No authorization code received" Error

## The Problem

When trying to login with Google, you get the error: **"No authorization code received"**

This means Supabase is redirecting back to your app, but the authorization code isn't being passed in the URL.

## Why This Happens

When Supabase completes the OAuth flow with Google, it should redirect to your callback URL with a `code` parameter. If this parameter is missing, you'll see this error.

## The Fix

### Step 1: Verify Supabase Redirect URL Configuration

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project**
3. **Navigate to**: **Authentication** → **URL Configuration**
4. **Check "Redirect URLs"** - Make sure you have:
   ```
   http://localhost:4000/auth/callback
   ```
   - **Important**: Must match EXACTLY (including `http://`, port `4000`, and `/auth/callback`)
   - No trailing slash
   - If it's missing, click **"+ Add URL"** and add it
5. **Check "Site URL"** - Should be:
   ```
   http://localhost:4000
   ```
6. **Click "Save"**

### Step 2: Verify Google Cloud Console Redirect URIs

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Navigate to**: **APIs & Services** → **Credentials**
3. **Click on your OAuth 2.0 Client ID**
4. **Under "Authorized redirect URIs"**, make sure you have:
   - `https://[your-project-ref].supabase.co/auth/v1/callback` (Supabase's callback)
   - `http://localhost:4000/auth/callback` (Your app's callback - optional but recommended)
5. **Click "Save"**

### Step 3: Check Browser Console for Debugging

1. **Open your browser's Developer Tools** (F12)
2. **Go to the Console tab**
3. **Try logging in with Google again**
4. **Look for these log messages**:
   - `Callback route - Full URL: ...`
   - `Callback route - Code: ...`
   - `Callback handler - Full URL: ...`
   - `Callback handler - Code from query params: ...`
   - `Callback handler - Code from hash: ...`

These logs will show you:
- What URL Supabase is redirecting to
- Whether the code is in query params (`?code=...`) or hash (`#code=...`)
- What parameters are being passed

### Step 4: Common Issues and Solutions

#### Issue 1: Redirect URL Mismatch

**Symptom**: Code is never received

**Solution**: 
- Make sure the redirect URL in Supabase Dashboard matches exactly: `http://localhost:4000/auth/callback`
- Check for typos, wrong port, or missing `/auth/callback` path

#### Issue 2: Code in Hash Fragment Instead of Query Params

**Symptom**: Code exists but in hash (`#code=...`) instead of query params (`?code=...`)

**Solution**: 
- The updated callback handler now checks both query params and hash fragments
- This should be automatically handled

#### Issue 3: Supabase Already Processed the Session

**Symptom**: No code in URL but session might exist

**Solution**: 
- The callback handler now checks if Supabase has already processed the session
- If a session exists, it will redirect to home automatically

#### Issue 4: Multiple Redirects Losing the Code

**Symptom**: Code is lost during redirect chain

**Solution**: 
- Make sure you're not redirecting multiple times
- The flow should be: Google → Supabase → `/auth/callback` → `/auth/callback-handler` → Home

## Testing the Fix

1. **Clear your browser cache** (or use incognito mode)
2. **Restart your dev server**:
   ```bash
   npm run dev
   ```
3. **Open browser console** (F12) to see debug logs
4. **Try logging in with Google**
5. **Check the console logs** to see:
   - What URL you're redirected to
   - Whether the code is present
   - Any error messages

## What the Logs Should Show (Success)

```
Callback route - Full URL: http://localhost:4000/auth/callback?code=abc123...
Callback route - Code: abc123...
Redirecting to handler with code: abc123...
Callback handler - Full URL: http://localhost:4000/auth/callback-handler?code=abc123...
Callback handler - Code from query params: abc123...
Exchanging code for session...
Session created successfully, redirecting to home
```

## What the Logs Might Show (Error)

```
Callback route - Full URL: http://localhost:4000/auth/callback
Callback route - Code: null
No authorization code received in callback
```

If you see this, check:
1. Supabase redirect URL configuration
2. Google Cloud Console redirect URIs
3. Make sure you clicked "Save" in both places

## Still Not Working?

If you're still getting the error after checking all the above:

1. **Share the console logs** - They will show exactly what's happening
2. **Check Supabase Dashboard** - Verify the redirect URL is saved correctly
3. **Check Google Cloud Console** - Verify both redirect URIs are added
4. **Try a different browser** - Rules out browser-specific issues
5. **Check if you're using the correct port** - Should be `4000` (check your `package.json`)
