import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile } from '@/hooks/useUserProfile';
import { Briefcase, Github, Globe, Building, TrendingUp } from 'lucide-react';

interface ProfessionalInfoFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
  isNeoBrutalism?: boolean;
}

export const ProfessionalInfoForm = ({ profile, onUpdate, isNeoBrutalism = false }: ProfessionalInfoFormProps) => {
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    onUpdate({ [field]: value });
  };

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (6-10 years)' },
    { value: 'executive', label: 'Executive Level (10+ years)' }
  ];

  const inputClass = isNeoBrutalism ? 'border-2 border-foreground focus:ring-2 focus:ring-primary' : '';
  const labelClass = isNeoBrutalism ? 'uppercase text-xs font-bold tracking-wide' : '';

  return (
    <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
          <Briefcase className="w-5 h-5" />
          Professional Information
        </CardTitle>
        <CardDescription>
          Your career overview and professional details. This helps us tailor your resume to your industry.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="professional_summary" className={`flex items-center gap-2 ${labelClass}`}>
            <TrendingUp className="w-3.5 h-3.5" />
            Professional Summary <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="professional_summary"
            value={profile?.professional_summary || ''}
            onChange={(e) => handleInputChange('professional_summary', e.target.value)}
            placeholder="Write a brief summary of your professional background and career objectives..."
            rows={4}
            className={inputClass}
          />
          <p className={`text-xs ${isNeoBrutalism ? 'font-medium' : 'text-muted-foreground'}`}>
            This will be used as the default summary in your resumes. Keep it concise and impactful.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="current_position" className={`flex items-center gap-2 ${labelClass}`}>
              <Briefcase className="w-3.5 h-3.5" />
              Current Position
            </Label>
            <Input
              id="current_position"
              value={profile?.current_position || ''}
              onChange={(e) => handleInputChange('current_position', e.target.value)}
              placeholder="Senior Software Engineer"
              className={inputClass}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry" className={`flex items-center gap-2 ${labelClass}`}>
              <Building className="w-3.5 h-3.5" />
              Industry
            </Label>
            <Input
              id="industry"
              value={profile?.industry || ''}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              placeholder="Technology, Healthcare, Finance, etc."
              className={inputClass}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="experience_level" className={labelClass}>Experience Level</Label>
          <Select
            value={profile?.experience_level || ''}
            onValueChange={(value) => handleInputChange('experience_level', value)}
          >
            <SelectTrigger className={inputClass}>
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
            <Label htmlFor="github_url" className={`flex items-center gap-2 ${labelClass}`}>
              <Github className="w-3.5 h-3.5" />
              GitHub Profile
            </Label>
            <Input
              id="github_url"
              value={profile?.github_url || ''}
              onChange={(e) => handleInputChange('github_url', e.target.value)}
              placeholder="https://github.com/username"
              className={inputClass}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portfolio_url" className={`flex items-center gap-2 ${labelClass}`}>
              <Globe className="w-3.5 h-3.5" />
              Portfolio URL
            </Label>
            <Input
              id="portfolio_url"
              value={profile?.portfolio_url || ''}
              onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
              placeholder="https://portfolio.com"
              className={inputClass}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
