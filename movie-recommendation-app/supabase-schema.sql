-- Supabase Database Schema for Movie Recommendation App
-- Run this SQL in your Supabase SQL Editor

-- Create watched_movies table
CREATE TABLE IF NOT EXISTS watched_movies (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  might_watch_again BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_watched_movies_user_id ON watched_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_watched_movies_movie_id ON watched_movies(movie_id);

-- Enable Row Level Security (RLS)
ALTER TABLE watched_movies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view their own watched movies" ON watched_movies;
DROP POLICY IF EXISTS "Users can insert their own watched movies" ON watched_movies;
DROP POLICY IF EXISTS "Users can update their own watched movies" ON watched_movies;
DROP POLICY IF EXISTS "Users can delete their own watched movies" ON watched_movies;

-- Create RLS policies
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

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
DROP TRIGGER IF EXISTS update_watched_movies_updated_at ON watched_movies;
CREATE TRIGGER update_watched_movies_updated_at
  BEFORE UPDATE ON watched_movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created successfully
SELECT 'watched_movies table created successfully!' AS status;
