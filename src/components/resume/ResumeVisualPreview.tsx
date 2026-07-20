import { useRef } from 'react';
import { ResumePreview } from '@/components/ResumePreview';
import ResumeTemplate, { templateMockData } from '@/utils/resumeTemplates';
import { ResumeData, adaptResumeData } from '@/utils/resumeAdapterUtils';
import { resolveTemplateKey } from '@/templates/registry';

const hasUserContent = (resume: ResumeData) => Boolean(
  resume.personal.name?.trim()
  || resume.personal.email?.trim()
  || resume.personal.phone?.trim()
  || resume.personal.summary?.trim()
  || resume.experience.some((item) => item.title?.trim() || item.company?.trim() || item.description?.trim())
  || resume.education.some((item) => item.school?.trim() || item.degree?.trim())
  || resume.skills.length
  || resume.projects?.some((item) => item.title?.trim() || item.description?.trim()),
);

const getPreviewResume = (resume: ResumeData, templateId: string): ResumeData => {
  if (hasUserContent(resume)) return resume;
  const templateKey = resolveTemplateKey(templateId);
  const sample = templateMockData[templateKey] ?? templateMockData['clean-slate'];
  return {
    ...sample,
    customization: {
      ...sample.customization,
      ...resume.customization,
    },
    selectedTemplate: templateKey,
  };
};

interface ResumeVisualPreviewProps {
  resume: ResumeData;
  templateId: string;
  templateNames: Record<string, string>;
  sectionOrder?: string[];
  hiddenSections?: string[];
}

export const ResumeVisualPreview = ({
  resume,
  templateId,
  templateNames,
  sectionOrder,
  hiddenSections
}: ResumeVisualPreviewProps) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  
  const previewResume = getPreviewResume(resume, templateId);

  // If sectionOrder/hiddenSections provided by props, use them, otherwise fallback to default template
  const getOrderedSections = () => {
    if (!sectionOrder) return undefined;
    const visibleSections = sectionOrder.filter(section => !hiddenSections?.includes(section));
    return visibleSections;
  };

  return (
    <div ref={resumeRef} className="resume-content">
      <ResumeTemplate 
        data={previewResume}
        templateName={resolveTemplateKey(templateId)}
        sectionOrder={getOrderedSections()}
        hiddenSections={hiddenSections}
      />
    </div>
  );
};

export const EnhancedResumePreview = ({
  resume,
  templateId,
  templateNames,
  sectionOrder,
  hiddenSections
}: ResumeVisualPreviewProps) => {
  const previewResume = getPreviewResume(resume, templateId);
  const adaptedData = adaptResumeData(previewResume);

  return (
    <ResumePreview
      resumeData={adaptedData}
      previewComponent={
        <ResumeTemplate
          data={previewResume}
          templateName={resolveTemplateKey(templateId)}
          sectionOrder={sectionOrder}
          hiddenSections={hiddenSections}
        />
      }
      sectionOrder={sectionOrder}
      hiddenSections={hiddenSections}
    />
  );
};
