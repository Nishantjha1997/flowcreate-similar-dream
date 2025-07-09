import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Heart } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface VolunteerFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
}

interface VolunteerExperience {
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  current?: boolean;
}

export const VolunteerForm = ({ profile, onUpdate }: VolunteerFormProps) => {
  const volunteerExperience = (profile?.volunteer_experience as VolunteerExperience[]) || [];
  
  const [newVolunteer, setNewVolunteer] = useState<VolunteerExperience>({
    organization: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    current: false
  });

  const addVolunteerExperience = () => {
    if (!newVolunteer.organization || !newVolunteer.role) return;
    
    const updatedVolunteer = [...volunteerExperience, { ...newVolunteer }];
    onUpdate({ volunteer_experience: updatedVolunteer });
    
    setNewVolunteer({
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      current: false
    });
  };

  const removeVolunteerExperience = (index: number) => {
    const updatedVolunteer = volunteerExperience.filter((_, i) => i !== index);
    onUpdate({ volunteer_experience: updatedVolunteer });
  };

  const updateVolunteerExperience = (index: number, updates: Partial<VolunteerExperience>) => {
    const updatedVolunteer = volunteerExperience.map((vol, i) => 
      i === index ? { ...vol, ...updates } : vol
    );
    onUpdate({ volunteer_experience: updatedVolunteer });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Volunteer Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Volunteer Experience */}
        {volunteerExperience.map((vol, index) => (
          <Card key={index} className="relative">
            <CardContent className="p-4">
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVolunteerExperience(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Organization</Label>
                  <Input
                    value={vol.organization}
                    onChange={(e) => updateVolunteerExperience(index, { organization: e.target.value })}
                    placeholder="Red Cross"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={vol.role}
                    onChange={(e) => updateVolunteerExperience(index, { role: e.target.value })}
                    placeholder="Event Coordinator"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="month"
                    value={vol.startDate}
                    onChange={(e) => updateVolunteerExperience(index, { startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="month"
                    value={vol.endDate}
                    onChange={(e) => updateVolunteerExperience(index, { endDate: e.target.value })}
                    disabled={vol.current}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  checked={vol.current || false}
                  onCheckedChange={(checked) => 
                    updateVolunteerExperience(index, { current: checked, endDate: checked ? '' : vol.endDate })
                  }
                />
                <Label>Currently volunteering here</Label>
                {vol.current && <Badge variant="secondary">Current</Badge>}
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={vol.description}
                  onChange={(e) => updateVolunteerExperience(index, { description: e.target.value })}
                  placeholder="Describe your volunteer activities and impact..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Volunteer Experience */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <h4 className="font-medium mb-4">Add New Volunteer Experience</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Organization *</Label>
                <Input
                  value={newVolunteer.organization}
                  onChange={(e) => setNewVolunteer(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Red Cross"
                />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Input
                  value={newVolunteer.role}
                  onChange={(e) => setNewVolunteer(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="Event Coordinator"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={newVolunteer.startDate}
                  onChange={(e) => setNewVolunteer(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={newVolunteer.endDate}
                  onChange={(e) => setNewVolunteer(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={newVolunteer.current}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                checked={newVolunteer.current || false}
                onCheckedChange={(checked) => 
                  setNewVolunteer(prev => ({ ...prev, current: checked, endDate: checked ? '' : prev.endDate }))
                }
              />
              <Label>Currently volunteering here</Label>
            </div>
            
            <div className="space-y-2 mb-4">
              <Label>Description</Label>
              <Textarea
                value={newVolunteer.description}
                onChange={(e) => setNewVolunteer(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your volunteer activities and impact..."
                rows={3}
              />
            </div>
            
            <Button onClick={addVolunteerExperience}>
              <Plus className="w-4 h-4 mr-2" />
              Add Volunteer Experience
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
