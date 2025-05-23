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
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'mood',
          responses: data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      router.push('/quiz/ad');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Handle error appropriately
    }
  };

  return (
    <QuizWizard
      steps={steps}
      onComplete={handleComplete}
    />
  );
} 