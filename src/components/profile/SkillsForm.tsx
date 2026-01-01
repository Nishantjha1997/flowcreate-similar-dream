import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Wrench, Globe } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface SkillsFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
  isNeoBrutalism?: boolean;
}

const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic'];

export const SkillsForm = ({ profile, onUpdate, isNeoBrutalism = false }: SkillsFormProps) => {
  const [newTechnicalSkill, setNewTechnicalSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiency, setNewProficiency] = useState('');

  const technicalSkills = profile?.technical_skills || [];
  const softSkills = profile?.soft_skills || [];
  const languages = profile?.languages || [];

  const inputClass = isNeoBrutalism ? 'border-2 border-foreground' : '';
  const labelClass = isNeoBrutalism ? 'uppercase text-xs font-bold tracking-wide' : '';
  const badgeClass = isNeoBrutalism ? 'border-2 border-foreground' : '';

  const addTechnicalSkill = () => { if (newTechnicalSkill.trim()) { onUpdate({ technical_skills: [...technicalSkills, newTechnicalSkill.trim()] }); setNewTechnicalSkill(''); } };
  const removeTechnicalSkill = (skill: string) => onUpdate({ technical_skills: technicalSkills.filter(s => s !== skill) });
  const addSoftSkill = () => { if (newSoftSkill.trim()) { onUpdate({ soft_skills: [...softSkills, newSoftSkill.trim()] }); setNewSoftSkill(''); } };
  const removeSoftSkill = (skill: string) => onUpdate({ soft_skills: softSkills.filter(s => s !== skill) });
  const addLanguage = () => { if (newLanguage.trim() && newProficiency) { onUpdate({ languages: [...languages, { language: newLanguage.trim(), proficiency: newProficiency }] }); setNewLanguage(''); setNewProficiency(''); } };
  const removeLanguage = (index: number) => onUpdate({ languages: languages.filter((_, i) => i !== index) });

  return (
    <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}><Wrench className="w-5 h-5" />Skills & Languages</CardTitle>
        <CardDescription>Add your technical skills, soft skills, and languages you speak.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className={labelClass}>Technical Skills</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {technicalSkills.map((skill, i) => (
              <Badge key={i} variant="secondary" className={`flex items-center gap-1 ${badgeClass}`}>{skill}<button onClick={() => removeTechnicalSkill(skill)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button></Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newTechnicalSkill} onChange={(e) => setNewTechnicalSkill(e.target.value)} placeholder="Add skill (e.g., React, Python)" onKeyPress={(e) => e.key === 'Enter' && addTechnicalSkill()} className={inputClass} />
            <Button onClick={addTechnicalSkill} size="sm" className={isNeoBrutalism ? 'border-2 border-foreground' : ''}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="space-y-3">
          <Label className={labelClass}>Soft Skills</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {softSkills.map((skill, i) => (
              <Badge key={i} variant="outline" className={`flex items-center gap-1 ${badgeClass}`}>{skill}<button onClick={() => removeSoftSkill(skill)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button></Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newSoftSkill} onChange={(e) => setNewSoftSkill(e.target.value)} placeholder="Add skill (e.g., Leadership)" onKeyPress={(e) => e.key === 'Enter' && addSoftSkill()} className={inputClass} />
            <Button onClick={addSoftSkill} size="sm" className={isNeoBrutalism ? 'border-2 border-foreground' : ''}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="space-y-3">
          <Label className={`flex items-center gap-2 ${labelClass}`}><Globe className="w-3.5 h-3.5" />Languages</Label>
          <div className="space-y-2 mb-2">
            {languages.map((lang, i) => (
              <div key={i} className={`flex items-center justify-between p-2 rounded ${isNeoBrutalism ? 'border-2 border-foreground' : 'border'}`}>
                <span>{lang.language} - <span className="text-muted-foreground">{lang.proficiency}</span></span>
                <button onClick={() => removeLanguage(i)} className="hover:text-destructive"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} placeholder="Language" className={inputClass} />
            <Select value={newProficiency} onValueChange={setNewProficiency}>
              <SelectTrigger className={inputClass}><SelectValue placeholder="Proficiency" /></SelectTrigger>
              <SelectContent>{PROFICIENCY_LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={addLanguage} size="sm" className={isNeoBrutalism ? 'border-2 border-foreground' : ''}><Plus className="h-4 w-4 mr-1" />Add</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
