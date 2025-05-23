/**
 * Movie Recommendation API Route
 * 
 * POST /api/recommend
 * Orchestrates the complete recommendation flow:
 * 1. Validates quiz data
 * 2. Calls Gemini AI for movie recommendation
 * 3. Enriches with TMDB metadata
 * 4. Returns complete recommendation
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendation } from '@/app/lib/ai-service';
import { enrichMovieWithTMDB } from '@/app/lib/tmdb-service';
import { QuizResponse, RecommendationAPIResult } from '@/app/types';

export async function POST(request: NextRequest): Promise<NextResponse<RecommendationAPIResult>> {
  const startTime = Date.now();
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const quizData = validateQuizData(body);
    
    console.log(`[API] Processing ${quizData.type} quiz recommendation`);
    
    // Step 1: Get AI recommendation
    console.log('[API] Calling AI service...');
    const aiRecommendation = await generateRecommendation(quizData);
    console.log(`[API] AI recommended: ${aiRecommendation.movieTitle}`);
    
    // Step 2: Enrich with TMDB data
    console.log('[API] Enriching with TMDB data...');
    const movieRecommendation = await enrichMovieWithTMDB(aiRecommendation);
    console.log(`[API] TMDB enrichment complete for ID: ${movieRecommendation.tmdbId}`);
    
    // Step 3: Calculate processing time and return response
    const processingTime = Date.now() - startTime;
    
    const response: RecommendationAPIResult = {
      success: true,
      recommendation: movieRecommendation,
      metadata: {
        quizType: quizData.type,
        processingTime,
        aiModel: 'gemini-pro',
        timestamp: new Date().toISOString()
      }
    };
    
    console.log(`[API] Recommendation complete in ${processingTime}ms`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[API] Error in recommendation flow:', error);
    
    // Determine error type and code
    let errorCode: 'INVALID_QUIZ_DATA' | 'AI_API_ERROR' | 'TMDB_API_ERROR' | 'MOVIE_NOT_FOUND' | 'INTERNAL_ERROR' = 'INTERNAL_ERROR';
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('Invalid quiz data')) {
        errorCode = 'INVALID_QUIZ_DATA';
      } else if (error.message.includes('Gemini API')) {
        errorCode = 'AI_API_ERROR';
      } else if (error.message.includes('TMDB') || error.message.includes('Movie not found')) {
        errorCode = 'TMDB_API_ERROR';
      } else if (error.message.includes('not found')) {
        errorCode = 'MOVIE_NOT_FOUND';
      }
    }
    
    const errorResponse: RecommendationAPIResult = {
      success: false,
      error: errorMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error instanceof Error ? error.stack : undefined,
        processingTime: Date.now() - startTime
      } : undefined
    };
    
    return NextResponse.json(errorResponse, { 
      status: errorCode === 'INVALID_QUIZ_DATA' ? 400 : 500 
    });
  }
}

/**
 * Validate quiz data structure
 */
function validateQuizData(data: unknown): QuizResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid quiz data: must be an object');
  }
  
  const typedData = data as Record<string, unknown>;
  
  if (!typedData.type || !typedData.responses) {
    throw new Error('Invalid quiz data: missing type or responses');
  }
  
  if (typedData.type !== 'mood' && typedData.type !== 'likes') {
    throw new Error('Invalid quiz data: type must be "mood" or "likes"');
  }
  
  const responses = typedData.responses as Record<string, unknown>;
  
  // Validate mood quiz structure
  if (typedData.type === 'mood') {
    const required = ['currentMood', 'desiredFeeling', 'genre', 'intensity', 'setting', 'companionType', 'duration'];
    for (const field of required) {
      if (!responses[field]) {
        throw new Error(`Invalid mood quiz data: missing ${field}`);
      }
    }
  }
  
  // Validate likes quiz structure
  if (typedData.type === 'likes') {
    const required = ['favoriteMovies', 'favoriteGenres', 'favoriteActors', 'dislikedGenres', 'preferredDecade', 'viewingContext'];
    for (const field of required) {
      if (!responses[field]) {
        throw new Error(`Invalid likes quiz data: missing ${field}`);
      }
    }
    
    // Validate arrays
    const arrays = ['favoriteMovies', 'favoriteGenres', 'favoriteActors', 'dislikedGenres'];
    for (const field of arrays) {
      if (!Array.isArray(responses[field])) {
        throw new Error(`Invalid likes quiz data: ${field} must be an array`);
      }
    }
  }
  
  return data as QuizResponse;
}

/**
 * Handle preflight OPTIONS request for CORS
 */
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 