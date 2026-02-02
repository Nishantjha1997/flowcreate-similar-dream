
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FolderKanban, Trash2, Link, Code, X, CheckCircle2, GripVertical } from 'lucide-react';
import { ResumeData } from '@/utils/resumeAdapterUtils';
import { AiSuggestionButton } from "@/components/resume/AiSuggestionButton";
import { cn } from '@/lib/utils';

interface ProjectsSectionProps {
  projects: ResumeData['projects'];
  onChange: (field: string, value: string, index: number) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onAIFeatureUpsell?: () => void;
  isPremium?: boolean;
}

export const ProjectsSection = ({
  projects,
  onChange,
  onAdd,
  onRemove,
  onAIFeatureUpsell,
  isPremium
}: ProjectsSectionProps) => {
  const [techInput, setTechInput] = useState<Record<number, string>>({});

  // Calculate completion for each project
  const getCompletion = (project: any) => {
    const fields = ['title', 'description'];
    const filled = fields.filter(f => project[f]?.trim()).length;
    return Math.round((filled / fields.length) * 100);
  };

  const addTech = (index: number, tech: string) => {
    if (!tech.trim()) return;
    const currentTechs = projects[index].technologies || [];
    if (currentTechs.includes(tech.trim())) return;
    const newTechs = [...currentTechs, tech.trim()];
    onChange('technologies', JSON.stringify(newTechs), index);
    setTechInput(prev => ({ ...prev, [index]: '' }));
  };

  const removeTech = (index: number, techToRemove: string) => {
    const currentTechs = projects[index].technologies || [];
    const newTechs = currentTechs.filter((t: string) => t !== techToRemove);
    onChange('technologies', JSON.stringify(newTechs), index);
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTech(index, techInput[index] || '');
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Projects</h2>
        </div>
        <p className="text-sm text-muted-foreground">Showcase your personal or professional projects.</p>
        
        <div className="p-8 border-2 border-dashed rounded-lg text-center bg-muted/20">
          <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-medium mb-1">No Projects Added</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add projects to demonstrate your skills and achievements
          </p>
          <Button onClick={onAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Projects</h2>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
        </div>
        <Button onClick={onAdd} size="sm" variant="outline" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      
      <div className="space-y-4">
        {projects.map((project, index) => {
          const completion = getCompletion(project);
          const isComplete = completion === 100;
          
          return (
            <div 
              key={project.id} 
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
                onClick={() => onRemove(project.id)}
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
                {/* Title & Link Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <FolderKanban className="h-3 w-3" />
                      Project Title
                    </Label>
                    <Input
                      value={project.title}
                      onChange={(e) => onChange('title', e.target.value, index)}
                      placeholder="E-commerce Dashboard"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium flex items-center gap-1.5">
                      <Link className="h-3 w-3" />
                      Project Link (Optional)
                    </Label>
                    <Input
                      value={project.link || ''}
                      onChange={(e) => onChange('link', e.target.value, index)}
                      placeholder="https://github.com/..."
                      className="h-9"
                    />
                  </div>
                </div>
                
                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Project Description
                  </Label>
                  <Textarea
                    value={project.description}
                    onChange={(e) => onChange('description', e.target.value, index)}
                    rows={2}
                    className="resize-none text-sm"
                    placeholder="Describe the project, your role, and impact..."
                  />
                  <AiSuggestionButton
                    value={project.description}
                    onAccept={(suggested) => onChange('description', suggested, index)}
                    label="Get AI Suggestions"
                    section="projects"
                    isPremium={isPremium}
                    onUpsell={onAIFeatureUpsell}
                    additionalContext={`Project: ${project.title}`}
                  />
                </div>
                
                {/* Technologies */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Code className="h-3 w-3" />
                    Technologies Used
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={techInput[index] || ''}
                      onChange={(e) => setTechInput(prev => ({ ...prev, [index]: e.target.value }))}
                      onKeyDown={(e) => handleTechKeyDown(e, index)}
                      placeholder="Type and press Enter..."
                      className="h-8 text-sm flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addTech(index, techInput[index] || '')}
                      className="h-8 px-2"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {(project.technologies?.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.technologies.map((tech: string, techIdx: number) => (
                        <span 
                          key={techIdx} 
                          className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTech(index, tech)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
