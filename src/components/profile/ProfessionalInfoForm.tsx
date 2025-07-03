import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile } from '@/hooks/useUserProfile';

interface ProfessionalInfoFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
}

export const ProfessionalInfoForm = ({ profile, onUpdate }: ProfessionalInfoFormProps) => {
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    onUpdate({ [field]: value });
  };

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (6-10 years)' },
    { value: 'executive', label: 'Executive Level (10+ years)' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="professional_summary">Professional Summary *</Label>
          <Textarea
            id="professional_summary"
            value={profile?.professional_summary || ''}
            onChange={(e) => handleInputChange('professional_summary', e.target.value)}
            placeholder="Write a brief summary of your professional background and career objectives..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            This will be used as the default summary in your resumes. Keep it concise and impactful.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="current_position">Current Position</Label>
            <Input
              id="current_position"
              value={profile?.current_position || ''}
              onChange={(e) => handleInputChange('current_position', e.target.value)}
              placeholder="Senior Software Engineer"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={profile?.industry || ''}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              placeholder="Technology, Healthcare, Finance, etc."
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="experience_level">Experience Level</Label>
          <Select
            value={profile?.experience_level || ''}
            onValueChange={(value) => handleInputChange('experience_level', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub Profile</Label>
            <Input
              id="github_url"
              value={profile?.github_url || ''}
              onChange={(e) => handleInputChange('github_url', e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portfolio_url">Portfolio URL</Label>
            <Input
              id="portfolio_url"
              value={profile?.portfolio_url || ''}
              onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
              placeholder="https://portfolio.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};