import { useRef } from 'react';
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '@/constants/pdfDimensions';
import { CoverLetterFormData } from '@/hooks/useCoverLetterData';

interface CoverLetterPreviewProps {
  formData: CoverLetterFormData;
  previewRef: React.RefObject<HTMLDivElement>;
}

const templateStyles: Record<string, React.CSSProperties> = {
  'clean-slate': {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    color: '#111827',
    lineHeight: '1.7',
    padding: '48px 52px',
    backgroundColor: '#ffffff',
  },
  'executive-serif': {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: '#1a1a2e',
    lineHeight: '1.8',
    padding: '52px 56px',
    backgroundColor: '#ffffff',
  },
  'split-frame': {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    color: '#111827',
    lineHeight: '1.6',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderLeft: '4px solid #1e293b',
    paddingLeft: '48px',
  },
};

export const CoverLetterPreview = ({ formData, previewRef }: CoverLetterPreviewProps) => {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const style = templateStyles[formData.template_id] || templateStyles['clean-slate'];

  const hasContent = formData.content.trim().length > 0;

  return (
    <div
      ref={previewRef}
      className="resume-content bg-white shadow-lg"
      style={{
        width: `${A4_WIDTH_PX}px`,
        minHeight: `${A4_HEIGHT_PX}px`,
        ...style,
        boxSizing: 'border-box',
      }}
    >
      {hasContent ? (
        <>
          {/* Date */}
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '28px' }}>
            {dateStr}
          </div>

          {/* Salutation */}
          <div style={{ fontSize: '14px', marginBottom: '20px', fontWeight: 500 }}>
            Dear Hiring Manager,
          </div>

          {/* Body content */}
          <div
            style={{
              fontSize: '13.5px',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap',
              color: '#374151',
            }}
          >
            {formData.content}
          </div>

          {/* Closing */}
          <div style={{ marginTop: '36px', fontSize: '14px' }}>
            <div style={{ marginBottom: '4px' }}>Sincerely,</div>
            <div style={{ fontWeight: 600, fontSize: '16px', color: '#111827' }}>
              {formData.title !== 'Untitled Cover Letter' ? formData.title : 'Your Name'}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full" style={{ color: '#9ca3af', fontSize: '14px', minHeight: '400px' }}>
          <p>Start writing your cover letter to see a preview here.</p>
        </div>
      )}
    </div>
  );
};
