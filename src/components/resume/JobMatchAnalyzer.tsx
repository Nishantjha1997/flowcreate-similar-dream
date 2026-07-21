import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Target, Loader2, CheckCircle2, XCircle, Lightbulb, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ResumeData } from '@/utils/types';
import { captureError } from '@/lib/monitoring';

interface JobMatchAnalyzerProps {
  resume: ResumeData;
}

interface MatchResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

function buildResumeSummary(resume: ResumeData): string {
  const parts: string[] = [];
  if (resume.personal?.summary) parts.push(`Summary: ${resume.personal.summary}`);
  if (resume.skills?.length) parts.push(`Skills: ${resume.skills.join(', ')}`);
  if (resume.experience?.length) {
    parts.push(
      'Experience:\n' +
        resume.experience
          .map((e) => `- ${e.title} at ${e.company}: ${e.description}`)
          .join('\n')
    );
  }
  if (resume.education?.length) {
    parts.push('Education:\n' + resume.education.map((e) => `- ${e.degree}, ${e.school}`).join('\n'));
  }
  return parts.join('\n\n') || 'No resume content yet.';
}

function extractJson(text: string): any {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not parse AI response');
  return JSON.parse(match[0]);
}

export function JobMatchAnalyzer({ resume }: JobMatchAnalyzerProps) {
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (jobDescription.trim().length < 40) {
      toast.error('Paste the full job description first (at least a few sentences).');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const prompt = `You are an ATS resume-matching expert. Compare this candidate's resume against the job description and return ONLY a JSON object, no other text.

RESUME:
${buildResumeSummary(resume)}

JOB DESCRIPTION:
${jobDescription.trim().slice(0, 4000)}

Return exactly this JSON shape:
{"score": <0-100 integer match score>, "matchedKeywords": [<up to 10 skills/keywords from the job description already present in the resume>], "missingKeywords": [<up to 10 important skills/keywords from the job description missing from the resume>], "suggestions": [<3-5 short, specific, actionable suggestions to tailor this resume for this job>]}`;

      const { data, error: fnError } = await supabase.functions.invoke('gemini-suggest', {
        body: { prompt, maxTokens: 1200 },
      });

      if (fnError) throw new Error(fnError.message || 'AI request failed');
      if (data?.error) throw new Error(data.error as string);
      if (!data?.suggestion) throw new Error('No response from AI');

      const parsed = extractJson(data.suggestion as string);
      setResult({
        score: typeof parsed.score === 'number' ? Math.max(0, Math.min(100, parsed.score)) : 0,
        matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords.slice(0, 10) : [],
        missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.slice(0, 10) : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      // Server-side entitlement gating (free plan) surfaces as a plain error
      // message here - show it as-is rather than a generic failure.
      setError(message);
      captureError(err, { context: 'job_match_analyzer' });
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) =>
    score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-4 h-8 text-xs font-medium border-border/50 hover:bg-muted/60 transition-all duration-200"
        >
          <Target className="h-3.5 w-3.5 mr-1.5" />
          Job Match
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> AI Job Match Analyzer
          </DialogTitle>
          <DialogDescription>
            Paste a job description to see how well this resume matches, which keywords are missing, and how to
            tailor it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            disabled={loading}
          />

          <Button onClick={handleAnalyze} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
            {loading ? 'Analyzing...' : 'Analyze Match'}
          </Button>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive flex items-start gap-2">
              <Crown className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className={`text-4xl font-bold ${scoreColor(result.score)}`}>{result.score}%</div>
                <p className="text-sm text-muted-foreground">Match Score</p>
                <Progress value={result.score} className="mt-2" />
              </div>

              {result.matchedKeywords.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> Already in your resume
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedKeywords.map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-green-700 border-green-300 bg-green-50">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.missingKeywords.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-amber-600" /> Missing from your resume
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.suggestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-primary" /> Tailoring suggestions
                  </p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
                    {result.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
