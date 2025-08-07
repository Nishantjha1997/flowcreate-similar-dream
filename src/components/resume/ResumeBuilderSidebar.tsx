import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionNav } from '@/components/resume/SectionNav';
import { TemplateSelector } from '@/components/resume/TemplateSelector';
import { ResumeFormSection } from '@/components/resume/ResumeFormSection';
import { SectionDragDropCustomizer } from '@/components/resume/SectionDragDropCustomizer';
import { ResumeData } from '@/utils/types';

interface ResumeBuilderSidebarProps {
  // Navigation props
  activeSection: string;
  onSectionChange: (section: string) => void;
  currentTemplateId: string;
  onTemplateChange: (templateId: string) => void;
  
  // Form props
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
  
  // Section customizer props
  activeSections: string[];
  hiddenSections: string[];
  sectionTitles: Record<string, string>;
  onSectionsChange: (active: string[], hidden: string[]) => void;
  onSectionTitleChange: (sectionId: string, title: string) => void;
  
  // Profile sync props
  onPopulateFromProfile?: () => void;
  hasProfileData?: boolean;
  onPDFDataExtracted?: (data: Partial<ResumeData>) => void;
}

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
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] bg-background">
      {/* Navigation Tabs - Fixed Height */}
      <Card className="flex-shrink-0 mb-3 shadow-sm">
        <CardContent className="p-2">
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-9 text-xs">
              <TabsTrigger value="sections" className="text-xs px-2">
                Edit
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs px-2">
                Themes
              </TabsTrigger>
              <TabsTrigger value="customize" className="text-xs px-2">
                Layout
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sections" className="mt-2 space-y-0">
              <SectionNav 
                activeSection={activeSection} 
                onSectionChange={onSectionChange} 
              />
            </TabsContent>
            
            <TabsContent value="templates" className="mt-2 space-y-0">
              <TemplateSelector 
                currentTemplateId={currentTemplateId} 
                onTemplateChange={onTemplateChange}
              />
            </TabsContent>
            
            <TabsContent value="customize" className="mt-2 space-y-0">
              <div className="max-h-48 overflow-y-auto">
                <SectionDragDropCustomizer
                  activeSections={activeSections}
                  hiddenSections={hiddenSections}
                  sectionTitles={sectionTitles}
                  onSectionsChange={onSectionsChange}
                  onSectionTitleChange={onSectionTitleChange}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Section - Scrollable */}
      <div className="flex-1 overflow-y-auto">
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
  );
};