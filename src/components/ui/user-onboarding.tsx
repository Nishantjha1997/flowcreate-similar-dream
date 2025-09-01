import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Target, Palette, Download, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'template-selector',
    title: 'Choose Your Template',
    description: 'Start by selecting a professional template that matches your industry and style preferences.',
    target: '[data-tour="template-selector"]',
    icon: <Palette className="h-5 w-5" />,
    position: 'bottom'
  },
  {
    id: 'section-navigation',
    title: 'Navigate Sections',
    description: 'Use this sidebar to edit different sections of your resume. Click on any section to start editing.',
    target: '[data-tour="section-nav"]',
    icon: <Target className="h-5 w-5" />,
    position: 'right'
  },
  {
    id: 'ai-suggestions',
    title: 'AI-Powered Suggestions',
    description: 'Get intelligent suggestions to improve your content. Premium users get unlimited AI assistance!',
    target: '[data-tour="ai-button"]',
    icon: <Lightbulb className="h-5 w-5" />,
    position: 'top'
  },
  {
    id: 'live-preview',
    title: 'Live Preview',
    description: 'See your changes in real-time as you edit. Your resume updates automatically as you type.',
    target: '[data-tour="preview"]',
    icon: <ArrowRight className="h-5 w-5" />,
    position: 'left'
  },
  {
    id: 'export-options',
    title: 'Export & Share',
    description: 'Download your resume as PDF, share it, or save it to your account when you\'re ready.',
    target: '[data-tour="export"]',
    icon: <Download className="h-5 w-5" />,
    position: 'bottom'
  }
];

interface UserOnboardingProps {
  isFirstVisit?: boolean;
  onComplete: () => void;
}

export function UserOnboarding({ isFirstVisit = false, onComplete }: UserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isFirstVisit) {
      // Delay to allow the page to render
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, [isFirstVisit]);

  useEffect(() => {
    if (isVisible && currentStep < onboardingSteps.length) {
      const step = onboardingSteps[currentStep];
      const element = document.querySelector(step.target) as HTMLElement;
      setTargetElement(element);

      if (element) {
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add highlight class
        element.classList.add('onboarding-highlight');
      }

      return () => {
        if (element) {
          element.classList.remove('onboarding-highlight');
        }
      };
    }
  }, [currentStep, isVisible]);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
    // Store completion in localStorage
    localStorage.setItem('onboarding_completed', 'true');
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible || currentStep >= onboardingSteps.length) {
    return null;
  }

  const step = onboardingSteps[currentStep];
  const targetRect = targetElement?.getBoundingClientRect();

  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const padding = 20;
    let top = 0;
    let left = 0;

    switch (step.position) {
      case 'top':
        top = targetRect.top - padding;
        left = targetRect.left + targetRect.width / 2;
        return {
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2;
        return {
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left - padding;
        return {
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.right + padding;
        return {
          top: `${top}px`,
          left: `${left}px`,
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

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
      
      {/* Spotlight effect */}
      {targetElement && (
        <div
          className="fixed border-4 border-primary rounded-lg z-50 pointer-events-none"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease'
          }}
        />
      )}

      {/* Tooltip */}
      <Card
        className="fixed z-50 w-80 bg-background border shadow-xl"
        style={getTooltipPosition()}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                {step.icon}
              </div>
              <Badge variant="secondary" className="text-xs">
                {currentStep + 1} of {onboardingSteps.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
              aria-label="Skip onboarding tour"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
          <p className="text-muted-foreground text-sm mb-4">{step.description}</p>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
              aria-label="Go to previous step"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-xs"
                aria-label="Skip remaining steps"
              >
                Skip Tour
              </Button>
              <Button
                onClick={nextStep}
                className="flex items-center gap-2"
                aria-label={currentStep === onboardingSteps.length - 1 ? "Complete tour" : "Go to next step"}
              >
                {currentStep === onboardingSteps.length - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom styles for highlighting */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .onboarding-highlight {
            position: relative;
            z-index: 51 !important;
          }
        `
      }} />
    </>
  );
}