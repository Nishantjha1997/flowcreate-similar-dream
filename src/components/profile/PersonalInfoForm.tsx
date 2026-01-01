import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AvatarUploader } from '@/components/AvatarUploader';
import { UserProfile } from '@/hooks/useUserProfile';
import { User, Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

interface PersonalInfoFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
  isNeoBrutalism?: boolean;
}

export const PersonalInfoForm = ({ profile, onUpdate, isNeoBrutalism = false }: PersonalInfoFormProps) => {
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    onUpdate({ [field]: value });
  };

  const inputClass = isNeoBrutalism ? 'border-2 border-foreground focus:ring-2 focus:ring-primary' : '';
  const labelClass = isNeoBrutalism ? 'uppercase text-xs font-bold tracking-wide' : '';

  return (
    <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
          <User className="w-5 h-5" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Your basic contact details. This information will appear at the top of your resume.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarUploader
          currentImage={{
            src: profile?.avatar_url || null,
            size: 150,
            shape: 'circle'
          }}
          onImageChange={(imageData) => {
            onUpdate({ avatar_url: imageData.src });
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" className={`flex items-center gap-2 ${labelClass}`}>
              <User className="w-3.5 h-3.5" />
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              value={profile?.full_name || ''}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="John Doe"
              className={inputClass}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className={`flex items-center gap-2 ${labelClass}`}>
              <Mail className="w-3.5 h-3.5" />
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@example.com"
              className={inputClass}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className={`flex items-center gap-2 ${labelClass}`}>
              <Phone className="w-3.5 h-3.5" />
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              value={profile?.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={inputClass}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date_of_birth" className={labelClass}>Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={profile?.date_of_birth || ''}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address" className={`flex items-center gap-2 ${labelClass}`}>
            <MapPin className="w-3.5 h-3.5" />
            Address
          </Label>
          <Textarea
            id="address"
            value={profile?.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="123 Main St, City, State, Country"
            rows={2}
            className={inputClass}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className={labelClass}>City</Label>
            <Input
              id="city"
              value={profile?.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="New York"
              className={inputClass}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state" className={labelClass}>State/Province</Label>
            <Input
              id="state"
              value={profile?.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="NY"
              className={inputClass}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country" className={labelClass}>Country</Label>
            <Input
              id="country"
              value={profile?.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="United States"
              className={inputClass}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className={`flex items-center gap-2 ${labelClass}`}>
              <Linkedin className="w-3.5 h-3.5" />
              LinkedIn Profile
            </Label>
            <Input
              id="linkedin_url"
              value={profile?.linkedin_url || ''}
              onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className={inputClass}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website_url" className={`flex items-center gap-2 ${labelClass}`}>
              <Globe className="w-3.5 h-3.5" />
              Personal Website
            </Label>
            <Input
              id="website_url"
              value={profile?.website_url || ''}
              onChange={(e) => handleInputChange('website_url', e.target.value)}
              placeholder="https://yourwebsite.com"
              className={inputClass}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
