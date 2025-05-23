/**
 * AI Service for FilmFinder
 * Handles communication with Google's Gemini API for movie recommendations
 */

import { QuizResponse, AIRecommendation } from '@/app/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('[AI Service] GEMINI_API_KEY is not set in environment variables');
  throw new Error('GEMINI_API_KEY is required for AI recommendations');
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generate movie recommendations using Google's Gemini AI
 * 
 * @param quizData - The quiz responses from the user
 * @returns A promise that resolves to an array of movie recommendations
 */
export async function generateRecommendation(quizData: QuizResponse): Promise<AIRecommendation> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });

    // Create the prompt based on quiz type
    const prompt = buildPrompt(quizData);

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response into structured recommendations
    return parseAIResponse(text);
  } catch (error: any) {
    console.error('[AI Service] Error generating recommendation:', error);
    
    // Handle specific API errors
    if (error.message?.includes('403 Forbidden')) {
      throw new Error('AI service authentication failed. Please check your API key.');
    }
    
    if (error.message?.includes('429')) {
      throw new Error('AI service rate limit exceeded. Please try again later.');
    }
    
    throw new Error('Failed to generate movie recommendation. Please try again.');
  }
}

/**
 * Build the prompt for the AI based on quiz type and responses
 */
function buildPrompt(quizData: QuizResponse): string {
  const baseInstruction = `You are a movie recommendation expert. Based on the user's quiz responses, recommend ONE specific movie that perfectly matches their preferences. 

IMPORTANT: Respond ONLY with valid JSON in exactly this format:
{
  "movieTitle": "Exact Movie Title",
  "year": 2023,
  "explanation": "2-3 sentence explanation of why this movie fits perfectly",
  "matchReasons": ["reason 1", "reason 2", "reason 3"],
  "confidenceScore": 0.95
}

Make sure the movie title is exact and searchable. Include the release year if there are multiple movies with similar titles.`;

  if (quizData.type === 'mood') {
    return `${baseInstruction}

USER'S MOOD PREFERENCES:
- Current mood: ${quizData.responses.currentMood}
- Desired feeling after watching: ${quizData.responses.desiredFeeling}
- Preferred genre: ${quizData.responses.genre}
- Intensity preference: ${quizData.responses.intensity}
- Setting preference: ${quizData.responses.setting}
- Watching with: ${quizData.responses.companionType}
- Available time: ${quizData.responses.duration}

Choose a movie that will transform their current mood into their desired feeling through the story, characters, and emotional journey.`;
  } else {
    return `${baseInstruction}

USER'S MOVIE PREFERENCES:
- Favorite movies: ${quizData.responses.favoriteMovies.join(', ')}
- Favorite genres: ${quizData.responses.favoriteGenres.join(', ')}
- Favorite actors: ${quizData.responses.favoriteActors.join(', ')}
- Disliked genres: ${quizData.responses.dislikedGenres.join(', ')}
- Preferred era: ${quizData.responses.preferredDecade}
- Viewing context: ${quizData.responses.viewingContext}

Find a movie that shares DNA with their favorites but offers something new they haven't seen.`;
  }
}

/**
 * Parse the AI response and extract recommendation data
 */
function parseAIResponse(text: string): AIRecommendation {
  try {
    // Clean up the response - remove any markdown or extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!parsed.movieTitle || !parsed.explanation || !parsed.matchReasons || !Array.isArray(parsed.matchReasons)) {
      throw new Error('Invalid AI response format - missing required fields');
    }

    return {
      movieTitle: parsed.movieTitle.trim(),
      year: parsed.year || undefined,
      explanation: parsed.explanation.trim(),
      matchReasons: parsed.matchReasons.map((reason: string) => reason.trim()),
      confidenceScore: Math.min(Math.max(parsed.confidenceScore || 0.8, 0), 1),
      alternativeTitle: parsed.alternativeTitle?.trim()
    };
    
  } catch (error) {
    console.error('[AI Service] Error parsing AI response:', error);
    console.error('[AI Service] Raw response:', text);
    
    // Fallback recommendation
    return {
      movieTitle: 'The Shawshank Redemption',
      year: 1994,
      explanation: 'A universally acclaimed drama that resonates with viewers seeking hope, friendship, and redemption.',
      matchReasons: ['Universally loved', 'Emotionally satisfying', 'Great storytelling'],
      confidenceScore: 0.7
    };
  }
} 