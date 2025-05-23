'use client';

import { useState, useEffect, useCallback } from 'react';

// Simple debounce utility to avoid external dependency
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
) {
  let timeout: NodeJS.Timeout | undefined;

  const debounced = (...args: Parameters<T>) => {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
}

// TMDB Movie interface for type safety
interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
}

interface MovieSelectStepProps {
  onNext: (data: { selectedMovies: TMDBMovie[] }) => void;
  onBack: () => void;
  data: any;
}

export default function MovieSelectStep({ onNext, onBack, data }: MovieSelectStepProps) {
  // State management for movie search and selection
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<TMDBMovie[]>(data.selectedMovies || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Call our internal API route that handles TMDB search
        const response = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error('Failed to search movies');
        }

        const { results } = await response.json();
        setSearchResults(results.slice(0, 10)); // Limit to top 10 results
      } catch (err) {
        setError('Failed to search movies. Please try again.');
        console.error('Movie search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Effect to trigger search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    
    // Cleanup function to cancel debounced calls
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  // Handle movie selection/deselection
  const handleMovieToggle = (movie: TMDBMovie) => {
    setSelectedMovies(prev => {
      const isAlreadySelected = prev.some(m => m.id === movie.id);
      
      if (isAlreadySelected) {
        // Remove movie from selection
        return prev.filter(m => m.id !== movie.id);
      } else if (prev.length < 3) {
        // Add movie if under limit
        return [...prev, movie];
      }
      
      // Don't add if already at limit
      return prev;
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMovies.length > 0) {
      onNext({ selectedMovies });
    }
  };

  // Get poster URL helper function
  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return '/placeholder-movie.jpg';
    return `https://image.tmdb.org/t/p/w200${posterPath}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Search Input Section */}
      <div className="space-y-4">
        <div>
          <label htmlFor="movie-search" className="block text-sm font-medium text-white mb-2">
            Search for movies you love
          </label>
          <div className="relative">
            <input
              id="movie-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for movies... (e.g., 'The Dark Knight', 'Inception')"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {isLoading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-sm bg-red-900 bg-opacity-20 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-h-96 overflow-y-auto space-y-2">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Search Results</h3>
            {searchResults.map((movie) => {
              const isSelected = selectedMovies.some(m => m.id === movie.id);
              const canSelect = selectedMovies.length < 3 || isSelected;

              return (
                <div
                  key={movie.id}
                  onClick={() => canSelect && handleMovieToggle(movie)}
                  className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 bg-opacity-10'
                      : canSelect
                      ? 'border-gray-700 hover:border-gray-600 cursor-pointer'
                      : 'border-gray-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <img
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-12 h-18 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-movie.jpg';
                    }}
                  />
                  <div className="ml-3 flex-1">
                    <h4 className="text-white font-medium">{movie.title}</h4>
                    <p className="text-gray-400 text-sm">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    </p>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                      {movie.overview || 'No description available'}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Movies Section */}
      {selectedMovies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white">
            Selected Movies ({selectedMovies.length}/3)
          </h3>
          <div className="grid gap-3">
            {selectedMovies.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center p-3 bg-primary-900 bg-opacity-20 border border-primary-700 rounded-lg"
              >
                <img
                  src={getPosterUrl(movie.poster_path)}
                  alt={movie.title}
                  className="w-12 h-18 object-cover rounded"
                />
                <div className="ml-3 flex-1">
                  <h4 className="text-white font-medium">{movie.title}</h4>
                  <p className="text-gray-400 text-sm">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleMovieToggle(movie)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions and Validation */}
      <div className="text-sm text-gray-400">
        <p>Select 1-3 movies that you love. We'll analyze what you enjoy about them.</p>
        {selectedMovies.length === 3 && (
          <p className="text-primary-400 mt-1">Maximum of 3 movies selected</p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={selectedMovies.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next ({selectedMovies.length} selected)
        </button>
      </div>
    </form>
  );
} 