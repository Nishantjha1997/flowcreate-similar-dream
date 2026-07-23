import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Save, Loader2 } from 'lucide-react';
import { EnhancedResumePreview } from '@/components/resume/ResumeVisualPreview';
import { JobMatchAnalyzer } from '@/components/resume/JobMatchAnalyzer';
import { DocumentExportActions } from '@/components/export/DocumentExportActions';
import { ResumeData } from '@/utils/types';
import { cn } from '@/lib/utils';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';

interface ResumeHeaderSectionProps {
  resumeElementRef: React.RefObject<HTMLDivElement>;
  resumeName: string;
  handleShare: () => void;
  handleDownload: () => void;
  handlePrint: () => void;
  isGenerating: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  isEditing?: boolean;
  resume: ResumeData;
  resumeId?: string | null;
  onResumeChange?: (resume: ResumeData) => Promise<void> | void;
  onCreateTailoredVersion?: (resume: ResumeData) => Promise<void>;
  onDocxExport?: () => void;
  isPremium?: boolean;
  templateId: string;
  templateNames: Record<string, string>;
  sectionOrder: string[];
  hiddenSections: string[];
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
}

export const ResumeHeaderSection = ({
  resumeElementRef,
  resumeName,
  handleShare,
  handleDownload,
  handlePrint,
  isGenerating,
  onSave,
  isSaving = false,
  isEditing = false,
  resume,
  resumeId,
  onResumeChange,
  onCreateTailoredVersion,
  onDocxExport,
  isPremium = false,
  templateId,
  templateNames,
  sectionOrder,
  hiddenSections,
  saveStatus,
  lastSaved
}: ResumeHeaderSectionProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{isEditing ? 'Edit Resume' : 'Resume Builder'}</span>
          {saveStatus && (
            <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} className="text-xs font-normal" />
          )}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isEditing ? 'Update your professional resume' : 'Create a professional resume in minutes'}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onSave && (
          <Button
            onClick={onSave}
            disabled={isSaving}
            size="sm"
            className="rounded-full px-5 h-8 text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            {isSaving ? 'Saving…' : isEditing ? 'Update' : 'Save'}
          </Button>
        )}
        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="rounded-full px-4 h-8 text-xs font-medium border-border/50 hover:bg-muted/60 transition-all duration-200"
        >
          <Share2 className="h-3.5 w-3.5 mr-1.5" />
          Share
        </Button>
        <JobMatchAnalyzer
          resume={resume}
          resumeId={resumeId}
          onResumeChange={onResumeChange}
          onCreateTailoredVersion={onCreateTailoredVersion}
        />
        <DocumentExportActions
          onSemanticExport={handlePrint}
          onImageExport={handleDownload}
          isImageGenerating={isGenerating}
          onDocxExport={onDocxExport}
          isPremium={isPremium}
        />
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
