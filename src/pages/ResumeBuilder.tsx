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
import { Crown, Zap } from 'lucide-react';

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const resumeElementRef = useRef<HTMLDivElement>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const { resume, setResume, templateId, isExample, editResumeId, loadingExistingResume } = useResumeData();
  const handlers = useResumeHandlers(setResume);
  const { isSaving, handleSaveResume, handleAIFeatureUpsell, premium, resumeCount } = useResumeSave(editResumeId);
  const { activeSection, activeSections, hiddenSections, handleSectionChange, handleSectionsChange } = useSectionManagement();
  
  usePageTracking();
  useJourneyTracking('resume_builder', activeSection);
  
  const handleProfileImageChange = (profileImage: string) => {
    setResume(prev => ({
      ...prev,
      personal: { ...prev.personal, profileImage }
    }));
  };
  
  const { saveStatus, lastSaved } = useAutoSave({
    resume,
    editResumeId,
    enabled: !!editResumeId || (!!resume.personal?.name && !!resume.personal?.email)
  });
  
  const { profile, populateFromProfile, hasProfileData, canFillFromProfile } = useResumeProfileSync({
    resume,
    setResume,
    shouldAutoPopulate: !isExample && !editResumeId && !resume.personal.name
  });

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
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="pt-3 pb-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Premium Upgrade Banner */}
          {!premium?.isPremium && (
            <div className="mb-4 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border border-border/40 backdrop-blur-sm px-5 py-3 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground tracking-tight">
                    Free plan · {resumeCount || 0}/1 resume
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Unlock unlimited resumes, AI features & premium templates
                  </p>
                </div>
              </div>
              <button
                className="px-5 py-2 text-xs font-semibold rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() =>
                  toast.info("Premium upgrade coming soon! Unlimited resumes + AI features for ₹199/month")
                }
              >
                Upgrade
              </button>
            </div>
          )}

          {/* Header Row */}
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

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 lg:h-[calc(100vh-10rem)]">
            {/* Left Sidebar */}
            <div className="lg:col-span-3 flex flex-col gap-3 lg:h-full lg:overflow-hidden" data-tour="section-nav">
              <div className="flex-shrink-0">
                <ProgressIndicator 
                  resume={resume}
                  onSectionClick={handleSectionChange}
                />
              </div>
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

            {/* Right Preview */}
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
      
      <UserOnboarding 
        isFirstVisit={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  );
};

export default ResumeBuilder;
