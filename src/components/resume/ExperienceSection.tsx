
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { ResumeData } from '@/utils/types';
import { AIEnhanceButton } from './AIEnhanceButton';

interface ExperienceSectionProps {
  experience: ResumeData['experience'];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  onToggleCurrent: (checked: boolean, index: number) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

export function ExperienceSection({
  experience,
  onChange,
  onToggleCurrent,
  onAdd,
  onRemove
}: ExperienceSectionProps) {
  const handleAIEnhanceDescription = (enhancedDescription: string, index: number) => {
    const event = {
      target: {
        name: 'description',
        value: enhancedDescription
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    onChange(event, index);
  };
  
  const handleAISuggestTitle = (suggestedTitle: string, index: number) => {
    const event = {
      target: {
        name: 'title',
        value: suggestedTitle
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(event, index);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Work Experience</h2>
        <Button onClick={onAdd} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          <span>Add Experience</span>
        </Button>
      </div>

      {experience.map((exp, index) => (
        <Card key={exp.id} className="overflow-hidden">
          <CardHeader className="bg-muted/40 p-4">
            <div className="flex justify-between">
              <div className="font-medium">{exp.title || exp.company || 'New Position'}</div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onRemove(exp.id)} 
                className="h-8 px-2 text-xs"
              >
                <Trash2 className="h-4 w-4" />
                <span className="ml-1">Remove</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor={`title-${index}`} className="text-sm font-medium">
                    Job Title
                  </Label>
                  <AIEnhanceButton 
                    section="jobTitle"
                    currentText={exp.description}
                    onApply={(title) => handleAISuggestTitle(title, index)}
                  />
                </div>
                <Input
                  id={`title-${index}`}
                  name="title"
                  value={exp.title}
                  onChange={(e) => onChange(e, index)}
                  placeholder="e.g. Software Engineer"
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
                  onChange={(e) => onChange(e, index)}
                  placeholder="e.g. Acme Inc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`location-${index}`} className="block text-sm font-medium mb-1">
                  Location
                </Label>
                <Input
                  id={`location-${index}`}
                  name="location"
                  value={exp.location}
                  onChange={(e) => onChange(e, index)}
                  placeholder="e.g. New York, NY"
                />
              </div>
              <div className="flex items-center space-x-2 pt-5">
                <Switch
                  id={`current-${index}`}
                  checked={exp.current}
                  onCheckedChange={(checked) => onToggleCurrent(checked, index)}
                />
                <Label htmlFor={`current-${index}`}>I currently work here</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`startDate-${index}`} className="block text-sm font-medium mb-1">
                  Start Date
                </Label>
                <Input
                  id={`startDate-${index}`}
                  name="startDate"
                  type="text"
                  value={exp.startDate}
                  onChange={(e) => onChange(e, index)}
                  placeholder="e.g. June 2020"
                />
              </div>
              {!exp.current && (
                <div>
                  <Label htmlFor={`endDate-${index}`} className="block text-sm font-medium mb-1">
                    End Date
                  </Label>
                  <Input
                    id={`endDate-${index}`}
                    name="endDate"
                    type="text"
                    value={exp.endDate}
                    onChange={(e) => onChange(e, index)}
                    placeholder="e.g. Present or May 2023"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor={`description-${index}`} className="text-sm font-medium">
                  Description
                </Label>
                <AIEnhanceButton 
                  section="experience"
                  currentText={exp.description}
                  jobTitle={exp.title}
                  onApply={(description) => handleAIEnhanceDescription(description, index)}
                />
              </div>
              <Textarea
                id={`description-${index}`}
                name="description"
                value={exp.description}
                onChange={(e) => onChange(e, index)}
                rows={4}
                placeholder="Describe your responsibilities and achievements..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use bullet points by starting lines with • or -
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {experience.length === 0 && (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">No work experience added yet. Click "Add Experience" to get started.</p>
        </div>
      )}
      
      <Button onClick={onAdd} variant="outline" className="w-full gap-1">
        <Plus className="h-4 w-4" />
        <span>Add Another Experience</span>
      </Button>
    </div>
  );
}
