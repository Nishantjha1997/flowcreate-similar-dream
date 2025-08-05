
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ResumeData } from '@/utils/resumeAdapterUtils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, X, UserCheck, FileText } from 'lucide-react';
import { AiSuggestionButton } from "@/components/resume/AiSuggestionButton";
import { PDFUploader } from '@/components/PDFUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Personal Information</h2>
        <div className="flex gap-2">
          {hasProfileData && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPopulateFromProfile}
              className="flex items-center gap-2"
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
                Upload Resume PDF
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
                onClose={() => setShowPDFUploader(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-4 mb-6">
        <Avatar className="w-24 h-24 border-2">
          {personal.profileImage ? (
            <AvatarImage src={personal.profileImage} alt="Profile" />
          ) : (
            <AvatarFallback className="text-lg">
              {personal.name ? personal.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex gap-2">
          <Label htmlFor="profile-image" className="cursor-pointer">
            <div className="flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90">
              <Upload size={14} />
              <span>Upload Photo</span>
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
              variant="destructive" 
              size="sm" 
              onClick={removeProfileImage}
              className="text-xs flex items-center gap-1"
            >
              <X size={14} />
              <span>Remove</span>
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Upload a professional photo for your resume</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name" className="block text-sm font-medium mb-1">
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            value={personal.name}
            onChange={onChange}
            placeholder="John Doe"
          />
        </div>
        <div>
          <Label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={personal.email}
            onChange={onChange}
            placeholder="john@example.com"
          />
        </div>
        <div>
          <Label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone
          </Label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={personal.phone}
            onChange={onChange}
            placeholder="(123) 456-7890"
          />
        </div>
        <div>
          <Label htmlFor="address" className="block text-sm font-medium mb-1">
            Location
          </Label>
          <Input
            type="text"
            id="address"
            name="address"
            value={personal.address}
            onChange={onChange}
            placeholder="City, Country"
          />
        </div>
        <div>
          <Label htmlFor="website" className="block text-sm font-medium mb-1">
            Website (Optional)
          </Label>
          <Input
            type="text"
            id="website"
            name="website"
            value={personal.website || ''}
            onChange={onChange}
            placeholder="yourwebsite.com"
          />
        </div>
        <div>
          <Label htmlFor="linkedin" className="block text-sm font-medium mb-1">
            LinkedIn (Optional)
          </Label>
          <Input
            type="text"
            id="linkedin"
            name="linkedin"
            value={personal.linkedin || ''}
            onChange={onChange}
            placeholder="linkedin.com/in/username"
          />
        </div>
        <div>
          <label htmlFor="summary" className="block text-sm font-medium mb-1">
            Professional Summary / About You
          </label>
          <textarea
            id="summary"
            name="summary"
            value={personal.summary}
            onChange={onChange}
            rows={5}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
      </div>
    </div>
  );
};
