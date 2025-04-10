
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { ResumeData } from '@/utils/resumeAdapterUtils';

interface ExperienceSectionProps {
  experience: ResumeData['experience'];
  onExperienceChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  onCurrentJobToggle: (checked: boolean, index: number) => void;
  addExperience: () => void;
  removeExperience: (id: number) => void;
}

export const ExperienceSection = ({
  experience,
  onExperienceChange,
  onCurrentJobToggle,
  addExperience,
  removeExperience
}: ExperienceSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Work Experience</h2>
      <p className="text-muted-foreground">Add your professional experience, starting with the most recent.</p>
      
      {experience.map((exp, index) => (
        <div key={exp.id} className="p-4 border rounded-md space-y-4 relative">
          {experience.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeExperience(exp.id)}
              className="absolute right-2 top-2 h-8 w-8 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          <div>
            <Label htmlFor={`title-${index}`} className="block text-sm font-medium mb-1">
              Job Title
            </Label>
            <Input
              id={`title-${index}`}
              name="title"
              value={exp.title}
              onChange={(e) => onExperienceChange(e, index)}
              placeholder="Marketing Manager"
            />
          </div>
          
          <div>
            <Label htmlFor={`company-${index}`} className="block text-sm font-medium mb-1">
              Company
            </Label>
            <Input
              id={`company-${index}`}
              name="company"
              value={exp.company}
              onChange={(e) => onExperienceChange(e, index)}
              placeholder="Company Name"
            />
          </div>
          
          <div>
            <Label htmlFor={`location-${index}`} className="block text-sm font-medium mb-1">
              Location (Optional)
            </Label>
            <Input
              id={`location-${index}`}
              name="location"
              value={exp.location}
              onChange={(e) => onExperienceChange(e, index)}
              placeholder="City, Country"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`startDate-${index}`} className="block text-sm font-medium mb-1">
                Start Date
              </Label>
              <Input
                id={`startDate-${index}`}
                name="startDate"
                value={exp.startDate}
                onChange={(e) => onExperienceChange(e, index)}
                placeholder="Jan 2020"
              />
            </div>
            
            <div>
              <Label htmlFor={`endDate-${index}`} className="block text-sm font-medium mb-1">
                End Date
              </Label>
              <Input
                id={`endDate-${index}`}
                name="endDate"
                value={exp.endDate}
                onChange={(e) => onExperienceChange(e, index)}
                placeholder="Dec 2022"
                disabled={exp.current}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id={`current-${index}`}
              checked={exp.current}
              onCheckedChange={(checked) => onCurrentJobToggle(checked, index)}
            />
            <Label htmlFor={`current-${index}`}>I currently work here</Label>
          </div>
          
          <div>
            <Label htmlFor={`description-${index}`} className="block text-sm font-medium mb-1">
              Description
            </Label>
            <Textarea
              id={`description-${index}`}
              name="description"
              value={exp.description}
              onChange={(e) => onExperienceChange(e, index)}
              rows={4}
              placeholder="Describe your responsibilities and achievements..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tip: Use bullet points (•) to format your description.
            </p>
          </div>
        </div>
      ))}
      
      <Button variant="outline" className="w-full" onClick={addExperience}>
        <Plus className="h-4 w-4 mr-2" />
        Add Experience
      </Button>
    </div>
  );
};
