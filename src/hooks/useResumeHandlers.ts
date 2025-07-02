import { ResumeData } from '@/utils/types';
import { emptyEducation, emptyExperience, emptyProject } from '@/components/resume/ResumeData';

export const useResumeHandlers = (
  setResume: React.Dispatch<React.SetStateAction<ResumeData>>
) => {
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

  return {
    handlePersonalInfoChange,
    handleExperienceChange,
    handleCurrentJobToggle,
    addExperience,
    removeExperience,
    handleEducationChange,
    addEducation,
    removeEducation,
    handleSkillsChange,
    handleCustomizationChange,
    handleProjectChange,
    addProject,
    removeProject
  };
};