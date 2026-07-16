import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface CoverLetter {
  id: string;
  user_id: string;
  resume_id: string | null;
  title: string;
  content: string;
  template_id: string;
  customization: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CoverLetterFormData {
  title: string;
  content: string;
  template_id: string;
  resume_id: string | null;
  customization: Record<string, any>;
}

const DEFAULT_COVER_LETTER: CoverLetterFormData = {
  title: 'Untitled Cover Letter',
  content: '',
  template_id: 'clean-slate',
  resume_id: null,
  customization: {},
};

export function useCoverLetterData() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CoverLetterFormData>(DEFAULT_COVER_LETTER);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing cover letter if editing
  const { data: existingLetter, isLoading } = useQuery({
    queryKey: ['coverLetter', editId],
    queryFn: async () => {
      if (!editId) return null;
      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('id', editId)
        .single();
      if (error) throw error;
      return data as CoverLetter;
    },
    enabled: !!editId,
  });

  // Populate form when existing data loads
  useEffect(() => {
    if (existingLetter) {
      setFormData({
        title: existingLetter.title || 'Untitled Cover Letter',
        content: existingLetter.content || '',
        template_id: existingLetter.template_id || 'clean-slate',
        resume_id: existingLetter.resume_id,
        customization: (existingLetter.customization as Record<string, any>) || {},
      });
    }
  }, [existingLetter]);

  // Fetch user's resumes for linking
  const { data: userResumes } = useQuery({
    queryKey: ['userResumes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('resumes')
        .select('id, resume_data')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const saveLetter = useCallback(async () => {
    if (!user?.id) {
      toast.error('You must be logged in to save.');
      return null;
    }

    setIsSaving(true);
    try {
      if (editId) {
        const { error } = await supabase
          .from('cover_letters')
          .update({
            title: formData.title,
            content: formData.content,
            template_id: formData.template_id,
            resume_id: formData.resume_id,
            customization: formData.customization as unknown as Json,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editId)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Cover letter saved!');
        queryClient.invalidateQueries({ queryKey: ['coverLetter', editId] });
        return editId;
      } else {
        const { data, error } = await supabase
          .from('cover_letters')
          .insert([{
            user_id: user.id,
            title: formData.title,
            content: formData.content,
            template_id: formData.template_id,
            resume_id: formData.resume_id,
            customization: formData.customization as unknown as Json,
          }])
          .select('id')
          .single();

        if (error) throw error;
        toast.success('Cover letter saved!');
        return data?.id || null;
      }
    } catch (error: any) {
      toast.error('Error saving: ' + (error?.message || 'Unknown error'));
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user, formData, editId, queryClient]);

  return {
    formData,
    setFormData,
    isSaving,
    saveLetter,
    isLoading,
    editId,
    userResumes: userResumes || [],
    userId: user?.id,
  };
}
