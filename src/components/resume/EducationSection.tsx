
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AiSuggestionButton } from "@/components/resume/AiSuggestionButton";
import { Plus, Trash2, GraduationCap, Building, BookOpen, Calendar, CheckCircle2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  // Calculate completion for each education entry
  const getCompletion = (edu: any) => {
    const fields = ['school', 'degree', 'field', 'startDate', 'endDate'];
    const filled = fields.filter(f => edu[f]?.trim()).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleAiDescription = (suggested: string, idx: number) => {
    const event = {
      target: {
        name: "description",
        value: suggested,
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(event, idx);
  };

  if (education.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Education</h2>
        </div>
        <p className="text-sm text-muted-foreground">Add your educational background.</p>
        
        <div className="p-8 border-2 border-dashed rounded-lg text-center bg-muted/20">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-medium mb-1">No Education Added</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your degrees, certifications, and relevant coursework
          </p>
          <Button onClick={onAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Education
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Education</h2>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
            {education.length} {education.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        <Button onClick={onAdd} size="sm" variant="outline" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      
      <div className="space-y-4">
        {education.map((edu, idx) => {
          const completion = getCompletion(edu);
          const isComplete = completion === 100;
          
          return (
            <div 
              key={edu.id} 
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all duration-200",
                isComplete ? "border-green-500/30 bg-green-50/30 dark:bg-green-950/10" : "border-muted hover:border-muted-foreground/30"
              )}
            >
              {/* Drag Handle & Completion Badge */}
              <div className="absolute left-2 top-4 flex flex-col items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
                {isComplete && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
              
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(edu.id)}
                className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              
              {/* Completion Bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted rounded-t-lg overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500",
                    isComplete ? "bg-green-500" : "bg-primary"
                  )}
                  style={{ width: `${completion}%` }}
                />
              </div>
              
              <div className="ml-6 space-y-4 pt-2">
                {/* School & Degree Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Building className="h-3 w-3" />
                      School / Institution
                    </Label>
                    <Input
                      name="school"
                      value={edu.school}
                      onChange={e => onChange(e, idx)}
                      placeholder="University of California, Berkeley"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <GraduationCap className="h-3 w-3" />
                      Degree
                    </Label>
                    <Input
                      name="degree"
                      value={edu.degree}
                      onChange={e => onChange(e, idx)}
                      placeholder="Bachelor of Science"
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Field & Dates Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" />
                      Field of Study
                    </Label>
                    <Input
                      name="field"
                      value={edu.field}
                      onChange={e => onChange(e, idx)}
                      placeholder="Computer Science"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Start Date
                    </Label>
                    <Input
                      name="startDate"
                      value={edu.startDate}
                      onChange={e => onChange(e, idx)}
                      placeholder="08/2018"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      End Date
                    </Label>
                    <Input
                      name="endDate"
                      value={edu.endDate}
                      onChange={e => onChange(e, idx)}
                      placeholder="05/2022"
                      className="h-9"
                    />
                  </div>
                </div>
                
                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Description (GPA, Honors, Activities)
                  </Label>
                  <Textarea
                    name="description"
                    value={edu.description}
                    onChange={e => onChange(e, idx)}
                    rows={2}
                    className="resize-none text-sm"
                    placeholder="GPA: 3.8/4.0, Dean's List, Relevant coursework..."
                  />
                  <AiSuggestionButton
                    value={edu.description || ""}
                    onAccept={suggested => handleAiDescription(suggested, idx)}
                    label="Get AI Suggestions"
                    section="education"
                    isPremium={isPremium}
                    onUpsell={onAIFeatureUpsell}
                    additionalContext={`Education: ${edu.degree} in ${edu.field} from ${edu.school}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
