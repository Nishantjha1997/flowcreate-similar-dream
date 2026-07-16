import React from 'react';
import ResumeTemplate from '@/utils/resumeTemplates';
import { templateMockData } from '@/utils/resumeTemplates';
import { ResumeData } from '@/utils/types';

interface ResumeTemplatePreviewProps {
  templateKey: string;
  className?: string;
  /** Override the default preview scale. Default 0.55 (A4@55% ≈ 437px wide). Range 0.25–0.85. */
  scale?: number;
}

export const ResumeTemplatePreview = ({ templateKey, className = '', scale = 0.55 }: ResumeTemplatePreviewProps) => {
  // Use the per-template mock data so each card shows representative content.
  // Fall back to clean-slate data if the template doesn't have its own entry yet.
  const mockData = (templateMockData[templateKey] || templateMockData['clean-slate']) as ResumeData;

  // Compensation factor: expand inner div so that after scale-down it fills the outer container.
  // Formula: 100 / scale → e.g. 0.55 → 181.82%
  const compensation = `${(100 / scale).toFixed(2)}%`;

  return (
    <div className={`bg-white shadow-sm overflow-hidden aspect-[8.5/11] ${className}`}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: compensation, height: compensation }}>
        <ResumeTemplate 
          data={mockData} 
          templateName={templateKey}
        />
      </div>
    </div>
  );
};
