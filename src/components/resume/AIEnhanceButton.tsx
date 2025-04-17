
import { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { AIEnhanceModal } from '@/components/AIEnhanceModal';
import { aiPrompts } from '@/utils/geminiApi';

interface AIEnhanceButtonProps extends ButtonProps {
  section: 'summary' | 'experience' | 'education' | 'skills' | 'jobTitle';
  currentText: string;
  jobTitle?: string;
  field?: string;
  degree?: string;
  onApply: (enhancedText: string) => void;
}

export function AIEnhanceButton({
  section,
  currentText,
  jobTitle = '',
  field = '',
  degree = '',
  onApply,
  ...props
}: AIEnhanceButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Configure modal content based on section
  let title = '';
  let description = '';
  let prompt = '';
  
  switch (section) {
    case 'summary':
      title = "Enhance Professional Summary";
      description = "Use AI to improve your professional summary and make it more compelling";
      prompt = aiPrompts.improveSummary(currentText);
      break;
    case 'experience':
      title = "Improve Job Description";
      description = "Transform your job responsibilities into achievement-oriented bullet points";
      prompt = aiPrompts.enhanceExperience(jobTitle, currentText);
      break;
    case 'education':
      title = "Enhance Education Description";
      description = "Highlight your academic achievements and relevant coursework";
      prompt = aiPrompts.improveEducation(degree, field, currentText);
      break;
    case 'skills':
      title = "Generate Relevant Skills";
      description = "Automatically generate skills based on your experience";
      prompt = aiPrompts.generateSkills(jobTitle, currentText);
      break;
    case 'jobTitle':
      title = "Suggest Job Title";
      description = "Get recommendations for job titles based on your responsibilities";
      prompt = aiPrompts.suggestJobTitle(currentText);
      break;
  }
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setIsModalOpen(true)}
        {...props}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>AI Enhance</span>
      </Button>
      
      <AIEnhanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        description={description}
        prompt={prompt}
        currentText={currentText}
        onApply={onApply}
      />
    </>
  );
}
