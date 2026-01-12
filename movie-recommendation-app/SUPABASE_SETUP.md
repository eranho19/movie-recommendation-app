# Supabase Setup Guide

This guide will help you set up Supabase for your movie recommendation app to store watched movies in the cloud instead of localStorage.

## Why Supabase?

- **Cloud Storage**: Your watched movies are stored in the cloud and accessible from any device
- **User Authentication**: Each user has their own watched movies list
- **Real-time Sync**: Changes sync across devices automatically
- **Fallback Support**: The app automatically falls back to localStorage if Supabase is not configured

## Prerequisites

- A Supabase account (free tier available)
- Your movie recommendation app already set up

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in the details:
   - **Name**: `movie-recommendations` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Free (or choose your preferred plan)
5. Click **"Create new project"**
6. Wait 2-3 minutes for your project to be set up

## Step 2: Create the Database Table

1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Paste the following SQL:

```sql
-- Create watched_movies table
CREATE TABLE watched_movies (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  might_watch_again BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Create index for faster queries
CREATE INDEX idx_watched_movies_user_id ON watched_movies(user_id);
CREATE INDEX idx_watched_movies_movie_id ON watched_movies(movie_id);

-- Enable Row Level Security (RLS)
ALTER TABLE watched_movies ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only read their own watched movies
CREATE POLICY "Users can view their own watched movies"
  ON watched_movies
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own watched movies
CREATE POLICY "Users can insert their own watched movies"
  ON watched_movies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own watched movies
CREATE POLICY "Users can update their own watched movies"
  ON watched_movies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own watched movies
CREATE POLICY "Users can delete their own watched movies"
  ON watched_movies
  FOR DELETE
  USING (auth.uid() = user_id);
```

4. Click **"Run"** to execute the SQL
5. You should see a success message

## Step 3: Get Your Supabase Credentials

1. In your Supabase project dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** in the settings menu
3. You'll see two important values:
   - **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`

## Step 4: Configure Your App

1. In your `movie-recommendation-app` directory, create a `.env.local` file if you don't have one:

**Windows (PowerShell):**
```powershell
cd movie-recommendation-app
Copy-Item env.example .env.local
notepad .env.local
```

**Mac/Linux:**
```bash
cd movie-recommendation-app
cp env.example .env.local
nano .env.local
```

2. Add your Supabase credentials to `.env.local`:

```env
# TMDB API Configuration
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Replace:
   - `https://xxxxxxxxxxxxx.supabase.co` with your **Project URL**
   - `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with your **anon public key**

4. Save and close the file

## Step 5: Enable Authentication (Optional but Recommended)

For the watched movies feature to work with Supabase, you need users to be authenticated. You have several options:

### Option A: Email/Password Authentication

1. In Supabase dashboard, go to **"Authentication"** → **"Providers"**
2. Enable **"Email"** provider
3. Configure email templates if desired
4. Implement sign-up/sign-in UI in your app (see below)

### Option B: Social Authentication (Google, GitHub, etc.)

1. In Supabase dashboard, go to **"Authentication"** → **"Providers"**
2. Enable your preferred provider (e.g., Google, GitHub)
3. Follow the provider-specific setup instructions
4. Implement social sign-in UI in your app

### Option C: Anonymous Authentication (Simplest)

If you want users to use the app without signing up, you can create anonymous sessions:

Add this to your app's initialization code:

```typescript
import { supabase } from './lib/supabase';

// Create anonymous session on first visit
async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    await supabase.auth.signInAnonymously();
  }
}

initAuth();
```

## Step 6: Test Your Setup

1. Restart your development server:
```bash
npm run dev
```

2. Open your app at [http://localhost:3000](http://localhost:3000)

3. Try marking a movie as watched

4. Check your Supabase dashboard:
   - Go to **"Table Editor"**
   - Click on **"watched_movies"** table
   - You should see your watched movie entry!

## Troubleshooting

### Issue: "No user ID found, falling back to localStorage"

**Solution**: You need to authenticate users. See Step 5 above.

### Issue: "Error reading watched movies from Supabase"

**Solutions**:
- Check that your `.env.local` file has the correct credentials
- Verify the table was created successfully in Supabase
- Check browser console for detailed error messages
- Ensure Row Level Security policies are set up correctly

### Issue: Movies are still using localStorage

**Solutions**:
- Make sure you've restarted your development server after adding environment variables
- Check that environment variables start with `NEXT_PUBLIC_`
- Verify credentials are correct in `.env.local`

### Issue: "Failed to fetch" or CORS errors

**Solutions**:
- Check your Supabase project URL is correct
- Ensure your project is not paused (free tier projects pause after inactivity)
- Check Supabase status at [https://status.supabase.com](https://status.supabase.com)

## Migrating Existing localStorage Data

If you have existing watched movies in localStorage and want to migrate them to Supabase:

1. Open browser console on your app
2. Run this code:

```javascript
// Get existing data from localStorage
const localData = JSON.parse(localStorage.getItem('watched_movies') || '[]');

// Import to Supabase (you'll need to implement this function)
async function migrateToSupabase() {
  for (const movie of localData) {
    await markMovieAsWatched(movie.id, movie.mightWatchAgain);
  }
  console.log('Migration complete!');
}

migrateToSupabase();
```

## Deployment

When deploying to Vercel (or other platforms), don't forget to add your Supabase environment variables:

1. Go to your Vercel project settings
2. Navigate to **"Environment Variables"**
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Select: Production, Preview, and Development
5. Redeploy your app

## Security Best Practices

1. **Never commit `.env.local`** to git (it's already in `.gitignore`)
2. **Use Row Level Security (RLS)** policies (already set up in Step 2)
3. **Rotate keys** if they're ever exposed
4. **Use environment-specific projects** for development and production
5. **Enable email confirmations** for user sign-ups in production

## Additional Features You Can Add

With Supabase set up, you can now add:

- **User profiles** with favorite genres, preferences
- **Movie ratings and reviews**
- **Watchlists** (movies to watch later)
- **Social features** (share recommendations with friends)
- **Real-time updates** (see when friends watch movies)

## Need Help?

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord**: [https://discord.supabase.com](https://discord.supabase.com)
- **Next.js + Supabase Guide**: [https://supabase.com/docs/guides/getting-started/quickstarts/nextjs](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**🎬 Congratulations! Your movie app now has cloud storage powered by Supabase!**
