import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, GraduationCap } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface EducationFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export const EducationForm = ({ profile, onUpdate }: EducationFormProps) => {
  const education = (profile?.education as Education[]) || [];
  
  const [newEducation, setNewEducation] = useState<Partial<Education>>({
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const addEducation = () => {
    if (!newEducation.school || !newEducation.degree) return;
    
    const edu: Education = {
      id: Date.now(),
      school: newEducation.school || '',
      degree: newEducation.degree || '',
      field: newEducation.field || '',
      startDate: newEducation.startDate || '',
      endDate: newEducation.endDate || '',
      description: newEducation.description || ''
    };

    const updatedEducation = [...education, edu];
    onUpdate({ education: updatedEducation });
    
    setNewEducation({
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const removeEducation = (id: number) => {
    const updatedEducation = education.filter(edu => edu.id !== id);
    onUpdate({ education: updatedEducation });
  };

  const updateEducation = (id: number, updates: Partial<Education>) => {
    const updatedEducation = education.map(edu => 
      edu.id === id ? { ...edu, ...updates } : edu
    );
    onUpdate({ education: updatedEducation });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Education
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Education */}
        {education.map((edu) => (
          <Card key={edu.id} className="relative">
            <CardContent className="p-4">
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(edu.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>School/University</Label>
                  <Input
                    value={edu.school}
                    onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                    placeholder="University of California"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Degree</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                    placeholder="Bachelor of Science"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <Input
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                    placeholder="Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description (GPA, Honors, Relevant Coursework)</Label>
                <Textarea
                  value={edu.description}
                  onChange={(e) => updateEducation(edu.id, { description: e.target.value })}
                  placeholder="GPA: 3.8/4.0, Magna Cum Laude, Relevant coursework: Data Structures, Algorithms..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Education */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <h4 className="font-medium mb-4">Add New Education</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>School/University *</Label>
                <Input
                  value={newEducation.school || ''}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, school: e.target.value }))}
                  placeholder="University of California"
                />
              </div>
              <div className="space-y-2">
                <Label>Degree *</Label>
                <Input
                  value={newEducation.degree || ''}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="Bachelor of Science"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Field of Study</Label>
                <Input
                  value={newEducation.field || ''}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
                  placeholder="Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={newEducation.startDate || ''}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={newEducation.endDate || ''}
                  onChange={(e) => setNewEducation(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <Label>Description (GPA, Honors, Relevant Coursework)</Label>
              <Textarea
                value={newEducation.description || ''}
                onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="GPA: 3.8/4.0, Magna Cum Laude, Relevant coursework: Data Structures, Algorithms..."
                rows={2}
              />
            </div>
            
            <Button onClick={addEducation}>
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
