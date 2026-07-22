import { useState } from 'react';
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
import { Sparkles, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CoverLetterFormData } from '@/hooks/useCoverLetterData';
import { coverLetterTemplateNames } from '@/utils/coverLetterTemplates';
import { getEdgeFunctionErrorMessage } from '@/utils/edgeFunctionError';
import { JobDescriptionGenerator } from './JobDescriptionGenerator';

const TEMPLATE_OPTIONS = Object.entries(coverLetterTemplateNames).map(([value, label]) => ({ value, label }));

interface CoverLetterEditorProps {
  formData: CoverLetterFormData;
  setFormData: (data: CoverLetterFormData) => void;
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
  const [aiLoading, setAiLoading] = useState(false);

  const handleGenerateSuggestion = async () => {
    if (!formData.resume_id) {
      toast.info('Link a resume first to use AI suggestions.');
      return;
    }

    setAiLoading(true);
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

      if (funcError) throw new Error(await getEdgeFunctionErrorMessage(funcError, 'AI suggestion failed'));
      if (funcData?.error) throw new Error(funcData.error as string);
      if (funcData?.suggestion) {
        setFormData({ ...formData, content: funcData.suggestion });
        toast.success('AI suggestion generated!');
      }
    } catch (error: any) {
      toast.error('AI suggestion failed: ' + (error?.message || 'Unknown error'));
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
        onGenerated={(content) => setFormData({ ...formData, content })}
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
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            AI Suggest
          </Button>
        </div>
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
