# Supabase Troubleshooting Guide

If movies aren't being saved to Supabase when you click "Seen / Don't Suggest", follow these steps:

## Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Look for messages starting with `[AuthProvider]` or `[markMovieAsWatched]`
4. Check for any error messages (red text)

## Step 2: Run Diagnostic Tests

The app includes built-in diagnostic tools. In your browser console, type:

```javascript
// Run all tests
testSupabase.runAll()

// Or run individual tests
testSupabase.testConnection()  // Test authentication
testSupabase.testTable()       // Test table access
testSupabase.testWrite()       // Test writing data
```

## Step 3: Common Issues & Solutions

### Issue 1: "Supabase not configured"

**Symptoms:**
- Console shows: `Supabase not configured, using localStorage fallback`
- No Supabase URL/Key found

**Solution:**
1. Check your `.env.local` file exists in `movie-recommendation-app/` folder
2. Verify it contains:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```
3. Restart your dev server: `npm run dev`

### Issue 2: "No user ID found"

**Symptoms:**
- Console shows: `⚠️ No user ID found!`
- `testSupabase.testConnection()` fails

**Solution:**
1. **Enable Anonymous Authentication in Supabase:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to **Authentication** → **Providers**
   - Find **"Anonymous"** provider
   - Toggle it **ON**
   - Click **Save**

2. **Verify the session:**
   - Check console for: `[AuthProvider] ✅ Anonymous session created successfully!`
   - If you see errors, check the error message

### Issue 3: "Permission denied" or RLS Error

**Symptoms:**
- Console shows: `PGRST301` or `permission denied`
- `testSupabase.testTable()` or `testSupabase.testWrite()` fails

**Solution:**
1. **Verify the table exists:**
   - Go to Supabase Dashboard → **Table Editor**
   - Check if `watched_movies` table exists
   - If not, run `supabase-schema.sql` in SQL Editor

2. **Check Row Level Security (RLS):**
   - Go to Supabase Dashboard → **Table Editor** → `watched_movies`
   - Click on **"Policies"** tab
   - Verify these policies exist:
     - "Users can view their own watched movies" (SELECT)
     - "Users can insert their own watched movies" (INSERT)
     - "Users can update their own watched movies" (UPDATE)
     - "Users can delete their own watched movies" (DELETE)

3. **Re-run the schema:**
   - Go to **SQL Editor** in Supabase
   - Copy and paste the entire `supabase-schema.sql` file
   - Click **Run**

### Issue 4: "Table doesn't exist"

**Symptoms:**
- Console shows: `42P01` error code
- `testSupabase.testTable()` fails

**Solution:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy the entire contents of `supabase-schema.sql`
3. Paste and click **Run**
4. Verify the table was created in **Table Editor**

### Issue 5: Data saves but doesn't appear in Supabase

**Symptoms:**
- No errors in console
- But no data in Supabase table

**Possible causes:**
1. **Wrong project:** Check you're looking at the correct Supabase project
2. **RLS filtering:** The data might be there but filtered by RLS policies
3. **Browser cache:** Try clearing browser cache or using incognito mode

**Solution:**
1. Check console for: `✅ Movie X saved to Supabase`
2. In Supabase Dashboard → **Table Editor** → `watched_movies`
3. Click **"Filter"** and try:
   - Remove all filters
   - Check "Show all rows" if available
4. Try querying directly in SQL Editor:
   ```sql
   SELECT * FROM watched_movies ORDER BY created_at DESC LIMIT 10;
   ```

## Step 4: Verify Your Setup

Run this checklist:

- [ ] `.env.local` file exists with Supabase credentials
- [ ] Dev server restarted after adding credentials
- [ ] `watched_movies` table exists in Supabase
- [ ] Row Level Security (RLS) is enabled
- [ ] RLS policies are created (4 policies: SELECT, INSERT, UPDATE, DELETE)
- [ ] Anonymous authentication is enabled in Supabase
- [ ] Browser console shows successful anonymous session creation

## Step 5: Test the Flow

1. Open browser console (F12)
2. Click "Seen / Don't Suggest" on any movie
3. Watch the console for:
   - `[markMovieAsWatched] Starting...`
   - `[markMovieAsWatched] User ID: ...`
   - `[markMovieAsWatched] ✅ SUCCESS! Movie X saved to Supabase`
4. Check Supabase Dashboard → Table Editor → `watched_movies`

## Still Not Working?

1. **Check the exact error message** in browser console
2. **Run diagnostic tests:** `testSupabase.runAll()` in console
3. **Share the error details:**
   - Error code (e.g., PGRST301, 42P01)
   - Error message
   - Console logs from `[AuthProvider]` and `[markMovieAsWatched]`

## Quick Test Commands

Open browser console and run:

```javascript
// Test everything
testSupabase.runAll()

// Check if Supabase is configured
console.log('Supabase configured:', window.location.href.includes('localhost') ? 'Check .env.local' : 'Check env vars')

// Check current user
supabase.auth.getUser().then(({data}) => console.log('Current user:', data.user))

// Try to read from table
supabase.from('watched_movies').select('*').limit(5).then(({data, error}) => {
  console.log('Table read result:', {data, error})
})
```

## Expected Console Output (Success)

When everything works, you should see:

```
[AuthProvider] Checking for existing session...
[AuthProvider] No session found, creating anonymous session...
[AuthProvider] ✅ Anonymous session created successfully!
[AuthProvider] User ID: abc123...
[AuthProvider] Is anonymous: true

[markMovieAsWatched] Starting - movieId: 12345, mightWatchAgain: false
[markMovieAsWatched] Supabase is configured, getting user ID...
[markMovieAsWatched] User ID: abc123...
[markMovieAsWatched] Attempting to save to Supabase...
[markMovieAsWatched] ✅ SUCCESS! Movie 12345 saved to Supabase
```

If you see different output, use the error messages to identify which step is failing.
