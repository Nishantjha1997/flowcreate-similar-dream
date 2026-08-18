import { useState, type Dispatch, type SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Save } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CoverLetterFormData } from '@/hooks/useCoverLetterData';
import { coverLetterTemplateNames } from '@/utils/coverLetterTemplates';
import { getEdgeFunctionErrorMessage } from '@/utils/edgeFunctionError';
import { toastActionFailed, toastActionDone } from '@/utils/toastMessages';
import { JobDescriptionGenerator } from './JobDescriptionGenerator';
import { useAuth } from '@/hooks/useAuth';
import { useAIQuota } from '@/hooks/useAIQuota';
import { generateAIContent } from '@/utils/ai/universalAIGenerator';


const TEMPLATE_OPTIONS = Object.entries(coverLetterTemplateNames).map(([value, label]) => ({ value, label }));

interface CoverLetterEditorProps {
  formData: CoverLetterFormData;
  setFormData: Dispatch<SetStateAction<CoverLetterFormData>>;
  isSaving: boolean;
  onSave: () => void;
  userResumes: Array<{ id: string; resume_data: any }>;
}

export const CoverLetterEditor = ({
  formData,
  setFormData,
  isSaving,
  onSave,
  userResumes,
}: CoverLetterEditorProps) => {
  const { user } = useAuth();
  const quota = useAIQuota(user?.id);
  const [aiLoading, setAiLoading] = useState(false);

  const handleGenerateSuggestion = async () => {
    if (!quota.isLoading && !quota.canUse) {
      window.location.assign('/pricing');
      return;
    }

    if (!formData.resume_id) {
      toast.info('Link a resume first to use AI suggestions.');
      return;
    }

    setAiLoading(true);
    try {
      let suggestion = '';

      // 1. Try Edge Function first
      try {
        const { data: funcData, error: funcError } = await supabase.functions.invoke(
          'gemini-suggest',
          {
            body: {
              context: 'cover_letter',
              resumeId: formData.resume_id,
              currentContent: formData.content,
            },
          }
        );

        if (!funcError && funcData?.suggestion) {
          suggestion = funcData.suggestion;
        }
      } catch (efErr) {
        console.warn('[CoverLetterEditor] Edge function failed, trying direct generator:', efErr);
      }

      // 2. Direct Universal Generator Fallback
      if (!suggestion) {
        const { data: resumeRow } = await supabase
          .from('resumes')
          .select('resume_data')
          .eq('id', formData.resume_id)
          .maybeSingle();

        const rd = (resumeRow?.resume_data ?? {}) as Record<string, any>;
        const candidateName = rd?.personal?.name || 'the applicant';
        const jobTitle = rd?.experience?.[0]?.title || 'Professional';
        const prompt = `Write a compelling, professional cover letter for ${candidateName} applying for a ${jobTitle} position.
Candidate summary: ${rd?.personal?.summary || 'Not specified'}
Skills: ${Array.isArray(rd?.skills) ? rd.skills.join(', ') : 'Not specified'}
${formData.content ? `User drafted draft: ${formData.content}` : ''}
Return ONLY the completed cover letter text.`;

        const directResult = await generateAIContent({
          prompt,
          maxTokens: 1200,
          timeoutMs: 60000,
        });

        if (directResult.text) {
          suggestion = directResult.text;
        }
      }

      if (suggestion) {
        setFormData((prev) => ({ ...prev, content: suggestion }));
        void quota.refresh();
        toastActionDone('AI suggestion generated.');
      } else {
        throw new Error('No suggestion generated. Please check your API key in Admin > AI Providers.');
      }
    } catch (error: any) {
      toastActionFailed('generate an AI suggestion', error?.message, 'Try again in a moment.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-6">
      <div className="space-y-2">
        <Label htmlFor="cl-title">Cover Letter Title</Label>
        <Input
          id="cl-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Software Engineer at Google"
          className="bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cl-template">Template Style</Label>
        <Select
          value={formData.template_id}
          onValueChange={(v) => setFormData({ ...formData, template_id: v })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cl-resume">Link Resume (for AI context)</Label>
        <Select
          value={formData.resume_id || 'none'}
          onValueChange={(v) => setFormData({ ...formData, resume_id: v === 'none' ? null : v })}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="None — select a resume" />
          </SelectTrigger>
          <SelectContent>
            {/* Radix SelectItem throws if value="" - it reserves empty string for clearing the selection */}
            <SelectItem value="none">None</SelectItem>
            {userResumes.map((r) => {
              const name = r.resume_data?.personal?.name || 'Untitled Resume';
              return (
                <SelectItem key={r.id} value={r.id}>
                  {name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <JobDescriptionGenerator
        resumeId={formData.resume_id}
        currentContent={formData.content}
        onGenerated={(content) => setFormData((prev) => ({ ...prev, content }))}
        onOptionsChange={(options) => setFormData((prev) => ({ ...prev, customization: { ...prev.customization, ...options } }))}
      />

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="cl-content">Cover Letter Content</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSuggestion}
            disabled={aiLoading}
            className="h-7 gap-1 text-xs"
          >
            {aiLoading ? (
              <Spinner size="xs" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {!quota.isLoading && !quota.canUse ? 'Upgrade for AI' : 'AI Suggest'}
          </Button>
        </div>
        <p className="text-right text-xs text-muted-foreground">
          {quota.isLoading
            ? 'Checking AI quota...'
            : quota.isUnlimited
              ? 'Unlimited AI uses'
              : `${quota.used}/${quota.cap} AI uses / 30 days`}
        </p>
        <Textarea
          id="cl-content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in..."
          className="flex-1 min-h-[300px] font-mono text-sm leading-relaxed bg-background resize-y"
        />
      </div>

      <Button
        onClick={onSave}
        disabled={isSaving}
        className="w-full gap-2"
      >
        <Save className="h-4 w-4" />
        {isSaving ? 'Saving...' : 'Save Cover Letter'}
      </Button>
    </div>
  );
};
