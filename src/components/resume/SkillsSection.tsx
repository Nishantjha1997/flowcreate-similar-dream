
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AiSuggestionButton } from "@/components/resume/AiSuggestionButton";

interface SkillsSectionProps {
  skills: string[];
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onAIFeatureUpsell?: () => void;
  isPremium?: boolean;
}

export const SkillsSection = ({ skills, onChange, onAIFeatureUpsell, isPremium }: SkillsSectionProps) => {
  const getSkillsString = () => {
    return skills.join(', ');
  };

  // We need a local handler to accept suggested skills string (and simulate a textarea event)
  const handleAcceptSuggestion = (suggested: string) => {
    // Make a fake change event as expected
    onChange({
      target: {
        value: suggested,
      },
    } as React.ChangeEvent<HTMLTextAreaElement>);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Skills</h2>
      <p className="text-muted-foreground">Add your key skills, separated by commas. Focus on skills relevant to your target job.</p>
      
      <div>
        <Label htmlFor="skills" className="block text-sm font-medium mb-1">
          Technical & Professional Skills
        </Label>
        <Textarea
          id="skills"
          value={getSkillsString()}
          onChange={onChange}
          rows={4}
          placeholder="JavaScript, React, Project Management, Leadership, Data Analysis, Adobe Creative Suite, Digital Marketing"
        />
        <AiSuggestionButton
          value={getSkillsString()}
          onAccept={handleAcceptSuggestion}
          label="Get AI Skills Suggestions"
          section="skills"
          isPremium={isPremium}
          onUpsell={onAIFeatureUpsell}
          additionalContext="Skills section for professional resume"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Include both technical skills (programming languages, software) and soft skills (leadership, communication)
        </p>
      </div>
      
      {skills.length > 0 && (
        <div>
          <Label className="block text-sm font-medium mb-2">
            Your Skills Preview
          </Label>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div key={index} className="bg-muted px-3 py-1 rounded-md text-sm">
                {skill}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
