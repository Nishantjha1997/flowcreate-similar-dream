
import React, { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ResumeData } from '@/utils/resumeAdapterUtils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, X, UserCheck, FileText, CheckCircle2, AlertCircle, User, Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';
import { AiSuggestionButton } from "@/components/resume/AiSuggestionButton";
import { PDFUploader } from '@/components/PDFUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PersonalInfoSectionProps {
  personal: ResumeData['personal'];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onProfileImageChange?: (profileImage: string) => void;
  onPopulateFromProfile?: () => void;
  hasProfileData?: boolean;
  onAIFeatureUpsell?: () => void;
  isPremium?: boolean;
  onPDFDataExtracted?: (data: any) => void;
}

// Validation helpers
const validateEmail = (email: string) => {
  if (!email) return { valid: false, message: 'Email is required' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, message: 'Invalid email format' };
  return { valid: true, message: '' };
};

const validatePhone = (phone: string) => {
  if (!phone) return { valid: false, message: 'Phone is required' };
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (!/^[\+]?[\d]{7,15}$/.test(cleaned)) return { valid: false, message: 'Invalid phone number' };
  return { valid: true, message: '' };
};

const validateName = (name: string) => {
  if (!name?.trim()) return { valid: false, message: 'Name is required' };
  if (name.trim().length < 2) return { valid: false, message: 'Name too short' };
  return { valid: true, message: '' };
};

const validateUrl = (url: string) => {
  if (!url) return { valid: true, message: '' }; // Optional field
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return { valid: true, message: '' };
  } catch {
    return { valid: false, message: 'Invalid URL format' };
  }
};

export const PersonalInfoSection = ({ 
  personal, 
  onChange, 
  onProfileImageChange,
  onAIFeatureUpsell,
  isPremium,
  onPopulateFromProfile,
  hasProfileData,
  onPDFDataExtracted
}: PersonalInfoSectionProps) => {
  const [showPDFUploader, setShowPDFUploader] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation state
  const validation = useMemo(() => ({
    name: validateName(personal.name),
    email: validateEmail(personal.email),
    phone: validatePhone(personal.phone),
    website: validateUrl(personal.website || ''),
    linkedin: validateUrl(personal.linkedin || ''),
  }), [personal]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldStatus = (field: keyof typeof validation) => {
    const val = validation[field];
    if (!touched[field] && !val.valid) return 'idle';
    return val.valid ? 'valid' : 'invalid';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result && onProfileImageChange) {
          onProfileImageChange(e.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const removeProfileImage = () => {
    if (onProfileImageChange) {
      onProfileImageChange('');
    }
  };

  const InputWithIcon = ({ 
    icon: Icon, 
    field, 
    label, 
    type = 'text', 
    placeholder, 
    value, 
    required = false 
  }: { 
    icon: React.ElementType; 
    field: string; 
    label: string; 
    type?: string; 
    placeholder: string; 
    value: string; 
    required?: boolean;
  }) => {
    const status = field in validation ? getFieldStatus(field as keyof typeof validation) : 'idle';
    const fieldValidation = field in validation ? validation[field as keyof typeof validation] : null;

    return (
      <div className="space-y-1.5">
        <Label htmlFor={field} className="flex items-center gap-1.5 text-sm font-medium">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        <div className="relative">
          <Input
            id={field}
            name={field}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={() => handleBlur(field)}
            placeholder={placeholder}
            className={cn(
              "pr-8 transition-all duration-200",
              status === 'valid' && "border-green-500 focus-visible:ring-green-500/20",
              status === 'invalid' && "border-destructive focus-visible:ring-destructive/20"
            )}
          />
          {status === 'valid' && (
            <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
          {status === 'invalid' && (
            <AlertCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
          )}
        </div>
        {status === 'invalid' && fieldValidation && (
          <p className="text-xs text-destructive flex items-center gap-1 animate-fade-in">
            {fieldValidation.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your contact details and professional summary
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasProfileData && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPopulateFromProfile}
              className="flex items-center gap-2 hover:bg-primary/5 border-primary/30 text-primary"
            >
              <UserCheck className="h-4 w-4" />
              Fill from Profile
            </Button>
          )}
          <Dialog open={showPDFUploader} onOpenChange={setShowPDFUploader}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Upload PDF
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Resume PDF</DialogTitle>
              </DialogHeader>
              <PDFUploader
                onDataExtracted={(data) => {
                  if (onPDFDataExtracted) {
                    onPDFDataExtracted(data);
                  }
                  setShowPDFUploader(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Profile Photo Section */}
      <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg border border-dashed">
        <Avatar className="w-20 h-20 border-2 border-background shadow-md">
          {personal.profileImage ? (
            <AvatarImage src={personal.profileImage} alt="Profile" />
          ) : (
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {personal.name ? personal.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <p className="text-sm font-medium mb-2">Profile Photo</p>
          <div className="flex gap-2">
            <Label htmlFor="profile-image" className="cursor-pointer">
              <div className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
                <Upload size={12} />
                <span>Upload</span>
              </div>
              <Input 
                id="profile-image" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </Label>
            
            {personal.profileImage && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={removeProfileImage}
                className="text-xs h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X size={12} className="mr-1" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">Recommended: Square image, min 200x200px</p>
        </div>
      </div>
      
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <InputWithIcon 
            icon={User} 
            field="name" 
            label="Full Name" 
            placeholder="John Doe" 
            value={personal.name}
            required
          />
        </div>
        
        <InputWithIcon 
          icon={Mail} 
          field="email" 
          label="Email" 
          type="email"
          placeholder="john@example.com" 
          value={personal.email}
          required
        />
        
        <InputWithIcon 
          icon={Phone} 
          field="phone" 
          label="Phone" 
          type="tel"
          placeholder="(123) 456-7890" 
          value={personal.phone}
          required
        />
        
        <InputWithIcon 
          icon={MapPin} 
          field="address" 
          label="Location" 
          placeholder="City, Country" 
          value={personal.address}
        />
        
        <InputWithIcon 
          icon={Globe} 
          field="website" 
          label="Website" 
          placeholder="yourwebsite.com" 
          value={personal.website || ''}
        />
        
        <div className="md:col-span-2">
          <InputWithIcon 
            icon={Linkedin} 
            field="linkedin" 
            label="LinkedIn" 
            placeholder="linkedin.com/in/username" 
            value={personal.linkedin || ''}
          />
        </div>
      </div>
      
      {/* Professional Summary */}
      <div className="space-y-2">
        <Label htmlFor="summary" className="text-sm font-medium">
          Professional Summary
        </Label>
        <Textarea
          id="summary"
          name="summary"
          value={personal.summary}
          onChange={onChange}
          rows={4}
          className="resize-none"
          placeholder="E.g. Results-driven marketing manager with 7+ years experience..."
        />
        <AiSuggestionButton
          value={personal.summary}
          onAccept={(suggested) =>
            onChange({
              target: { name: "summary", value: suggested },
            } as React.ChangeEvent<HTMLTextAreaElement>)
          }
          label="Get AI Summary Suggestions"
          section="summary"
          isPremium={isPremium}
          onUpsell={onAIFeatureUpsell}
          additionalContext="Professional summary for resume header"
        />
        <p className="text-xs text-muted-foreground">
          Tip: Keep it concise (2-3 sentences) and highlight your key achievements
        </p>
      </div>
    </div>
  );
};
