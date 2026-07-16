import React from 'react';
import ResumeTemplate from '@/utils/resumeTemplates';
import { templateMockData } from '@/utils/resumeTemplates';
import { ResumeData } from '@/utils/types';

interface ResumeTemplatePreviewProps {
  templateKey: string;
  className?: string;
}

export const ResumeTemplatePreview = ({ templateKey, className = '' }: ResumeTemplatePreviewProps) => {
  // Use the per-template mock data so each card shows representative content.
  // Fall back to clean-slate data if the template doesn't have its own entry yet.
  const mockData = (templateMockData[templateKey] || templateMockData['clean-slate']) as ResumeData;

  return (
    <div className={`bg-white shadow-sm overflow-hidden aspect-[8.5/11] ${className}`}>
      <div style={{ transform: 'scale(0.32)', transformOrigin: 'top left', width: '312.5%', height: '312.5%' }}>
        <ResumeTemplate 
          data={mockData} 
          templateName={templateKey}
        />
      </div>
    </div>
  );
};
