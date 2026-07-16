import { CoverLetterFormData } from '@/hooks/useCoverLetterData';
import { coverLetterTemplateStyles, DEFAULT_COVER_LETTER_TEMPLATE } from '@/utils/coverLetterTemplates';

interface CoverLetterPreviewProps {
  formData: CoverLetterFormData;
  previewRef: React.RefObject<HTMLDivElement>;
}

export const CoverLetterPreview = ({ formData, previewRef }: CoverLetterPreviewProps) => {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const templateStyles = coverLetterTemplateStyles[formData.template_id] || coverLetterTemplateStyles[DEFAULT_COVER_LETTER_TEMPLATE];
  const hasContent = formData.content.trim().length > 0;

  return (
    <div
      ref={previewRef}
      className="resume-content bg-white shadow-lg"
      style={templateStyles.container}
    >
      {hasContent ? (
        <>
          <div style={templateStyles.date}>{dateStr}</div>

          <div style={templateStyles.salutation}>Dear Hiring Manager,</div>

          <div style={templateStyles.body}>{formData.content}</div>

          <div style={templateStyles.closing}>
            <div style={{ marginBottom: '4px' }}>Sincerely,</div>
            <div style={templateStyles.signatureName}>
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
