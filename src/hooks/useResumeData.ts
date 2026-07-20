import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { ResumeData } from '@/utils/types';
import { exampleResumes } from '@/components/resume/ResumeData';
import { DEFAULT_KEY, getTemplate, resolveTemplateKey } from '@/templates/registry';

const defaultResumeData: ResumeData = {
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
};

export const useResumeData = () => {
  const [searchParams] = useSearchParams();
  const requestedTemplateId = searchParams.get('template');
  const isExample = searchParams.get('example') === 'true';
  const editResumeId = searchParams.get('edit');
  
  const [resume, setResume] = useState<ResumeData>(defaultResumeData);

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

  // Query-string selection wins, then the saved DB column, then resume_data.
  // This lets old edit links containing only ?edit=<id> reopen the correct
  // template and keeps the canonical key available to every save path.
  const templateId = resolveTemplateKey(
    requestedTemplateId
      || existingResume?.template_id
      || resume.selectedTemplate
      || DEFAULT_KEY,
  );

  // Load resume data based on context
  useEffect(() => {
    if (existingResume && existingResume.resume_data) {
      const savedData = existingResume.resume_data as unknown as ResumeData;
      setResume({
        ...savedData,
        customization: {
          ...defaultResumeData.customization,
          ...savedData.customization,
        },
        selectedTemplate: resolveTemplateKey(
          requestedTemplateId || existingResume.template_id || savedData.selectedTemplate,
        ),
      });
      return;
    }

    if (isExample) {
      if (exampleResumes[templateId]) {
        setResume({ ...exampleResumes[templateId], selectedTemplate: templateId });
      }
    } else if (!editResumeId) {
      let savedData: ResumeData | null = null;
      const savedResume = localStorage.getItem('resumeData');
      if (savedResume) {
        try {
          savedData = JSON.parse(savedResume) as ResumeData;
        } catch {
          localStorage.removeItem('resumeData');
        }
      }

      setResume((current) => {
        const base = savedData ?? current;
        const isTemplateChange = resolveTemplateKey(base.selectedTemplate) !== templateId;
        return {
          ...base,
          selectedTemplate: templateId,
          customization: {
            ...defaultResumeData.customization,
            ...base.customization,
            primaryColor: isTemplateChange
              ? getTemplate(templateId).defaultAccent
              : base.customization?.primaryColor || getTemplate(templateId).defaultAccent,
          },
        };
      });
    }
  // Template query changes are handled by the focused effect below; including
  // them here would reload resume_data and discard unsaved edits.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExample, existingResume, editResumeId]);

  // Template changes inside the builder must never reload the DB payload and
  // discard unsaved edits. Only update the selected design metadata here.
  useEffect(() => {
    if (!requestedTemplateId) return;
    const requestedKey = resolveTemplateKey(requestedTemplateId);
    setResume((current) => {
      if (resolveTemplateKey(current.selectedTemplate) === requestedKey) return current;
      return {
        ...current,
        selectedTemplate: requestedKey,
        customization: {
          ...current.customization,
          primaryColor: getTemplate(requestedKey).defaultAccent,
        },
      };
    });
  }, [requestedTemplateId]);

  // Save to localStorage
  useEffect(() => {
    if (!isExample && !editResumeId) {
      localStorage.setItem('resumeData', JSON.stringify(resume));
    }
  }, [resume, isExample, editResumeId]);

  return {
    resume,
    setResume,
    templateId,
    isExample,
    editResumeId,
    loadingExistingResume
  };
};
