'use client';

import { useState } from 'react';

interface IntensityStepProps {
  onNext: (data: { intensity: string }) => void;
  onBack: () => void;
  data: Record<string, unknown>;
}

const intensityOptions = [
  {
    value: 'light',
    label: 'Light & Easy',
    description: 'Something gentle and easy to watch',
    examples: 'Feel-good comedies, light dramas',
  },
  {
    value: 'moderate',
    label: 'Moderate & Balanced',
    description: 'A good mix of entertainment and depth',
    examples: 'Dramas, adventure films, romantic comedies',
  },
  {
    value: 'intense',
    label: 'Intense & Gripping',
    description: 'Something that will keep you on the edge of your seat',
    examples: 'Thrillers, psychological dramas, intense action',
  },
  {
    value: 'extreme',
    label: 'Extreme & Challenging',
    description: 'For when you want something that pushes boundaries',
    examples: 'Psychological thrillers, intense dramas, mind-bending sci-fi',
  },
];

export default function IntensityStep({ onNext, onBack, data }: IntensityStepProps) {
  const [selectedIntensity, setSelectedIntensity] = useState((data.intensity as string) || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIntensity) {
      onNext({ intensity: selectedIntensity });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        {intensityOptions.map((option) => (
          <label
            key={option.value}
            className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
              selectedIntensity === option.value
                ? 'border-primary-500 bg-primary-50 bg-opacity-10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <input
              type="radio"
              name="intensity"
              value={option.value}
              checked={selectedIntensity === option.value}
              onChange={(e) => setSelectedIntensity(e.target.value)}
              className="sr-only"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="block text-sm font-medium text-white">
                  {option.label}
                </span>
                <div
                  className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center ${
                    selectedIntensity === option.value
                      ? 'border-primary-500'
                      : 'border-gray-600'
                  }`}
                >
                  {selectedIntensity === option.value && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                  )}
                </div>
              </div>
              <span className="mt-1 block text-sm text-gray-400">
                {option.description}
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                Examples: {option.examples}
              </span>
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
          disabled={!selectedIntensity}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </form>
  );
} 