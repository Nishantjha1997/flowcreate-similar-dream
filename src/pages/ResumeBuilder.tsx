import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; 
import Header from '@/components/Header';
import { ResumeHeaderSection } from '@/components/resume/ResumeHeaderSection';
import { ResumeNavigation } from '@/components/resume/ResumeNavigation';
import { ResumeFormSection } from '@/components/resume/ResumeFormSection';
import { ResumePreviewSection } from '@/components/resume/ResumePreviewSection';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { SectionDragDropCustomizer } from '@/components/resume/SectionDragDropCustomizer';

import { ResumeData } from '@/utils/types';
import { emptyEducation, emptyExperience, emptyProject, exampleResumes, templateNames } from '@/components/resume/ResumeData';

import { useAuth } from "@/hooks/useAuth";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useResumeCount } from "@/hooks/useResumeLimit";

import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

const ResumeBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('template') || '1';
  const isExample = searchParams.get('example') === 'true';
  const [activeSection, setActiveSection] = useState('personal');
  const resumeElementRef = useRef<HTMLDivElement>(null);
  
  const [resume, setResume] = useState<ResumeData>({
    personal: {
      name: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
      website: '',
      linkedin: '',
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

  const resumeName = resume.personal?.name || 'resume';
  const { isGenerating, generatePDF } = usePDFGenerator(`${resumeName}.pdf`);

  // NEW: Section order and hidden state
  const defaultSectionOrder = ['personal', 'experience', 'education', 'skills', 'projects'];
  const [activeSections, setActiveSections] = useState<string[]>(defaultSectionOrder);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);

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
      // NEW: Fill with the template's complete mock data if template is just selected (and not editing)
      if (exampleResumes[templateId]) {
        setResume(exampleResumes[templateId]);
      }
    }
  }, [templateId, isExample]);

  useEffect(() => {
    if (!isExample) {
      localStorage.setItem('resumeData', JSON.stringify(resume));
    }
  }, [resume, isExample]);

  const { user } = useAuth();
  const userId = user?.id;

  const { data: premium, isLoading: loadingPremium } = usePremiumStatus(userId);
  const { data: resumeCount, isLoading: loadingCount, refetch: refetchResumeCount } =
    useResumeCount(userId);

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleDownload = () => {
    const resumeContainer = document.getElementById('resume-preview-container');
    
    if (resumeContainer) {
      generatePDF(resumeContainer);
    } else {
      toast.error("Could not find resume content to download.");
    }
  };

  // NEW: Pass section arrangement and order up/downstream
  const handleSectionsChange = (active: string[], hidden: string[]) => {
    setActiveSections(active);
    setHiddenSections(hidden);
  };

  // Modified handler for adding resume (limit by plan)
  const handleSaveResume = async () => {
    if (loadingPremium || loadingCount) {
      toast.warning("Checking your plan...");
      return;
    }
    // Free plan: allow max 1 resume
    if (!premium?.isPremium && resumeCount >= 1) {
      toast.error("Free users can only save 1 resume. Upgrade to Premium to save more.");
      return;
    }

    // Insert/update resume in Supabase
    const { error } = await supabase
      .from("resumes")
      .insert([
        {
          user_id: userId,
          resume_data: resume as unknown as Json, // <--- Fix/convert here!
        }
      ]);

    if (error) {
      toast.error("Error saving resume: " + error.message);
    } else {
      toast.success("Resume saved!");
      refetchResumeCount();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* PREMIUM UPGRADE BANNER */}
          {!premium?.isPremium && (
            <div className="mb-5 bg-yellow-50 text-yellow-900 border-l-4 border-yellow-400 p-3 rounded flex items-center justify-between shadow">
              <span>
                Free users can only save 1 resume.{" "}
                <b>Upgrade to Premium</b> for unlimited resumes!
              </span>
              {/* Placeholder Upgrade-to-Premium Button */}
              <button
                className="ml-4 px-4 py-2 bg-primary text-white font-bold rounded shadow hover:bg-primary/90 transition-all"
                // We'll later integrate Razorpay
                onClick={() =>
                  toast.info("Premium upgrade coming soon! (Razorpay will be integrated)")
                }
              >
                Upgrade ₹199/month
              </button>
            </div>
          )}

          <ResumeHeaderSection 
            resumeElementRef={resumeElementRef}
            resumeName={resumeName}
            handleShare={handleShare}
            handleDownload={handleDownload}
            isGenerating={isGenerating}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <ResumeNavigation
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                currentTemplateId={templateId}
                onTemplateChange={handleTemplateChange}
              />
              {/* Section customizer menu */}
              <div className="mt-4">
                <SectionDragDropCustomizer
                  activeSections={activeSections}
                  hiddenSections={hiddenSections}
                  sectionTitles={{}} // Pass if you use titles, otherwise keep empty
                  onSectionsChange={handleSectionsChange}
                  onSectionTitleChange={() => {}} // Placeholder if needed
                />
              </div>
            </div>

            <div className="lg:col-span-5">
              <ResumeFormSection
                activeSection={activeSection}
                resume={resume}
                handlePersonalInfoChange={handlePersonalInfoChange}
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
              />
            </div>

            <div className="lg:col-span-4">
              <ResumePreviewSection
                resume={resume}
                templateId={templateId}
                templateNames={templateNames}
                resumeRef={resumeElementRef}
                handleDownload={handleDownload}
                isGenerating={isGenerating}
                sectionOrder={activeSections}
                hiddenSections={hiddenSections}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
