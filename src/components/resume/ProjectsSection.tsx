
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { ResumeData } from '@/utils/resumeAdapterUtils';
import { AiSuggestionButton } from "@/components/resume/AiSuggestionButton";

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
  if (!projects || projects.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <p className="text-muted-foreground">Add your personal or professional projects to showcase your technical skills and achievements.</p>
        
        <div className="p-6 border border-dashed rounded-md text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">Add Your First Project</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Showcase your work by adding details about projects you've worked on.
          </p>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Projects</h2>
      <p className="text-muted-foreground">Add your personal or professional projects to showcase your technical skills and achievements.</p>
      
      {projects.map((project, index) => (
        <div key={project.id} className="p-4 border rounded-md space-y-4 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(project.id)}
            className="absolute right-2 top-2 h-8 w-8 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <div>
            <Label htmlFor={`projectTitle-${index}`} className="block text-sm font-medium mb-1">
              Project Title
            </Label>
            <Input
              id={`projectTitle-${index}`}
              value={project.title}
              onChange={(e) => onChange('title', e.target.value, index)}
              placeholder="E-commerce Website, Mobile App, Data Analysis Dashboard"
            />
          </div>
          
          <div>
            <Label htmlFor={`projectDescription-${index}`} className="block text-sm font-medium mb-1">
              Project Description & Your Role
            </Label>
            <Textarea
              id={`projectDescription-${index}`}
              value={project.description}
              onChange={(e) => onChange('description', e.target.value, index)}
              rows={3}
              placeholder="Describe the project, your specific role, challenges solved, and measurable impact..."
            />
            <AiSuggestionButton
              value={project.description}
              onAccept={(suggested) =>
                onChange('description', suggested, index)
              }
              label="Get AI Project Suggestions"
              section="projects"
              isPremium={isPremium}
              onUpsell={onAIFeatureUpsell}
              additionalContext={`Project: ${project.title}`}
            />
          </div>
          
          <div>
            <Label htmlFor={`projectLink-${index}`} className="block text-sm font-medium mb-1">
              Project Link (Optional)
            </Label>
            <Input
              id={`projectLink-${index}`}
              value={project.link || ''}
              onChange={(e) => onChange('link', e.target.value, index)}
              placeholder="https://github.com/yourusername/project or live demo URL"
            />
          </div>
          
          <div>
            <Label htmlFor={`projectTech-${index}`} className="block text-sm font-medium mb-1">
              Technologies & Tools Used
            </Label>
            <Input
              id={`projectTech-${index}`}
              value={(project.technologies || []).join(', ')}
              onChange={(e) => {
                const techs = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                onChange('technologies', JSON.stringify(techs), index);
              }}
              placeholder="React, Node.js, MongoDB, AWS, Docker, Python"
            />
          </div>
        </div>
      ))}
      
      <Button variant="outline" className="w-full" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Add Project
      </Button>
    </div>
  );
};
