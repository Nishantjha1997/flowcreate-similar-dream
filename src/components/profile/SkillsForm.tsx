import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface SkillsFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
}

export const SkillsForm = ({ profile, onUpdate }: SkillsFormProps) => {
  const [newTechnicalSkill, setNewTechnicalSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newProficiency, setNewProficiency] = useState('');

  const technicalSkills = profile?.technical_skills || [];
  const softSkills = profile?.soft_skills || [];
  const languages = profile?.languages || [];

  const addTechnicalSkill = () => {
    if (newTechnicalSkill.trim()) {
      const updatedSkills = [...technicalSkills, newTechnicalSkill.trim()];
      onUpdate({ technical_skills: updatedSkills });
      setNewTechnicalSkill('');
    }
  };

  const removeTechnicalSkill = (skillToRemove: string) => {
    const updatedSkills = technicalSkills.filter(skill => skill !== skillToRemove);
    onUpdate({ technical_skills: updatedSkills });
  };

  const addSoftSkill = () => {
    if (newSoftSkill.trim()) {
      const updatedSkills = [...softSkills, newSoftSkill.trim()];
      onUpdate({ soft_skills: updatedSkills });
      setNewSoftSkill('');
    }
  };

  const removeSoftSkill = (skillToRemove: string) => {
    const updatedSkills = softSkills.filter(skill => skill !== skillToRemove);
    onUpdate({ soft_skills: updatedSkills });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && newProficiency.trim()) {
      const updatedLanguages = [...languages, { 
        language: newLanguage.trim(), 
        proficiency: newProficiency.trim() 
      }];
      onUpdate({ languages: updatedLanguages });
      setNewLanguage('');
      setNewProficiency('');
    }
  };

  const removeLanguage = (index: number) => {
    const updatedLanguages = languages.filter((_, i) => i !== index);
    onUpdate({ languages: updatedLanguages });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Languages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Technical Skills */}
        <div className="space-y-3">
          <Label>Technical Skills</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {technicalSkills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {skill}
                <button
                  onClick={() => removeTechnicalSkill(skill)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTechnicalSkill}
              onChange={(e) => setNewTechnicalSkill(e.target.value)}
              placeholder="Add a technical skill (e.g., React, Python, AWS)"
              onKeyPress={(e) => e.key === 'Enter' && addTechnicalSkill()}
            />
            <Button onClick={addTechnicalSkill} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Soft Skills */}
        <div className="space-y-3">
          <Label>Soft Skills</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {softSkills.map((skill, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                {skill}
                <button
                  onClick={() => removeSoftSkill(skill)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newSoftSkill}
              onChange={(e) => setNewSoftSkill(e.target.value)}
              placeholder="Add a soft skill (e.g., Leadership, Communication)"
              onKeyPress={(e) => e.key === 'Enter' && addSoftSkill()}
            />
            <Button onClick={addSoftSkill} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <Label>Languages</Label>
          <div className="space-y-2 mb-2">
            {languages.map((lang, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span>{lang.language} - {lang.proficiency}</span>
                <button
                  onClick={() => removeLanguage(index)}
                  className="hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Language (e.g., English)"
            />
            <Input
              value={newProficiency}
              onChange={(e) => setNewProficiency(e.target.value)}
              placeholder="Proficiency (e.g., Native, Fluent)"
            />
            <Button onClick={addLanguage} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};