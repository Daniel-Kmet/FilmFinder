'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizResponse, MovieRecommendation, RecommendationAPIResult } from '@/app/types';
import MovieCard from '@/app/components/MovieCard';
import trackEvent from '@/app/lib/analytics';

/**
 * Results Page
 * 
 * Displays AI-generated movie recommendations based on completed quiz.
 * Handles the complete flow from quiz data → API call → results display.
 * 
 * Workflow:
 * 1. Retrieve quiz data from sessionStorage
 * 2. Call /api/recommend with quiz payload
 * 3. Display loading state during processing
 * 4. Show recommendation with rich UI
 * 5. Fire analytics events
 * 6. Handle errors gracefully
 */

interface LoadingState {
  step: 'validating' | 'ai-thinking' | 'fetching-data' | 'complete' | 'error';
  message: string;
}

export default function ResultsPage() {
  const router = useRouter();
  
  // Component state
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [recommendation, setRecommendation] = useState<MovieRecommendation | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    step: 'validating',
    message: 'Validating your quiz responses...'
  });
  const [error, setError] = useState<string | null>(null);

  /**
   * Load quiz data and trigger recommendation generation
   */
  useEffect(() => {
    const loadQuizAndGenerateRecommendation = async () => {
      try {
        // Step 1: Retrieve quiz data from sessionStorage
        const completedQuizData = sessionStorage.getItem('completedQuiz');
        
        if (!completedQuizData) {
          console.error('[Results] No completed quiz data found');
          setError('No quiz data found. Please complete a quiz first.');
          setLoading({ step: 'error', message: 'Quiz data not found' });
          return;
        }

        const parsedQuizData: QuizResponse = JSON.parse(completedQuizData);
        setQuizData(parsedQuizData);
        
        console.log(`[Results] Processing ${parsedQuizData.type} quiz`);

        // Step 2: Update loading state for AI processing
        setLoading({
          step: 'ai-thinking',
          message: 'Our AI is analyzing your preferences...'
        });

        // Step 3: Call recommendation API
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsedQuizData),
        });

        if (!response.ok) {
          const errorData: RecommendationAPIResult = await response.json();
          throw new Error(errorData.success === false ? errorData.error : 'API request failed');
        }

        // Step 4: Update loading state for data fetching
        setLoading({
          step: 'fetching-data',
          message: 'Fetching movie details and cast information...'
        });

        const result: RecommendationAPIResult = await response.json();
        
        if (!result.success) {
          throw new Error(result.error);
        }

        // Step 5: Set recommendation and complete loading
        setRecommendation(result.recommendation);
        setLoading({
          step: 'complete',
          message: 'Your perfect movie match is ready!'
        });

        // Step 6: Fire analytics event
        trackEvent('recommendation_displayed', {
          quiz_type: parsedQuizData.type,
          movie_id: result.recommendation.tmdbId,
          movie_title: result.recommendation.title,
          confidence_score: result.recommendation.confidenceScore,
          processing_time: result.metadata.processingTime,
          ai_model: result.metadata.aiModel,
        });

        console.log(`[Results] Recommendation complete: ${result.recommendation.title}`);

      } catch (error) {
        console.error('[Results] Error generating recommendation:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        setError(errorMessage);
        setLoading({
          step: 'error',
          message: 'Something went wrong while generating your recommendation'
        });

        // Track error event
        if (quizData) {
          trackEvent('recommendation_error', {
            quiz_type: quizData.type,
            error_message: errorMessage,
          });
        }
      }
    };

    loadQuizAndGenerateRecommendation();
  }, []);

  /**
   * Handle "Find Where to Watch" click
   */
  const handleWatchClick = () => {
    if (!recommendation || !quizData) return;

    // Track click event
    trackEvent('watch_clicked', {
      quiz_type: quizData.type,
      movie_id: recommendation.tmdbId,
      movie_title: recommendation.title,
    });

    // Open TMDB page in new tab
    window.open(recommendation.tmdbUrl, '_blank');
  };

  /**
   * Handle "Save for Later" click
   */
  const handleSaveClick = async () => {
    if (!recommendation || !quizData) return;

    // Track save event
    trackEvent('movie_saved', {
      quiz_type: quizData.type,
      movie_id: recommendation.tmdbId,
      movie_title: recommendation.title,
    });

    // TODO: Implement save functionality (Priority 2)
    alert('Save functionality will be implemented in the next phase!');
  };

  /**
   * Handle "Take Another Quiz" click
   */
  const handleNewQuiz = () => {
    if (quizData) {
      trackEvent('new_quiz_started', {
        previous_quiz_type: quizData.type,
        from_results: true,
      });
    }

    // Clear session storage and navigate to home
    sessionStorage.removeItem('completedQuiz');
    sessionStorage.removeItem('pendingQuiz');
    router.push('/');
  };

  // Loading state render
  if (loading.step !== 'complete' && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-6 p-8">
          {/* Loading animation */}
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">
                {loading.step === 'validating' && '📋'}
                {loading.step === 'ai-thinking' && '🤖'}
                {loading.step === 'fetching-data' && '🎬'}
              </span>
            </div>
          </div>

          {/* Loading message */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {loading.message}
            </h2>
            <p className="text-gray-600 text-sm">
              {loading.step === 'ai-thinking' && 'This may take 10-15 seconds...'}
              {loading.step === 'fetching-data' && 'Almost done...'}
              {loading.step === 'validating' && 'Just a moment...'}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: loading.step === 'validating' ? '20%' :
                       loading.step === 'ai-thinking' ? '60%' :
                       loading.step === 'fetching-data' ? '90%' : '100%'
              }}
            />
          </div>

          {/* Powered by notice */}
          <p className="text-xs text-gray-500">
            Powered by Google Gemini AI & The Movie Database
          </p>
        </div>
      </div>
    );
  }

  // Error state render
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-6 p-8">
          <div className="text-6xl">😕</div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {error}
            </p>
            <button
              onClick={handleNewQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state render
  if (recommendation && quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Your Perfect Movie Match! 🎯
            </h1>
            <p className="text-gray-600">
              Based on your {quizData.type === 'mood' ? 'mood preferences' : 'favorite movies'}
            </p>
          </div>

          {/* Movie Card */}
          <MovieCard
            movie={recommendation}
            onWatchClick={handleWatchClick}
            onSaveClick={handleSaveClick}
            className="mb-8"
          />

          {/* Action Bar */}
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <button
              onClick={handleNewQuiz}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              🎲 Get Another Recommendation
            </button>
            
            <p className="text-sm text-gray-500">
              Not quite what you are looking for? Take another quiz to discover more movies!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 