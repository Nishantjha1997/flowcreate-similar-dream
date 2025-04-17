
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SkillsSectionProps {
  skills: string[];
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const SkillsSection = ({ skills, onChange }: SkillsSectionProps) => {
  const getSkillsString = () => {
    return skills.join(', ');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Skills</h2>
      <p className="text-muted-foreground">Add your key skills, separated by commas.</p>
      
      <div>
        <Label htmlFor="skills" className="block text-sm font-medium mb-1">
          Skills
        </Label>
        <Textarea
          id="skills"
          value={getSkillsString()}
          onChange={onChange}
          rows={4}
          placeholder="JavaScript, React, Project Management, Leadership"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Example: JavaScript, React, Customer Service, Team Leadership
        </p>
      </div>
      
      {skills.length > 0 && (
        <div>
          <Label className="block text-sm font-medium mb-2">
            Your Skills
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
