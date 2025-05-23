/**
 * TypeScript definitions for FilmFinder
 * Defines interfaces for quiz responses, movie recommendations, and API contracts
 */

// Quiz Types
export type QuizType = 'mood' | 'likes';

export interface MoodQuizResponse {
  type: 'mood';
  responses: {
    currentMood: string;
    desiredFeeling: string;
    genre: string;
    intensity: string;
    setting: string;
    companionType: string;
    duration: string;
  };
}

export interface LikesQuizResponse {
  type: 'likes';
  responses: {
    favoriteMovies: string[];
    favoriteGenres: string[];
    favoriteActors: string[];
    dislikedGenres: string[];
    preferredDecade: string;
    viewingContext: string;
  };
}

export type QuizResponse = MoodQuizResponse | LikesQuizResponse;

// TMDB API Types
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovieDetails extends TMDBMovie {
  genres: TMDBGenre[];
  runtime: number;
  budget: number;
  revenue: number;
  homepage: string;
  imdb_id: string;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCredits {
  id: number;
  cast: TMDBCastMember[];
  crew: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }>;
}

// AI Recommendation Types
export interface AIRecommendation {
  movieTitle: string;
  year?: number;
  explanation: string;
  matchReasons: string[];
  confidenceScore: number;
  alternativeTitle?: string;
}

// Final Recommendation Response
export interface MovieRecommendation {
  // AI-generated data
  explanation: string;
  matchReasons: string[];
  confidenceScore: number;
  
  // TMDB data
  tmdbId: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  genres: string[];
  rating: number;
  voteCount: number;
  runtime?: number;
  
  // Cast (top 5)
  cast: Array<{
    name: string;
    character: string;
    profileUrl: string | null;
  }>;
  
  // Watch links
  tmdbUrl: string;
  imdbUrl?: string;
}

// API Response Types
export interface RecommendationAPIResponse {
  success: true;
  recommendation: MovieRecommendation;
  metadata: {
    quizType: QuizType;
    processingTime: number;
    aiModel: string;
    timestamp: string;
  };
}

export interface RecommendationAPIError {
  success: false;
  error: string;
  code: 'INVALID_QUIZ_DATA' | 'AI_API_ERROR' | 'TMDB_API_ERROR' | 'MOVIE_NOT_FOUND' | 'INTERNAL_ERROR';
  details?: Record<string, unknown>;
}

export type RecommendationAPIResult = RecommendationAPIResponse | RecommendationAPIError;

// Analytics Event Types
export interface AnalyticsQuizEvent {
  quiz_type: QuizType;
  quiz_step?: string;
  [key: string]: unknown;
}

export interface AnalyticsRecommendationEvent {
  movie_id: number;
  movie_title: string;
  quiz_type: QuizType;
  confidence_score: number;
  processing_time: number;
  [key: string]: unknown;
} 