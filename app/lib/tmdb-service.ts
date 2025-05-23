/**
 * TMDB Service for FilmFinder
 * Handles communication with The Movie Database API
 */

import { TMDBMovie, TMDBMovieDetails, TMDBCredits, MovieRecommendation, AIRecommendation } from '@/app/types';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMAGE_BASE_URL_LARGE = 'https://image.tmdb.org/t/p/w1280';

/**
 * Search for a movie on TMDB and get detailed information
 */
export async function enrichMovieWithTMDB(aiRecommendation: AIRecommendation): Promise<MovieRecommendation> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key not configured');
  }

  try {
    // Step 1: Search for the movie
    const searchResults = await searchMovie(aiRecommendation.movieTitle, aiRecommendation.year);
    
    if (searchResults.length === 0) {
      throw new Error(`Movie not found: ${aiRecommendation.movieTitle}`);
    }

    // Get the best match (first result is usually most relevant)
    const movie = searchResults[0];
    
    // Step 2: Get detailed movie information
    const [movieDetails, credits] = await Promise.all([
      getMovieDetails(movie.id),
      getMovieCredits(movie.id)
    ]);

    // Step 3: Build the enriched recommendation
    return buildMovieRecommendation(aiRecommendation, movieDetails, credits);
    
  } catch (error) {
    console.error('[TMDB Service] Error enriching movie:', error);
    throw error;
  }
}

/**
 * Search for movies by title
 */
async function searchMovie(title: string, year?: number): Promise<TMDBMovie[]> {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY!,
    query: title,
    include_adult: 'false',
    language: 'en-US',
    page: '1'
  });

  if (year) {
    searchParams.append('year', year.toString());
  }

  const response = await fetch(`${TMDB_BASE_URL}/search/movie?${searchParams}`);
  
  if (!response.ok) {
    throw new Error(`TMDB search error: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * Get detailed movie information
 */
async function getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
  );
  
  if (!response.ok) {
    throw new Error(`TMDB movie details error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get movie credits (cast and crew)
 */
async function getMovieCredits(movieId: number): Promise<TMDBCredits> {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`
  );
  
  if (!response.ok) {
    throw new Error(`TMDB credits error: ${response.status}`);
  }

  return response.json();
}

/**
 * Build the final movie recommendation with all data
 */
function buildMovieRecommendation(
  aiRecommendation: AIRecommendation,
  movieDetails: TMDBMovieDetails,
  credits: TMDBCredits
): MovieRecommendation {
  return {
    // AI-generated data
    explanation: aiRecommendation.explanation,
    matchReasons: aiRecommendation.matchReasons,
    confidenceScore: aiRecommendation.confidenceScore,
    
    // TMDB data
    tmdbId: movieDetails.id,
    title: movieDetails.title,
    overview: movieDetails.overview,
    posterUrl: movieDetails.poster_path ? `${TMDB_IMAGE_BASE_URL}${movieDetails.poster_path}` : null,
    backdropUrl: movieDetails.backdrop_path ? `${TMDB_IMAGE_BASE_URL_LARGE}${movieDetails.backdrop_path}` : null,
    releaseDate: movieDetails.release_date,
    genres: movieDetails.genres.map(g => g.name),
    rating: Math.round(movieDetails.vote_average * 10) / 10, // Round to 1 decimal
    voteCount: movieDetails.vote_count,
    runtime: movieDetails.runtime,
    
    // Cast (top 5)
    cast: credits.cast.slice(0, 5).map(castMember => ({
      name: castMember.name,
      character: castMember.character,
      profileUrl: castMember.profile_path ? `${TMDB_IMAGE_BASE_URL}${castMember.profile_path}` : null
    })),
    
    // Watch links
    tmdbUrl: `https://www.themoviedb.org/movie/${movieDetails.id}`,
    imdbUrl: movieDetails.imdb_id ? `https://www.imdb.com/title/${movieDetails.imdb_id}` : undefined
  };
}

/**
 * Build full poster URL
 */
export function getFullPosterUrl(posterPath: string | null, size: 'small' | 'large' = 'small'): string | null {
  if (!posterPath) return null;
  const baseUrl = size === 'large' ? TMDB_IMAGE_BASE_URL_LARGE : TMDB_IMAGE_BASE_URL;
  return `${baseUrl}${posterPath}`;
}

/**
 * Get movie by TMDB ID (for saved recommendations)
 */
export async function getMovieById(tmdbId: number): Promise<MovieRecommendation | null> {
  try {
    const [movieDetails, credits] = await Promise.all([
      getMovieDetails(tmdbId),
      getMovieCredits(tmdbId)
    ]);

    // Create a basic AI recommendation structure for existing movies
    const basicAI: AIRecommendation = {
      movieTitle: movieDetails.title,
      year: new Date(movieDetails.release_date).getFullYear(),
      explanation: 'Previously recommended movie from your history.',
      matchReasons: ['From your recommendation history'],
      confidenceScore: 0.8
    };

    return buildMovieRecommendation(basicAI, movieDetails, credits);
    
  } catch (error) {
    console.error('[TMDB Service] Error getting movie by ID:', error);
    return null;
  }
} 