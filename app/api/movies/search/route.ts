import { NextRequest, NextResponse } from 'next/server';

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Movie Search API Route
 * 
 * Handles GET requests to search for movies using TMDB API
 * Query parameters:
 * - q: search query string
 * 
 * Returns: JSON response with movie results
 */
export async function GET(request: NextRequest) {
  try {
    // Validate API key configuration
    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY not configured');
      return NextResponse.json(
        { error: 'Movie search service not configured' },
        { status: 500 }
      );
    }

    // Extract search query from URL parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Validate query length to prevent abuse
    if (query.length > 100) {
      return NextResponse.json(
        { error: 'Search query too long' },
        { status: 400 }
      );
    }

    // Call TMDB search API
    const tmdbUrl = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`;
    
    const tmdbResponse = await fetch(tmdbUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FilmFinder/1.0'
      },
      // Cache for 5 minutes to reduce API calls
      next: { revalidate: 300 }
    });

    if (!tmdbResponse.ok) {
      console.error('TMDB API error:', tmdbResponse.status, tmdbResponse.statusText);
      return NextResponse.json(
        { error: 'Movie search service temporarily unavailable' },
        { status: 503 }
      );
    }

    const tmdbData = await tmdbResponse.json();

    // Filter and format results for frontend
    const filteredResults = tmdbData.results
      .filter((movie: any) => {
        // Filter out movies without essential data
        return movie.title && 
               movie.release_date && 
               movie.poster_path &&
               movie.vote_average > 0; // Filter out unrated movies
      })
      .slice(0, 20) // Limit to top 20 results
      .map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path,
        overview: movie.overview || '',
        vote_average: movie.vote_average
      }));

    return NextResponse.json({
      results: filteredResults,
      total_results: Math.min(tmdbData.total_results, 20)
    });

  } catch (error) {
    console.error('Movie search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 