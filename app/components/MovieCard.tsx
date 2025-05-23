/**
 * Movie Card Component
 * 
 * Displays a recommended movie with all relevant information:
 * - Movie poster and backdrop
 * - Title, year, rating, runtime
 * - AI explanation and match reasons
 * - Cast information
 * - Watch links (TMDB, IMDB)
 * - Call-to-action buttons
 */

import { MovieRecommendation } from '@/app/types';
import Image from 'next/image';

interface MovieCardProps {
  movie: MovieRecommendation;
  onWatchClick: () => void;
  onSaveClick: () => void;
  className?: string;
}

export default function MovieCard({ movie, onWatchClick, onSaveClick, className = '' }: MovieCardProps) {
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';
  const runtimeText = movie.runtime ? `${movie.runtime} min` : '';
  
  return (
    <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto ${className}`}>
      {/* Header with backdrop */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-900 to-purple-900">
        {movie.backdropUrl && (
          <Image
            src={movie.backdropUrl}
            alt={`${movie.title} backdrop`}
            fill
            className="object-cover opacity-60"
            priority
          />
        )}
        
        {/* Overlay content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-end space-x-6">
            {/* Movie Poster */}
            <div className="flex-shrink-0 w-24 h-36 md:w-32 md:h-48 rounded-lg overflow-hidden bg-gray-800 shadow-2xl">
              {movie.posterUrl ? (
                <Image
                  src={movie.posterUrl}
                  alt={`${movie.title} poster`}
                  width={200}
                  height={300}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <span className="text-4xl">🎬</span>
                </div>
              )}
            </div>
            
            {/* Movie Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 truncate">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-200">
                {releaseYear && <span>{releaseYear}</span>}
                {movie.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">★</span>
                    <span>{movie.rating}/10</span>
                  </div>
                )}
                {runtimeText && <span>{runtimeText}</span>}
              </div>
              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {movie.genres.slice(0, 3).map(genre => (
                    <span
                      key={genre}
                      className="px-2 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 space-y-6">
        {/* AI Explanation */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <span className="text-lg mr-2">🤖</span>
            Why this movie?
          </h3>
          <p className="text-blue-800 leading-relaxed">{movie.explanation}</p>
          
          {/* Match Reasons */}
          {movie.matchReasons.length > 0 && (
            <div className="mt-3 space-y-1">
              {movie.matchReasons.map((reason, index) => (
                <div key={index} className="flex items-center text-sm text-blue-700">
                  <span className="text-blue-400 mr-2">•</span>
                  {reason}
                </div>
              ))}
            </div>
          )}
          
          {/* Confidence Score */}
          <div className="mt-3 flex items-center">
            <span className="text-xs text-blue-600 mr-2">Confidence:</span>
            <div className="flex-1 bg-blue-200 rounded-full h-2 max-w-24">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${movie.confidenceScore * 100}%` }}
              />
            </div>
            <span className="text-xs text-blue-600 ml-2">
              {Math.round(movie.confidenceScore * 100)}%
            </span>
          </div>
        </div>

        {/* Movie Overview */}
        {movie.overview && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Plot</h3>
            <p className="text-gray-700 leading-relaxed">{movie.overview}</p>
          </div>
        )}

        {/* Cast */}
        {movie.cast.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Cast</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {movie.cast.map((castMember, index) => (
                <div key={index} className="flex-shrink-0 text-center w-16">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mb-2">
                    {castMember.profileUrl ? (
                      <Image
                        src={castMember.profileUrl}
                        alt={castMember.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-gray-500 text-lg">👤</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {castMember.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {castMember.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onWatchClick}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🎬 Find Where to Watch
          </button>
          
          <button
            onClick={onSaveClick}
            className="sm:w-auto px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium rounded-lg transition-colors duration-200"
          >
            💾 Save for Later
          </button>
        </div>

        {/* External Links */}
        <div className="flex justify-center space-x-6 text-sm text-gray-500">
          <a
            href={movie.tmdbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            View on TMDB →
          </a>
          {movie.imdbUrl && (
            <a
              href={movie.imdbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-600 transition-colors duration-200"
            >
              View on IMDb →
            </a>
          )}
        </div>
      </div>
    </div>
  );
} 