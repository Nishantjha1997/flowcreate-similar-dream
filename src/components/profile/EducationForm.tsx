import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X, GraduationCap } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface EducationFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
  isNeoBrutalism?: boolean;
}

interface Education { id: number; school: string; degree: string; field: string; startDate: string; endDate: string; description: string; }

export const EducationForm = ({ profile, onUpdate, isNeoBrutalism = false }: EducationFormProps) => {
  const education = (profile?.education as Education[]) || [];
  const [newEducation, setNewEducation] = useState<Partial<Education>>({ school: '', degree: '', field: '', startDate: '', endDate: '', description: '' });
  const inputClass = isNeoBrutalism ? 'border-2 border-foreground' : '';
  const labelClass = isNeoBrutalism ? 'uppercase text-xs font-bold tracking-wide' : '';

  const addEducation = () => {
    if (!newEducation.school || !newEducation.degree) return;
    onUpdate({ education: [...education, { id: Date.now(), school: newEducation.school || '', degree: newEducation.degree || '', field: newEducation.field || '', startDate: newEducation.startDate || '', endDate: newEducation.endDate || '', description: newEducation.description || '' }] });
    setNewEducation({ school: '', degree: '', field: '', startDate: '', endDate: '', description: '' });
  };
  const removeEducation = (id: number) => onUpdate({ education: education.filter(edu => edu.id !== id) });
  const updateEducation = (id: number, updates: Partial<Education>) => onUpdate({ education: education.map(edu => edu.id === id ? { ...edu, ...updates } : edu) });

  return (
    <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}><GraduationCap className="w-5 h-5" />Education</CardTitle>
        <CardDescription>Add your educational background and qualifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {education.map((edu) => (
          <Card key={edu.id} className={`relative ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
            <CardContent className="p-4">
              <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-destructive"><X className="h-4 w-4" /></Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2"><Label className={labelClass}>School/University</Label><Input value={edu.school} onChange={(e) => updateEducation(edu.id, { school: e.target.value })} className={inputClass} /></div>
                <div className="space-y-2"><Label className={labelClass}>Degree</Label><Input value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2"><Label className={labelClass}>Field of Study</Label><Input value={edu.field} onChange={(e) => updateEducation(edu.id, { field: e.target.value })} className={inputClass} /></div>
                <div className="space-y-2"><Label className={labelClass}>Start Date</Label><Input type="month" value={edu.startDate} onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })} className={inputClass} /></div>
                <div className="space-y-2"><Label className={labelClass}>End Date</Label><Input type="month" value={edu.endDate} onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="space-y-2"><Label className={labelClass}>Description</Label><Textarea value={edu.description} onChange={(e) => updateEducation(edu.id, { description: e.target.value })} rows={2} className={inputClass} /></div>
            </CardContent>
          </Card>
        ))}
        <Card className={`border-dashed ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
          <CardContent className="p-4">
            <h4 className={`font-medium mb-4 ${isNeoBrutalism ? 'uppercase font-bold' : ''}`}>Add New Education</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2"><Label className={labelClass}>School/University *</Label><Input value={newEducation.school || ''} onChange={(e) => setNewEducation(prev => ({ ...prev, school: e.target.value }))} className={inputClass} /></div>
              <div className="space-y-2"><Label className={labelClass}>Degree *</Label><Input value={newEducation.degree || ''} onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2"><Label className={labelClass}>Field of Study</Label><Input value={newEducation.field || ''} onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))} className={inputClass} /></div>
              <div className="space-y-2"><Label className={labelClass}>Start Date</Label><Input type="month" value={newEducation.startDate || ''} onChange={(e) => setNewEducation(prev => ({ ...prev, startDate: e.target.value }))} className={inputClass} /></div>
              <div className="space-y-2"><Label className={labelClass}>End Date</Label><Input type="month" value={newEducation.endDate || ''} onChange={(e) => setNewEducation(prev => ({ ...prev, endDate: e.target.value }))} className={inputClass} /></div>
            </div>
            <div className="space-y-2 mb-4"><Label className={labelClass}>Description</Label><Textarea value={newEducation.description || ''} onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))} rows={2} className={inputClass} /></div>
            <Button onClick={addEducation} className={isNeoBrutalism ? 'border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]' : ''}><Plus className="w-4 h-4 mr-2" />Add Education</Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
