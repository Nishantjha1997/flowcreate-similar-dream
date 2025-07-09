import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Code, ExternalLink } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface ProjectsFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
}

interface Project {
  id: number;
  title: string;
  description: string;
  link?: string;
  technologies?: string[];
}

export const ProjectsForm = ({ profile, onUpdate }: ProjectsFormProps) => {
  const projects = (profile?.projects as Project[]) || [];
  
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    link: '',
    technologies: []
  });
  
  const [newTechnology, setNewTechnology] = useState('');

  const addProject = () => {
    if (!newProject.title || !newProject.description) return;
    
    const project: Project = {
      id: Date.now(),
      title: newProject.title || '',
      description: newProject.description || '',
      link: newProject.link || '',
      technologies: newProject.technologies || []
    };

    const updatedProjects = [...projects, project];
    onUpdate({ projects: updatedProjects });
    
    setNewProject({
      title: '',
      description: '',
      link: '',
      technologies: []
    });
  };

  const removeProject = (id: number) => {
    const updatedProjects = projects.filter(proj => proj.id !== id);
    onUpdate({ projects: updatedProjects });
  };

  const updateProject = (id: number, updates: Partial<Project>) => {
    const updatedProjects = projects.map(proj => 
      proj.id === id ? { ...proj, ...updates } : proj
    );
    onUpdate({ projects: updatedProjects });
  };

  const addTechnologyToProject = (projectId: number, technology: string) => {
    if (!technology.trim()) return;
    
    const updatedProjects = projects.map(proj => 
      proj.id === projectId 
        ? { ...proj, technologies: [...(proj.technologies || []), technology.trim()] }
        : proj
    );
    onUpdate({ projects: updatedProjects });
  };

  const removeTechnologyFromProject = (projectId: number, techIndex: number) => {
    const updatedProjects = projects.map(proj => 
      proj.id === projectId 
        ? { ...proj, technologies: (proj.technologies || []).filter((_, i) => i !== techIndex) }
        : proj
    );
    onUpdate({ projects: updatedProjects });
  };

  const addTechnologyToNew = () => {
    if (!newTechnology.trim()) return;
    
    setNewProject(prev => ({
      ...prev,
      technologies: [...(prev.technologies || []), newTechnology.trim()]
    }));
    setNewTechnology('');
  };

  const removeTechnologyFromNew = (techIndex: number) => {
    setNewProject(prev => ({
      ...prev,
      technologies: (prev.technologies || []).filter((_, i) => i !== techIndex)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Projects */}
        {projects.map((project) => (
          <Card key={project.id} className="relative">
            <CardContent className="p-4">
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(project.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Project Title</Label>
                  <Input
                    value={project.title}
                    onChange={(e) => updateProject(project.id, { title: e.target.value })}
                    placeholder="E-commerce Website"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={project.link || ''}
                      onChange={(e) => updateProject(project.id, { link: e.target.value })}
                      placeholder="https://github.com/username/project"
                    />
                    {project.link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <Label>Description</Label>
                <Textarea
                  value={project.description}
                  onChange={(e) => updateProject(project.id, { description: e.target.value })}
                  placeholder="Describe the project, your role, and key achievements..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Technologies Used</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(project.technologies || []).map((tech, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <button
                        onClick={() => removeTechnologyFromProject(project.id, index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add technology (e.g., React, Node.js)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTechnologyToProject(project.id, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Project */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <h4 className="font-medium mb-4">Add New Project</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Project Title *</Label>
                <Input
                  value={newProject.title || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="E-commerce Website"
                />
              </div>
              <div className="space-y-2">
                <Label>Project Link</Label>
                <Input
                  value={newProject.link || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="https://github.com/username/project"
                />
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <Label>Description *</Label>
              <Textarea
                value={newProject.description || ''}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the project, your role, and key achievements..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2 mb-4">
              <Label>Technologies Used</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(newProject.technologies || []).map((tech, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <button
                      onClick={() => removeTechnologyFromNew(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  placeholder="Add technology (e.g., React, Node.js)"
                  onKeyPress={(e) => e.key === 'Enter' && addTechnologyToNew()}
                />
                <Button onClick={addTechnologyToNew} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button onClick={addProject}>
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
