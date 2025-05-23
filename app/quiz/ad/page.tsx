'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import trackEvent from '@/app/lib/analytics';

/**
 * Ad Interstitial Page
 * 
 * This page serves as a bridge between quiz completion and recommendation results.
 * It displays an ad (video or placeholder) that funds the AI recommendation service,
 * tracks analytics events, and automatically redirects to results upon completion.
 * 
 * Workflow:
 * 1. User completes quiz → navigates here with quiz data in sessionStorage
 * 2. Ad plays for ~30 seconds (or until video ends)
 * 3. GA4 'ad_viewed' event is fired
 * 4. Automatic redirect to /results with quiz payload
 */

interface QuizPayload {
  type: 'mood' | 'likes';
  responses: Record<string, unknown>;
}

export default function AdInterstitialPage() {
  const router = useRouter();
  
  // Component state
  const [quizData, setQuizData] = useState<QuizPayload | null>(null);
  const [adError, setAdError] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isAdCompleted, setIsAdCompleted] = useState(false);
  
  // Refs for cleanup
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout>();
  const countdownTimerRef = useRef<NodeJS.Timeout>();

  // Environment configuration
  const adUrl = process.env.NEXT_PUBLIC_VAST_TAG_URL || '/placeholder-ad.mp4';
  const isVastAd = !!process.env.NEXT_PUBLIC_VAST_TAG_URL;

  /**
   * Load quiz data from sessionStorage
   * This data was stored by the quiz completion handlers
   */
  useEffect(() => {
    try {
      const pendingQuizData = sessionStorage.getItem('pendingQuiz');
      
      if (!pendingQuizData) {
        console.error('[Ad] No pending quiz data found');
        // Redirect to home if no quiz data
        router.push('/');
        return;
      }

      const parsedData: QuizPayload = JSON.parse(pendingQuizData);
      setQuizData(parsedData);

      console.log('[Ad] Loaded quiz data:', parsedData.type);
      
    } catch (error) {
      console.error('[Ad] Error loading quiz data:', error);
      router.push('/');
    }
  }, [router]);

  /**
   * Handle ad completion - fires analytics and redirects
   * This is called when:
   * - Video ends naturally
   * - Fallback timeout expires (30 seconds)
   * - Video fails to load
   */
  const handleAdComplete = () => {
    if (isAdCompleted || !quizData) return;
    
    setIsAdCompleted(true);

    try {
      // Fire GA4 analytics event
      trackEvent('ad_viewed', {
        quiz_type: quizData.type,
        ad_type: isVastAd ? 'vast' : 'placeholder',
        ad_duration: 30 - timeRemaining,
        error_occurred: adError,
      });

      console.log('[Ad] Analytics event fired: ad_viewed');

      // Small delay to ensure analytics fires
      setTimeout(() => {
        // Store quiz data for results page
        sessionStorage.setItem('completedQuiz', JSON.stringify(quizData));
        
        // Clean up pending quiz data
        sessionStorage.removeItem('pendingQuiz');
        
        // Navigate to results
        router.push('/results');
      }, 500);

    } catch (error) {
      console.error('[Ad] Error in handleAdComplete:', error);
      // Still redirect even if analytics fails
      router.push('/results');
    }
  };

  /**
   * Handle video error
   * If the ad fails to load, we still proceed to results
   */
  const handleVideoError = () => {
    console.warn('[Ad] Video failed to load, proceeding to results');
    setAdError(true);
    handleAdComplete();
  };

  /**
   * Set up timers when component mounts and quiz data is available
   */
  useEffect(() => {
    if (!quizData) return;

    // Fallback timer - ensure we redirect even if video doesn't fire onEnded
    fallbackTimerRef.current = setTimeout(() => {
      console.log('[Ad] Fallback timer expired');
      handleAdComplete();
    }, 30000);

    // Countdown timer for user feedback
    countdownTimerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
          }
          return 0;
        }
        return newTime;
      });
    }, 1000);

    // Cleanup function
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [quizData]);

  /**
   * Skip ad function for development/testing
   * Remove this in production
   */
  const handleSkipAd = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Ad] Skipping ad (development mode)');
      handleAdComplete();
    }
  };

  // Show loading while quiz data loads
  if (!quizData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p>Loading your recommendation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header Message */}
      <div className="relative z-10 bg-gradient-to-b from-black to-transparent p-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">
            Generating Your Perfect Movie Recommendation
          </h1>
          <div className="bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg p-4">
            <p className="text-blue-200 text-sm leading-relaxed">
              This recommendation is ad-funded — please disable your ad blocker and watch this ad to continue.
              Our AI is analyzing your {quizData.type === 'mood' ? 'mood preferences' : 'favorite movies'} 
              to find something you'll love.
            </p>
          </div>
          
          {/* Countdown Timer */}
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{timeRemaining} seconds remaining</span>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {!adError ? (
          <video
            ref={videoRef}
            src={adUrl}
            autoPlay
            muted={false}
            controls={false}
            playsInline
            onEnded={handleAdComplete}
            onError={handleVideoError}
            onLoadStart={() => console.log('[Ad] Video loading started')}
            onCanPlay={() => console.log('[Ad] Video can play')}
            className="w-full h-full object-cover"
            style={{ backgroundColor: '#000' }}
          >
            <p className="text-white text-center p-8">
              Your browser does not support the video tag. The page will redirect automatically.
            </p>
          </video>
        ) : (
          // Error fallback display
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center text-white space-y-4">
              <div className="text-6xl">🎬</div>
              <h2 className="text-xl font-semibold">Ad Loading...</h2>
              <p className="text-gray-400 mb-4">
                We are loading your personalized movie recommendation. This brief advertisement helps keep our service free.
              </p>
              <div className="animate-pulse bg-gray-700 h-2 w-48 rounded mx-auto"></div>
            </div>
          </div>
        )}

        {/* Development Skip Button */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleSkipAd}
            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded z-20"
          >
            Skip (Dev)
          </button>
        )}

        {/* Loading Overlay for Slow Connections */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white opacity-0 animate-fade-in" style={{ animationDelay: '5s' }}>
            <p className="text-sm">
              Slow connection? Your recommendation will be ready shortly...
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 bg-gradient-to-t from-black to-transparent p-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-xs">
            FilmFinder uses ads to provide free AI-powered movie recommendations. 
            Thank you for supporting independent creators.
          </p>
        </div>
      </div>
    </div>
  );
} 