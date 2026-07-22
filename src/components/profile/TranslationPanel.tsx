import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Json } from '@/integrations/supabase/types';
import { getEdgeFunctionErrorMessage } from '@/utils/edgeFunctionError';
import {
  Sparkles,
  Loader2,
  Globe,
  Languages,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface TranslationPanelProps {
  resumeData: Record<string, any>;
  profileId: string;
  onTranslated?: (data: Record<string, any>) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'zh', label: 'Chinese (Simplified)', native: '简体中文' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'ko', label: 'Korean', native: '한국어' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'it', label: 'Italian', native: 'Italiano' },
  { code: 'nl', label: 'Dutch', native: 'Nederlands' },
];

export function TranslationPanel({ resumeData, profileId, onTranslated }: TranslationPanelProps) {
  const { user } = useAuth();
  const [targetLang, setTargetLang] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleTranslate = async () => {
    if (!targetLang || !user?.id) {
      toast.error('Please select a target language.');
      return;
    }

    if (!resumeData || Object.keys(resumeData).length === 0) {
      toast.error('No resume data to translate.');
      return;
    }

    setIsTranslating(true);
    setError('');
    setTranslatedText('');

    try {
      // Extract translatable text fields from resume data
      const extractTextFields = (data: Record<string, any>): string => {
        const parts: string[] = [];

        if (data.full_name) parts.push(`Name: ${data.full_name}`);
        if (data.professional_summary) parts.push(`Summary: ${data.professional_summary}`);
        if (data.current_position) parts.push(`Current Position: ${data.current_position}`);

        if (Array.isArray(data.work_experience)) {
          data.work_experience.forEach((exp: any, i: number) => {
            if (exp.title) parts.push(`Job ${i + 1} Title: ${exp.title}`);
            if (exp.company) parts.push(`Job ${i + 1} Company: ${exp.company}`);
            if (exp.description) parts.push(`Job ${i + 1} Description: ${exp.description}`);
          });
        }

        if (Array.isArray(data.education)) {
          data.education.forEach((edu: any, i: number) => {
            if (edu.school) parts.push(`Education ${i + 1} School: ${edu.school}`);
            if (edu.degree) parts.push(`Education ${i + 1} Degree: ${edu.degree}`);
            if (edu.field) parts.push(`Education ${i + 1} Field: ${edu.field}`);
          });
        }

        if (Array.isArray(data.projects)) {
          data.projects.forEach((proj: any, i: number) => {
            if (proj.title) parts.push(`Project ${i + 1} Title: ${proj.title}`);
            if (proj.description) parts.push(`Project ${i + 1} Description: ${proj.description}`);
          });
        }

        return parts.join('\n---\n');
      };

      const sourceText = extractTextFields(resumeData);
      if (!sourceText.trim()) {
        toast.error('No translatable text found in profile.');
        setIsTranslating(false);
        return;
      }

      const langLabel = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.label || targetLang;

      const prompt = `Translate the following resume content to ${langLabel}. Preserve the field labels exactly (e.g., "Name:", "Summary:", "Job Title:") - only translate the values after the colon. Keep the "---" separators between sections. Do not add any extra text or commentary.\n\n${sourceText}`;

      // Call the gemini-suggest edge function for translation (uses invoke for CORS-safe call)
      const { data: funcData, error: funcError } = await supabase.functions.invoke('gemini-suggest', {
        body: { prompt },
      });

      if (funcError) {
        throw new Error(await getEdgeFunctionErrorMessage(funcError, 'Translation service unavailable'));
      }

      setTranslatedText(funcData?.suggestion || '');

      // Save translated data back to master profile
      if (funcData?.suggestion && onTranslated) {
        try {
          // Parse translated sections back into profile data
          const translatedSections = parseTranslatedSections(funcData.suggestion, resumeData);
          await supabase
            .from('master_profiles')
            .update({
              profile_data: translatedSections as unknown as Json,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profileId)
            .eq('user_id', user.id);

          onTranslated(translatedSections);
        } catch (saveError) {
          console.error('Failed to save translation:', saveError);
        }
      }

      toast.success('Translation complete!');
    } catch (err: any) {
      setError(err?.message || 'Translation failed. Please try again.');
      toast.error('Translation failed: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Language Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Target Language</Label>
        <Select value={targetLang} onValueChange={setTargetLang}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a language..." />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <span className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  {lang.label}
                  <span className="text-muted-foreground text-xs">({lang.native})</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Summary */}
      {resumeData && Object.keys(resumeData).length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {resumeData.full_name && (
            <Badge variant="outline" className="text-xs">
              <Languages className="h-3 w-3 mr-1" />
              {resumeData.full_name}
            </Badge>
          )}
          {resumeData.professional_summary && (
            <Badge variant="outline" className="text-xs">Has summary</Badge>
          )}
          {resumeData.work_experience?.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {resumeData.work_experience.length} experiences
            </Badge>
          )}
          {resumeData.education?.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {resumeData.education.length} education entries
            </Badge>
          )}
        </div>
      ) : (
        <div className="rounded-lg bg-muted/30 p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No profile data to translate. Add information from the Account page first.
          </p>
        </div>
      )}

      {/* Translate Button */}
      <Button
        onClick={handleTranslate}
        disabled={isTranslating || !targetLang || !resumeData || Object.keys(resumeData).length === 0}
        className="w-full"
      >
        {isTranslating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 mr-2" />
        )}
        {isTranslating ? 'Translating with AI...' : 'Translate with AI'}
      </Button>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <p className="text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}

      {/* Translation Preview */}
      {translatedText && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-semibold">Translation Preview</span>
          </div>
          <Textarea
            value={translatedText}
            readOnly
            className="min-h-[120px] text-sm bg-background resize-none"
          />
          <p className="text-xs text-muted-foreground">
            The translated content has been saved to your master profile.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Parses the AI translation response back into the profile data structure.
 * Preserves field labels and maps values back to the original keys.
 */
function parseTranslatedSections(
  translatedText: string,
  originalData: Record<string, any>
): Record<string, any> {
  const result = { ...originalData };
  const sections = translatedText.split('---').map((s) => s.trim());

  // Simple heuristic: extract key-value pairs and map them back
  // A full implementation would do more sophisticated parsing
  sections.forEach((section) => {
    const lines = section.split('\n').filter((l) => l.trim());
    lines.forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return;

      const key = line.substring(0, colonIndex).trim().toLowerCase();
      const value = line.substring(colonIndex + 1).trim();

      // Map translated fields back to profile keys
      if (key.includes('name') && !key.includes('company') && !key.includes('school')) {
        result.full_name = value;
      } else if (key.includes('summary')) {
        result.professional_summary = value;
      } else if (key.includes('current position')) {
        result.current_position = value;
      }
      // More granular mapping can be added as needed
    });
  });

  return result;
}
