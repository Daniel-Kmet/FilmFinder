import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FilmFinder - AI-Powered Movie Recommendations',
  description: 'Get personalized movie recommendations based on your mood and preferences using AI.',
  keywords: 'movies, recommendations, AI, film suggestions, personalized movies',
  authors: [{ name: 'FilmFinder Team' }],
  openGraph: {
    title: 'FilmFinder - AI-Powered Movie Recommendations',
    description: 'Get personalized movie recommendations based on your mood and preferences using AI.',
    type: 'website',
    locale: 'en_US',
    url: 'https://filmfinder.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7514637431264317"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
} 