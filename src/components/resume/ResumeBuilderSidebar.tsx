import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';
import { ResumeFormSection } from '@/components/resume/ResumeFormSection';
import { SectionDragDropCustomizer } from '@/components/resume/SectionDragDropCustomizer';
import { ResumeData } from '@/utils/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CustomizationPanel } from '../CustomizationPanel';
import { useDesignMode } from '@/hooks/useDesignMode';
import { cn } from '@/lib/utils';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Settings,
  Palette,
  Layout,
  FileText,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface ResumeBuilderSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  currentTemplateId: string;
  onTemplateChange: (templateId: string) => void;
  resume: ResumeData;
  handlePersonalInfoChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onProfileImageChange?: (profileImage: string) => void;
  handleExperienceChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  handleCurrentJobToggle: (checked: boolean, index: number) => void;
  addExperience: () => void;
  removeExperience: (id: number) => void;
  handleEducationChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => void;
  addEducation: () => void;
  removeEducation: (id: number) => void;
  handleSkillsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleProjectChange: (field: string, value: string, index: number) => void;
  addProject: () => void;
  removeProject: (id: number) => void;
  handleCustomizationChange: (customization: ResumeData['customization']) => void;
  onAIFeatureUpsell?: () => void;
  isPremium?: boolean;
  activeSections: string[];
  hiddenSections: string[];
  sectionTitles: Record<string, string>;
  onSectionsChange: (active: string[], hidden: string[]) => void;
  onSectionTitleChange: (sectionId: string, title: string) => void;
  onPopulateFromProfile?: () => void;
  hasProfileData?: boolean;
  canFillFromProfile?: boolean;
  onPDFDataExtracted?: (data: Partial<ResumeData>) => void;
}

const templates = [
  { id: "1", name: "Executive Modern", category: "Professional", templateKey: "modern", featured: true, atsOptimized: true },
  { id: "2", name: "Corporate Classic", category: "Professional", templateKey: "classic", featured: false, atsOptimized: true },
  { id: "3", name: "Business Elite", category: "Professional", templateKey: "professional", featured: false, atsOptimized: true },
  { id: "4", name: "Software Engineer Pro", category: "Technology", templateKey: "technical", featured: true, atsOptimized: true },
  { id: "5", name: "DevOps Specialist", category: "Technology", templateKey: "developer", featured: false, atsOptimized: true },
  { id: "6", name: "Data Scientist", category: "Technology", templateKey: "data-scientist", featured: true, atsOptimized: true },
  { id: "7", name: "Creative Portfolio", category: "Creative", templateKey: "creative", featured: true, atsOptimized: false },
  { id: "8", name: "UI/UX Designer", category: "Creative", templateKey: "elegant", featured: false, atsOptimized: false },
  { id: "10", name: "Medical Professional", category: "Healthcare", templateKey: "medical", featured: true, atsOptimized: true },
  { id: "12", name: "Academic Researcher", category: "Education", templateKey: "academic", featured: true, atsOptimized: true },
  { id: "19", name: "C-Level Executive", category: "Executive", templateKey: "executive", featured: true, atsOptimized: true },
  { id: "21", name: "ATS Optimized Pro", category: "ATS-Friendly", templateKey: "ats-pro", featured: true, atsOptimized: true }
];

const sections = [
  { id: 'personal', name: 'Personal Info', icon: User },
  { id: 'experience', name: 'Experience', icon: Briefcase },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'skills', name: 'Skills', icon: Award },
  { id: 'projects', name: 'Projects', icon: BookOpen },
];

// Helper to check section completion
const isSectionComplete = (resume: ResumeData, sectionId: string): boolean => {
  switch (sectionId) {
    case 'personal':
      return !!(resume.personal?.name && resume.personal?.email);
    case 'experience':
      return !!(resume.experience && resume.experience.length > 0 && resume.experience[0]?.title);
    case 'education':
      return !!(resume.education && resume.education.length > 0 && resume.education[0]?.school);
    case 'skills':
      return !!(resume.skills && resume.skills.length > 0);
    case 'projects':
      return !!(resume.projects && resume.projects.length > 0 && resume.projects[0]?.title);
    default:
      return false;
  }
};

export const ResumeBuilderSidebar = ({
  activeSection,
  onSectionChange,
  currentTemplateId,
  onTemplateChange,
  resume,
  handlePersonalInfoChange,
  onProfileImageChange,
  handleExperienceChange,
  handleCurrentJobToggle,
  addExperience,
  removeExperience,
  handleEducationChange,
  addEducation,
  removeEducation,
  handleSkillsChange,
  handleProjectChange,
  addProject,
  removeProject,
  handleCustomizationChange,
  onAIFeatureUpsell,
  isPremium,
  activeSections,
  hiddenSections,
  sectionTitles,
  onSectionsChange,
  onSectionTitleChange,
  onPopulateFromProfile,
  hasProfileData,
  canFillFromProfile,
  onPDFDataExtracted
}: ResumeBuilderSidebarProps) => {
  const [activeTab, setActiveTab] = useState('edit');
  const { isNeoBrutalism } = useDesignMode();

  const tabs = [
    { id: 'edit', label: 'Edit', icon: FileText },
    { id: 'templates', label: 'Themes', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
  ];

  return (
    <div className={cn(
      "flex flex-col h-full rounded-lg border bg-card overflow-hidden transition-all duration-300",
      isNeoBrutalism && "border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))]"
    )}>
      {/* Tab Navigation with Animation */}
      <div className={cn(
        "flex-shrink-0 border-b bg-muted/30",
        isNeoBrutalism && "border-b-2 border-foreground"
      )}>
        <div className="grid grid-cols-3 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all duration-300 border-b-2 relative",
                  isActive
                    ? "border-primary text-primary bg-background"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isActive && "scale-[1.02]",
                  isNeoBrutalism && isActive && "border-foreground bg-accent"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className={cn(
                  "h-3.5 w-3.5 transition-transform duration-300",
                  isActive && "scale-110"
                )} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full animate-scale-in" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content Area with Animation */}
      <ScrollArea className="flex-1">
        <div className="p-3 animate-fade-in">
          {activeTab === 'edit' && (
            <div className="space-y-3">
              {/* Section Navigation Header */}
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs font-medium text-muted-foreground uppercase tracking-wide",
                  isNeoBrutalism && "font-bold text-foreground"
                )}>Sections</span>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className={cn(
                        "h-7 px-2 text-xs",
                        isNeoBrutalism && "border border-foreground hover:bg-accent"
                      )}
                    >
                      <Settings className="h-3.5 w-3.5 mr-1" />
                      Style
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-md z-50">
                    <SheetHeader>
                      <SheetTitle>Customize Resume</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="mt-4 h-[calc(100vh-6rem)]">
                      <div className="pr-4 pb-4">
                        <CustomizationPanel
                          customization={resume.customization}
                          onCustomizationChange={handleCustomizationChange}
                          resumeData={resume}
                        />
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Fill from Profile Button - Show when user can fill (logged in) */}
              {canFillFromProfile && onPopulateFromProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full h-8 text-xs gap-1.5 border-primary/30",
                    hasProfileData 
                      ? "bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10"
                      : "bg-muted/50 hover:bg-muted",
                    isNeoBrutalism && "border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                  )}
                  onClick={onPopulateFromProfile}
                >
                  <Sparkles className={cn("h-3.5 w-3.5", hasProfileData && "text-primary")} />
                  {hasProfileData ? 'Fill from Profile' : 'Import from Profile'}
                </Button>
              )}

              {/* Section Navigation Pills */}
              <div className="flex flex-wrap gap-1.5">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  const isComplete = isSectionComplete(resume, section.id);
                  return (
                    <button
                      key={section.id}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 relative group",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm scale-105"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-102",
                        isNeoBrutalism && isActive && "border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))]",
                        isNeoBrutalism && !isActive && "border border-foreground/30"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => onSectionChange(section.id)}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{section.name}</span>
                      {isComplete && !isActive && (
                        <CheckCircle2 className="h-3 w-3 text-green-500 ml-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              <Separator className={isNeoBrutalism ? "bg-foreground/30" : ""} />

              {/* Form Content with Animation */}
              <div className="animate-fade-in" key={activeSection}>
                <ResumeFormSection
                  activeSection={activeSection}
                  resume={resume}
                  handlePersonalInfoChange={handlePersonalInfoChange}
                  onProfileImageChange={onProfileImageChange}
                  handleExperienceChange={handleExperienceChange}
                  handleCurrentJobToggle={handleCurrentJobToggle}
                  addExperience={addExperience}
                  removeExperience={removeExperience}
                  handleEducationChange={handleEducationChange}
                  addEducation={addEducation}
                  removeEducation={removeEducation}
                  handleSkillsChange={handleSkillsChange}
                  handleProjectChange={handleProjectChange}
                  addProject={addProject}
                  removeProject={removeProject}
                  handleCustomizationChange={handleCustomizationChange}
                  onAIFeatureUpsell={onAIFeatureUpsell}
                  isPremium={isPremium}
                  onPopulateFromProfile={onPopulateFromProfile}
                  hasProfileData={hasProfileData}
                  onPDFDataExtracted={onPDFDataExtracted}
                />
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-3 animate-fade-in">
              <span className={cn(
                "text-xs font-medium text-muted-foreground uppercase tracking-wide",
                isNeoBrutalism && "font-bold text-foreground"
              )}>Choose Template</span>
              
              <div className="grid grid-cols-2 gap-2">
                {templates.map((template, index) => (
                  <button
                    key={template.id}
                    className={cn(
                      "relative text-left rounded-lg overflow-hidden border transition-all duration-200 hover:shadow-md group",
                      currentTemplateId === template.id 
                        ? "ring-2 ring-primary border-primary scale-[1.02]" 
                        : "hover:border-muted-foreground/30 hover:scale-[1.01]",
                      isNeoBrutalism && "border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:shadow-[1px_1px_0_0_hsl(var(--foreground))] hover:translate-x-[2px] hover:translate-y-[2px]"
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => onTemplateChange(template.id)}
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-muted/50 to-muted overflow-hidden relative">
                      <ResumeTemplatePreview 
                        templateKey={template.templateKey}
                        className="w-full h-full scale-[0.6] origin-top-left"
                      />
                      {currentTemplateId === template.id && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <Badge variant="default" className="text-[10px]">Active</Badge>
                        </div>
                      )}
                      <div className="absolute top-1 left-1 flex gap-0.5">
                        {template.featured && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">⭐</Badge>
                        )}
                        {template.atsOptimized && (
                          <Badge className="text-[9px] px-1 py-0 h-4 bg-green-500/90">ATS</Badge>
                        )}
                      </div>
                    </div>
                    <div className={cn(
                      "p-1.5 bg-background border-t",
                      isNeoBrutalism && "border-t-2 border-foreground"
                    )}>
                      <div className="text-[11px] font-medium truncate">{template.name}</div>
                      <div className="text-[10px] text-muted-foreground">{template.category}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className={cn(
                "p-2 bg-muted/30 rounded-md",
                isNeoBrutalism && "border-2 border-foreground/50"
              )}>
                <p className="text-[10px] text-muted-foreground">
                  💡 <strong>ATS templates</strong> are optimized for applicant tracking systems
                </p>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-3 animate-fade-in">
              <span className={cn(
                "text-xs font-medium text-muted-foreground uppercase tracking-wide",
                isNeoBrutalism && "font-bold text-foreground"
              )}>Section Order</span>
              <SectionDragDropCustomizer
                activeSections={activeSections}
                hiddenSections={hiddenSections}
                sectionTitles={sectionTitles}
                onSectionsChange={onSectionsChange}
                onSectionTitleChange={onSectionTitleChange}
              />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
