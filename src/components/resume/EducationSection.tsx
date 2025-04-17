
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { ResumeData } from '@/utils/types';
import { AIEnhanceButton } from './AIEnhanceButton';

interface EducationSectionProps {
  education: ResumeData['education'];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

export function EducationSection({
  education,
  onChange,
  onAdd,
  onRemove
}: EducationSectionProps) {
  const handleAIEnhanceDescription = (enhancedDescription: string, index: number) => {
    const event = {
      target: {
        name: 'description',
        value: enhancedDescription
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    onChange(event, index);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Education</h2>
        <Button onClick={onAdd} size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          <span>Add Education</span>
        </Button>
      </div>

      {education.map((edu, index) => (
        <Card key={edu.id} className="overflow-hidden">
          <CardHeader className="bg-muted/40 p-4">
            <div className="flex justify-between">
              <div className="font-medium">{edu.school || 'New Education'}</div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onRemove(edu.id)} 
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
                <Label htmlFor={`school-${index}`} className="block text-sm font-medium mb-1">
                  School / University
                </Label>
                <Input
                  id={`school-${index}`}
                  name="school"
                  value={edu.school}
                  onChange={(e) => onChange(e, index)}
                  placeholder="e.g. Harvard University"
                />
              </div>
              <div>
                <Label htmlFor={`degree-${index}`} className="block text-sm font-medium mb-1">
                  Degree
                </Label>
                <Input
                  id={`degree-${index}`}
                  name="degree"
                  value={edu.degree}
                  onChange={(e) => onChange(e, index)}
                  placeholder="e.g. Bachelor of Science"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`field-${index}`} className="block text-sm font-medium mb-1">
                  Field of Study
                </Label>
                <Input
                  id={`field-${index}`}
                  name="field"
                  value={edu.field}
                  onChange={(e) => onChange(e, index)}
                  placeholder="e.g. Computer Science"
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
                    type="text"
                    value={edu.startDate}
                    onChange={(e) => onChange(e, index)}
                    placeholder="e.g. 2018"
                  />
                </div>
                <div>
                  <Label htmlFor={`endDate-${index}`} className="block text-sm font-medium mb-1">
                    End Date
                  </Label>
                  <Input
                    id={`endDate-${index}`}
                    name="endDate"
                    type="text"
                    value={edu.endDate}
                    onChange={(e) => onChange(e, index)}
                    placeholder="e.g. 2022"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor={`description-${index}`} className="text-sm font-medium">
                  Description
                </Label>
                <AIEnhanceButton 
                  section="education"
                  currentText={edu.description}
                  degree={edu.degree}
                  field={edu.field}
                  onApply={(description) => handleAIEnhanceDescription(description, index)}
                />
              </div>
              <Textarea
                id={`description-${index}`}
                name="description"
                value={edu.description}
                onChange={(e) => onChange(e, index)}
                rows={3}
                placeholder="Describe relevant coursework, achievements, etc."
              />
            </div>
          </CardContent>
        </Card>
      ))}
      
      {education.length === 0 && (
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">No education added yet. Click "Add Education" to get started.</p>
        </div>
      )}
      
      <Button onClick={onAdd} variant="outline" className="w-full gap-1">
        <Plus className="h-4 w-4" />
        <span>Add Another Education</span>
      </Button>
    </div>
  );
}
