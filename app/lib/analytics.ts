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
    gtag: (...args: unknown[]) => void;
    dataLayer: Record<string, unknown>[];
  }
}

/**
 * Track a custom event with Google Analytics
 * 
 * @param eventName - The event name
 * @param eventParameters - Additional event parameters
 */
export default function trackEvent(eventName: string, eventParameters: Record<string, unknown> = {}) {
  // Only track in production or when GA_MEASUREMENT_ID is set
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  
  if (!measurementId || typeof window === 'undefined') {
    console.log(`[Analytics] Would track: ${eventName}`, eventParameters);
    return;
  }

  try {
    // Ensure gtag is available
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        // Add default parameters
        page_title: document.title,
        page_location: window.location.href,
        
        // Add custom parameters
        ...eventParameters,
        
        // Add timestamp
        event_timestamp: Date.now(),
      });
      
      console.log(`[Analytics] Tracked: ${eventName}`, eventParameters);
    } else {
      console.warn('[Analytics] gtag not available');
    }
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
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
 * @param url - The page URL
 * @param title - The page title
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  try {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
      page_title: title,
    });
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error);
  }
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
  additionalData?: Record<string, unknown>
) {
  trackEvent(eventName, {
    quiz_type: quizType,
    quiz_step: step,
    ...additionalData,
  });
}

/**
 * Set user properties for analytics
 * 
 * @param properties - User properties to set
 */
export function setUserProperties(properties: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  try {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      user_properties: properties,
    });
  } catch (error) {
    console.error('[Analytics] Error setting user properties:', error);
  }
}

/**
 * Enhanced event tracking with validation
 * 
 * @param eventName - The event name
 * @param parameters - Event parameters
 */
export function trackEnhancedEvent(eventName: string, parameters: Record<string, unknown> = {}) {
  // Validate event name
  if (!eventName || typeof eventName !== 'string') {
    console.error('[Analytics] Invalid event name:', eventName);
    return;
  }

  // Clean and validate parameters
  const cleanParameters = Object.fromEntries(
    Object.entries(parameters).filter(([key, value]) => {
      // Remove undefined values and ensure valid keys
      return value !== undefined && typeof key === 'string' && key.length > 0;
    })
  );

  // Use the main tracking function
  trackEvent(eventName, cleanParameters);
}

/**
 * Legacy support - track events with rest parameters
 * @deprecated Use trackEvent instead
 */
export function legacyTrackEvent(eventName: string, ...params: unknown[]) {
  console.warn('[Analytics] Using deprecated legacyTrackEvent, use trackEvent instead');
  
  // Convert rest parameters to an object
  const parameters: Record<string, unknown> = {};
  params.forEach((param, index) => {
    parameters[`param_${index}`] = param;
  });
  
  trackEvent(eventName, parameters);
} 