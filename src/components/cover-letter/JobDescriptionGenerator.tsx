import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Upload, Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getEdgeFunctionErrorMessage } from '@/utils/edgeFunctionError';

interface JobDescriptionGeneratorProps {
  resumeId: string | null;
  onGenerated: (content: string) => void;
}

export const JobDescriptionGenerator = ({ resumeId, onGenerated }: JobDescriptionGeneratorProps) => {
  const [jobDescription, setJobDescription] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isText = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
    const isPdf = file.type === 'application/pdf';
    if (!isText && !isPdf) {
      toast.error('Please upload a PDF or plain text (.txt) file.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB.');
      event.target.value = '';
      return;
    }

    setUploading(true);
    try {
      let text: string;
      if (isText) {
        text = await file.text();
      } else {
        const formData = new FormData();
        formData.append('file', file);
        const { data, error } = await supabase.functions.invoke('extract-text-from-file', {
          body: formData,
        });
        if (error) throw new Error(await getEdgeFunctionErrorMessage(error, 'Failed to read the file'));
        if (data?.error) throw new Error(data.error as string);
        text = (data?.text as string) || '';
      }

      if (!text.trim()) {
        toast.error('Could not extract any text from that file. Try pasting it instead.');
        return;
      }

      setJobDescription(text);
      setFileName(file.name);
      toast.success('Job description loaded from file.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to read the file.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
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
      <Textarea
        placeholder="Paste the job description here, or upload a file below..."
        value={jobDescription}
        onChange={(e) => {
          setJobDescription(e.target.value);
          setFileName(null);
        }}
        rows={5}
        className="text-xs font-mono bg-background resize-y"
        disabled={generating}
      />
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".pdf,.txt,text/plain,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="jd-upload"
          disabled={uploading || generating}
        />
        <label htmlFor="jd-upload">
          <Button asChild variant="outline" size="sm" disabled={uploading || generating} className="h-7 text-xs">
            <span className="cursor-pointer gap-1.5 max-w-[140px] truncate">
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {fileName ?? 'Upload JD file'}
            </span>
          </Button>
        </label>
        <Button
          onClick={handleGenerate}
          disabled={generating || uploading}
          size="sm"
          className="flex-1 h-7 gap-1.5 text-xs"
        >
          {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
          {generating ? 'Writing...' : 'Generate Cover Letter'}
        </Button>
      </div>
    </div>
  );
};
