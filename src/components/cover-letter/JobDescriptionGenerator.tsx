import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getEdgeFunctionErrorMessage } from '@/utils/edgeFunctionError';
import { JobDescriptionInput } from '@/components/JobDescriptionInput';
import { Spinner } from '@/components/ui/spinner';
import { toastActionFailed, toastActionDone } from '@/utils/toastMessages';

interface JobDescriptionGeneratorOptions {
  tone: string;
  length: string;
  instructions: string;
  company: string;
  role: string;
}

interface JobDescriptionGeneratorProps {
  resumeId: string | null;
  currentContent: string;
  onGenerated: (content: string) => void;
  onOptionsChange?: (options: JobDescriptionGeneratorOptions) => void;
}

export const JobDescriptionGenerator = ({ resumeId, currentContent, onGenerated, onOptionsChange }: JobDescriptionGeneratorProps) => {
  const [jobDescription, setJobDescription] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('standard');
  const [instructions, setInstructions] = useState('');
  const [generating, setGenerating] = useState(false);

  const emitOptions = (overrides: Partial<JobDescriptionGeneratorOptions> = {}) => {
    onOptionsChange?.({ tone, length, instructions, company, role, ...overrides });
  };

  const handleGenerate = async () => {
    if (!resumeId) {
      toast.info('Link a resume above first so the AI has your background to work from.');
      return;
    }
    if (jobDescription.trim().length < 40) {
      toast.error('Paste or upload the full job description first (at least a few sentences).');
      return;
    }

    const previousContent = currentContent;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-suggest', {
        body: {
          context: 'cover_letter_from_jd',
          resumeId,
          jobDescription: jobDescription.trim(),
          company: company.trim(),
          role: role.trim(),
          tone,
          length,
          instructions: instructions.trim(),
          maxTokens: 1200,
        },
      });

      if (error) throw new Error(await getEdgeFunctionErrorMessage(error, 'Failed to generate cover letter'));
      if (data?.error) throw new Error(data.error as string);
      if (!data?.suggestion) throw new Error('No response from AI');

      onGenerated(data.suggestion as string);

      // A generation overwrites whatever the user had already written - never
      // let that be silently unrecoverable.
      if (previousContent.trim().length > 0) {
        toastActionDone('Cover letter drafted. Review and edit it below.', {
          action: {
            label: 'Undo',
            onClick: () => onGenerated(previousContent),
          },
        });
      } else {
        toastActionDone('Cover letter drafted. Review and edit it below.');
      }
    } catch (err: any) {
      toastActionFailed('generate the cover letter', err?.message, 'Try again in a moment.');
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
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Company (optional)</Label>
          <Input
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              emitOptions({ company: e.target.value });
            }}
            placeholder="e.g., Acme Corp"
            className="h-8 text-xs bg-background"
            disabled={generating}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Role (optional)</Label>
          <Input
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              emitOptions({ role: e.target.value });
            }}
            placeholder="e.g., Product Manager"
            className="h-8 text-xs bg-background"
            disabled={generating}
          />
        </div>
      </div>
      <JobDescriptionInput
        value={jobDescription}
        onChange={setJobDescription}
        disabled={generating}
        rows={5}
        textareaClassName="text-xs font-mono bg-background resize-y"
      />
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Tone</Label>
          <Select value={tone} onValueChange={(value) => { setTone(value); emitOptions({ tone: value }); }}>
            <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Length</Label>
          <Select value={length} onValueChange={(value) => { setLength(value); emitOptions({ length: value }); }}>
            <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short · 180 words</SelectItem>
              <SelectItem value="standard">Standard · 300 words</SelectItem>
              <SelectItem value="long">Detailed · 450 words</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Textarea
        value={instructions}
        onChange={(event) => {
          setInstructions(event.target.value);
          emitOptions({ instructions: event.target.value });
        }}
        placeholder="Optional: emphasize a specific project or skill"
        rows={2}
        className="text-xs bg-background"
        disabled={generating}
      />
      <Button
        onClick={handleGenerate}
        disabled={generating}
        size="sm"
        className="w-full h-7 gap-1.5 text-xs"
      >
        {generating ? <Spinner size="xs" /> : <Wand2 className="h-3 w-3" />}
        {generating ? 'Writing...' : 'Generate Cover Letter'}
      </Button>
    </div>
  );
};
