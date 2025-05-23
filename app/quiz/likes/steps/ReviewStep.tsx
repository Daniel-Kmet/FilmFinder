'use client';

// Movie interface matching previous steps
interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
}

// Attribute options for display labels
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

interface ReviewStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  data: any;
}

export default function ReviewStep({ onNext, onBack, data }: ReviewStepProps) {
  const selectedMovies: TMDBMovie[] = data.selectedMovies || [];
  const movieAttributes: Record<number, string[]> = data.movieAttributes || {};

  // Get poster URL helper function
  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return '/placeholder-movie.jpg';
    return `https://image.tmdb.org/t/p/w200${posterPath}`;
  };

  // Get attribute label from value
  const getAttributeLabel = (value: string) => {
    return attributeOptions.find(attr => attr.value === value)?.label || value;
  };

  // Get attribute icon from value
  const getAttributeIcon = (value: string) => {
    return attributeOptions.find(attr => attr.value === value)?.icon || '⭐';
  };

  // Handle final submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass all data to parent for final submission
    onNext(data);
  };

  // Calculate total selections for summary
  const totalAttributes = Object.values(movieAttributes).reduce(
    (total, attrs) => total + attrs.length, 
    0
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-white">
          Review Your Preferences
        </h3>
        <p className="text-gray-400">
          Here's what we learned about your movie preferences. Ready to get your personalized recommendation?
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-400">{selectedMovies.length}</div>
          <div className="text-sm text-gray-400">Movies Selected</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-400">{totalAttributes}</div>
          <div className="text-sm text-gray-400">Preferences Identified</div>
        </div>
      </div>

      {/* Movie Reviews */}
      <div className="space-y-6">
        {selectedMovies.map((movie, index) => {
          const movieAttrs = movieAttributes[movie.id] || [];
          
          return (
            <div key={movie.id} className="bg-gray-800 rounded-lg p-4 space-y-4">
              {/* Movie Header */}
              <div className="flex items-start space-x-4">
                <img
                  src={getPosterUrl(movie.poster_path)}
                  alt={movie.title}
                  className="w-20 h-30 object-cover rounded flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-movie.jpg';
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{movie.title}</h4>
                      <p className="text-gray-400 text-sm">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                      </p>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          {movieAttrs.length} aspect{movieAttrs.length !== 1 ? 's' : ''} you loved:
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected Attributes */}
              <div className="ml-24">
                <div className="flex flex-wrap gap-2">
                  {movieAttrs.map((attrValue) => (
                    <div
                      key={attrValue}
                      className="flex items-center space-x-1 px-3 py-1 bg-primary-900 bg-opacity-30 border border-primary-700 rounded-full text-sm"
                    >
                      <span>{getAttributeIcon(attrValue)}</span>
                      <span className="text-primary-200">{getAttributeLabel(attrValue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Privacy Notice */}
      <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-400 text-lg">🔒</div>
          <div className="text-sm">
            <h5 className="text-blue-200 font-medium mb-1">Your Privacy Matters</h5>
            <p className="text-blue-300 text-xs leading-relaxed">
              Your preferences are used only to generate personalized recommendations. 
              We don't share your movie data with third parties, and you can delete your 
              quiz responses at any time from your profile.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Edit</span>
        </button>

        <button
          type="submit"
          className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          <span>Get My Recommendation</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Additional Context */}
      <div className="text-center text-xs text-gray-500">
        <p>
          Based on your selections, our AI will analyze similar movies and recommend 
          something you'll love. This usually takes just a few seconds.
        </p>
      </div>
    </form>
  );
} 