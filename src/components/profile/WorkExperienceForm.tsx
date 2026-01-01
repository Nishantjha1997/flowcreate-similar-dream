import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Briefcase, Clock } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface WorkExperienceFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
  isNeoBrutalism?: boolean;
}

interface WorkExperience {
  id: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export const WorkExperienceForm = ({ profile, onUpdate, isNeoBrutalism = false }: WorkExperienceFormProps) => {
  const workExperience = (profile?.work_experience as WorkExperience[]) || [];
  
  const [newExperience, setNewExperience] = useState<Partial<WorkExperience>>({
    title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: ''
  });

  const inputClass = isNeoBrutalism ? 'border-2 border-foreground' : '';
  const labelClass = isNeoBrutalism ? 'uppercase text-xs font-bold tracking-wide' : '';

  const addExperience = () => {
    if (!newExperience.title || !newExperience.company) return;
    const experience: WorkExperience = {
      id: Date.now(), title: newExperience.title || '', company: newExperience.company || '',
      location: newExperience.location || '', startDate: newExperience.startDate || '',
      endDate: newExperience.current ? '' : (newExperience.endDate || ''),
      current: newExperience.current || false, description: newExperience.description || ''
    };
    onUpdate({ work_experience: [...workExperience, experience] });
    setNewExperience({ title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' });
  };

  const removeExperience = (id: number) => onUpdate({ work_experience: workExperience.filter(exp => exp.id !== id) });
  const updateExperience = (id: number, updates: Partial<WorkExperience>) => {
    onUpdate({ work_experience: workExperience.map(exp => exp.id === id ? { ...exp, ...updates } : exp) });
  };

  return (
    <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
          <Clock className="w-5 h-5" />
          Work Experience
        </CardTitle>
        <CardDescription>Add your professional work history, starting with the most recent.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {workExperience.map((exp) => (
          <Card key={exp.id} className={`relative ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
            <CardContent className="p-4">
              <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-destructive"><X className="h-4 w-4" /></Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2"><Label className={labelClass}>Job Title</Label><Input value={exp.title} onChange={(e) => updateExperience(exp.id, { title: e.target.value })} className={inputClass} /></div>
                <div className="space-y-2"><Label className={labelClass}>Company</Label><Input value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2"><Label className={labelClass}>Location</Label><Input value={exp.location} onChange={(e) => updateExperience(exp.id, { location: e.target.value })} className={inputClass} /></div>
                <div className="space-y-2"><Label className={labelClass}>Start Date</Label><Input type="month" value={exp.startDate} onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} className={inputClass} /></div>
                <div className="space-y-2"><Label className={labelClass}>End Date</Label><Input type="month" value={exp.endDate} onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })} disabled={exp.current} className={inputClass} /></div>
              </div>
              <div className="flex items-center space-x-2 mb-4"><Switch checked={exp.current} onCheckedChange={(checked) => updateExperience(exp.id, { current: checked, endDate: checked ? '' : exp.endDate })} /><Label>Currently working here</Label>{exp.current && <Badge variant="secondary">Current</Badge>}</div>
              <div className="space-y-2"><Label className={labelClass}>Description</Label><Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, { description: e.target.value })} rows={3} className={inputClass} /></div>
            </CardContent>
          </Card>
        ))}
        <Card className={`border-dashed ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
          <CardContent className="p-4">
            <h4 className={`font-medium mb-4 ${isNeoBrutalism ? 'uppercase font-bold' : ''}`}>Add New Work Experience</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2"><Label className={labelClass}>Job Title *</Label><Input value={newExperience.title || ''} onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))} className={inputClass} /></div>
              <div className="space-y-2"><Label className={labelClass}>Company *</Label><Input value={newExperience.company || ''} onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2"><Label className={labelClass}>Location</Label><Input value={newExperience.location || ''} onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))} className={inputClass} /></div>
              <div className="space-y-2"><Label className={labelClass}>Start Date</Label><Input type="month" value={newExperience.startDate || ''} onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))} className={inputClass} /></div>
              <div className="space-y-2"><Label className={labelClass}>End Date</Label><Input type="month" value={newExperience.endDate || ''} onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))} disabled={newExperience.current} className={inputClass} /></div>
            </div>
            <div className="flex items-center space-x-2 mb-4"><Switch checked={newExperience.current || false} onCheckedChange={(checked) => setNewExperience(prev => ({ ...prev, current: checked, endDate: checked ? '' : prev.endDate }))} /><Label>Currently working here</Label></div>
            <div className="space-y-2 mb-4"><Label className={labelClass}>Description</Label><Textarea value={newExperience.description || ''} onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))} rows={3} className={inputClass} /></div>
            <Button onClick={addExperience} className={isNeoBrutalism ? 'border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]' : ''}><Plus className="w-4 h-4 mr-2" />Add Experience</Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
