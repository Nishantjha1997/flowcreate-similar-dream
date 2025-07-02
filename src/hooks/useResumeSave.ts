import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { ResumeData } from '@/utils/types';
import { useAuth } from "@/hooks/useAuth";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useResumeCount } from "@/hooks/useResumeLimit";

export const useResumeSave = (editResumeId?: string | null) => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  const { data: premium, isLoading: loadingPremium } = usePremiumStatus(userId);
  const { data: resumeCount, isLoading: loadingCount, refetch: refetchResumeCount } = useResumeCount(userId);

  const handleSaveResume = async (resume: ResumeData) => {
    if (!userId) {
      toast.error("Please log in to save your resume.");
      return;
    }

    if (loadingPremium || loadingCount) {
      toast.warning("Checking your plan...");
      return;
    }

    setIsSaving(true);

    try {
      if (editResumeId) {
        // Update existing resume
        const { error } = await supabase
          .from("resumes")
          .update({
            resume_data: resume as unknown as Json,
            updated_at: new Date().toISOString()
          })
          .eq('id', editResumeId)
          .eq('user_id', userId);

        if (error) {
          toast.error("Error updating resume: " + error.message);
        } else {
          toast.success("Resume updated successfully!");
        }
      } else {
        // Create new resume - Check limits for free users
        if (!premium?.isPremium && resumeCount >= 1) {
          toast.error("Free users can only save 1 resume. Please delete your existing resume or upgrade to Premium to save more.");
          return;
        }

        // Insert new resume
        const { error } = await supabase
          .from("resumes")
          .insert([
            {
              user_id: userId,
              resume_data: resume as unknown as Json,
            }
          ]);

        if (error) {
          toast.error("Error saving resume: " + error.message);
        } else {
          toast.success("Resume saved successfully!");
          refetchResumeCount();
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIFeatureUpsell = () => {
    if (!premium?.isPremium) {
      toast.info("AI features are available with Premium! Upgrade for just ₹199/month to unlock AI-powered resume suggestions.");
    }
  };

  return {
    isSaving,
    handleSaveResume,
    handleAIFeatureUpsell,
    premium,
    resumeCount,
    loadingPremium,
    loadingCount
  };
};