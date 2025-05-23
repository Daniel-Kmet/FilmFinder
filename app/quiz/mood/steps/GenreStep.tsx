'use client';

import { useState } from 'react';

interface GenreStepProps {
  onNext: (data: { genres: string[] }) => void;
  onBack: () => void;
  data: Record<string, unknown>;
}

const genreOptions = [
  { value: 'action', label: 'Action', icon: '🎬' },
  { value: 'comedy', label: 'Comedy', icon: '😄' },
  { value: 'drama', label: 'Drama', icon: '🎭' },
  { value: 'horror', label: 'Horror', icon: '👻' },
  { value: 'romance', label: 'Romance', icon: '❤️' },
  { value: 'sci-fi', label: 'Sci-Fi', icon: '🚀' },
  { value: 'thriller', label: 'Thriller', icon: '🔪' },
  { value: 'documentary', label: 'Documentary', icon: '📹' },
  { value: 'animation', label: 'Animation', icon: '🎨' },
  { value: 'fantasy', label: 'Fantasy', icon: '✨' },
  { value: 'mystery', label: 'Mystery', icon: '🔍' },
  { value: 'western', label: 'Western', icon: '🤠' },
];

export default function GenreStep({ onNext, onBack, data }: GenreStepProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>((data.genres as string[]) || []);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGenres.length > 0) {
      onNext({ genres: selectedGenres });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {genreOptions.map((genre) => (
          <button
            key={genre.value}
            type="button"
            onClick={() => handleGenreToggle(genre.value)}
            className={`relative flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200 ${
              selectedGenres.includes(genre.value)
                ? 'border-primary-500 bg-primary-50 bg-opacity-10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <span className="text-2xl mb-2">{genre.icon}</span>
            <span className="text-sm font-medium text-white">{genre.label}</span>
            {selectedGenres.includes(genre.value) && (
              <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary-500 flex items-center justify-center">
                <svg
                  className="h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">
          {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
        </p>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={selectedGenres.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </form>
  );
} 