'use client';

import { useState } from 'react';

// Movie interface matching the previous step
interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
}

// Available movie attributes to analyze
const attributeOptions = [
  { value: 'acting', label: 'Acting Performance', icon: '🎭' },
  { value: 'cinematography', label: 'Cinematography', icon: '📸' },
  { value: 'story', label: 'Story/Plot', icon: '📖' },
  { value: 'dialogue', label: 'Dialogue', icon: '💬' },
  { value: 'soundtrack', label: 'Music/Soundtrack', icon: '🎵' },
  { value: 'humor', label: 'Humor', icon: '😄' },
  { value: 'action', label: 'Action Sequences', icon: '💥' },
  { value: 'emotion', label: 'Emotional Impact', icon: '❤️' },
  { value: 'worldbuilding', label: 'World Building', icon: '🌍' },
  { value: 'characters', label: 'Character Development', icon: '👥' },
  { value: 'pacing', label: 'Pacing', icon: '⏱️' },
  { value: 'atmosphere', label: 'Atmosphere/Mood', icon: '🌙' },
  { value: 'originality', label: 'Originality', icon: '✨' },
  { value: 'themes', label: 'Themes/Messages', icon: '💭' }
];

interface AttributeStepProps {
  onNext: (data: { movieAttributes: Record<number, string[]> }) => void;
  onBack: () => void;
  data: any;
}

export default function AttributeStep({ onNext, onBack, data }: AttributeStepProps) {
  const selectedMovies: TMDBMovie[] = data.selectedMovies || [];
  
  // State: movieId -> array of selected attribute values
  const [movieAttributes, setMovieAttributes] = useState<Record<number, string[]>>(
    data.movieAttributes || {}
  );

  // Get poster URL helper function
  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return '/placeholder-movie.jpg';
    return `https://image.tmdb.org/t/p/w200${posterPath}`;
  };

  // Handle attribute toggle for a specific movie
  const handleAttributeToggle = (movieId: number, attributeValue: string) => {
    setMovieAttributes(prev => {
      const movieAttrs = prev[movieId] || [];
      const isSelected = movieAttrs.includes(attributeValue);
      
      return {
        ...prev,
        [movieId]: isSelected
          ? movieAttrs.filter(attr => attr !== attributeValue)
          : [...movieAttrs, attributeValue]
      };
    });
  };

  // Check if all movies have at least one attribute selected
  const isValid = selectedMovies.every(movie => 
    movieAttributes[movie.id] && movieAttributes[movie.id].length > 0
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext({ movieAttributes });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Instructions */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-white">
          What did you love about each movie?
        </h3>
        <p className="text-gray-400 text-sm">
          Select the aspects that made these movies special to you. This helps us understand your preferences.
        </p>
      </div>

      {/* Movie Attribute Selection */}
      {selectedMovies.map((movie, movieIndex) => {
        const selectedAttrs = movieAttributes[movie.id] || [];
        
        return (
          <div key={movie.id} className="space-y-4">
            {/* Movie Header */}
            <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
              <img
                src={getPosterUrl(movie.poster_path)}
                alt={movie.title}
                className="w-16 h-24 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-movie.jpg';
                }}
              />
              <div className="flex-1">
                <h4 className="text-white font-semibold">{movie.title}</h4>
                <p className="text-gray-400 text-sm">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {selectedAttrs.length} attribute{selectedAttrs.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">
                  Movie {movieIndex + 1} of {selectedMovies.length}
                </span>
              </div>
            </div>

            {/* Attribute Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pl-4">
              {attributeOptions.map((attribute) => {
                const isSelected = selectedAttrs.includes(attribute.value);
                
                return (
                  <button
                    key={`${movie.id}-${attribute.value}`}
                    type="button"
                    onClick={() => handleAttributeToggle(movie.id, attribute.value)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 bg-opacity-10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-lg mb-1">{attribute.icon}</span>
                    <span className="text-xs font-medium text-white text-center leading-tight">
                      {attribute.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 h-3 w-3 rounded-full bg-primary-500 flex items-center justify-center">
                        <svg
                          className="h-2 w-2 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Validation Message for This Movie */}
            {selectedAttrs.length === 0 && (
              <div className="text-orange-400 text-sm bg-orange-900 bg-opacity-20 p-3 rounded-lg ml-4">
                Please select at least one aspect you loved about "{movie.title}"
              </div>
            )}
          </div>
        );
      })}

      {/* Overall Progress */}
      <div className="text-center text-sm text-gray-400">
        <p>
          {selectedMovies.filter(movie => movieAttributes[movie.id]?.length > 0).length} of{' '}
          {selectedMovies.length} movies completed
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Review Selections
        </button>
      </div>
    </form>
  );
} 