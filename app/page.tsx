import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
            FilmFinder
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your next favorite movie with our AI-powered recommendation engine. 
            Answer a few questions about your mood or favorite films, and we'll find the perfect match.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/quiz/mood"
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 rounded-lg text-lg font-semibold transition-colors duration-200"
            >
              Start Mood Quiz
            </Link>
            <Link
              href="/quiz/likes"
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-lg font-semibold transition-colors duration-200"
            >
              Rate Movies
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-lg bg-gray-800 bg-opacity-50">
              <h3 className="text-xl font-semibold mb-2">Personalized</h3>
              <p className="text-gray-400">Get recommendations that match your unique taste and current mood.</p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800 bg-opacity-50">
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-400">Advanced AI technology understands your preferences better than any algorithm.</p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800 bg-opacity-50">
              <h3 className="text-xl font-semibold mb-2">Discover</h3>
              <p className="text-gray-400">Find hidden gems and critically acclaimed films you'll love.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 