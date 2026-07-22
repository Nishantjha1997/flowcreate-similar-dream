import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getEdgeFunctionErrorMessage } from '@/utils/edgeFunctionError';
import { JobDescriptionInput } from '@/components/JobDescriptionInput';

interface JobDescriptionGeneratorProps {
  resumeId: string | null;
  onGenerated: (content: string) => void;
}

export const JobDescriptionGenerator = ({ resumeId, onGenerated }: JobDescriptionGeneratorProps) => {
  const [jobDescription, setJobDescription] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!resumeId) {
      toast.info('Link a resume above first so the AI has your background to work from.');
      return;
    }
    if (jobDescription.trim().length < 40) {
      toast.error('Paste or upload the full job description first (at least a few sentences).');
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-suggest', {
        body: {
          context: 'cover_letter_from_jd',
          resumeId,
          jobDescription: jobDescription.trim(),
          maxTokens: 1200,
        },
      });

      if (error) throw new Error(await getEdgeFunctionErrorMessage(error, 'Failed to generate cover letter'));
      if (data?.error) throw new Error(data.error as string);
      if (!data?.suggestion) throw new Error('No response from AI');

      onGenerated(data.suggestion as string);
      toast.success('Cover letter drafted! Review and edit it below.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate cover letter.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-3 space-y-2.5">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <Label className="text-xs font-medium">Generate from a job description</Label>
      </div>
      <JobDescriptionInput
        value={jobDescription}
        onChange={setJobDescription}
        disabled={generating}
        rows={5}
        textareaClassName="text-xs font-mono bg-background resize-y"
      />
      <Button
        onClick={handleGenerate}
        disabled={generating}
        size="sm"
        className="w-full h-7 gap-1.5 text-xs"
      >
        {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
        {generating ? 'Writing...' : 'Generate Cover Letter'}
      </Button>
    </div>
  );
};
