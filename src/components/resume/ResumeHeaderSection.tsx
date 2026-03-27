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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          {isEditing ? 'Edit Resume' : 'Resume Builder'}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isEditing ? 'Update your professional resume' : 'Create a professional resume in minutes'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onSave && (
          <Button
            onClick={onSave}
            disabled={isSaving}
            size="sm"
            className="rounded-full px-5 h-9 text-xs font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-200"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Save'}
          </Button>
        )}
        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="rounded-full px-4 h-9 text-xs font-medium border-border/60 hover:bg-muted/50 transition-all duration-200"
        >
          <Share2 className="h-3.5 w-3.5 mr-1.5" />
          Share
        </Button>
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          disabled={isGenerating}
          className="rounded-full px-4 h-9 text-xs font-medium border-border/60 hover:bg-muted/50 transition-all duration-200"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          {isGenerating ? 'Generating...' : 'PDF'}
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
