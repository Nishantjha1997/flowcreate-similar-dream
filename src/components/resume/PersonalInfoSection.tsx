
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ResumeData } from '@/utils/resumeAdapterUtils';

interface PersonalInfoSectionProps {
  personal: ResumeData['personal'];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const PersonalInfoSection = ({ personal, onChange }: PersonalInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Personal Information</h2>
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
          <Label htmlFor="summary" className="block text-sm font-medium mb-1">
            Professional Summary
          </Label>
          <Textarea
            id="summary"
            name="summary"
            value={personal.summary}
            onChange={onChange}
            rows={4}
            placeholder="Write a professional summary..."
          />
        </div>
      </div>
    </div>
  );
};
