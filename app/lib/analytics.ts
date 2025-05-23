/**
 * Analytics Utility for FilmFinder
 * 
 * Provides a clean interface for tracking GA4 events throughout the application.
 * Handles environment checks and graceful fallbacks when analytics is not configured.
 */

// GA4 Configuration
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

/**
 * Track a custom event with GA4
 * 
 * @param eventName - The name of the event to track
 * @param payload - Optional additional data to send with the event
 * 
 * Usage examples:
 * - trackEvent('ad_viewed', { quizType: 'mood' })
 * - trackEvent('recommendation_clicked', { movieId: 12345 })
 * - trackEvent('quiz_completed', { type: 'likes', duration: 240 })
 */
export function trackEvent(eventName: string, payload?: Record<string, any>) {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.log('[Analytics] Server-side, skipping event:', eventName);
      return;
    }

    // Check if GA4 is configured
    if (!GA_MEASUREMENT_ID) {
      console.log('[Analytics] GA4 not configured, skipping event:', eventName);
      return;
    }

    // Check if gtag is available
    if (typeof window.gtag !== 'function') {
      console.log('[Analytics] gtag not loaded, skipping event:', eventName);
      return;
    }

    // Track the event
    window.gtag('event', eventName, {
      // Standard GA4 parameters
      event_category: 'user_interaction',
      event_label: eventName,
      
      // Custom payload data
      ...payload,
      
      // Add timestamp for debugging
      timestamp: new Date().toISOString(),
    });

    console.log('[Analytics] Event tracked:', eventName, payload);

  } catch (error) {
    console.error('[Analytics] Error tracking event:', eventName, error);
  }
}

/**
 * Initialize GA4 tracking
 * 
 * This should be called once in the app layout or _app.tsx
 * It loads the GA4 script and sets up the configuration
 */
export function initializeAnalytics() {
  try {
    if (typeof window === 'undefined' || !GA_MEASUREMENT_ID) {
      return;
    }

    // Load GA4 script if not already loaded
    if (!document.querySelector(`script[src*="gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
    }

    // Initialize dataLayer if not exists
    window.dataLayer = window.dataLayer || [];

    // Define gtag function
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    // Configure GA4
    window.gtag('config', GA_MEASUREMENT_ID, {
      // Privacy-friendly settings
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    console.log('[Analytics] GA4 initialized with ID:', GA_MEASUREMENT_ID);

  } catch (error) {
    console.error('[Analytics] Error initializing GA4:', error);
  }
}

/**
 * Track page views
 * 
 * @param pagePath - The path of the page being viewed
 * @param pageTitle - Optional title of the page
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || pagePath,
  });
}

/**
 * Track quiz-specific events with consistent parameters
 * 
 * @param eventName - Quiz event name (quiz_started, quiz_completed, etc.)
 * @param quizType - Type of quiz (mood, likes)
 * @param step - Optional step information
 * @param additionalData - Any other relevant data
 */
export function trackQuizEvent(
  eventName: string, 
  quizType: 'mood' | 'likes', 
  step?: string, 
  additionalData?: Record<string, any>
) {
  trackEvent(eventName, {
    quiz_type: quizType,
    quiz_step: step,
    ...additionalData,
  });
}

export default trackEvent; 