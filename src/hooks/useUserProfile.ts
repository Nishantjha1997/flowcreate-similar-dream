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
        .upsert(updateData, { onConflict: 'user_id' })
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

    const normalizeString = (value: unknown): string => {
      if (typeof value === 'string') return value;
      if (value === null || value === undefined) return '';
      return String(value);
    };

    const normalizeStringArray = (value: unknown): string[] => {
      if (Array.isArray(value)) {
        return value
          .flatMap((item) => {
            if (typeof item === 'string') return [item];
            if (item && typeof item === 'object') {
              const obj = item as any;
              const candidate = obj.name ?? obj.skill ?? obj.technology ?? obj.title;
              return candidate ? [String(candidate)] : [];
            }
            return [];
          })
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (typeof value === 'string') {
        // Handle common legacy formats: "React, Node, SQL"
        return value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      return [];
    };

    const normalizeLanguages = (value: unknown): Array<{ language: string; proficiency: string }> => {
      if (!Array.isArray(value)) return [];

      return value
        .map((item) => {
          if (typeof item === 'string') {
            return { language: item.trim(), proficiency: 'Basic' };
          }
          if (item && typeof item === 'object') {
            const obj = item as any;
            const language = normalizeString(obj.language || obj.name).trim();
            const proficiency = normalizeString(obj.proficiency || obj.level || 'Basic').trim();
            if (!language) return null;
            return { language, proficiency: proficiency || 'Basic' };
          }
          return null;
        })
        .filter(Boolean) as Array<{ language: string; proficiency: string }>;
    };

    // Populate personal information
    populatedData.personal = {
      name: normalizeString(profile.full_name).trim(),
      email: normalizeString(profile.email).trim(),
      phone: normalizeString(profile.phone).trim(),
      address: normalizeString(profile.address).trim(),
      linkedin: normalizeString(profile.linkedin_url).trim(),
      website: normalizeString(profile.website_url || profile.portfolio_url).trim(),
      summary: normalizeString(profile.professional_summary).trim(),
      profileImage: normalizeString(profile.avatar_url).trim()
    };

    // Populate experience if available - map profile fields to resume fields
    if (Array.isArray(profile.work_experience) && profile.work_experience.length > 0) {
      populatedData.experience = profile.work_experience.map((exp: any, index: number) => ({
        id: index + 1,
        title: normalizeString(exp?.title || exp?.position).trim(),
        company: normalizeString(exp?.company || exp?.organization).trim(),
        location: normalizeString(exp?.location).trim(),
        startDate: normalizeString(exp?.startDate || exp?.start_date).trim(),
        endDate: exp?.current
          ? 'Present'
          : normalizeString(exp?.endDate || exp?.end_date).trim(),
        current: !!exp?.current,
        description: normalizeString(exp?.description).trim()
      }));
    }

    // Populate education if available - map profile fields to resume fields
    if (Array.isArray(profile.education) && profile.education.length > 0) {
      populatedData.education = profile.education.map((edu: any, index: number) => ({
        id: index + 1,
        school: normalizeString(edu?.school || edu?.institution || edu?.university).trim(),
        degree: normalizeString(edu?.degree).trim(),
        field: normalizeString(edu?.field || edu?.major || edu?.fieldOfStudy).trim(),
        startDate: normalizeString(edu?.startDate || edu?.start_date).trim(),
        endDate: normalizeString(edu?.endDate || edu?.end_date).trim(),
        description: edu?.description
          ? normalizeString(edu.description).trim()
          : (edu?.gpa ? `GPA: ${normalizeString(edu.gpa).trim()}` : '')
      }));
    }

    // Populate skills if available (must be string[] for builder + templates)
    const normalizedSkills = normalizeStringArray(profile.technical_skills);
    if (normalizedSkills.length > 0) {
      populatedData.skills = normalizedSkills;
    }

    // Populate projects if available - technologies MUST be string[] (templates call .map)
    if (Array.isArray(profile.projects) && profile.projects.length > 0) {
      populatedData.projects = profile.projects.map((proj: any, index: number) => ({
        id: index + 1,
        title: normalizeString(proj?.title || proj?.name).trim(),
        description: normalizeString(proj?.description).trim(),
        link: normalizeString(proj?.link || proj?.url).trim(),
        technologies: normalizeStringArray(proj?.technologies ?? proj?.tech_stack ?? proj?.stack)
      }));
    }

    // Populate certifications if available
    if (Array.isArray(profile.certifications) && profile.certifications.length > 0) {
      populatedData.certifications = profile.certifications.map((cert: any) => ({
        name: normalizeString(cert?.name || cert?.title).trim(),
        issuer: normalizeString(cert?.issuer || cert?.organization).trim(),
        date: normalizeString(cert?.date || cert?.issued_date).trim(),
        url: normalizeString(cert?.url || cert?.credential_url).trim()
      }));
    }

    // Populate volunteer experience if available
    if (Array.isArray(profile.volunteer_experience) && profile.volunteer_experience.length > 0) {
      populatedData.volunteer = profile.volunteer_experience.map((vol: any) => ({
        organization: normalizeString(vol?.organization || vol?.company).trim(),
        role: normalizeString(vol?.role || vol?.title).trim(),
        startDate: normalizeString(vol?.startDate || vol?.start_date).trim(),
        endDate: normalizeString(vol?.endDate || vol?.end_date).trim(),
        description: normalizeString(vol?.description).trim()
      }));
    }

    // Populate languages if available
    const normalizedLanguages = normalizeLanguages(profile.languages);
    if (normalizedLanguages.length > 0) {
      populatedData.languages = normalizedLanguages;
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