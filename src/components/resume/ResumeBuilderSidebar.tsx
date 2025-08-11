import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Template data for inline component
const templates = [
  {
    id: "1",
    name: "Executive Modern",
    category: "Professional",
    templateKey: "modern",
    featured: true,
    atsOptimized: true
  },
  {
    id: "2",
    name: "Corporate Classic",
    category: "Professional",
    templateKey: "classic",
    featured: false,
    atsOptimized: true
  },
  {
    id: "3",
    name: "Business Elite",
    category: "Professional",
    templateKey: "professional",
    featured: false,
    atsOptimized: true
  },
  {
    id: "4",
    name: "Software Engineer Pro",
    category: "Technology",
    templateKey: "technical",
    featured: true,
    atsOptimized: true
  },
  {
    id: "5",
    name: "DevOps Specialist",
    category: "Technology",
    templateKey: "developer",
    featured: false,
    atsOptimized: true
  },
  {
    id: "6",
    name: "Data Scientist",
    category: "Technology",
    templateKey: "data-scientist",
    featured: true,
    atsOptimized: true
  },
  {
    id: "7",
    name: "Creative Portfolio",
    category: "Creative",
    templateKey: "creative",
    featured: true,
    atsOptimized: false
  },
  {
    id: "8",
    name: "UI/UX Designer",
    category: "Creative",
    templateKey: "elegant",
    featured: false,
    atsOptimized: false
  },
  {
    id: "10",
    name: "Medical Professional",
    category: "Healthcare",
    templateKey: "medical",
    featured: true,
    atsOptimized: true
  },
  {
    id: "12",
    name: "Academic Researcher",
    category: "Education",
    templateKey: "academic",
    featured: true,
    atsOptimized: true
  },
  {
    id: "19",
    name: "C-Level Executive",
    category: "Executive",
    templateKey: "executive",
    featured: true,
    atsOptimized: true
  },
  {
    id: "21",
    name: "ATS Optimized Pro",
    category: "ATS-Friendly",
    templateKey: "ats-pro",
    featured: true,
    atsOptimized: true
  }
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

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'experience', name: 'Experience', icon: Briefcase },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'skills', name: 'Skills', icon: Award },
    { id: 'projects', name: 'Projects', icon: BookOpen },
    
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'edit':
        return (
          <div className="flex h-full flex-col gap-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-sm font-medium text-muted-foreground">Resume Sections</div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" variant="secondary" className="h-8">
                    <Settings className="h-4 w-4 mr-1" />
                    Customize
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md z-50">
                  <SheetHeader>
                    <SheetTitle>Customize Resume</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 pb-4 overflow-y-auto h-[calc(100vh-8rem)]">
                    <CustomizationPanel
                      customization={resume.customization}
                      onCustomizationChange={handleCustomizationChange}
                      resumeData={resume}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start h-9 px-3"
                    onClick={() => onSectionChange(section.id)}
                  >
                    <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{section.name}</span>
                  </Button>
                );
              })}
            </div>
            <Separator className="my-2" />
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
      
      case 'templates':
        return (
          <div className="flex h-full flex-col gap-3">
            <div className="text-sm font-medium text-muted-foreground px-1">
              Choose Template
            </div>
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-2 gap-2 pr-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`relative cursor-pointer border rounded-lg overflow-hidden transition-all hover:shadow-md hover:scale-[1.02] ${
                      currentTemplateId === template.id ? 'ring-2 ring-primary shadow-lg' : ''
                    }`}
                    onClick={() => onTemplateChange(template.id)}
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                      <ResumeTemplatePreview 
                        templateKey={template.templateKey}
                        className="w-full h-full scale-75 origin-top-left"
                      />
                      {currentTemplateId === template.id && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <Badge className="text-xs">Active</Badge>
                        </div>
                      )}
                      <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                        {template.featured && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                            ⭐
                          </Badge>
                        )}
                        {template.atsOptimized && (
                          <Badge className="text-[10px] px-1 py-0 h-4 bg-green-500 hover:bg-green-600">
                            ATS
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-2 bg-background border-t">
                      <div className="text-xs font-medium truncate">{template.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{template.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-3 p-2 bg-muted/30 rounded-lg">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                💡 <strong>ATS templates</strong> are optimized for applicant tracking systems
              </p>
            </div>
          </div>
        );
      
      case 'layout':
        return (
          <div className="flex h-full flex-col gap-3">
            <div className="text-sm font-medium text-muted-foreground px-1">
              Section Layout
            </div>
            <ScrollArea className="flex-1">
              <div className="pr-3">
                <SectionDragDropCustomizer
                  activeSections={activeSections}
                  hiddenSections={hiddenSections}
                  sectionTitles={sectionTitles}
                  onSectionsChange={onSectionsChange}
                  onSectionTitleChange={onSectionTitleChange}
                />
              </div>
            </ScrollArea>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Tab Navigation */}
      <Card className="flex-shrink-0 border-b border-t-0 border-l-0 border-r-0 rounded-none sticky top-0 z-20 bg-background">
        <CardContent className="p-0">
          <div className="grid grid-cols-3 border-b">
            <Button
              variant={activeTab === 'edit' ? 'default' : 'ghost'}
              size="sm"
              className="h-10 rounded-none border-r flex-col gap-1 py-2"
              onClick={() => setActiveTab('edit')}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="text-xs">Edit</span>
            </Button>
            <Button
              variant={activeTab === 'templates' ? 'default' : 'ghost'}
              size="sm"
              className="h-10 rounded-none border-r flex-col gap-1 py-2"
              onClick={() => setActiveTab('templates')}
            >
              <Palette className="h-3.5 w-3.5" />
              <span className="text-xs">Themes</span>
            </Button>
            <Button
              variant={activeTab === 'layout' ? 'default' : 'ghost'}
              size="sm"
              className="h-10 rounded-none flex-col gap-1 py-2"
              onClick={() => setActiveTab('layout')}
            >
              <Layout className="h-3.5 w-3.5" />
              <span className="text-xs">Layout</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-2">
          {renderTabContent()}
        </div>
      </div>

    </div>
  );
};