import type { WatchedMovie } from '../types/movie';
import { supabase, isSupabaseConfigured } from './supabase';

const WATCHED_MOVIES_KEY = 'watched_movies';
const TABLE_NAME = 'watched_movies';

// Helper function to get user ID (you can customize this based on your auth setup)
async function getUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// LocalStorage fallback functions
function getWatchedMoviesFromLocalStorage(): WatchedMovie[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(WATCHED_MOVIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading watched movies from localStorage:', error);
    return [];
  }
}

function saveWatchedMoviesToLocalStorage(movies: WatchedMovie[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(WATCHED_MOVIES_KEY, JSON.stringify(movies));
  } catch (error) {
    console.error('Error saving watched movies to localStorage:', error);
  }
}

export async function getWatchedMovies(): Promise<WatchedMovie[]> {
  if (!isSupabaseConfigured()) {
    return getWatchedMoviesFromLocalStorage();
  }

  const userId = await getUserId();
  if (!userId) {
    return getWatchedMoviesFromLocalStorage();
  }

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return data.map((row: any) => ({
      id: row.movie_id,
      watchedAt: row.watched_at,
      mightWatchAgain: row.might_watch_again,
    }));
  } catch (error) {
    console.error('Error reading watched movies from Supabase:', error);
    return getWatchedMoviesFromLocalStorage();
  }
}

export async function markMovieAsWatched(movieId: number, mightWatchAgain: boolean = false): Promise<void> {
  if (!isSupabaseConfigured()) {
    const watched = getWatchedMoviesFromLocalStorage();
    const existing = watched.find(m => m.id === movieId);
    
    if (existing) {
      existing.mightWatchAgain = mightWatchAgain;
      existing.watchedAt = new Date().toISOString();
    } else {
      watched.push({
        id: movieId,
        watchedAt: new Date().toISOString(),
        mightWatchAgain,
      });
    }
    
    saveWatchedMoviesToLocalStorage(watched);
    return;
  }

  const userId = await getUserId();
  if (!userId) {
    console.warn('No user ID found, falling back to localStorage');
    return markMovieAsWatched(movieId, mightWatchAgain);
  }

  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        user_id: userId,
        movie_id: movieId,
        watched_at: new Date().toISOString(),
        might_watch_again: mightWatchAgain,
      }, {
        onConflict: 'user_id,movie_id'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error marking movie as watched in Supabase:', error);
    // Fallback to localStorage
    const watched = getWatchedMoviesFromLocalStorage();
    const existing = watched.find(m => m.id === movieId);
    
    if (existing) {
      existing.mightWatchAgain = mightWatchAgain;
      existing.watchedAt = new Date().toISOString();
    } else {
      watched.push({
        id: movieId,
        watchedAt: new Date().toISOString(),
        mightWatchAgain,
      });
    }
    
    saveWatchedMoviesToLocalStorage(watched);
  }
}

export async function unmarkMovieAsWatched(movieId: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    const watched = getWatchedMoviesFromLocalStorage();
    const filtered = watched.filter(m => m.id !== movieId);
    saveWatchedMoviesToLocalStorage(filtered);
    return;
  }

  const userId = await getUserId();
  if (!userId) {
    console.warn('No user ID found, falling back to localStorage');
    const watched = getWatchedMoviesFromLocalStorage();
    const filtered = watched.filter(m => m.id !== movieId);
    saveWatchedMoviesToLocalStorage(filtered);
    return;
  }

  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);

    if (error) throw error;
  } catch (error) {
    console.error('Error unmarking movie as watched in Supabase:', error);
    // Fallback to localStorage
    const watched = getWatchedMoviesFromLocalStorage();
    const filtered = watched.filter(m => m.id !== movieId);
    saveWatchedMoviesToLocalStorage(filtered);
  }
}

export async function isMovieWatched(movieId: number): Promise<WatchedMovie | undefined> {
  const watched = await getWatchedMovies();
  return watched.find(m => m.id === movieId);
}

export async function shouldExcludeMovie(movieId: number): Promise<boolean> {
  const watchedMovie = await isMovieWatched(movieId);
  // Exclude if watched AND not marked as might watch again
  return watchedMovie !== undefined && !watchedMovie.mightWatchAgain;
}







