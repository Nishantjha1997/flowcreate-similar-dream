import React, { memo, useCallback, useMemo } from 'react';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';
import { ResumeData } from '@/utils/types';
import { usePerformanceMonitor } from '@/hooks/usePerformanceOptimization';

interface OptimizedResumePreviewProps {
  resume: ResumeData;
  templateId: string;
  sectionOrder: string[];
  hiddenSections: string[];
  resumeRef?: React.RefObject<HTMLDivElement>;
}

const OptimizedResumePreview = memo(function OptimizedResumePreview({
  resume,
  templateId,
  sectionOrder,
  hiddenSections,
  resumeRef
}: OptimizedResumePreviewProps) {
  usePerformanceMonitor('OptimizedResumePreview');

  // Memoize filtered sections to avoid recalculation
  const visibleSections = useMemo(() => {
    return sectionOrder.filter(section => !hiddenSections.includes(section));
  }, [sectionOrder, hiddenSections]);

  // Memoize resume data to prevent unnecessary re-renders
  const memoizedResume = useMemo(() => resume, [
    resume.personal,
    resume.experience,
    resume.education,
    resume.skills,
    resume.projects,
    resume.customization
  ]);

  return (
    <div ref={resumeRef} className="bg-white p-8 shadow-lg min-h-[297mm] w-[210mm] mx-auto">
      <ResumeTemplatePreview
        templateKey={templateId}
      />
    </div>
  );
});

export { OptimizedResumePreview };