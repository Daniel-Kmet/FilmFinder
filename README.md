# FilmFinder 🎬

An AI-driven movie recommendation platform that provides personalized movie suggestions based on user preferences and moods.

## 🚀 Priority 1 Implementation Complete ✅

The core recommendation flow is now fully functional:

### ✅ Results Page & Recommendation Logic
- **Results Page Shell**: Complete client-side route with loading states
- **API Route (`/api/recommend`)**: Full serverless implementation that:
  - Validates quiz payload
  - Calls Google Gemini AI for recommendations
  - Enriches with TMDB metadata (poster, synopsis, cast)
  - Returns consolidated JSON response
- **Results UI**: Rich movie card with AI explanation, cast, and watch links
- **Analytics**: GA4 events for `recommendationDisplayed`, `watchClicked`, etc.

### 🎯 End-to-End Flow Working
Quiz Answers → AI Analysis → TMDB Metadata → Beautiful UI → Analytics

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI**: Google Gemini Pro API
- **Movie Data**: The Movie Database (TMDB) API
- **Analytics**: Google Analytics 4
- **Testing**: Jest with React Testing Library

## 📋 Environment Setup

Create a `.env.local` file in the root directory with these variables:

```bash
# Required - Google Gemini AI API Key
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Required - The Movie Database (TMDB) API Key  
# Get your API key from: https://www.themoviedb.org/settings/api
TMDB_API_KEY=your_tmdb_api_key_here

# Optional - Google Analytics 4 Measurement ID
# Get from Google Analytics: https://analytics.google.com/
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional - VAST Ad Tag URL
# If you have a video ad network, add your VAST tag URL here
NEXT_PUBLIC_VAST_TAG_URL=https://your-ad-network.com/vast-tag
```

## 🚀 Getting Started

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy the environment variables above into `.env.local`
   - Get your API keys from the links provided
   - At minimum, you need `GEMINI_API_KEY` and `TMDB_API_KEY`

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## 🎮 How It Works

1. **Take a Quiz**: Choose between mood-based or likes-based recommendations
2. **Watch Ad**: Brief ad interstitial funds the AI processing
3. **Get Recommendation**: AI analyzes your responses and finds the perfect movie
4. **Discover Details**: See why the movie matches, cast info, and where to watch

## 📁 Project Structure

```
app/
├── api/recommend/         # Main recommendation API route
├── components/           # React components
│   └── MovieCard.tsx    # Rich movie display component
├── lib/                 # Service modules
│   ├── ai-service.ts    # Google Gemini AI integration
│   ├── tmdb-service.ts  # TMDB API integration
│   └── analytics.ts     # GA4 event tracking
├── quiz/               # Quiz pages and components
├── results/            # Results page with loading states
└── types/              # TypeScript definitions
```

## 🔮 Coming Next (Priority 2)

- **User Accounts**: NextAuth.js integration with social login
- **Data Persistence**: Save recommendations with Prisma + Supabase
- **Recommendation History**: Personal dashboard with saved movies
- **Advanced Analytics**: User behavior insights and conversion tracking

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## 📊 Analytics Events

The app tracks these GA4 events:
- `quiz_started` - User begins a quiz
- `quiz_completed` - Quiz submitted successfully  
- `ad_viewed` - Ad interstitial completed
- `recommendation_displayed` - Movie recommendation shown
- `watch_clicked` - User clicks "Find Where to Watch"
- `movie_saved` - User saves movie for later
- `recommendation_error` - Error in recommendation flow

## 🎯 Demo the Core Value Prop

The app now demonstrates the complete value proposition:
1. **Personalized Recommendations**: AI analyzes preferences to find perfect matches
2. **Rich Metadata**: Beautiful movie cards with posters, cast, and explanations
3. **Actionable Results**: Direct links to watch on popular platforms
4. **Ad-Funded Model**: Sustainable revenue through integrated advertising

## 🔧 Development Notes

- Uses TypeScript strict mode for type safety
- Implements comprehensive error handling and loading states
- Optimized for mobile-first responsive design
- Follows Next.js 14 app router conventions
- Analytics-first architecture for data-driven optimization

---

**Ready to find your next favorite movie?** 🍿 