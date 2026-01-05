import { useEffect, useCallback } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ResumeData } from '@/utils/types';
import { toast } from 'sonner';

interface UseResumeProfileSyncProps {
  resume: ResumeData;
  setResume: (resume: ResumeData | ((prev: ResumeData) => ResumeData)) => void;
  shouldAutoPopulate?: boolean;
}

export const useResumeProfileSync = ({ 
  resume, 
  setResume, 
  shouldAutoPopulate = false 
}: UseResumeProfileSyncProps) => {
  const { profile, isLoading, populateResumeFromProfile } = useUserProfile();

  // Auto-populate resume from profile on initial load
  useEffect(() => {
    if (shouldAutoPopulate && profile && !resume.personal.name) {
      const populatedData = populateResumeFromProfile(profile);
      setResume(prevResume => ({
        ...prevResume,
        ...populatedData,
        personal: {
          ...prevResume.personal,
          ...populatedData.personal
        },
        customization: {
          ...prevResume.customization,
          fontSize: 'medium' as const,
          spacing: 'normal' as const
        }
      }));
    }
  }, [profile, shouldAutoPopulate, resume.personal.name, setResume, populateResumeFromProfile]);

  const populateFromProfile = useCallback(() => {
    if (!profile) {
      toast.error('No profile data found. Please complete your profile first.');
      return;
    }
    
    const populatedData = populateResumeFromProfile(profile);
    
    // Check if there's actual data to populate
    const hasData = populatedData.personal?.name || 
                    populatedData.personal?.email || 
                    (populatedData.experience && populatedData.experience.length > 0) ||
                    (populatedData.education && populatedData.education.length > 0) ||
                    (populatedData.skills && populatedData.skills.length > 0);
    
    if (!hasData) {
      toast.error('Your profile appears to be empty. Please add data to your profile first.');
      return;
    }
    
    setResume(prevResume => ({
      ...prevResume,
      ...populatedData,
      personal: {
        ...prevResume.personal,
        ...populatedData.personal
      },
      experience: populatedData.experience && populatedData.experience.length > 0 
        ? populatedData.experience 
        : prevResume.experience,
      education: populatedData.education && populatedData.education.length > 0 
        ? populatedData.education 
        : prevResume.education,
      skills: populatedData.skills && populatedData.skills.length > 0 
        ? populatedData.skills 
        : prevResume.skills,
      projects: populatedData.projects && populatedData.projects.length > 0 
        ? populatedData.projects 
        : prevResume.projects,
      certifications: populatedData.certifications && populatedData.certifications.length > 0 
        ? populatedData.certifications 
        : prevResume.certifications,
      volunteer: populatedData.volunteer && populatedData.volunteer.length > 0 
        ? populatedData.volunteer 
        : prevResume.volunteer,
      languages: populatedData.languages && populatedData.languages.length > 0 
        ? populatedData.languages 
        : prevResume.languages,
      customization: {
        ...prevResume.customization,
        fontSize: 'medium' as const,
        spacing: 'normal' as const
      }
    }));
    
    toast.success('Resume populated from your profile!');
  }, [profile, setResume, populateResumeFromProfile]);

  // Determine if profile has meaningful data
  const hasProfileData = !isLoading && !!(
    profile?.full_name || 
    profile?.email ||
    (profile?.work_experience && profile.work_experience.length > 0) ||
    (profile?.education && profile.education.length > 0) ||
    (profile?.technical_skills && profile.technical_skills.length > 0)
  );

  return {
    profile,
    isLoading,
    populateFromProfile,
    hasProfileData
  };
};