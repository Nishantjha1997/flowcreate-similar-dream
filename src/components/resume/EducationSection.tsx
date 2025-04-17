
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { ResumeData } from '@/utils/resumeAdapterUtils';

interface EducationSectionProps {
  education: ResumeData['education'];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

export const EducationSection = ({
  education,
  onChange,
  onAdd,
  onRemove
}: EducationSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Education</h2>
      <p className="text-muted-foreground">Add your educational background, starting with the most recent.</p>
      
      {education.map((edu, index) => (
        <div key={edu.id} className="p-4 border rounded-md space-y-4 relative">
          {education.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(edu.id)}
              className="absolute right-2 top-2 h-8 w-8 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          <div>
            <Label htmlFor={`school-${index}`} className="block text-sm font-medium mb-1">
              School/University
            </Label>
            <Input
              id={`school-${index}`}
              name="school"
              value={edu.school}
              onChange={(e) => onChange(e, index)}
              placeholder="University Name"
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
              placeholder="Bachelor's, Master's, etc."
            />
          </div>
          
          <div>
            <Label htmlFor={`field-${index}`} className="block text-sm font-medium mb-1">
              Field of Study
            </Label>
            <Input
              id={`field-${index}`}
              name="field"
              value={edu.field}
              onChange={(e) => onChange(e, index)}
              placeholder="Computer Science, Business, etc."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`eduStartDate-${index}`} className="block text-sm font-medium mb-1">
                Start Date
              </Label>
              <Input
                id={`eduStartDate-${index}`}
                name="startDate"
                value={edu.startDate}
                onChange={(e) => onChange(e, index)}
                placeholder="2018"
              />
            </div>
            
            <div>
              <Label htmlFor={`eduEndDate-${index}`} className="block text-sm font-medium mb-1">
                End Date (or Expected)
              </Label>
              <Input
                id={`eduEndDate-${index}`}
                name="endDate"
                value={edu.endDate}
                onChange={(e) => onChange(e, index)}
                placeholder="2022"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor={`eduDescription-${index}`} className="block text-sm font-medium mb-1">
              Description (Optional)
            </Label>
            <Textarea
              id={`eduDescription-${index}`}
              name="description"
              value={edu.description}
              onChange={(e) => onChange(e, index)}
              rows={2}
              placeholder="GPA, honors, relevant coursework, etc."
            />
          </div>
        </div>
      ))}
      
      <Button variant="outline" className="w-full" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </Button>
    </div>
  );
};
