
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Save } from 'lucide-react';
import { EnhancedResumePreview } from '@/components/resume/ResumeVisualPreview';
import { ResumeData } from '@/utils/types';

interface ResumeHeaderSectionProps {
  resumeElementRef: React.RefObject<HTMLDivElement>;
  resumeName: string;
  handleShare: () => void;
  handleDownload: () => void;
  isGenerating: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  isEditing?: boolean;
  resume: ResumeData;
  templateId: string;
  templateNames: Record<string, string>;
  sectionOrder: string[];
  hiddenSections: string[];
}

export const ResumeHeaderSection = ({
  resumeElementRef,
  resumeName,
  handleShare,
  handleDownload,
  isGenerating,
  onSave,
  isSaving = false,
  isEditing = false,
  resume,
  templateId,
  templateNames,
  sectionOrder,
  hiddenSections
}: ResumeHeaderSectionProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          {isEditing ? 'Edit Resume' : 'Resume Builder'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Update your professional resume' : 'Create a professional resume in minutes'}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {onSave && (
          <Button onClick={onSave} disabled={isSaving} size="sm" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : isEditing ? 'Update Resume' : 'Save Resume'}
          </Button>
        )}
        <Button onClick={handleShare} variant="outline" size="sm" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm" disabled={isGenerating} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          {isGenerating ? 'Downloading...' : 'Download PDF'}
        </Button>
        <EnhancedResumePreview 
          resume={resume}
          templateId={templateId}
          templateNames={templateNames}
          sectionOrder={sectionOrder}
          hiddenSections={hiddenSections}
        />
      </div>
    </div>
  );
};
