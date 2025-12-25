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
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Settings,
  Palette,
  Layout,
  FileText
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
  onPDFDataExtracted
}: ResumeBuilderSidebarProps) => {
  const [activeTab, setActiveTab] = useState('edit');

  return (
    <div className="flex flex-col h-full rounded-lg border bg-card overflow-hidden">
      {/* Compact Tab Navigation */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <div className="grid grid-cols-3">
          <button
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'edit' 
                ? 'border-primary text-primary bg-background' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            onClick={() => setActiveTab('edit')}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
          <button
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'templates' 
                ? 'border-primary text-primary bg-background' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Themes</span>
          </button>
          <button
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'layout' 
                ? 'border-primary text-primary bg-background' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
            onClick={() => setActiveTab('layout')}
          >
            <Layout className="h-3.5 w-3.5" />
            <span>Layout</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {activeTab === 'edit' && (
            <div className="space-y-3">
              {/* Section Navigation Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sections</span>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
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

              {/* Section Navigation Pills */}
              <div className="flex flex-wrap gap-1.5">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                      onClick={() => onSectionChange(section.id)}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{section.name}</span>
                    </button>
                  );
                })}
              </div>

              <Separator />

              {/* Form Content */}
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
          )}

          {activeTab === 'templates' && (
            <div className="space-y-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Choose Template</span>
              
              <div className="grid grid-cols-2 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    className={`relative text-left rounded-lg overflow-hidden border transition-all hover:shadow-md ${
                      currentTemplateId === template.id 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-muted-foreground/30'
                    }`}
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
                    <div className="p-1.5 bg-background border-t">
                      <div className="text-[11px] font-medium truncate">{template.name}</div>
                      <div className="text-[10px] text-muted-foreground">{template.category}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-2 bg-muted/30 rounded-md">
                <p className="text-[10px] text-muted-foreground">
                  💡 <strong>ATS templates</strong> are optimized for applicant tracking systems
                </p>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Section Order</span>
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