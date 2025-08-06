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
    <div className="h-[calc(100vh-2rem)] overflow-y-auto bg-card border rounded-lg shadow-lg"
         style={{ maxHeight: 'calc(100vh - 2rem)' }}>
      {/* Navigation Tabs */}
      <Card className="bg-card border mb-4">
        <CardContent className="p-0">
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sections">
                Sections
              </TabsTrigger>
              <TabsTrigger value="templates">
                Templates
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sections" className="mt-0">
              <SectionNav 
                activeSection={activeSection} 
                onSectionChange={onSectionChange} 
              />
            </TabsContent>
            <TabsContent value="templates" className="mt-0">
              <TemplateSelector 
                currentTemplateId={currentTemplateId} 
                onTemplateChange={onTemplateChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Section */}
      <div className="mb-4">
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

      {/* Section Customizer */}
      <Card className="bg-card border">
        <CardContent className="p-4">
          <SectionDragDropCustomizer
            activeSections={activeSections}
            hiddenSections={hiddenSections}
            sectionTitles={sectionTitles}
            onSectionsChange={onSectionsChange}
            onSectionTitleChange={onSectionTitleChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};