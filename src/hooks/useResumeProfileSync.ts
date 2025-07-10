import { useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ResumeData } from '@/utils/types';

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
  const { profile, populateResumeFromProfile } = useUserProfile();

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

  const populateFromProfile = () => {
    if (profile) {
      const populatedData = populateResumeFromProfile(profile);
      setResume(prevResume => ({
        ...prevResume,
        ...populatedData,
        personal: {
          ...prevResume.personal,
          ...populatedData.personal
        },
        experience: populatedData.experience || prevResume.experience,
        education: populatedData.education || prevResume.education,
        skills: populatedData.skills || prevResume.skills,
        projects: populatedData.projects || prevResume.projects,
        certifications: populatedData.certifications || prevResume.certifications,
        volunteer: populatedData.volunteer || prevResume.volunteer,
        languages: populatedData.languages || prevResume.languages,
        customization: {
          ...prevResume.customization,
          fontSize: 'medium' as const,
          spacing: 'normal' as const
        }
      }));
    }
  };

  return {
    profile,
    populateFromProfile,
    hasProfileData: !!(profile?.full_name || profile?.email)
  };
};