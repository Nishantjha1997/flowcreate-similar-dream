import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; 
import Header from '@/components/Header';
import { ResumeHeaderSection } from '@/components/resume/ResumeHeaderSection';
import { ResumeBuilderSidebar } from '@/components/resume/ResumeBuilderSidebar';
import { ResumePreviewSection } from '@/components/resume/ResumePreviewSection';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { useResumeData } from '@/hooks/useResumeData';
import { useResumeHandlers } from '@/hooks/useResumeHandlers';
import { useResumeSave } from '@/hooks/useResumeSave';
import { useSectionManagement } from '@/hooks/useSectionManagement';
import { templateNames } from '@/components/resume/ResumeData';

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const resumeElementRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks for data management
  const { resume, setResume, templateId, isExample, editResumeId, loadingExistingResume } = useResumeData();
  const handlers = useResumeHandlers(setResume);
  const { isSaving, handleSaveResume, handleAIFeatureUpsell, premium, resumeCount } = useResumeSave(editResumeId);
  const { activeSection, activeSections, hiddenSections, handleSectionChange, handleSectionsChange } = useSectionManagement();

  const resumeName = resume.personal?.name || 'resume';
  const { isGenerating, generatePDF } = usePDFGenerator(`${resumeName}.pdf`);

  const handleTemplateChange = (newTemplateId: string) => {
    navigate(`/resume-builder?template=${newTemplateId}${isExample ? '&example=true' : ''}${editResumeId ? `&edit=${editResumeId}` : ''}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleDownload = () => {
    if (resumeElementRef.current) {
      generatePDF(resumeElementRef.current);
    } else {
      toast.error("Could not find resume content to download.");
    }
  };

  if (loadingExistingResume) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading resume...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* FREE USER LIMITATION BANNER */}
          {!premium?.isPremium && (
            <div className="mb-5 bg-yellow-50 text-yellow-900 border-l-4 border-yellow-400 p-3 rounded flex items-center justify-between shadow">
              <span>
                Free users can only save 1 resume. You have {resumeCount || 0}/1 resume saved.{" "}
                <b>Upgrade to Premium</b> for unlimited resumes and AI features!
              </span>
              <button
                className="ml-4 px-4 py-2 bg-primary text-white font-bold rounded shadow hover:bg-primary/90 transition-all"
                onClick={() =>
                  toast.info("Premium upgrade coming soon! Get unlimited resumes + AI features for ₹199/month")
                }
              >
                Upgrade ₹199/month
              </button>
            </div>
          )}

          <ResumeHeaderSection 
            resumeElementRef={resumeElementRef}
            resumeName={resumeName}
            handleShare={handleShare}
            handleDownload={handleDownload}
            isGenerating={isGenerating}
            onSave={() => handleSaveResume(resume)}
            isSaving={isSaving}
            isEditing={!!editResumeId}
            resume={resume}
            templateId={templateId}
            templateNames={templateNames}
            sectionOrder={activeSections}
            hiddenSections={hiddenSections}
          />

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-3">
              <ResumeBuilderSidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                currentTemplateId={templateId}
                onTemplateChange={handleTemplateChange}
                resume={resume}
                handlePersonalInfoChange={handlers.handlePersonalInfoChange}
                handleExperienceChange={handlers.handleExperienceChange}
                handleCurrentJobToggle={handlers.handleCurrentJobToggle}
                addExperience={handlers.addExperience}
                removeExperience={handlers.removeExperience}
                handleEducationChange={handlers.handleEducationChange}
                addEducation={handlers.addEducation}
                removeEducation={handlers.removeEducation}
                handleSkillsChange={handlers.handleSkillsChange}
                handleProjectChange={handlers.handleProjectChange}
                addProject={handlers.addProject}
                removeProject={handlers.removeProject}
                handleCustomizationChange={handlers.handleCustomizationChange}
                onAIFeatureUpsell={handleAIFeatureUpsell}
                isPremium={premium?.isPremium}
                activeSections={activeSections}
                hiddenSections={hiddenSections}
                sectionTitles={{}}
                onSectionsChange={handleSectionsChange}
                onSectionTitleChange={() => {}}
              />
            </div>

            <div className="lg:col-span-7">
              <ResumePreviewSection
                resume={resume}
                templateId={templateId}
                templateNames={templateNames}
                resumeRef={resumeElementRef}
                sectionOrder={activeSections}
                hiddenSections={hiddenSections}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
