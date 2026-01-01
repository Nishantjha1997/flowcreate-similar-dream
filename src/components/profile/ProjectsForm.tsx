import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Code, ExternalLink } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface ProjectsFormProps { profile: UserProfile | null; onUpdate: (data: Partial<UserProfile>) => void; isNeoBrutalism?: boolean; }
interface Project { id: number; title: string; description: string; link?: string; technologies?: string[]; }

export const ProjectsForm = ({ profile, onUpdate, isNeoBrutalism = false }: ProjectsFormProps) => {
  const projects = (profile?.projects as Project[]) || [];
  const [newProject, setNewProject] = useState<Partial<Project>>({ title: '', description: '', link: '', technologies: [] });
  const [newTechnology, setNewTechnology] = useState('');
  const inputClass = isNeoBrutalism ? 'border-2 border-foreground' : '';
  const labelClass = isNeoBrutalism ? 'uppercase text-xs font-bold tracking-wide' : '';

  const addProject = () => { if (!newProject.title || !newProject.description) return; onUpdate({ projects: [...projects, { id: Date.now(), ...newProject } as Project] }); setNewProject({ title: '', description: '', link: '', technologies: [] }); };
  const removeProject = (id: number) => onUpdate({ projects: projects.filter(p => p.id !== id) });
  const updateProject = (id: number, updates: Partial<Project>) => onUpdate({ projects: projects.map(p => p.id === id ? { ...p, ...updates } : p) });
  const addTechToNew = () => { if (newTechnology.trim()) { setNewProject(p => ({ ...p, technologies: [...(p.technologies || []), newTechnology.trim()] })); setNewTechnology(''); } };
  const removeTechFromNew = (i: number) => setNewProject(p => ({ ...p, technologies: (p.technologies || []).filter((_, idx) => idx !== i) }));

  return (
    <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}><Code className="w-5 h-5" />Projects</CardTitle>
        <CardDescription>Showcase your portfolio projects and personal work.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {projects.map((p) => (
          <Card key={p.id} className={`relative ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
            <CardContent className="p-4">
              <Button variant="ghost" size="sm" onClick={() => removeProject(p.id)} className="absolute top-2 right-2 text-destructive"><X className="h-4 w-4" /></Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2"><Label className={labelClass}>Title</Label><Input value={p.title} onChange={(e) => updateProject(p.id, { title: e.target.value })} className={inputClass} /></div>
                <div className="space-y-2"><Label className={labelClass}>Link</Label><div className="flex gap-2"><Input value={p.link || ''} onChange={(e) => updateProject(p.id, { link: e.target.value })} className={inputClass} />{p.link && <Button variant="outline" size="sm" asChild><a href={p.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>}</div></div>
              </div>
              <div className="space-y-2 mb-4"><Label className={labelClass}>Description</Label><Textarea value={p.description} onChange={(e) => updateProject(p.id, { description: e.target.value })} rows={3} className={inputClass} /></div>
              <div className="space-y-2"><Label className={labelClass}>Technologies</Label><div className="flex flex-wrap gap-2">{(p.technologies || []).map((t, i) => <Badge key={i} variant="secondary" className={isNeoBrutalism ? 'border-2 border-foreground' : ''}>{t}<button onClick={() => updateProject(p.id, { technologies: p.technologies?.filter((_, idx) => idx !== i) })} className="ml-1"><X className="h-3 w-3" /></button></Badge>)}</div></div>
            </CardContent>
          </Card>
        ))}
        <Card className={`border-dashed ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
          <CardContent className="p-4">
            <h4 className={`font-medium mb-4 ${isNeoBrutalism ? 'uppercase font-bold' : ''}`}>Add New Project</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2"><Label className={labelClass}>Title *</Label><Input value={newProject.title || ''} onChange={(e) => setNewProject(p => ({ ...p, title: e.target.value }))} className={inputClass} /></div>
              <div className="space-y-2"><Label className={labelClass}>Link</Label><Input value={newProject.link || ''} onChange={(e) => setNewProject(p => ({ ...p, link: e.target.value }))} className={inputClass} /></div>
            </div>
            <div className="space-y-2 mb-4"><Label className={labelClass}>Description *</Label><Textarea value={newProject.description || ''} onChange={(e) => setNewProject(p => ({ ...p, description: e.target.value }))} rows={3} className={inputClass} /></div>
            <div className="space-y-2 mb-4"><Label className={labelClass}>Technologies</Label><div className="flex flex-wrap gap-2 mb-2">{(newProject.technologies || []).map((t, i) => <Badge key={i} variant="secondary" className={isNeoBrutalism ? 'border-2 border-foreground' : ''}>{t}<button onClick={() => removeTechFromNew(i)} className="ml-1"><X className="h-3 w-3" /></button></Badge>)}</div><div className="flex gap-2"><Input value={newTechnology} onChange={(e) => setNewTechnology(e.target.value)} placeholder="Add technology" onKeyPress={(e) => e.key === 'Enter' && addTechToNew()} className={inputClass} /><Button onClick={addTechToNew} size="sm" className={isNeoBrutalism ? 'border-2 border-foreground' : ''}><Plus className="h-4 w-4" /></Button></div></div>
            <Button onClick={addProject} className={isNeoBrutalism ? 'border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]' : ''}><Plus className="w-4 h-4 mr-2" />Add Project</Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
