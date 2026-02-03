import { useRef, Suspense, lazy, useEffect, useState } from 'react';
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
import { useResumeProfileSync } from '@/hooks/useResumeProfileSync';
import { useAutoSave } from '@/hooks/useAutoSave';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { ResumeSkeleton } from '@/components/ui/resume-skeleton';
import { UserOnboarding } from '@/components/ui/user-onboarding';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { templateNames } from '@/components/resume/ResumeData';
import { ResumeData } from '@/utils/types';
import { analytics, usePageTracking, useJourneyTracking } from '@/components/ui/analytics-tracker';

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const resumeElementRef = useRef<HTMLDivElement>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Custom hooks for data management
  const { resume, setResume, templateId, isExample, editResumeId, loadingExistingResume } = useResumeData();
  const handlers = useResumeHandlers(setResume);
  const { isSaving, handleSaveResume, handleAIFeatureUpsell, premium, resumeCount } = useResumeSave(editResumeId);
  const { activeSection, activeSections, hiddenSections, handleSectionChange, handleSectionsChange } = useSectionManagement();
  
  // Analytics tracking
  usePageTracking();
  useJourneyTracking('resume_builder', activeSection);
  
  // Profile image handler
  const handleProfileImageChange = (profileImage: string) => {
    setResume(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        profileImage
      }
    }));
  };
  
  // Auto-save functionality
  const { saveStatus, lastSaved } = useAutoSave({
    resume,
    editResumeId,
    enabled: !!editResumeId || (!!resume.personal?.name && !!resume.personal?.email)
  });
  
  // Profile sync for auto-population
  const { profile, populateFromProfile, hasProfileData, canFillFromProfile } = useResumeProfileSync({
    resume,
    setResume,
    shouldAutoPopulate: !isExample && !editResumeId && !resume.personal.name
  });

  
  // Check if user is new for onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
    const isFirstEdit = !editResumeId && !isExample;
    if (!hasSeenOnboarding && isFirstEdit) {
      setTimeout(() => setShowOnboarding(true), 2000);
    }
  }, [editResumeId, isExample]);

  const resumeName = resume.personal?.name || 'resume';
  const { isGenerating, generatePDF } = usePDFGenerator(`${resumeName}.pdf`);

  const handleTemplateChange = (newTemplateId: string) => {
    navigate(`/resume-builder?template=${newTemplateId}${isExample ? '&example=true' : ''}${editResumeId ? `&edit=${editResumeId}` : ''}`);
  };

  const handlePDFDataExtracted = (extractedData: Partial<ResumeData>) => {
    setResume(prev => ({
      ...prev,
      ...extractedData,
      personal: { ...prev.personal, ...extractedData.personal },
      experience: extractedData.experience || prev.experience,
      education: extractedData.education || prev.education,
      skills: extractedData.skills || prev.skills,
      projects: extractedData.projects || prev.projects
    }));
    toast.success("Resume data imported successfully!");
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
    return <ResumeSkeleton />;
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

          <div className="flex items-center justify-between mb-4" data-tour="export">
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
            <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 lg:h-[calc(100vh-12rem)]">
            {/* Left Sidebar - Fixed Height with Internal Scroll */}
            <div className="lg:col-span-3 flex flex-col gap-3 lg:h-full lg:overflow-hidden" data-tour="section-nav">
              {/* Progress Indicator - Compact */}
              <div className="flex-shrink-0">
                <ProgressIndicator 
                  resume={resume}
                  onSectionClick={handleSectionChange}
                />
              </div>
              
              {/* Sidebar - Takes remaining space */}
              <div className="flex-1 lg:min-h-0">
                <ResumeBuilderSidebar
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                  currentTemplateId={templateId}
                  onTemplateChange={handleTemplateChange}
                  resume={resume}
                  handlePersonalInfoChange={handlers.handlePersonalInfoChange}
                  onProfileImageChange={handleProfileImageChange}
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
                  onPopulateFromProfile={populateFromProfile}
                  hasProfileData={hasProfileData}
                  canFillFromProfile={canFillFromProfile}
                  onPDFDataExtracted={handlePDFDataExtracted}
                />
              </div>
            </div>

            {/* Right Preview - Fixed Height with Internal Scroll */}
            <div className="lg:col-span-7 lg:h-full" data-tour="preview">
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
      
      {/* User Onboarding */}
      <UserOnboarding 
        isFirstVisit={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  );
};

export default ResumeBuilder;
