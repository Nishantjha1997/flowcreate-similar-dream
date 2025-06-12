
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AiSuggestionButton } from "@/components/resume/AiSuggestionButton";

interface EducationSectionProps {
  education: any[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onAIFeatureUpsell?: () => void;
  isPremium?: boolean;
}

export const EducationSection = ({
  education,
  onChange,
  onAdd,
  onRemove,
  onAIFeatureUpsell,
  isPremium
}: EducationSectionProps) => {
  // AI description callback
  const handleAiDescription = (suggested: string, idx: number) => {
    const event = {
      target: {
        name: "description",
        value: suggested,
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event, idx);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Education</h2>
      <p className="text-muted-foreground">Add your educational background, starting with the most recent.</p>
      
      {education.map((edu, idx) => (
        <div key={edu.id} className="mb-6 border-b border-muted pb-6">
          <Label htmlFor={`education-school-${edu.id}`}>School/Institution</Label>
          <Textarea
            id={`education-school-${edu.id}`}
            name="school"
            value={edu.school}
            onChange={e => onChange(e, idx)}
            rows={1}
            className="mb-2"
            placeholder="University of California, Berkeley"
          />

          <Label htmlFor={`education-degree-${edu.id}`}>Degree</Label>
          <Textarea
            id={`education-degree-${edu.id}`}
            name="degree"
            value={edu.degree}
            onChange={e => onChange(e, idx)}
            rows={1}
            className="mb-2"
            placeholder="Bachelor of Science"
          />

          <Label htmlFor={`education-field-${edu.id}`}>Field of Study</Label>
          <Textarea
            id={`education-field-${edu.id}`}
            name="field"
            value={edu.field}
            onChange={e => onChange(e, idx)}
            rows={1}
            className="mb-2"
            placeholder="Computer Science"
          />

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div>
              <Label htmlFor={`education-startdate-${edu.id}`}>Start Date</Label>
              <Textarea
                id={`education-startdate-${edu.id}`}
                name="startDate"
                value={edu.startDate}
                onChange={e => onChange(e, idx)}
                rows={1}
                placeholder="08/2018"
              />
            </div>
            <div>
              <Label htmlFor={`education-enddate-${edu.id}`}>End Date</Label>
              <Textarea
                id={`education-enddate-${edu.id}`}
                name="endDate"
                value={edu.endDate}
                onChange={e => onChange(e, idx)}
                rows={1}
                placeholder="05/2022"
              />
            </div>
          </div>
          
          <Label htmlFor={`education-description-${edu.id}`}>Description</Label>
          <Textarea
            id={`education-description-${edu.id}`}
            name="description"
            value={edu.description}
            onChange={e => onChange(e, idx)}
            rows={3}
            className="mb-2"
            placeholder="GPA: 3.8/4.0, Dean's List, Relevant coursework, honors, activities..."
          />
          <AiSuggestionButton
            value={edu.description || ""}
            onAccept={suggested => handleAiDescription(suggested, idx)}
            label="Get AI Education Suggestions"
            section="education"
            isPremium={isPremium}
            onUpsell={onAIFeatureUpsell}
            additionalContext={`Education: ${edu.degree} in ${edu.field} from ${edu.school}`}
          />
          
          <Button onClick={() => onRemove(edu.id)} type="button" variant="destructive" size="sm" className="mt-2">
            Remove Education
          </Button>
        </div>
      ))}
      <Button onClick={onAdd} type="button" className="mt-4">
        Add Education
      </Button>
    </div>
  );
};
