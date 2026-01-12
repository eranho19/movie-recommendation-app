export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  adult: boolean;
  video: boolean;
  runtime?: number; // Duration in minutes
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  budget: number;
  revenue: number;
  tagline: string;
  homepage: string;
  imdb_id: string;
  status: string;
  awards?: Award[];
}

export interface Award {
  name: string;
  category?: string;
  year?: number;
  won: boolean;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Filters {
  genres: number[];
  tags: string[];
  minScore: number;
  language: 'english' | 'international' | 'all';
  totalTime?: number; // Total time in hours for movie combinations
  streamingProviders: string[]; // Selected streaming providers
  fromYear?: number; // Starting year for release date filter
  toYear?: number; // Ending year for release date filter
}

export type StreamingProvider = 'Netflix' | 'Prime' | 'Hulu' | 'Paramount' | 'HBO' | 'Disney' | 'Tubi' | 'Peacock' | 'AppleTV';

export const STREAMING_PROVIDERS: { id: string; name: StreamingProvider; tmdbId: number }[] = [
  { id: 'netflix', name: 'Netflix', tmdbId: 8 },
  { id: 'prime', name: 'Prime', tmdbId: 9 },
  { id: 'hulu', name: 'Hulu', tmdbId: 15 },
  { id: 'paramount', name: 'Paramount', tmdbId: 531 },
  { id: 'hbo', name: 'HBO', tmdbId: 384 },
  { id: 'disney', name: 'Disney', tmdbId: 337 },
  { id: 'tubi', name: 'Tubi', tmdbId: 283 },
  { id: 'peacock', name: 'Peacock', tmdbId: 386 },
  { id: 'appletv', name: 'AppleTV', tmdbId: 350 },
];

export interface WatchedMovie {
  id: number;
  watchedAt: string;
  mightWatchAgain: boolean;
}

export interface MovieCombination {
  movies: Movie[];
  totalRuntime: number;
  averageRating: number;
  provider?: string; // Streaming provider for this combination
}

export interface MovieWithProvider extends Movie {
  availableOn?: string[]; // List of provider IDs this movie is available on
}

export type ViewMode = 'list' | 'grid';

// Genre-specific tags
export const GENRE_TAGS: Record<string, { id: string; name: string; description: string }[]> = {
  // Horror (27)
  '27': [
    { id: 'gore', name: 'Gore', description: 'Graphic violence' },
    { id: 'psychological', name: 'Psychological', description: 'Mind games and fear' },
    { id: 'supernatural', name: 'Supernatural', description: 'Ghosts and demons' },
    { id: 'torture', name: 'Torture', description: 'Intense suffering' },
    { id: 'revenge', name: 'Revenge', description: 'Payback horror' },
    { id: 'slasher', name: 'Slasher', description: 'Serial killer themed' },
  ],
  // Comedy (35)
  '35': [
    { id: 'mockumentary', name: 'Mockumentary', description: 'Fake documentary style' },
    { id: 'nonsense', name: 'Nonsense', description: 'Absurd humor' },
    { id: 'satire', name: 'Satire', description: 'Social commentary' },
    { id: 'slapstick', name: 'Slapstick', description: 'Physical comedy' },
    { id: 'dark-comedy', name: 'Dark Comedy', description: 'Dark humor' },
    { id: 'romantic-comedy', name: 'Rom-Com', description: 'Love and laughs' },
  ],
  // Action (28)
  '28': [
    { id: 'martial-arts', name: 'Martial Arts', description: 'Hand-to-hand combat' },
    { id: 'explosions', name: 'Explosions', description: 'Big action set pieces' },
    { id: 'car-chases', name: 'Car Chases', description: 'High-speed pursuits' },
    { id: 'superhero', name: 'Superhero', description: 'Powered heroes' },
    { id: 'spy', name: 'Spy/Espionage', description: 'Secret agents' },
    { id: 'war', name: 'War', description: 'Military action' },
  ],
  // Drama (18)
  '18': [
    { id: 'biographical', name: 'Biographical', description: 'Based on real life' },
    { id: 'historical', name: 'Historical', description: 'Period pieces' },
    { id: 'emotional', name: 'Emotional', description: 'Deep feelings' },
    { id: 'legal', name: 'Legal', description: 'Courtroom drama' },
    { id: 'family', name: 'Family', description: 'Family relationships' },
    { id: 'political', name: 'Political', description: 'Government intrigue' },
  ],
  // Thriller (53)
  '53': [
    { id: 'mystery', name: 'Mystery', description: 'Whodunit' },
    { id: 'suspense', name: 'Suspense', description: 'Edge of your seat' },
    { id: 'crime', name: 'Crime', description: 'Criminal underworld' },
    { id: 'conspiracy', name: 'Conspiracy', description: 'Hidden plots' },
    { id: 'noir', name: 'Noir', description: 'Dark and gritty' },
    { id: 'heist', name: 'Heist', description: 'Elaborate theft' },
  ],
  // Science Fiction (878)
  '878': [
    { id: 'space', name: 'Space', description: 'Outer space adventures' },
    { id: 'time-travel', name: 'Time Travel', description: 'Temporal manipulation' },
    { id: 'dystopian', name: 'Dystopian', description: 'Dark future' },
    { id: 'cyberpunk', name: 'Cyberpunk', description: 'High tech, low life' },
    { id: 'alien', name: 'Alien', description: 'Extraterrestrial life' },
    { id: 'post-apocalyptic', name: 'Post-Apocalyptic', description: 'After the end' },
  ],
  // Romance (10749)
  '10749': [
    { id: 'epic-romance', name: 'Epic Romance', description: 'Grand love stories' },
    { id: 'tearjerker', name: 'Tearjerker', description: 'Emotional romance' },
    { id: 'period-romance', name: 'Period Romance', description: 'Historical love' },
    { id: 'forbidden-love', name: 'Forbidden Love', description: 'Star-crossed lovers' },
    { id: 'love-triangle', name: 'Love Triangle', description: 'Complicated relationships' },
  ],
  // Animation (16)
  '16': [
    { id: 'cgi', name: 'CGI', description: 'Computer animated' },
    { id: 'stop-motion', name: 'Stop Motion', description: 'Frame by frame' },
    { id: 'anime', name: 'Anime', description: 'Japanese animation' },
    { id: 'family-friendly', name: 'Family Friendly', description: 'For all ages' },
    { id: 'adult-animation', name: 'Adult Animation', description: 'Mature themes' },
  ],
  // Fantasy (14)
  '14': [
    { id: 'magic', name: 'Magic', description: 'Wizards and spells' },
    { id: 'medieval', name: 'Medieval', description: 'Knights and castles' },
    { id: 'mythology', name: 'Mythology', description: 'Gods and legends' },
    { id: 'epic-quest', name: 'Epic Quest', description: 'Hero\'s journey' },
    { id: 'dark-fantasy', name: 'Dark Fantasy', description: 'Grim and dark' },
  ],
};

