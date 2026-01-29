'use client';

import { useState, useEffect } from 'react';
import { Film, Tag, Star, Globe, X, Filter, Clock, Tv, Calendar, AlertCircle } from 'lucide-react';
import type { Filters, Genre, LanguageOption } from '../types/movie';
import { GENRE_TAGS, STREAMING_PROVIDERS, LANGUAGE_OPTIONS } from '../types/movie';
import { playClickSound } from '../lib/sounds';

interface FilterPanelProps {
  genres: Genre[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onSuggest: () => void;
}

export default function FilterPanel({ genres, filters, onFilterChange, onSuggest }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  // Generate year options from 1920 to 2020 in 10-year increments, plus "Current"
  const currentYear = new Date().getFullYear();
  const yearOptions: { label: string; value: number | 'current' }[] = [];
  for (let year = 1920; year <= 2020; year += 10) {
    yearOptions.push({
      label: year.toString(),
      value: year
    });
  }
  // Add "Current" option which represents the current year
  yearOptions.push({
    label: 'Current',
    value: 'current'
  });

  const handleGenreToggle = (genreId: number) => {
    playClickSound();
    
    // If clicking the same genre that's already selected, deselect it (re-enable multi-select)
    if (filters.genres.includes(genreId) && filters.genres.length === 1) {
      const newGenres: number[] = [];
      onFilterChange({ ...filters, genres: newGenres, tags: [] });
      return;
    }
    
    // If a genre is already selected, replace it with the new one (single-select mode)
    // Otherwise, add to the list (multi-select mode when none selected)
    const newGenres = filters.genres.length > 0 && !filters.genres.includes(genreId)
      ? [genreId] // Single-select: replace with new selection
      : filters.genres.includes(genreId)
        ? filters.genres.filter(id => id !== genreId) // Deselect if already selected
        : [...filters.genres, genreId]; // Add if none selected (multi-select mode)
    
    // Clear tags when genres change as they're genre-specific
    onFilterChange({ ...filters, genres: newGenres, tags: [] });
  };

  const handleTagToggle = (tagId: string) => {
    playClickSound();
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(id => id !== tagId)
      : [...filters.tags, tagId];
    onFilterChange({ ...filters, tags: newTags });
  };

  const handleMinScoreChange = (value: number) => {
    playClickSound();
    onFilterChange({ ...filters, minScore: value });
  };

  const handleLanguageChange = (language: 'english' | 'international' | 'all') => {
    playClickSound();
    // Keep international languages when switching to 'all' or 'international'
    // Only clear when switching to 'english'
    const updatedFilters: Filters = {
      ...filters,
      language,
      ...(language === 'english' ? { internationalLanguages: undefined } : {})
    };
    onFilterChange(updatedFilters);
  };

  const handleInternationalLanguageToggle = (languageId: LanguageOption) => {
    playClickSound();
    const currentLanguages = filters.internationalLanguages || [];
    const newLanguages = currentLanguages.includes(languageId)
      ? currentLanguages.filter(id => id !== languageId)
      : [...currentLanguages, languageId];
    onFilterChange({ ...filters, internationalLanguages: newLanguages.length > 0 ? newLanguages : undefined });
  };

  const handleTotalTimeChange = (value: number) => {
    playClickSound();
    onFilterChange({ ...filters, totalTime: value });
  };

  const handleProviderToggle = (providerId: string) => {
    playClickSound();
    const newProviders = filters.streamingProviders.includes(providerId)
      ? filters.streamingProviders.filter(id => id !== providerId)
      : [...filters.streamingProviders, providerId];
    onFilterChange({ ...filters, streamingProviders: newProviders });
  };

  const handleFromYearChange = (value: string) => {
    playClickSound();
    if (value === '') {
      onFilterChange({ ...filters, fromYear: undefined });
    } else {
      const yearValue = value === 'current' ? currentYear : parseInt(value, 10);
      onFilterChange({ ...filters, fromYear: yearValue });
    }
  };

  const handleToYearChange = (value: string) => {
    playClickSound();
    if (value === '') {
      onFilterChange({ ...filters, toYear: undefined });
    } else {
      const yearValue = value === 'current' ? currentYear : parseInt(value, 10);
      onFilterChange({ ...filters, toYear: yearValue });
    }
  };

  const clearFilters = () => {
    playClickSound();
    onFilterChange({
      genres: [],
      tags: [],
      minScore: 0,
      language: 'all',
      internationalLanguages: undefined,
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
    (filters.internationalLanguages?.length ?? 0) > 0 ||
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
            onClick={() => {
              playClickSound();
              setIsOpen(!isOpen);
            }}
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
            {genres.map(genre => {
              const isSelected = filters.genres.includes(genre.id);
              const isDisabled = filters.genres.length > 0 && !isSelected; // Disable if another genre is selected
              
              return (
                <button
                  key={genre.id}
                  onClick={() => handleGenreToggle(genre.id)}
                  disabled={isDisabled}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-imdb-yellow text-imdb-bg'
                      : isDisabled
                        ? 'bg-imdb-bg text-imdb-text-secondary opacity-40 cursor-not-allowed'
                        : 'bg-imdb-bg text-imdb-text-secondary hover:bg-imdb-border'
                  }`}
                  title={isDisabled ? 'Click the selected genre again to enable multi-select' : ''}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
          {filters.genres.length > 0 && (
            <p className="text-xs text-imdb-text-secondary mt-2">
              💡 Click the selected genre again to enable multi-select
            </p>
          )}
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
          <div className="flex gap-2 mb-3">
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
          {/* Multi-language selection for International and All */}
          {(filters.language === 'international' || filters.language === 'all') && (
            <div className="mt-3 pt-3 border-t border-imdb-border">
              <p className="text-xs text-imdb-text-secondary mb-2">
                {filters.language === 'all' 
                  ? 'Select specific international languages (English will always be included):'
                  : 'Select specific languages:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map(lang => {
                  const isSelected = filters.internationalLanguages?.includes(lang.id) || false;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => handleInternationalLanguageToggle(lang.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-imdb-yellow text-imdb-bg'
                          : 'bg-imdb-bg text-imdb-text-secondary hover:bg-imdb-border'
                      }`}
                    >
                      {lang.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-imdb-text-secondary mt-2">
                {filters.internationalLanguages && filters.internationalLanguages.length > 0
                  ? filters.language === 'all'
                    ? `Selected: ${filters.internationalLanguages.length} international language(s) (English always included)`
                    : `Selected: ${filters.internationalLanguages.length} language(s)`
                  : filters.language === 'all'
                    ? 'Select languages or leave empty to show all languages (English prioritized)'
                    : 'Select languages or leave empty to show all non-English movies'}
              </p>
            </div>
          )}
        </div>

        {/* Year Range Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-imdb-yellow" />
            <h3 className="font-semibold text-imdb-text-primary">Release Year</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-imdb-text-secondary mb-1">From</label>
              <select
                value={filters.fromYear === undefined ? '' : (filters.fromYear === currentYear ? 'current' : filters.fromYear.toString())}
                onChange={(e) => handleFromYearChange(e.target.value)}
                className="w-full bg-imdb-bg border border-imdb-border text-imdb-text-primary rounded-md px-3 py-2 focus:outline-none focus:border-imdb-yellow transition-colors"
              >
                <option value="">Any</option>
                {yearOptions.map(option => (
                  <option key={`from-${option.value}`} value={option.value.toString()}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-imdb-text-secondary mb-1">To</label>
              <select
                value={filters.toYear === undefined ? '' : (filters.toYear === currentYear ? 'current' : filters.toYear.toString())}
                onChange={(e) => handleToYearChange(e.target.value)}
                className="w-full bg-imdb-bg border border-imdb-border text-imdb-text-primary rounded-md px-3 py-2 focus:outline-none focus:border-imdb-yellow transition-colors"
              >
                <option value="">Any</option>
                {yearOptions.map(option => (
                  <option key={`to-${option.value}`} value={option.value.toString()}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-imdb-text-secondary mt-2">
            {filters.fromYear !== undefined || filters.toYear !== undefined
              ? `Showing movies from ${filters.fromYear !== undefined ? filters.fromYear : 'any year'} to ${filters.toYear !== undefined ? filters.toYear : 'any year'}`
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
            onClick={() => {
              playClickSound();
              onSuggest();
            }}
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

