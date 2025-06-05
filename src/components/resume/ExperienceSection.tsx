
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AiSuggestionButton } from "@/components/resume/AiSuggestionButton";

interface ExperienceSectionProps {
  experience: any[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  onCurrentJobToggle: (checked: boolean, index: number) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onAIFeatureUpsell?: () => void;
  isPremium?: boolean;
}

export const ExperienceSection = ({
  experience,
  onChange,
  onCurrentJobToggle,
  onAdd,
  onRemove,
  onAIFeatureUpsell,
  isPremium
}: ExperienceSectionProps) => {
  // AI description callback
  const handleAiDescription = (suggested: string, idx: number) => {
    // Fake a change event for the description field
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
      <h2 className="text-xl font-semibold">Work Experience</h2>
      <p className="text-muted-foreground">Add your work experience, starting with the most recent.</p>
      
      {experience.map((exp, idx) => (
        <div key={exp.id} className="mb-6 border-b border-muted pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor={`experience-title-${exp.id}`}>Job Title</Label>
              <Input
                id={`experience-title-${exp.id}`}
                name="title"
                value={exp.title}
                onChange={e => onChange(e, idx)}
                placeholder="e.g. Software Engineer"
              />
            </div>
            <div>
              <Label htmlFor={`experience-company-${exp.id}`}>Company</Label>
              <Input
                id={`experience-company-${exp.id}`}
                name="company"
                value={exp.company}
                onChange={e => onChange(e, idx)}
                placeholder="e.g. Acme Inc."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor={`experience-location-${exp.id}`}>Location</Label>
              <Input
                id={`experience-location-${exp.id}`}
                name="location"
                value={exp.location}
                onChange={e => onChange(e, idx)}
                placeholder="e.g. San Francisco, CA"
              />
            </div>
            <div>
              <Label htmlFor={`experience-startDate-${exp.id}`}>Start Date</Label>
              <Input
                id={`experience-startDate-${exp.id}`}
                name="startDate"
                value={exp.startDate}
                onChange={e => onChange(e, idx)}
                placeholder="e.g. Jan 2020"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <Switch
              id={`experience-current-${exp.id}`}
              checked={exp.current}
              onCheckedChange={checked => onCurrentJobToggle(checked, idx)}
            />
            <Label htmlFor={`experience-current-${exp.id}`}>
              I currently work here
            </Label>
          </div>
          
          {!exp.current && (
            <div className="mb-4">
              <Label htmlFor={`experience-endDate-${exp.id}`}>End Date</Label>
              <Input
                id={`experience-endDate-${exp.id}`}
                name="endDate"
                value={exp.endDate}
                onChange={e => onChange(e, idx)}
                placeholder="e.g. Dec 2022"
                disabled={exp.current}
              />
            </div>
          )}
          
          <div className="mb-4">
            <Label htmlFor={`experience-description-${exp.id}`}>Description</Label>
            <Textarea
              id={`experience-description-${exp.id}`}
              name="description"
              value={exp.description}
              onChange={e => onChange(e, idx)}
              rows={4}
              className="mb-2"
              placeholder="Describe your responsibilities and achievements"
            />
            <AiSuggestionButton
              value={exp.description || ""}
              onAccept={suggested => handleAiDescription(suggested, idx)}
              label="Suggest Description"
              isPremium={isPremium}
              onUpsell={onAIFeatureUpsell}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onRemove(exp.id)}
            className="text-destructive hover:text-destructive"
          >
            Remove
          </Button>
        </div>
      ))}
      
      <Button onClick={onAdd} type="button" className="mt-4">
        Add Experience
      </Button>
    </div>
  );
};
