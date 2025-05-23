'use client';

import { useState } from 'react';

interface DurationStepProps {
  onNext: (data: { duration: string }) => void;
  onBack: () => void;
  data: Record<string, unknown>;
}

const durationOptions = [
  { value: 'short', label: 'Short (< 90 min)', description: 'Perfect for a quick watch' },
  { value: 'medium', label: 'Medium (90-120 min)', description: 'Standard movie length' },
  { value: 'long', label: 'Long (> 120 min)', description: 'Epic and immersive' },
  { value: 'any', label: 'Any Length', description: 'I\'m flexible' },
];

export default function DurationStep({ onNext, onBack, data }: DurationStepProps) {
  const [selectedDuration, setSelectedDuration] = useState((data.duration as string) || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDuration) {
      onNext({ duration: selectedDuration });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        {durationOptions.map((option) => (
          <label
            key={option.value}
            className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
              selectedDuration === option.value
                ? 'border-primary-500 bg-primary-50 bg-opacity-10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <input
              type="radio"
              name="duration"
              value={option.value}
              checked={selectedDuration === option.value}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="sr-only"
            />
            <div className="flex flex-1">
              <div className="flex flex-col">
                <span className="block text-sm font-medium text-white">
                  {option.label}
                </span>
                <span className="mt-1 flex items-center text-sm text-gray-400">
                  {option.description}
                </span>
              </div>
            </div>
            <div
              className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center ${
                selectedDuration === option.value
                  ? 'border-primary-500'
                  : 'border-gray-600'
              }`}
            >
              {selectedDuration === option.value && (
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
          disabled={!selectedDuration}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </form>
  );
} 