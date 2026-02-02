
import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AiSuggestionButton } from "@/components/resume/AiSuggestionButton";
import { Plus, Trash2, Briefcase, Building2, MapPin, Calendar, CheckCircle2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  // Calculate completion for each experience entry
  const getCompletion = (exp: any) => {
    const fields = ['title', 'company', 'location', 'startDate', 'description'];
    const filled = fields.filter(f => exp[f]?.trim()).length;
    return Math.round((filled / fields.length) * 100);
  };

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

  if (experience.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Work Experience</h2>
        </div>
        <p className="text-sm text-muted-foreground">Add your work experience to showcase your professional background.</p>
        
        <div className="p-8 border-2 border-dashed rounded-lg text-center bg-muted/20">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-medium mb-1">No Experience Added</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start by adding your most recent work experience
          </p>
          <Button onClick={onAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Experience
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Work Experience</h2>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
            {experience.length} {experience.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
        <Button onClick={onAdd} size="sm" variant="outline" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      
      <div className="space-y-4">
        {experience.map((exp, idx) => {
          const completion = getCompletion(exp);
          const isComplete = completion === 100;
          
          return (
            <div 
              key={exp.id} 
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
                onClick={() => onRemove(exp.id)}
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
                {/* Job Title & Company Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Briefcase className="h-3 w-3" />
                      Job Title
                    </Label>
                    <Input
                      name="title"
                      value={exp.title}
                      onChange={e => onChange(e, idx)}
                      placeholder="e.g. Software Engineer"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" />
                      Company
                    </Label>
                    <Input
                      name="company"
                      value={exp.company}
                      onChange={e => onChange(e, idx)}
                      placeholder="e.g. Acme Inc."
                      className="h-9"
                    />
                  </div>
                </div>
                
                {/* Location & Dates Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      Location
                    </Label>
                    <Input
                      name="location"
                      value={exp.location}
                      onChange={e => onChange(e, idx)}
                      placeholder="San Francisco, CA"
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
                      value={exp.startDate}
                      onChange={e => onChange(e, idx)}
                      placeholder="Jan 2020"
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
                      value={exp.current ? 'Present' : exp.endDate}
                      onChange={e => onChange(e, idx)}
                      placeholder="Dec 2022"
                      className="h-9"
                      disabled={exp.current}
                    />
                  </div>
                </div>
                
                {/* Current Job Toggle */}
                <div className="flex items-center gap-2 py-1">
                  <Switch
                    id={`current-${exp.id}`}
                    checked={exp.current}
                    onCheckedChange={checked => onCurrentJobToggle(checked, idx)}
                    className="scale-90"
                  />
                  <Label htmlFor={`current-${exp.id}`} className="text-xs cursor-pointer">
                    I currently work here
                  </Label>
                </div>
                
                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Job Description & Achievements
                  </Label>
                  <Textarea
                    name="description"
                    value={exp.description}
                    onChange={e => onChange(e, idx)}
                    rows={3}
                    className="resize-none text-sm"
                    placeholder="• Led development of key features resulting in 30% user growth&#10;• Managed team of 5 engineers..."
                  />
                  <AiSuggestionButton
                    value={exp.description || ""}
                    onAccept={suggested => handleAiDescription(suggested, idx)}
                    label="Get AI Suggestions"
                    section="experience"
                    jobTitle={exp.title}
                    company={exp.company}
                    isPremium={isPremium}
                    onUpsell={onAIFeatureUpsell}
                    additionalContext={`Work experience at ${exp.company} as ${exp.title}`}
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
