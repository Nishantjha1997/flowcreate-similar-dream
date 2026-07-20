import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { ResumeData } from '@/utils/types';
import { useAuth } from "@/hooks/useAuth";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { useResumeCount } from "@/hooks/useResumeLimit";
import { useEntitlements } from "@/hooks/useEntitlements";
import { resolveTemplateKey } from '@/templates/registry';

export const useResumeSave = (editResumeId?: string | null) => {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  const { data: premium, isLoading: loadingPremium } = usePremiumStatus(userId);
  const { data: resumeCount, isLoading: loadingCount, refetch: refetchResumeCount } = useResumeCount(userId);
  const { data: entitlements } = useEntitlements(userId);

  const handleSaveResume = async (resume: ResumeData): Promise<{ success: boolean; resumeId?: string }> => {
    if (!userId) {
      toast.error("Please log in to save your resume.");
      return { success: false };
    }

    if (loadingPremium || loadingCount) {
      toast.warning("Checking your plan...");
      return { success: false };
    }

    setIsSaving(true);

    try {
      if (editResumeId) {
        // Update existing resume
        const { error } = await supabase
          .from("resumes")
          .update({
            resume_data: resume as unknown as Json,
            template_id: resolveTemplateKey(resume.selectedTemplate),
            updated_at: new Date().toISOString()
          })
          .eq('id', editResumeId)
          .eq('user_id', userId);

        if (error) {
          toast.error("Error updating resume: " + error.message);
          return { success: false };
        } else {
          toast.success("Resume updated successfully!");
          return { success: true, resumeId: editResumeId };
        }
      } else {
        // Create new resume - enforce the plan's resume limit (-1 = unlimited).
        // Entitlements come from the subscription_plans catalog; if they
        // haven't loaded yet, fall back to the legacy premium check so
        // premium users are never blocked by a slow query.
        // The legacy boolean remains authoritative for manually granted users.
        // Older admin grants set is_premium=true without attaching a plan row,
        // which can otherwise resolve to the free plan's one-resume limit.
        const maxResumes = premium?.isPremium
          ? -1
          : (entitlements?.limits.max_resumes ?? 1);
        if (maxResumes !== -1 && resumeCount >= maxResumes) {
          toast.error(
            maxResumes === 1
              ? "The free plan includes 1 saved resume. Upgrade on the Pricing page for unlimited resumes, or delete your existing one."
              : `Your plan allows ${maxResumes} saved resumes. Upgrade on the Pricing page for more.`
          );
          return { success: false };
        }

        // Insert new resume
        const { data, error } = await supabase
          .from("resumes")
          .insert([
            {
              user_id: userId,
              resume_data: resume as unknown as Json,
              template_id: resolveTemplateKey(resume.selectedTemplate),
            }
          ])
          .select('id')
          .single();

        if (error) {
          toast.error("Error saving resume: " + error.message);
          return { success: false };
        } else {
          toast.success("Resume saved successfully!");
          refetchResumeCount();
          return { success: true, resumeId: data.id };
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIFeatureUpsell = () => {
    if (!premium?.isPremium) {
      toast.info("AI-powered suggestions are a Premium feature. See the Pricing page to upgrade and unlock them.");
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
