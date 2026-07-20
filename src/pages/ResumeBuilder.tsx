import { useCallback, useRef, useEffect, useState } from 'react';
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
import { DEFAULT_RESUME_SECTIONS, useSectionManagement } from '@/hooks/useSectionManagement';
import { useResumeProfileSync } from '@/hooks/useResumeProfileSync';
import { useAutoSave } from '@/hooks/useAutoSave';
import { ResumeSkeleton } from '@/components/ui/resume-skeleton';
import { UserOnboarding } from '@/components/ui/user-onboarding';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { templateNames } from '@/components/resume/ResumeData';
import { ResumeData } from '@/utils/types';
import { usePageTracking, useJourneyTracking } from '@/components/ui/analytics-tracker';
import { Zap } from 'lucide-react';
import { ShareManagement } from '@/components/sharing/ShareManagement';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getTemplate, resolveTemplateKey } from '@/templates/registry';

const ResumeBuilder = () => {
  const navigate = useNavigate();
  usePageMeta({
    title: 'Resume Builder',
    description: 'Build your professional resume online for free. Choose a template, add your details, and download as PDF in minutes.',
  });
  const resumeElementRef = useRef<HTMLDivElement>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'edit' | 'preview'>('edit');
  
  const { resume, setResume, templateId, isExample, editResumeId, loadingExistingResume } = useResumeData();
  const handlers = useResumeHandlers(setResume);
  const { isSaving, handleSaveResume, handleAIFeatureUpsell, premium, resumeCount } = useResumeSave(editResumeId);
  const { activeSection, activeSections, hiddenSections, handleSectionChange, handleSectionsChange } = useSectionManagement(
    resume.customization?.sectionsOrder?.length
      ? resume.customization.sectionsOrder
      : DEFAULT_RESUME_SECTIONS,
    resume.customization?.hiddenSections ?? [],
  );
  
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
      const timer = window.setTimeout(() => setShowOnboarding(true), 2000);
      return () => window.clearTimeout(timer);
    }
  }, [editResumeId, isExample]);

  const resumeName = resume.personal?.name || 'resume';
  const { isGenerating, generatePDF, printResume } = usePDFGenerator(`${resumeName}.pdf`);

  const handleTemplateChange = (newTemplateId: string) => {
    const canonicalKey = resolveTemplateKey(newTemplateId);
    const template = getTemplate(canonicalKey);

    if (template.premium && !premium?.isPremium) {
      toast.info(`“${template.name}” is included with Premium. Choose a free design or view the Pricing page to upgrade.`);
      return;
    }

    setResume((current) => ({
      ...current,
      selectedTemplate: canonicalKey,
      customization: {
        ...current.customization,
        primaryColor: template.defaultAccent,
      },
    }));
    navigate(`/resume-builder?template=${canonicalKey}${isExample ? '&example=true' : ''}${editResumeId ? `&edit=${editResumeId}` : ''}`);
  };

  const handleSectionLayoutChange = useCallback((active: string[], hidden: string[]) => {
    handleSectionsChange(active, hidden);
    setResume((current) => ({
      ...current,
      customization: {
        ...current.customization,
        sectionsOrder: active,
        hiddenSections: hidden,
      },
    }));
  }, [handleSectionsChange, setResume]);

  const handleSectionTitleChange = useCallback((sectionId: string, title: string) => {
    setResume((current) => {
      const sectionTitles = { ...(current.customization.sectionTitles ?? {}) };
      if (title.trim()) sectionTitles[sectionId] = title.trim();
      else delete sectionTitles[sectionId];

      return {
        ...current,
        customization: {
          ...current.customization,
          sectionTitles,
        },
      };
    });
  }, [setResume]);

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

	const [shareDialogOpen, setShareDialogOpen] = useState(false);

	  const handleShare = () => {
	    setShareDialogOpen(true);
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
                onClick={() => navigate('/pricing')}
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
              handlePrint={() => printResume(resumeElementRef.current)}
              isGenerating={isGenerating}
              onSave={() => handleSaveResume(resume)}
              isSaving={isSaving}
              isEditing={!!editResumeId}
              resume={resume}
              templateId={templateId}
              templateNames={templateNames}
              sectionOrder={activeSections}
              hiddenSections={hiddenSections}
              saveStatus={saveStatus}
              lastSaved={lastSaved}
            />
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden mb-4 p-1 bg-muted rounded-xl border border-border/40">
            <button
              onClick={() => setActiveMobileTab('edit')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeMobileTab === 'edit' 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Edit Details
            </button>
            <button
              onClick={() => setActiveMobileTab('preview')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeMobileTab === 'preview' 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Preview
            </button>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 lg:h-[calc(100vh-10rem)]">
            {/* Left Sidebar */}
            <div className={`lg:col-span-3 flex flex-col gap-3 lg:h-full lg:overflow-hidden ${activeMobileTab !== 'edit' ? 'hidden lg:flex' : ''}`} data-tour="section-nav">
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
                  sectionTitles={resume.customization.sectionTitles ?? {}}
                  onSectionsChange={handleSectionLayoutChange}
                  onSectionTitleChange={handleSectionTitleChange}
                  onPopulateFromProfile={populateFromProfile}
                  hasProfileData={hasProfileData}
                  canFillFromProfile={canFillFromProfile}
                  onPDFDataExtracted={handlePDFDataExtracted}
                />
              </div>
            </div>

            {/* Right Preview */}
            <div className={`lg:col-span-7 lg:h-full ${activeMobileTab !== 'preview' ? 'hidden lg:block' : ''}`} data-tour="preview">
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
      
      {/* Share Management Dialog (controlled by header Share button) */}
      <ShareManagement
        resumeId={editResumeId}
        resumeName={resume.personal?.name}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </div>
  );
};

export default ResumeBuilder;
