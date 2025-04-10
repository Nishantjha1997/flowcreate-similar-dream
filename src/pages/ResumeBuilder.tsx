import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { CustomizationPanel } from '@/components/CustomizationPanel';
import { Download, Share2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

// Import new component files
import { PersonalInfoSection } from '@/components/resume/PersonalInfoSection';
import { ExperienceSection } from '@/components/resume/ExperienceSection';
import { EducationSection } from '@/components/resume/EducationSection';
import { SkillsSection } from '@/components/resume/SkillsSection';
import { ProjectsSection } from '@/components/resume/ProjectsSection';
import { SectionNav } from '@/components/resume/SectionNav';
import { TemplateSelector } from '@/components/resume/TemplateSelector';
import { ResumeVisualPreview, EnhancedResumePreview } from '@/components/resume/ResumeVisualPreview';
import { ResumeData, adaptResumeData } from '@/utils/resumeAdapterUtils';
import { emptyEducation, emptyExperience, emptyProject, exampleResumes, templateNames } from '@/components/resume/ResumeData';

const ResumeBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('template') || '1';
  const isExample = searchParams.get('example') === 'true';
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  
  const [resume, setResume] = useState<ResumeData>({
    personal: {
      name: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
    },
    experience: [
      {
        id: 1,
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ],
    education: [
      {
        id: 1,
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ],
    skills: [],
    customization: {
      primaryColor: '#2563eb',
      secondaryColor: '#6b7280',
      fontSize: 'medium',
      spacing: 'normal'
    }
  });

  useEffect(() => {
    const savedResume = localStorage.getItem('resumeData');
    if (savedResume) {
      setResume(JSON.parse(savedResume));
    }
    
    if (isExample) {
      const exampleId = templateId;
      if (exampleResumes[exampleId]) {
        setResume(exampleResumes[exampleId]);
      }
    } else {
      const templateKey = templateNames[templateId];
      let primaryColor = '#2563eb';
      let secondaryColor = '#6b7280';
      
      switch(templateKey) {
        case 'modern':
          primaryColor = '#2563eb';
          secondaryColor = '#6b7280';
          break;
        case 'classic':
          primaryColor = '#000000';
          secondaryColor = '#333333';
          break;
        case 'creative':
          primaryColor = '#FF6B6B';
          secondaryColor = '#FFE66D';
          break;
        case 'technical':
          primaryColor = '#4CAF50';
          secondaryColor = '#333333';
          break;
        case 'professional':
          primaryColor = '#003366';
          secondaryColor = '#555555';
          break;
        case 'minimalist':
          primaryColor = '#FFD700';
          secondaryColor = '#8B4513';
          break;
        case 'executive':
          primaryColor = '#00008B';
          secondaryColor = '#B03060';
          break;
      }
      
      setResume(prev => ({
        ...prev,
        customization: {
          ...prev.customization,
          primaryColor,
          secondaryColor
        }
      }));
    }
  }, [templateId, isExample]);

  useEffect(() => {
    if (!isExample) {
      localStorage.setItem('resumeData', JSON.stringify(resume));
    }
  }, [resume, isExample]);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResume((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [name]: value,
      },
    }));
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { name, value } = e.target;
    setResume((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience[index] = {
        ...updatedExperience[index],
        [name]: value,
      };
      return {
        ...prev,
        experience: updatedExperience,
      };
    });
  };

  const handleCurrentJobToggle = (checked: boolean, index: number) => {
    setResume((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience[index] = {
        ...updatedExperience[index],
        current: checked,
        endDate: checked ? '' : updatedExperience[index].endDate,
      };
      return {
        ...prev,
        experience: updatedExperience,
      };
    });
  };

  const addExperience = () => {
    setResume((prev) => {
      const newId = prev.experience.length > 0 
        ? Math.max(...prev.experience.map(e => e.id)) + 1 
        : 1;
        
      return {
        ...prev,
        experience: [
          ...prev.experience,
          { ...emptyExperience, id: newId },
        ],
      };
    });
  };

  const removeExperience = (id: number) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  };

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { name, value } = e.target;
    setResume((prev) => {
      const updatedEducation = [...prev.education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [name]: value,
      };
      return {
        ...prev,
        education: updatedEducation,
      };
    });
  };

  const addEducation = () => {
    setResume((prev) => {
      const newId = prev.education.length > 0 
        ? Math.max(...prev.education.map(e => e.id)) + 1 
        : 1;
        
      return {
        ...prev,
        education: [
          ...prev.education,
          { ...emptyEducation, id: newId },
        ],
      };
    });
  };

  const removeEducation = (id: number) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const skillsString = e.target.value;
    const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
    
    setResume((prev) => ({
      ...prev,
      skills: skillsArray,
    }));
  };

  const handleCustomizationChange = (customization: ResumeData['customization']) => {
    setResume(prev => ({
      ...prev,
      customization
    }));
  };

  const handleTemplateChange = (newTemplateId: string) => {
    navigate(`/resume-builder?template=${newTemplateId}${isExample ? '&example=true' : ''}`);
  };

  const handleProjectChange = (field: string, value: string, index: number) => {
    setResume((prev) => {
      const updatedProjects = [...(prev.projects || [])];
      
      if (field === 'technologies') {
        try {
          const techs = JSON.parse(value);
          updatedProjects[index] = {
            ...updatedProjects[index],
            technologies: techs
          };
        } catch (e) {
          console.error("Error parsing technologies:", e);
        }
      } else {
        updatedProjects[index] = {
          ...updatedProjects[index],
          [field]: value
        };
      }
      
      return {
        ...prev,
        projects: updatedProjects
      };
    });
  };

  const addProject = () => {
    setResume((prev) => {
      const projects = prev.projects || [];
      const newId = projects.length > 0 
        ? Math.max(...projects.map(p => p.id)) + 1 
        : 1;
      
      return {
        ...prev,
        projects: [
          ...projects,
          { ...emptyProject, id: newId }
        ]
      };
    });
  };

  const removeProject = (id: number) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects?.filter(p => p.id !== id)
    }));
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleDownload = () => {
    setIsGenerating(true);
    
    const filename = `${resume.personal?.name || 'resume'}.pdf`;
    
    const options = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const tempDiv = document.createElement('div');
    tempDiv.style.width = '8.5in';
    tempDiv.style.padding = '0.5in';
    tempDiv.style.backgroundColor = 'white';
    
    const resumeElement = document.querySelector('.resume-container');
    if (resumeElement) {
      tempDiv.innerHTML = resumeElement.innerHTML;
      document.body.appendChild(tempDiv);
    }

    setTimeout(() => {
      html2pdf()
        .from(tempDiv)
        .set(options)
        .save()
        .then(() => {
          setIsGenerating(false);
          document.body.removeChild(tempDiv);
          toast.success("Resume downloaded successfully!");
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
          setIsGenerating(false);
          if (tempDiv.parentNode) {
            document.body.removeChild(tempDiv);
          }
          toast.error("Error generating PDF. Please try again.");
        });
    }, 100);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Resume Builder</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating PDF..." : "Download PDF"}
              </Button>
              <Button size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-0">
                  <Tabs defaultValue="sections" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="sections">Sections</TabsTrigger>
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sections">
                      <SectionNav 
                        activeSection={activeSection} 
                        onSectionChange={handleSectionChange} 
                      />
                    </TabsContent>
                    <TabsContent value="templates">
                      <TemplateSelector 
                        currentTemplateId={templateId} 
                        onTemplateChange={handleTemplateChange}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card>
                <CardContent className="p-6">
                  {activeSection === 'personal' && (
                    <PersonalInfoSection 
                      personal={resume.personal}
                      onChange={handlePersonalInfoChange}
                    />
                  )}

                  {activeSection === 'experience' && (
                    <ExperienceSection 
                      experience={resume.experience}
                      onExperienceChange={handleExperienceChange}
                      onCurrentJobToggle={handleCurrentJobToggle}
                      addExperience={addExperience}
                      removeExperience={removeExperience}
                    />
                  )}

                  {activeSection === 'education' && (
                    <EducationSection
                      education={resume.education}
                      onEducationChange={handleEducationChange}
                      addEducation={addEducation}
                      removeEducation={removeEducation}
                    />
                  )}

                  {activeSection === 'skills' && (
                    <SkillsSection 
                      skills={resume.skills}
                      onSkillsChange={handleSkillsChange}
                    />
                  )}

                  {activeSection === 'projects' && (
                    <ProjectsSection 
                      projects={resume.projects}
                      onProjectChange={handleProjectChange}
                      addProject={addProject}
                      removeProject={removeProject}
                    />
                  )}

                  {activeSection === 'customize' && (
                    <CustomizationPanel 
                      customization={resume.customization} 
                      onCustomizationChange={handleCustomizationChange}
                      resumeData={adaptResumeData(resume)}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card className="h-full flex flex-col">
                <div className="p-4 bg-muted flex items-center justify-between border-b">
                  <h3 className="font-medium">Preview</h3>
                  <EnhancedResumePreview 
                    resume={resume}
                    templateId={templateId}
                    templateNames={templateNames}
                  />
                </div>
                <CardContent className="flex-1 p-0 relative overflow-auto">
                  <div className="resume-container" style={{ display: 'none' }}>
                    <ResumeVisualPreview 
                      resume={resume}
                      templateId={templateId}
                      templateNames={templateNames}
                    />
                  </div>
                  <ResumeVisualPreview 
                    resume={resume}
                    templateId={templateId}
                    templateNames={templateNames}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
