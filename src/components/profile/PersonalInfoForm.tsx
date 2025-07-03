import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile } from '@/hooks/useUserProfile';

interface PersonalInfoFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
}

export const PersonalInfoForm = ({ profile, onUpdate }: PersonalInfoFormProps) => {
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={profile?.full_name || ''}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="John Doe"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={profile?.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={profile?.date_of_birth || ''}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={profile?.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="123 Main St, City, State, Country"
            rows={2}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profile?.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="New York"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              value={profile?.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="NY"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={profile?.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="United States"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
            <Input
              id="linkedin_url"
              value={profile?.linkedin_url || ''}
              onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website_url">Personal Website</Label>
            <Input
              id="website_url"
              value={profile?.website_url || ''}
              onChange={(e) => handleInputChange('website_url', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};