'use client';

import { useRouter } from 'next/navigation';
import QuizWizard from '@/app/components/QuizWizard';
import DurationStep from './steps/DurationStep';
import GenreStep from './steps/GenreStep';
import MoodStep from './steps/MoodStep';
import IntensityStep from './steps/IntensityStep';

const steps = [
  {
    id: 'duration',
    title: 'How much time do you have?',
    description: 'Select your preferred movie duration to help us find the perfect match.',
    component: DurationStep,
  },
  {
    id: 'genre',
    title: 'What genre interests you?',
    description: 'Choose one or more genres that you enjoy watching.',
    component: GenreStep,
  },
  {
    id: 'mood',
    title: 'How are you feeling?',
    description: 'Tell us about your current mood to get a movie that matches your vibe.',
    component: MoodStep,
  },
  {
    id: 'intensity',
    title: 'How intense do you want it?',
    description: 'Select the level of emotional intensity you prefer in movies.',
    component: IntensityStep,
  },
];

export default function MoodQuiz() {
  const router = useRouter();

  const handleComplete = async (data: any) => {
    try {
      // Prepare quiz payload
      const quizPayload = {
        type: 'mood',
        responses: {
          currentMood: data.mood,
          desiredFeeling: data.desiredFeeling || 'any',
          genre: data.genres?.[0] || 'any',
          intensity: data.intensity,
          setting: 'any', // Not collected in this quiz
          companionType: 'any', // Not collected in this quiz
          duration: data.duration,
        },
      };

      // Store quiz data in sessionStorage for ad page
      sessionStorage.setItem('pendingQuiz', JSON.stringify(quizPayload));

      // Navigate to ad interstitial
      router.push('/quiz/ad');

    } catch (error) {
      console.error('Error preparing quiz submission:', error);
      
      // Show user-friendly error
      alert('There was an issue processing your quiz. Please try again.');
    }
  };

  return (
    <QuizWizard
      steps={steps}
      onComplete={handleComplete}
      initialData={{}}
    />
  );
} 