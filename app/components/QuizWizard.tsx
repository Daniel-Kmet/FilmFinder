import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuizStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{
    onNext: (data: any) => void;
    onBack: () => void;
    data: any;
  }>;
}

interface QuizWizardProps {
  steps: QuizStep[];
  onComplete: (data: any) => void;
  initialData?: any;
}

export default function QuizWizard({ steps, onComplete, initialData = {} }: QuizWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const router = useRouter();

  const handleNext = (stepData: any) => {
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
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
            <span className="text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <p className="text-gray-400">{steps[currentStep].description}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <CurrentStepComponent
            onNext={handleNext}
            onBack={handleBack}
            data={formData}
          />
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
          >
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>
          <div className="flex gap-2">
            {Array.from({ length: steps.length }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-primary-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 