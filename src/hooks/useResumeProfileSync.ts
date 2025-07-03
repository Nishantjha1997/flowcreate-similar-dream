import { useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ResumeData } from '@/utils/types';

interface UseResumeProfileSyncProps {
  resume: ResumeData;
  setResume: (resume: ResumeData) => void;
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
      const populatedResume = populateResumeFromProfile(profile);
      setResume({
        ...populatedResume,
        customization: {
          ...populatedResume.customization,
          fontSize: 'medium' as const,
          spacing: 'normal' as const
        }
      });
    }
  }, [profile, shouldAutoPopulate, resume.personal.name, setResume, populateResumeFromProfile]);

  const populateFromProfile = () => {
    if (profile) {
      const populatedResume = populateResumeFromProfile(profile);
      setResume({
        ...populatedResume,
        customization: {
          ...populatedResume.customization,
          fontSize: 'medium' as const,
          spacing: 'normal' as const
        }
      });
    }
  };

  return {
    profile,
    populateFromProfile,
    hasProfileData: !!(profile?.full_name || profile?.email)
  };
};