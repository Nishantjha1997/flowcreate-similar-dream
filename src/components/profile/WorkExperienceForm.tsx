import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Briefcase } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface WorkExperienceFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
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

export const WorkExperienceForm = ({ profile, onUpdate }: WorkExperienceFormProps) => {
  const workExperience = (profile?.work_experience as WorkExperience[]) || [];
  
  const [newExperience, setNewExperience] = useState<Partial<WorkExperience>>({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const addExperience = () => {
    if (!newExperience.title || !newExperience.company) return;
    
    const experience: WorkExperience = {
      id: Date.now(),
      title: newExperience.title || '',
      company: newExperience.company || '',
      location: newExperience.location || '',
      startDate: newExperience.startDate || '',
      endDate: newExperience.current ? '' : (newExperience.endDate || ''),
      current: newExperience.current || false,
      description: newExperience.description || ''
    };

    const updatedExperience = [...workExperience, experience];
    onUpdate({ work_experience: updatedExperience });
    
    setNewExperience({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
  };

  const removeExperience = (id: number) => {
    const updatedExperience = workExperience.filter(exp => exp.id !== id);
    onUpdate({ work_experience: updatedExperience });
  };

  const updateExperience = (id: number, updates: Partial<WorkExperience>) => {
    const updatedExperience = workExperience.map(exp => 
      exp.id === id ? { ...exp, ...updates } : exp
    );
    onUpdate({ work_experience: updatedExperience });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Work Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Experience */}
        {workExperience.map((exp) => (
          <Card key={exp.id} className="relative">
            <CardContent className="p-4">
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(exp.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) => updateExperience(exp.id, { title: e.target.value })}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                    placeholder="Tech Corp Inc."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                    disabled={exp.current}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  checked={exp.current}
                  onCheckedChange={(checked) => 
                    updateExperience(exp.id, { current: checked, endDate: checked ? '' : exp.endDate })
                  }
                />
                <Label>Currently working here</Label>
                {exp.current && <Badge variant="secondary">Current</Badge>}
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Experience */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <h4 className="font-medium mb-4">Add New Work Experience</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input
                  value={newExperience.title || ''}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input
                  value={newExperience.company || ''}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Tech Corp Inc."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={newExperience.location || ''}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="San Francisco, CA"
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={newExperience.startDate || ''}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={newExperience.endDate || ''}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={newExperience.current}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                checked={newExperience.current || false}
                onCheckedChange={(checked) => 
                  setNewExperience(prev => ({ ...prev, current: checked, endDate: checked ? '' : prev.endDate }))
                }
              />
              <Label>Currently working here</Label>
            </div>
            
            <div className="space-y-2 mb-4">
              <Label>Description</Label>
              <Textarea
                value={newExperience.description || ''}
                onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your responsibilities and achievements..."
                rows={3}
              />
            </div>
            
            <Button onClick={addExperience}>
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
