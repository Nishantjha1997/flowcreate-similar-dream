import { useEffect, useCallback } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/hooks/useAuth';
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
  const { user } = useAuth();
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
    // Check if user is logged in
    if (!user) {
      toast.error('Please log in to use this feature.');
      return;
    }

    if (isLoading) {
      toast.info('Loading profile data...');
      return;
    }

    if (!profile) {
      toast.error('No profile found. Please complete your profile first in Account settings.');
      return;
    }
    
    const populatedData = populateResumeFromProfile(profile);
    
    // Check if there's actual data to populate
    const hasPersonalData = populatedData.personal?.name || populatedData.personal?.email || populatedData.personal?.phone;
    const hasExperience = populatedData.experience && populatedData.experience.length > 0;
    const hasEducation = populatedData.education && populatedData.education.length > 0;
    const hasSkills = populatedData.skills && populatedData.skills.length > 0;
    const hasProjects = populatedData.projects && populatedData.projects.length > 0;
    
    const hasAnyData = hasPersonalData || hasExperience || hasEducation || hasSkills || hasProjects;
    
    if (!hasAnyData) {
      toast.error('Your profile appears to be empty. Please add data to your profile first in Account settings.');
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
    
    // Show success with details
    const importedSections = [];
    if (hasPersonalData) importedSections.push('personal info');
    if (hasExperience) importedSections.push('experience');
    if (hasEducation) importedSections.push('education');
    if (hasSkills) importedSections.push('skills');
    if (hasProjects) importedSections.push('projects');
    
    toast.success(`Resume populated with: ${importedSections.join(', ')}`);
  }, [user, profile, isLoading, setResume, populateResumeFromProfile]);

  // User is logged in = can try to fill from profile (even if no data yet, will show helpful error)
  const canFillFromProfile = !!user;
  
  // Determine if profile has meaningful data (for showing indicator)
  const hasProfileData = !isLoading && !!(
    profile?.full_name || 
    profile?.email ||
    (profile?.work_experience && Array.isArray(profile.work_experience) && profile.work_experience.length > 0) ||
    (profile?.education && Array.isArray(profile.education) && profile.education.length > 0) ||
    (profile?.technical_skills && Array.isArray(profile.technical_skills) && profile.technical_skills.length > 0)
  );

  return {
    profile,
    isLoading,
    populateFromProfile,
    hasProfileData,
    canFillFromProfile
  };
};