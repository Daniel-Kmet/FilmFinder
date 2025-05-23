'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuizStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<StepProps>;
}

interface StepProps {
  onNext: (data: Record<string, unknown>) => void;
  onBack: () => void;
  data: Record<string, unknown>;
}

interface QuizWizardProps {
  steps: QuizStep[];
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
}

export default function QuizWizard({ steps, onComplete, initialData = {} }: QuizWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const router = useRouter();

  const handleNext = (stepData: Record<string, unknown>) => {
    const newData = { ...formData, ...stepData };
    setFormData(newData);

    if (currentStep === steps.length - 1) {
      onComplete(newData);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      router.back();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12">
      {/* Progress bar */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
          <p className="text-gray-400">{steps[currentStep].description}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <CurrentStepComponent
            onNext={handleNext}
            onBack={handleBack}
            data={formData}
          />
        </div>
      </div>
    </div>
  );
} 