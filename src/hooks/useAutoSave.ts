import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ResumeData } from '@/utils/types';
import { useResumeSave } from './useResumeSave';

interface UseAutoSaveProps {
  resume: ResumeData;
  editResumeId?: string | null;
  enabled?: boolean;
  interval?: number; // in milliseconds
}

export function useAutoSave({
  resume,
  editResumeId,
  enabled = true,
  interval = 30000 // 30 seconds
}: UseAutoSaveProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { handleSaveResume } = useResumeSave(editResumeId);
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastResumeRef = useRef<string>();

  const triggerAutoSave = async () => {
    if (!enabled) return;

    const currentResumeString = JSON.stringify(resume);
    
    // Skip if no changes
    if (currentResumeString === lastResumeRef.current) {
      return;
    }

    // Skip if required fields are missing
    if (!resume.personal?.name?.trim() || !resume.personal?.email?.trim()) {
      return;
    }

    try {
      setSaveStatus('saving');
      await handleSaveResume(resume);
      setSaveStatus('saved');
      setLastSaved(new Date());
      lastResumeRef.current = currentResumeString;
      
      // Reset to idle after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Auto-save failed:', error);
      
      // Reset to idle after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  };

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up auto-save interval
    intervalRef.current = setInterval(triggerAutoSave, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [resume, enabled, interval, editResumeId]);

  // Manual save function
  const manualSave = () => {
    triggerAutoSave();
  };

  return {
    saveStatus,
    lastSaved,
    manualSave
  };
}