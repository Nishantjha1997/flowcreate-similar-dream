import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AvatarUploader } from '@/components/AvatarUploader';
import { UserProfile } from '@/hooks/useUserProfile';
import { User, Mail, Phone, MapPin, Globe, Linkedin, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalInfoFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
  isNeoBrutalism?: boolean;
}

interface ValidationState {
  full_name: { valid: boolean; message: string };
  email: { valid: boolean; message: string };
  phone: { valid: boolean; message: string };
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  // Accept various phone formats - at least 7 digits
  const phoneRegex = /[\d\s\-+()]{7,}/;
  return phoneRegex.test(phone);
};

export const PersonalInfoForm = ({ profile, onUpdate, isNeoBrutalism = false }: PersonalInfoFormProps) => {
  const [validation, setValidation] = useState<ValidationState>({
    full_name: { valid: true, message: '' },
    email: { valid: true, message: '' },
    phone: { valid: true, message: '' }
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    onUpdate({ [field]: value });
    
    // Real-time validation
    if (field === 'full_name') {
      const valid = value.trim().length >= 2;
      setValidation(prev => ({
        ...prev,
        full_name: {
          valid,
          message: valid ? '' : 'Name must be at least 2 characters'
        }
      }));
    }
    
    if (field === 'email') {
      const valid = !value || validateEmail(value);
      setValidation(prev => ({
        ...prev,
        email: {
          valid,
          message: valid ? '' : 'Please enter a valid email address'
        }
      }));
    }
    
    if (field === 'phone') {
      const valid = !value || validatePhone(value);
      setValidation(prev => ({
        ...prev,
        phone: {
          valid,
          message: valid ? '' : 'Please enter a valid phone number'
        }
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validate on mount with existing data
  useEffect(() => {
    if (profile) {
      setValidation({
        full_name: {
          valid: !profile.full_name || profile.full_name.trim().length >= 2,
          message: profile.full_name && profile.full_name.trim().length < 2 ? 'Name must be at least 2 characters' : ''
        },
        email: {
          valid: !profile.email || validateEmail(profile.email),
          message: profile.email && !validateEmail(profile.email) ? 'Please enter a valid email address' : ''
        },
        phone: {
          valid: !profile.phone || validatePhone(profile.phone),
          message: profile.phone && !validatePhone(profile.phone) ? 'Please enter a valid phone number' : ''
        }
      });
    }
  }, [profile?.full_name, profile?.email, profile?.phone]);

  const getFieldStatus = (field: keyof ValidationState) => {
    const value = profile?.[field] || '';
    const isTouched = touched[field];
    const { valid, message } = validation[field];
    
    if (!value) return { status: 'empty', message: '' };
    if (!valid && isTouched) return { status: 'error', message };
    if (valid && value) return { status: 'success', message: '' };
    return { status: 'empty', message: '' };
  };

  const inputClass = isNeoBrutalism ? 'border-2 border-foreground focus:ring-2 focus:ring-primary' : '';
  const labelClass = isNeoBrutalism ? 'uppercase text-xs font-bold tracking-wide' : '';

  const getInputClassWithValidation = (field: keyof ValidationState) => {
    const { status } = getFieldStatus(field);
    return cn(
      inputClass,
      'transition-all duration-200',
      status === 'error' && 'border-destructive ring-1 ring-destructive/30',
      status === 'success' && 'border-green-500 ring-1 ring-green-500/30'
    );
  };

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
            <div className="relative">
              <Input
                id="full_name"
                value={profile?.full_name || ''}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                onBlur={() => handleBlur('full_name')}
                placeholder="John Doe"
                className={cn(getInputClassWithValidation('full_name'), 'pr-10')}
              />
              {getFieldStatus('full_name').status === 'success' && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {getFieldStatus('full_name').status === 'error' && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
              )}
            </div>
            {getFieldStatus('full_name').status === 'error' && (
              <p className="text-xs text-destructive animate-fade-in">{getFieldStatus('full_name').message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className={`flex items-center gap-2 ${labelClass}`}>
              <Mail className="w-3.5 h-3.5" />
              Email Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="john@example.com"
                className={cn(getInputClassWithValidation('email'), 'pr-10')}
              />
              {getFieldStatus('email').status === 'success' && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {getFieldStatus('email').status === 'error' && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
              )}
            </div>
            {getFieldStatus('email').status === 'error' && (
              <p className="text-xs text-destructive animate-fade-in">{getFieldStatus('email').message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className={`flex items-center gap-2 ${labelClass}`}>
              <Phone className="w-3.5 h-3.5" />
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="phone"
                value={profile?.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="+1 (555) 123-4567"
                className={cn(getInputClassWithValidation('phone'), 'pr-10')}
              />
              {getFieldStatus('phone').status === 'success' && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {getFieldStatus('phone').status === 'error' && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
              )}
            </div>
            {getFieldStatus('phone').status === 'error' && (
              <p className="text-xs text-destructive animate-fade-in">{getFieldStatus('phone').message}</p>
            )}
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