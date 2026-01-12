# Supabase Quick Start (5 Minutes)

Quick guide to get Supabase connected to your movie app.

## 1. Create Supabase Project (2 min)

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Name it `movie-recommendations`
4. Choose a password and region
5. Click **"Create new project"** and wait 2-3 minutes

## 2. Create Database Table (1 min)

1. Click **"SQL Editor"** in the sidebar
2. Click **"New Query"**
3. Paste this SQL and click **"Run"**:

```sql
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

CREATE INDEX idx_watched_movies_user_id ON watched_movies(user_id);
CREATE INDEX idx_watched_movies_movie_id ON watched_movies(movie_id);

ALTER TABLE watched_movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watched movies"
  ON watched_movies
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## 3. Get Your Credentials (1 min)

1. Click **"Settings"** (gear icon) → **"API"**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

## 4. Add to Your App (1 min)

1. Create `.env.local` file in `movie-recommendation-app` folder:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key_here
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

2. Restart your dev server:
```bash
npm run dev
```

## 5. Enable Anonymous Auth (Optional)

To let users use the app without signing up, add this to `app/layout.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { supabase } from './lib/supabase';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Create anonymous session if none exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        supabase.auth.signInAnonymously();
      }
    });
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## ✅ Done!

Your watched movies are now stored in Supabase! 

**Note**: Without authentication, the app will fall back to localStorage (which still works fine).

For detailed setup including authentication, see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
