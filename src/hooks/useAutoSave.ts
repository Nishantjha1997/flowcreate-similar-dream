import { useEffect, useRef, useState } from 'react';
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

  // Hold the latest resume in a ref so the interval callback always sees
  // current data without being recreated on every keystroke.
  const resumeRef = useRef<ResumeData>(resume);
  const saveHandlerRef = useRef(handleSaveResume);
  const lastSavedStringRef = useRef<string>();
  const savingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  // Track in-flight status-reset timers so we can cancel them on unmount.
  const statusTimerRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // Keep the ref in sync with the prop on every render.
  resumeRef.current = resume;
  saveHandlerRef.current = handleSaveResume;

  const triggerAutoSave = async () => {
    if (!enabled || savingRef.current) return;

    const current = resumeRef.current;
    const currentString = JSON.stringify(current);

    // Skip if no changes since last successful save.
    if (currentString === lastSavedStringRef.current) return;

    // Skip if required fields are missing.
    if (!current.personal?.name?.trim() || !current.personal?.email?.trim()) return;

    try {
      savingRef.current = true;
      if (mountedRef.current) setSaveStatus('saving');
      const didSave = await saveHandlerRef.current(current);
      if (!didSave) throw new Error('Save was not completed');
      lastSavedStringRef.current = currentString;
      if (mountedRef.current) {
        setSaveStatus('saved');
        setLastSaved(new Date());
      }
      // Reset to idle after 3 s; cancel if unmounted first.
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      statusTimerRef.current = setTimeout(() => {
        if (mountedRef.current) setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      if (mountedRef.current) setSaveStatus('error');
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      statusTimerRef.current = setTimeout(() => {
        if (mountedRef.current) setSaveStatus('idle');
      }, 5000);
    } finally {
      savingRef.current = false;
    }
  };

  // Set up the interval once per [enabled, interval, editResumeId] change.
  // `resume` is intentionally excluded — we read it via resumeRef inside
  // triggerAutoSave so the interval is never recreated on every keystroke.
  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(triggerAutoSave, interval);

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, interval, editResumeId]);

  const manualSave = () => {
    triggerAutoSave();
  };

  return {
    saveStatus,
    lastSaved,
    manualSave
  };
}
