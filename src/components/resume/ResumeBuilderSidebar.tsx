import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';
import { ResumeFormSection } from '@/components/resume/ResumeFormSection';
import { SectionDragDropCustomizer } from '@/components/resume/SectionDragDropCustomizer';
import { ResumeData } from '@/utils/types';
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
  SlidersHorizontal,
  FileText,
  Sparkles,
  CheckCircle2,
  Lock,
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

import { TEMPLATE_REGISTRY, resolveTemplateKey } from '@/templates/registry';


const sections = [
  { id: 'personal', name: 'Personal', icon: User },
  { id: 'experience', name: 'Experience', icon: Briefcase },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'skills', name: 'Skills', icon: Award },
  { id: 'projects', name: 'Projects', icon: BookOpen },
];

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
  const [templateFilter, setTemplateFilter] = useState<'all' | 'free' | 'ats' | 'photo'>('all');
  const { isNeoBrutalism } = useDesignMode();

  const visibleTemplates = TEMPLATE_REGISTRY.filter((template) => {
    if (templateFilter === 'free') return !template.premium;
    if (templateFilter === 'ats') return template.atsOptimized;
    if (templateFilter === 'photo') return template.supportsPhoto;
    return true;
  });

  const tabs = [
    { id: 'edit', label: 'Edit', icon: FileText },
    { id: 'templates', label: 'Templates', icon: Palette },
    { id: 'design', label: 'Design', icon: SlidersHorizontal },
    { id: 'layout', label: 'Sections', icon: Layout },
  ];

  return (
    <div className={cn(
      "flex flex-col h-full rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-300 shadow-sm",
      isNeoBrutalism && "border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-none"
    )}>
      {/* Tab Navigation */}
      <div className={cn(
        "flex-shrink-0 border-b border-border/30",
        isNeoBrutalism && "border-b-2 border-foreground"
      )}>
        <div className="grid grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={cn(
                  "flex min-w-0 items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-all duration-200 relative sm:text-[11px]",
                  isActive
                    ? "text-foreground bg-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                  isNeoBrutalism && isActive && "bg-accent"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                <span className="truncate">{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 inset-x-4 h-0.5 bg-foreground rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {activeTab === 'edit' && (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Sections</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2.5 text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={() => setActiveTab('design')}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Design
                </Button>
              </div>

              {/* Fill from Profile */}
              {canFillFromProfile && onPopulateFromProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full h-8 text-xs gap-1.5 rounded-xl border-primary/20 hover:border-primary/40 transition-all duration-200",
                    hasProfileData 
                      ? "bg-primary/5 hover:bg-primary/10 text-primary"
                      : "bg-muted/30 hover:bg-muted/50",
                    isNeoBrutalism && "border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                  )}
                  onClick={onPopulateFromProfile}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {hasProfileData ? 'Fill from Profile' : 'Import from Profile'}
                </Button>
              )}

              {/* Section Pills */}
              <div className="flex flex-wrap gap-1.5">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  const isComplete = isSectionComplete(resume, section.id);
                  return (
                    <button
                      key={section.id}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                        isActive
                          ? "bg-foreground text-background shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                        isNeoBrutalism && isActive && "border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))]"
                      )}
                      onClick={() => onSectionChange(section.id)}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{section.name}</span>
                      {isComplete && !isActive && (
                        <CheckCircle2 className="h-3 w-3 text-green-500 ml-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              <Separator className="bg-border/30" />

              {/* Form Content */}
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
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Choose Template</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">{visibleTemplates.length}</span>
              </div>

              <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted/30 p-1" aria-label="Filter templates">
                {([
                  ['all', 'All'],
                  ['free', 'Free'],
                  ['ats', 'ATS'],
                  ['photo', 'Photo'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTemplateFilter(value)}
                    className={cn(
                      'rounded-md px-1.5 py-1 text-[9px] font-semibold transition-colors',
                      templateFilter === value
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {visibleTemplates.map((template) => {
                  const isSelected = resolveTemplateKey(currentTemplateId) === template.key;
                  const isLocked = template.premium && !isPremium;
                  return (
                    <button
                      key={template.key}
                      className={cn(
                        "relative text-left rounded-xl overflow-hidden border transition-all duration-200 hover:shadow-md group flex flex-col",
                        isSelected
                          ? "ring-2 ring-primary border-primary shadow-sm" 
                          : "border-border/40 hover:border-border/80",
                        isLocked && "hover:border-amber-400/60",
                        isNeoBrutalism && "border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))]"
                      )}
                      onClick={() => onTemplateChange(template.key)}
                      aria-label={`${template.name}${isLocked ? ', Premium template' : ''}`}
                    >
                      <div className="aspect-[3/4] bg-muted/30 overflow-hidden relative w-full">
                        <ResumeTemplatePreview 
                          templateKey={template.key}
                          className="w-full h-full"
                          scale={0.40}
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] flex items-center justify-center">
                            <Badge className="text-[10px] bg-primary text-primary-foreground font-medium shadow-sm">
                              Active
                            </Badge>
                          </div>
                        )}
                        {isLocked && (
                          <div className="absolute inset-0 bg-background/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[9px] font-semibold text-white shadow-sm">
                              <Lock className="h-2.5 w-2.5" /> Premium
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 px-2 pt-1.5 flex-wrap">
                        {template.premium ? (
                          <Badge className="text-[9px] px-1 py-0 h-4 bg-amber-500 text-white border-0">PRO</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 text-emerald-600 border-emerald-300">FREE</Badge>
                        )}
                        {template.atsOptimized && <Badge className="text-[9px] px-1 py-0 h-4 bg-blue-500 text-white border-0">ATS</Badge>}
                      </div>
                      <div className={cn(
                        "p-2 bg-background border-t border-border/20 mt-1 flex-1 flex flex-col justify-between",
                        isNeoBrutalism && "border-t-2 border-foreground"
                      )}>
                        <div className="text-[11px] font-semibold truncate text-foreground leading-tight">{template.name}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">{template.category}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 bg-muted/20 rounded-xl border border-border/30">
                <p className="text-[10px] text-muted-foreground">
                  💡 <strong className="text-foreground">ATS templates</strong> are optimized for applicant tracking systems
                </p>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="animate-fade-in">
              <CustomizationPanel
                customization={resume.customization}
                onCustomizationChange={handleCustomizationChange}
                resumeData={resume}
                compact
              />
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-3 animate-fade-in">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Section Order</span>
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
