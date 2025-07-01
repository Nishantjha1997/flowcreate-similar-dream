import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; 
import Header from '@/components/Header';
import { ResumeHeaderSection } from '@/components/resume/ResumeHeaderSection';
import { ResumeBuilderSidebar } from '@/components/resume/ResumeBuilderSidebar';
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
import { useQuery } from '@tanstack/react-query';

const ResumeBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('template') || '1';
  const isExample = searchParams.get('example') === 'true';
  const editResumeId = searchParams.get('edit');
  const [activeSection, setActiveSection] = useState('personal');
  const resumeElementRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  
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

  // Fetch existing resume if editing
  const { data: existingResume, isLoading: loadingExistingResume } = useQuery({
    queryKey: ['resume', editResumeId],
    queryFn: async () => {
      if (!editResumeId) return null;
      
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', editResumeId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!editResumeId
  });

  const resumeName = resume.personal?.name || 'resume';
  const { isGenerating, generatePDF } = usePDFGenerator(`${resumeName}.pdf`);

  // NEW: Section order and hidden state
  const defaultSectionOrder = ['personal', 'experience', 'education', 'skills', 'projects'];
  const [activeSections, setActiveSections] = useState<string[]>(defaultSectionOrder);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);

  // Load existing resume data if editing
  useEffect(() => {
    if (existingResume && existingResume.resume_data) {
      setResume(existingResume.resume_data as unknown as ResumeData);
      return;
    }
    
    const savedResume = localStorage.getItem('resumeData');
    if (savedResume && !editResumeId) {
      setResume(JSON.parse(savedResume));
    }
    
    if (isExample) {
      const exampleId = templateId;
      if (exampleResumes[exampleId]) {
        setResume(exampleResumes[exampleId]);
      }
    } else if (!editResumeId) {
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
  }, [templateId, isExample, existingResume, editResumeId]);

  useEffect(() => {
    if (!isExample && !editResumeId) {
      localStorage.setItem('resumeData', JSON.stringify(resume));
    }
  }, [resume, isExample, editResumeId]);

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
    navigate(`/resume-builder?template=${newTemplateId}${isExample ? '&example=true' : ''}${editResumeId ? `&edit=${editResumeId}` : ''}`);
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

  // Modified handler for adding/updating resume (limit by plan)
  const handleSaveResume = async () => {
    if (!userId) {
      toast.error("Please log in to save your resume.");
      return;
    }

    if (loadingPremium || loadingCount) {
      toast.warning("Checking your plan...");
      return;
    }

    setIsSaving(true);

    try {
      if (editResumeId) {
        // Update existing resume
        const { error } = await supabase
          .from("resumes")
          .update({
            resume_data: resume as unknown as Json,
            updated_at: new Date().toISOString()
          })
          .eq('id', editResumeId)
          .eq('user_id', userId);

        if (error) {
          toast.error("Error updating resume: " + error.message);
        } else {
          toast.success("Resume updated successfully!");
        }
      } else {
        // Create new resume - Check limits for free users
        if (!premium?.isPremium && resumeCount >= 1) {
          toast.error("Free users can only save 1 resume. Please delete your existing resume or upgrade to Premium to save more.");
          return;
        }

        // Insert new resume
        const { error } = await supabase
          .from("resumes")
          .insert([
            {
              user_id: userId,
              resume_data: resume as unknown as Json,
            }
          ]);

        if (error) {
          toast.error("Error saving resume: " + error.message);
        } else {
          toast.success("Resume saved successfully!");
          refetchResumeCount();
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle AI feature upsell for free users
  const handleAIFeatureUpsell = () => {
    if (!premium?.isPremium) {
      toast.info("AI features are available with Premium! Upgrade for just ₹199/month to unlock AI-powered resume suggestions.");
      // You can add navigation to pricing page here if needed
      // navigate('/pricing');
    }
  };

  if (loadingExistingResume) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading resume...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* FREE USER LIMITATION BANNER */}
          {!premium?.isPremium && (
            <div className="mb-5 bg-yellow-50 text-yellow-900 border-l-4 border-yellow-400 p-3 rounded flex items-center justify-between shadow">
              <span>
                Free users can only save 1 resume. You have {resumeCount || 0}/1 resume saved.{" "}
                <b>Upgrade to Premium</b> for unlimited resumes and AI features!
              </span>
              <button
                className="ml-4 px-4 py-2 bg-primary text-white font-bold rounded shadow hover:bg-primary/90 transition-all"
                onClick={() =>
                  toast.info("Premium upgrade coming soon! Get unlimited resumes + AI features for ₹199/month")
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
            onSave={handleSaveResume}
            isSaving={isSaving}
            isEditing={!!editResumeId}
            resume={resume}
            templateId={templateId}
            templateNames={templateNames}
            sectionOrder={activeSections}
            hiddenSections={hiddenSections}
          />

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-3">
              <ResumeBuilderSidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                currentTemplateId={templateId}
                onTemplateChange={handleTemplateChange}
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
                onAIFeatureUpsell={handleAIFeatureUpsell}
                isPremium={premium?.isPremium}
                activeSections={activeSections}
                hiddenSections={hiddenSections}
                sectionTitles={{}}
                onSectionsChange={handleSectionsChange}
                onSectionTitleChange={() => {}}
              />
            </div>

            <div className="lg:col-span-7">
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
    </div>
  );
};

export default ResumeBuilder;
