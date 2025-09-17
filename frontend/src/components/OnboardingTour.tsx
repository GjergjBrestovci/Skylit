import React, { useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SkyLit! 🎉',
    description: 'Your AI-powered website generator. Let\'s take a quick tour to get you started.',
  },
  {
    id: 'create-tab',
    title: 'Create Tab',
    description: 'Start here to create your first website. Just describe what you want and our AI will build it for you.',
    target: '[data-tour="create-tab"]',
    position: 'bottom'
  },
  {
    id: 'templates',
    title: 'Browse Templates',
    description: 'Not sure where to start? Browse our curated collection of professional templates.',
    target: '[data-tour="templates-tab"]',
    position: 'bottom'
  },
  {
    id: 'inspiration',
    title: 'Get Inspired',
    description: 'Check out sample prompts to see what kinds of websites you can create.',
    target: '[data-tour="prompts-tab"]',
    position: 'bottom'
  },
  {
    id: 'projects',
    title: 'Manage Projects',
    description: 'All your websites will appear in the Projects tab. You can edit, duplicate, and organize them here.',
    target: '[data-tour="projects-tab"]',
    position: 'bottom'
  },
  {
    id: 'start-creating',
    title: 'Ready to Create! 🚀',
    description: 'You\'re all set! Click the "Create" tab to build your first website.',
  }
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  const step = ONBOARDING_STEPS[currentStep];

  useEffect(() => {
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        // Highlight the target element
        element.style.position = 'relative';
        element.style.zIndex = '1001';
        element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
        element.style.borderRadius = '8px';
      }
    } else {
      setTargetElement(null);
    }

    return () => {
      if (targetElement) {
        targetElement.style.position = '';
        targetElement.style.zIndex = '';
        targetElement.style.boxShadow = '';
        targetElement.style.borderRadius = '';
      }
    };
  }, [currentStep, step.target]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const getTooltipPosition = () => {
    if (!targetElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = targetElement.getBoundingClientRect();
    const position = step.position || 'bottom';

    switch (position) {
      case 'top':
        return {
          top: rect.top - 10,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: rect.bottom + 10,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - 10,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 10,
          transform: 'translate(0, -50%)'
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-1000 transition-opacity duration-300" />
      
      {/* Tooltip */}
      <div
        className="fixed z-1002 bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 transition-all duration-300"
        style={getTooltipPosition()}
      >
        {/* Progress indicator */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-1">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {currentStep + 1} of {ONBOARDING_STEPS.length}
          </span>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {step.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleSkip}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Skip Tour
            </button>
          </div>
          
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>

        {/* Arrow pointer */}
        {targetElement && (
          <div
            className={`absolute w-0 h-0 ${
              step.position === 'top' ? 'border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white top-full left-1/2 transform -translate-x-1/2' :
              step.position === 'left' ? 'border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white left-full top-1/2 transform -translate-y-1/2' :
              step.position === 'right' ? 'border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white right-full top-1/2 transform -translate-y-1/2' :
              'border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white bottom-full left-1/2 transform -translate-x-1/2'
            }`}
          />
        )}
      </div>
    </>
  );
};

// Hook to check if user has completed onboarding
export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('skylit-onboarding-completed');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('skylit-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('skylit-onboarding-completed');
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    resetOnboarding
  };
};
