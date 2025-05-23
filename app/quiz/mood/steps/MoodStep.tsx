'use client';

import { useState } from 'react';

interface MoodStepProps {
  onNext: (data: { mood: string }) => void;
  onBack: () => void;
  data: any;
}

const moodOptions = [
  {
    value: 'happy',
    label: 'Happy & Uplifting',
    description: 'Looking for something to brighten your day',
    icon: '😊',
  },
  {
    value: 'relaxed',
    label: 'Relaxed & Chill',
    description: 'Want to unwind and take it easy',
    icon: '😌',
  },
  {
    value: 'excited',
    label: 'Excited & Energetic',
    description: 'Ready for something thrilling and action-packed',
    icon: '🤩',
  },
  {
    value: 'thoughtful',
    label: 'Thoughtful & Reflective',
    description: 'In the mood for something deep and meaningful',
    icon: '🤔',
  },
  {
    value: 'nostalgic',
    label: 'Nostalgic & Sentimental',
    description: 'Feeling like revisiting the classics',
    icon: '🕰️',
  },
  {
    value: 'adventurous',
    label: 'Adventurous & Curious',
    description: 'Ready to explore new worlds and stories',
    icon: '🗺️',
  },
];

export default function MoodStep({ onNext, onBack, data }: MoodStepProps) {
  const [selectedMood, setSelectedMood] = useState(data.mood || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood) {
      onNext({ mood: selectedMood });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        {moodOptions.map((option) => (
          <label
            key={option.value}
            className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
              selectedMood === option.value
                ? 'border-primary-500 bg-primary-50 bg-opacity-10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <input
              type="radio"
              name="mood"
              value={option.value}
              checked={selectedMood === option.value}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{option.icon}</span>
              <div className="flex-1">
                <span className="block text-sm font-medium text-white">
                  {option.label}
                </span>
                <span className="mt-1 text-sm text-gray-400">
                  {option.description}
                </span>
              </div>
            </div>
            <div
              className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center ${
                selectedMood === option.value
                  ? 'border-primary-500'
                  : 'border-gray-600'
              }`}
            >
              {selectedMood === option.value && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!selectedMood}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </form>
  );
} 