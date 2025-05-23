import { NextRequest, NextResponse } from 'next/server';

const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Movie Search API Route
 * 
 * Handles GET requests to search for movies using TMDB API
 * Query parameters:
 * - q: search query string (legacy)
 * - query: search query string (new)
 * 
 * Returns: JSON response with movie results
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || searchParams.get('query');

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  if (!TMDB_ACCESS_TOKEN) {
    console.error('TMDB_ACCESS_TOKEN not configured');
    return NextResponse.json(
      { error: 'TMDB access token not configured' },
      { status: 500 }
    );
  }

  try {
    const tmdbUrl = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`;
    
    const response = await fetch(tmdbUrl, {
      headers: {
        'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter and format results for frontend
    const filteredResults = data.results
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
      total_results: Math.min(data.total_results, 20)
    });
    
  } catch (error) {
    console.error('Error searching movies:', error);
    return NextResponse.json(
      { error: 'Failed to search movies' },
      { status: 500 }
    );
  }
} 