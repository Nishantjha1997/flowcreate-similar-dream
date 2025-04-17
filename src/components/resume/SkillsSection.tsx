
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ResumeData } from '@/utils/types';
import { AIEnhanceButton } from './AIEnhanceButton';

interface SkillsSectionProps {
  skills: ResumeData['skills'];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function SkillsSection({ skills, onChange }: SkillsSectionProps) {
  const skillsString = skills.join(', ');
  
  const handleAIGeneratedSkills = (generatedSkills: string) => {
    const event = {
      target: {
        value: generatedSkills
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    onChange(event);
  };
  
  // Get the first job title from resume data if available
  const getJobTitleFromLocalStorage = () => {
    const resumeData = localStorage.getItem('resumeData');
    if (resumeData) {
      try {
        const parsed = JSON.parse(resumeData);
        return parsed?.experience?.[0]?.title || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  };
  
  // Get the first job description from resume data if available
  const getJobDescriptionFromLocalStorage = () => {
    const resumeData = localStorage.getItem('resumeData');
    if (resumeData) {
      try {
        const parsed = JSON.parse(resumeData);
        return parsed?.experience?.[0]?.description || '';
      } catch (e) {
        return '';
      }
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Skills</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="skills" className="text-sm font-medium mb-1">
            Enter your skills (separated by commas)
          </Label>
          <AIEnhanceButton 
            section="skills"
            currentText={getJobDescriptionFromLocalStorage()}
            jobTitle={getJobTitleFromLocalStorage()}
            onApply={handleAIGeneratedSkills}
          />
        </div>
        <Textarea
          id="skills"
          value={skillsString}
          onChange={onChange}
          rows={4}
          placeholder="e.g. JavaScript, React, Project Management, Team Leadership"
        />
        <p className="text-xs text-muted-foreground">
          Enter your skills separated by commas. These will be displayed as badges on your resume.
        </p>
      </div>
      
      {skills.length > 0 && (
        <div>
          <Label className="text-sm font-medium block mb-2">Preview</Label>
          <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-md">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary">{skill.trim()}</Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 p-4 border rounded-md bg-muted/30">
        <h3 className="font-medium mb-2">Tips for showcasing skills</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
          <li>Include a mix of hard skills (technical abilities) and soft skills (interpersonal traits)</li>
          <li>Tailor your skills to match the job descriptions you're targeting</li>
          <li>Be specific rather than general (e.g., "React Testing Library" vs just "Testing")</li>
          <li>Include proficiency levels for language skills</li>
        </ul>
      </div>
    </div>
  );
}
