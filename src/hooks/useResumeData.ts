import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { ResumeData } from '@/utils/types';
import { exampleResumes, templateNames } from '@/components/resume/ResumeData';

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
  const templateId = searchParams.get('template') || '1';
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

  // Load resume data based on context
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
      
      if (exampleResumes[templateId]) {
        setResume(exampleResumes[templateId]);
      }
    }
  }, [templateId, isExample, existingResume, editResumeId]);

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