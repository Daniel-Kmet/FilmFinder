'use client';

import { useRouter } from 'next/navigation';
import QuizWizard from '@/app/components/QuizWizard';
import MovieSelectStep from './steps/MovieSelectStep';
import AttributeStep from './steps/AttributeStep';
import ReviewStep from './steps/ReviewStep';

/**
 * Likes/Dislikes Quiz Page
 * 
 * This quiz helps users identify their preferences by:
 * 1. Selecting 1-3 movies they love
 * 2. Identifying what they liked about each movie
 * 3. Reviewing their selections before submission
 * 
 * The quiz results are used to generate personalized movie recommendations
 * via AI analysis of their stated preferences.
 */

// Quiz step configuration
const steps = [
  {
    id: 'movie-select',
    title: 'Select Your Favorite Movies',
    description: 'Choose 1-3 movies that you absolutely love. We\'ll use these to understand your taste.',
    component: MovieSelectStep,
  },
  {
    id: 'attributes',
    title: 'What Did You Love?',
    description: 'For each movie, tell us what aspects made it special to you.',
    component: AttributeStep,
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Take a final look at your preferences before we generate your recommendation.',
    component: ReviewStep,
  },
];

export default function LikesQuiz() {
  const router = useRouter();

  /**
   * Handle quiz completion
   * 
   * When user completes all steps, we:
   * 1. Store the quiz data temporarily
   * 2. Navigate to the ad interstitial page
   * 3. Pass quiz type and responses for recommendation generation
   */
  const handleComplete = async (data: Record<string, unknown>) => {
    try {
      // Extract movie titles and attributes
      const selectedMovies = data.selectedMovies as Array<{
        title: string;
        genre_ids?: number[];
        credits?: {
          cast?: Array<{ name: string }>;
        };
      }>;
      
      const favoriteMovies = selectedMovies.map((movie) => movie.title);
      const favoriteGenres = Array.from(new Set(
        selectedMovies.flatMap((movie) => 
          movie.genre_ids || []
        )
      ));
      const favoriteActors = Array.from(new Set(
        selectedMovies.flatMap((movie) => 
          movie.credits?.cast?.slice(0, 3).map((cast) => cast.name) || []
        )
      ));

      // Prepare quiz payload
      const quizPayload = {
        type: 'likes' as const,
        responses: {
          favoriteMovies,
          favoriteGenres,
          favoriteActors,
          dislikedGenres: [], // Not collected in this quiz
          preferredDecade: 'any', // Not collected in this quiz
          viewingContext: 'any', // Not collected in this quiz
        },
      };

      // Store quiz data in sessionStorage for ad page
      sessionStorage.setItem('pendingQuiz', JSON.stringify(quizPayload));

      // Navigate to ad interstitial
      router.push('/quiz/ad');

    } catch (error) {
      console.error('Error preparing quiz submission:', error);
      
      // Show user-friendly error
      alert('There was an issue processing your quiz. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Page Header */}
      <div className="container mx-auto px-4 pt-8 pb-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Tell Us What You Love
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Help us understand your movie preferences by sharing some favorites. 
            Our AI will analyze what you love to find your next perfect watch.
          </p>
        </div>
      </div>

      {/* Quiz Wizard */}
      <QuizWizard
        steps={steps}
        onComplete={handleComplete}
        initialData={{
          selectedMovies: [],
          movieAttributes: {},
        }}
      />

      {/* Progress Indicator Info */}
      <div className="container mx-auto px-4 pb-8">
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>This quiz typically takes 3-5 minutes to complete</p>
          <p>Your responses are used only for generating recommendations</p>
        </div>
      </div>
    </div>
  );
} 