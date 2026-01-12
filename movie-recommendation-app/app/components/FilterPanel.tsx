'use client';

import { useState, useEffect } from 'react';
import { Film, Tag, Star, Globe, X, Filter, Clock, Tv, Calendar, AlertCircle } from 'lucide-react';
import type { Filters, Genre } from '../types/movie';
import { GENRE_TAGS, STREAMING_PROVIDERS } from '../types/movie';

interface FilterPanelProps {
  genres: Genre[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onSuggest: () => void;
}

export default function FilterPanel({ genres, filters, onFilterChange, onSuggest }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  // Generate year ranges from 1920 to current year in 10-year increments
  const currentYear = new Date().getFullYear();
  const yearRanges: { label: string; from: number; to: number }[] = [];
  for (let year = 1920; year <= currentYear; year += 10) {
    const endYear = Math.min(year + 9, currentYear);
    yearRanges.push({
      label: `${year} - ${endYear}`,
      from: year,
      to: endYear
    });
  }

  const handleGenreToggle = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter(id => id !== genreId)
      : [...filters.genres, genreId];
    // Clear tags when genres change as they're genre-specific
    onFilterChange({ ...filters, genres: newGenres, tags: [] });
  };

  const handleTagToggle = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(id => id !== tagId)
      : [...filters.tags, tagId];
    onFilterChange({ ...filters, tags: newTags });
  };

  const handleMinScoreChange = (value: number) => {
    onFilterChange({ ...filters, minScore: value });
  };

  const handleLanguageChange = (language: 'english' | 'international' | 'all') => {
    onFilterChange({ ...filters, language });
  };

  const handleTotalTimeChange = (value: number) => {
    onFilterChange({ ...filters, totalTime: value });
  };

  const handleProviderToggle = (providerId: string) => {
    const newProviders = filters.streamingProviders.includes(providerId)
      ? filters.streamingProviders.filter(id => id !== providerId)
      : [...filters.streamingProviders, providerId];
    onFilterChange({ ...filters, streamingProviders: newProviders });
  };

  const handleYearRangeChange = (value: string) => {
    if (value === '') {
      onFilterChange({ ...filters, fromYear: undefined, toYear: undefined });
    } else {
      const range = yearRanges.find(r => `${r.from}-${r.to}` === value);
      if (range) {
        onFilterChange({ ...filters, fromYear: range.from, toYear: range.to });
      }
    }
  };

  const clearFilters = () => {
    onFilterChange({
      genres: [],
      tags: [],
      minScore: 0,
      language: 'all',
      totalTime: undefined,
      streamingProviders: [],
      fromYear: undefined,
      toYear: undefined,
    });
  };

  // Get available tags based on selected genres
  const availableTags = filters.genres.length > 0
    ? filters.genres.flatMap(genreId => GENRE_TAGS[String(genreId)] || [])
    : [];

  // Remove duplicates
  const uniqueTags = availableTags.filter((tag, index, self) =>
    index === self.findIndex(t => t.id === tag.id)
  );

  const hasActiveFilters = 
    filters.genres.length > 0 || 
    filters.tags.length > 0 || 
    filters.minScore > 0 || 
    filters.language !== 'all' ||
    (filters.totalTime !== undefined && filters.totalTime > 0) ||
    filters.streamingProviders.length > 0 ||
    filters.fromYear !== undefined ||
    filters.toYear !== undefined;

  return (
    <div className="bg-imdb-surface border border-imdb-border rounded-lg p-4 md:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-imdb-yellow" />
          <h2 className="text-xl font-bold text-imdb-text-primary">Filters</h2>
          {hasActiveFilters && (
            <span className="bg-imdb-yellow text-imdb-bg text-xs font-bold px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-imdb-text-secondary hover:text-imdb-yellow text-sm flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-imdb-yellow hover:text-yellow-400 text-sm md:hidden"
          >
            {isOpen ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden md:block'}`}>
        {/* Genre Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Film className="w-5 h-5 text-imdb-yellow" />
            <h3 className="font-semibold text-imdb-text-primary">Genres</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <button
                key={genre.id}
                onClick={() => handleGenreToggle(genre.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filters.genres.includes(genre.id)
                    ? 'bg-imdb-yellow text-imdb-bg'
                    : 'bg-imdb-bg text-imdb-text-secondary hover:bg-imdb-border'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tags Filter - Only show when genres are selected */}
        {filters.genres.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-imdb-yellow" />
              <h3 className="font-semibold text-imdb-text-primary">Genre-Specific Tags</h3>
            </div>
            {uniqueTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {uniqueTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.tags.includes(tag.id)
                        ? 'bg-imdb-yellow text-imdb-bg'
                        : 'bg-imdb-bg text-imdb-text-secondary hover:bg-imdb-border'
                    }`}
                    title={tag.description}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-imdb-text-secondary">No specific tags available for selected genres</p>
            )}
          </div>
        )}

        {/* Minimum Score Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-imdb-yellow" />
            <h3 className="font-semibold text-imdb-text-primary">Minimum Score</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.minScore}
                onChange={(e) => handleMinScoreChange(parseFloat(e.target.value))}
                className="flex-1 accent-imdb-yellow"
              />
              <span className="text-imdb-yellow font-bold text-2xl w-16 text-right">
                {filters.minScore.toFixed(1)}+
              </span>
            </div>
            <p className="text-xs text-imdb-text-secondary">
              Show movies with a minimum rating of {filters.minScore.toFixed(1)} stars
            </p>
          </div>
        </div>

        {/* Language Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-imdb-yellow" />
            <h3 className="font-semibold text-imdb-text-primary">Language</h3>
          </div>
          <div className="flex gap-2">
            {(['all', 'english', 'international'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 ${
                  filters.language === lang
                    ? 'bg-imdb-yellow text-imdb-bg'
                    : 'bg-imdb-bg text-imdb-text-secondary hover:bg-imdb-border'
                }`}
              >
                {lang === 'all' ? 'All' : lang === 'english' ? 'English' : 'International'}
              </button>
            ))}
          </div>
        </div>

        {/* Year Range Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-imdb-yellow" />
            <h3 className="font-semibold text-imdb-text-primary">Release Year</h3>
          </div>
          <select
            value={filters.fromYear && filters.toYear ? `${filters.fromYear}-${filters.toYear}` : ''}
            onChange={(e) => handleYearRangeChange(e.target.value)}
            className="w-full bg-imdb-bg border border-imdb-border text-imdb-text-primary rounded-md px-3 py-2 focus:outline-none focus:border-imdb-yellow transition-colors"
          >
            <option value="">All Years</option>
            {yearRanges.map(range => (
              <option key={`${range.from}-${range.to}`} value={`${range.from}-${range.to}`}>
                {range.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-imdb-text-secondary mt-2">
            {filters.fromYear && filters.toYear
              ? `Showing movies from ${filters.fromYear} to ${filters.toYear}`
              : 'Filter movies by release year range'}
          </p>
        </div>

        {/* Streaming Providers Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tv className="w-5 h-5 text-imdb-yellow" />
            <h3 className="font-semibold text-imdb-text-primary">Streaming Providers</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {STREAMING_PROVIDERS.map(provider => (
              <button
                key={provider.id}
                onClick={() => handleProviderToggle(provider.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filters.streamingProviders.includes(provider.id)
                    ? 'bg-imdb-yellow text-imdb-bg'
                    : 'bg-imdb-bg text-imdb-text-secondary hover:bg-imdb-border'
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-imdb-text-secondary mt-2">
            {filters.streamingProviders.length > 0
              ? `Filtering by ${filters.streamingProviders.length} provider(s). Note: Older movies may have limited availability.`
              : 'Select providers to filter by streaming availability (US region)'}
          </p>
          {filters.streamingProviders.length > 0 && (filters.fromYear || filters.toYear) && (
            <p className="text-xs text-yellow-500 mt-1 flex items-start gap-1">
              <span>⚠️</span>
              <span>Combining year filters with streaming providers may significantly reduce results, especially for older movies.</span>
            </p>
          )}
        </div>

        {/* Total Time Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-imdb-yellow" />
            <h3 className="font-semibold text-imdb-text-primary">Total Viewing Time</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.totalTime || 0}
                onChange={(e) => handleTotalTimeChange(parseFloat(e.target.value))}
                className="flex-1 accent-imdb-yellow"
              />
              <span className="text-imdb-yellow font-bold text-2xl w-20 text-right">
                {filters.totalTime ? `${filters.totalTime}h` : 'Off'}
              </span>
            </div>
            <p className="text-xs text-imdb-text-secondary">
              {filters.totalTime && filters.totalTime > 0 
                ? filters.streamingProviders.length > 0
                  ? `Get 3 combinations per provider totaling ${filters.totalTime} hours (±30 min)`
                  : `Get 5 movie combinations totaling ${filters.totalTime} hours (±30 min)`
                : 'Set total time to get movie combinations for tonight'}
            </p>
          </div>
        </div>

        {/* Suggest Button */}
        <div className="pt-4 border-t border-imdb-border">
          <button
            onClick={onSuggest}
            className="w-full bg-imdb-yellow hover:bg-yellow-500 text-imdb-bg font-bold py-3 px-6 rounded-md text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Film className="w-6 h-6" />
            Suggest Movies
          </button>
          <p className="text-xs text-imdb-text-secondary text-center mt-2">
            Click to get movie recommendations based on your filters
          </p>
        </div>
      </div>
    </div>
  );
}

