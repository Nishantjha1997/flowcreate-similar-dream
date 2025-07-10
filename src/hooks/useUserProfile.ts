import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ResumeData } from '@/utils/types';

export interface UserProfile {
  id: string;
  user_id: string;
  
  // Personal Information
  full_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  
  // Professional Links
  linkedin_url?: string;
  website_url?: string;
  github_url?: string;
  portfolio_url?: string;
  
  // Profile Photo
  avatar_url?: string;
  
  // Professional Summary
  professional_summary?: string;
  
  // Career Information
  current_position?: string;
  industry?: string;
  experience_level?: 'entry' | 'mid' | 'senior' | 'executive';
  
  // Skills and Experience (stored as JSON)
  technical_skills?: string[];
  soft_skills?: string[];
  languages?: Array<{ language: string; proficiency: string }>;
  work_experience?: any[];
  education?: any[];
  projects?: any[];
  certifications?: any[];
  achievements?: any[];
  volunteer_experience?: any[];
  
  // Metadata
  profile_completeness?: number;
  last_resume_sync?: string;
  auto_sync_enabled?: boolean;
  
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserProfile | null;
    },
    enabled: !!user?.id
  });

  // Create or update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log('Updating profile with data:', profileData);
      console.log('User ID:', user.id);
      
      const updateData = {
        user_id: user.id,
        ...profileData,
        updated_at: new Date().toISOString()
      };
      
      console.log('Final update data:', updateData);
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert(updateData)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Profile updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error(`Failed to update profile: ${error?.message || 'Unknown error'}. Please try again.`);
    }
  });

  // Auto-populate resume from profile
  const populateResumeFromProfile = (profile: UserProfile): Partial<ResumeData> => {
    const populatedData: Partial<ResumeData> = {};
    
    // Populate personal information
    populatedData.personal = {
      name: profile.full_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      linkedin: profile.linkedin_url || '',
      website: profile.website_url || profile.portfolio_url || '',
      summary: profile.professional_summary || '',
      profileImage: profile.avatar_url || ''
    };

    // Populate experience if available
    if (profile.work_experience && Array.isArray(profile.work_experience) && profile.work_experience.length > 0) {
      populatedData.experience = profile.work_experience;
    }

    // Populate education if available
    if (profile.education && Array.isArray(profile.education) && profile.education.length > 0) {
      populatedData.education = profile.education;
    }

    // Populate skills if available
    if (profile.technical_skills && Array.isArray(profile.technical_skills) && profile.technical_skills.length > 0) {
      populatedData.skills = profile.technical_skills;
    }

    // Populate projects if available
    if (profile.projects && Array.isArray(profile.projects) && profile.projects.length > 0) {
      populatedData.projects = profile.projects;
    }

    // Populate certifications if available
    if (profile.certifications && Array.isArray(profile.certifications) && profile.certifications.length > 0) {
      populatedData.certifications = profile.certifications;
    }

    // Populate volunteer experience if available
    if (profile.volunteer_experience && Array.isArray(profile.volunteer_experience) && profile.volunteer_experience.length > 0) {
      populatedData.volunteer = profile.volunteer_experience;
    }

    // Populate languages if available
    if (profile.languages && Array.isArray(profile.languages) && profile.languages.length > 0) {
      populatedData.languages = profile.languages;
    }

    return populatedData;
  };

  // Calculate profile completeness
  const calculateCompleteness = (profile: UserProfile): number => {
    const fields = [
      profile.full_name,
      profile.email,
      profile.phone,
      profile.professional_summary,
      profile.current_position,
      profile.address
    ];

    const arrays = [
      profile.technical_skills,
      profile.work_experience,
      profile.education,
      profile.projects,
      profile.certifications,
      profile.languages
    ];

    let completed = fields.filter(field => field && field.trim() !== '').length;
    completed += arrays.filter(arr => arr && arr.length > 0).length;

    return Math.round((completed / 12) * 100);
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    populateResumeFromProfile,
    calculateCompleteness
  };
};