import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
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
import { Target, Loader2, CheckCircle2, XCircle, Lightbulb, Crown, Wand2, History, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ResumeData } from '@/utils/types';
import { captureError } from '@/lib/monitoring';
import { getEdgeFunctionErrorMessage } from '@/utils/edgeFunctionError';
import { JobDescriptionInput } from '@/components/JobDescriptionInput';
import { useAuth } from '@/hooks/useAuth';
import { useAIQuota } from '@/hooks/useAIQuota';
import {
  applyJobRecommendation,
  hashJobDescription,
  normalizeJobMatchResult,
  type JobMatchResult,
  type JobRecommendation,
} from '@/utils/jobMatch';

interface JobMatchAnalyzerProps {
  resume: ResumeData;
  resumeId?: string | null;
  onResumeChange?: (resume: ResumeData) => Promise<void> | void;
  onCreateTailoredVersion?: (resume: ResumeData) => Promise<void>;
}

export function JobMatchAnalyzer({ resume, resumeId, onResumeChange, onCreateTailoredVersion }: JobMatchAnalyzerProps) {
  const { user } = useAuth();
  const quota = useAIQuota(user?.id);
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [workingResume, setWorkingResume] = useState(resume);

  useEffect(() => setWorkingResume(resume), [resume]);

  const history = useQuery({
    queryKey: ['job-match-reports', resumeId],
    enabled: !!resumeId,
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from('job_match_reports')
        .select('id, score, job_title, company, created_at, recommendations')
        .eq('resume_id', resumeId!)
        .order('created_at', { ascending: false })
        .limit(10);
      if (queryError) throw queryError;
      return data ?? [];
    },
  });

  const handleAnalyze = async () => {
    if (!quota.isLoading && !quota.canUse) {
      window.location.assign('/pricing');
      return;
    }

    if (jobDescription.trim().length < 40) {
      toast.error('Paste the full job description first (at least a few sentences).');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('gemini-suggest', {
        body: {
          context: 'job_match',
          resume,
          jobDescription: jobDescription.trim(),
          maxTokens: 1800,
        },
      });

      if (fnError) throw new Error(await getEdgeFunctionErrorMessage(fnError, 'AI request failed'));
      if (data?.error) throw new Error(data.error as string);
      if (!data?.suggestion) throw new Error('No response from AI');

      const parsed = data.jobMatch ?? JSON.parse(data.suggestion as string);
      const normalized = normalizeJobMatchResult(parsed);
      setResult(normalized);
      setAppliedIds([]);
      const jdHash = await hashJobDescription(jobDescription);
      const { data: report, error: reportError } = await supabase
        .from('job_match_reports')
        .insert({
          user_id: user?.id,
          resume_id: resumeId || null,
          jd_text: jobDescription.trim(),
          jd_hash: jdHash,
          score: normalized.score,
          score_breakdown: normalized.breakdown,
          matched_keywords: normalized.matchedKeywords,
          missing_keywords: normalized.missingKeywords,
          recommendations: normalized.recommendations,
        })
        .select('id')
        .maybeSingle();
      if (reportError) throw reportError;
      void history.refetch();
      void quota.refresh();
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

  const applyRecommendation = async (recommendation: JobRecommendation) => {
    const updated = applyJobRecommendation(workingResume, recommendation);
    if (!updated) {
      toast.error('This suggestion no longer matches the current resume text. Re-run the analysis.');
      return;
    }
    setWorkingResume(updated);
    await onResumeChange?.(updated);
    setAppliedIds((current) => [...new Set([...current, recommendation.id])]);
    toast.success('Approved change applied to your resume.');
  };

  const revertRecommendation = async (recommendation: JobRecommendation) => {
    if (recommendation.section === 'personal' && recommendation.type === 'improve_summary' && recommendation.currentText !== undefined) {
      const restored = { ...workingResume, personal: { ...workingResume.personal, summary: recommendation.currentText } };
      setWorkingResume(restored);
      await onResumeChange?.(restored);
    } else if (recommendation.section === 'experience' && typeof recommendation.entryIndex === 'number' && recommendation.currentText !== undefined) {
      const experience = workingResume.experience.map((entry, index) => index === recommendation.entryIndex
        ? { ...entry, description: recommendation.currentText }
        : entry);
      const restored = { ...workingResume, experience };
      setWorkingResume(restored);
      await onResumeChange?.(restored);
    } else if (recommendation.section === 'skills' && recommendation.skill) {
      const restored = {
        ...workingResume,
        skills: workingResume.skills.filter((skill) => skill.toLowerCase() !== recommendation.skill!.toLowerCase()),
      };
      setWorkingResume(restored);
      await onResumeChange?.(restored);
    }
    setAppliedIds((current) => current.filter((id) => id !== recommendation.id));
    toast.success('Change undone.');
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
          <JobDescriptionInput
            value={jobDescription}
            onChange={setJobDescription}
            disabled={loading}
            rows={8}
            placeholder="Paste the full job description here, or upload a file below..."
          />

          <Button onClick={handleAnalyze} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
            {loading ? 'Analyzing...' : !quota.isLoading && !quota.canUse ? 'Upgrade to Analyze' : 'Analyze Match'}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {quota.isLoading
              ? 'Checking AI quota...'
              : quota.isUnlimited
                ? 'Unlimited AI analyses'
                : `${quota.used}/${quota.cap} AI analyses / 30 days`}
          </p>

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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(result.breakdown).map(([label, value]) => (
                  <div key={label} className="rounded-lg border bg-muted/30 p-2 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold">{value}%</p>
                  </div>
                ))}
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

              {result.recommendations.length > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-1.5">
                        <Wand2 className="h-4 w-4 text-primary" /> Recommended fixes
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Review each change. FlowCreate never changes your resume silently.</p>
                    </div>
                    {onCreateTailoredVersion && resumeId && (
                      <Button size="sm" variant="outline" onClick={() => void onCreateTailoredVersion(workingResume)}>
                        Save tailored copy
                      </Button>
                    )}
                  </div>
                  {result.recommendations.map((recommendation) => {
                    const applied = appliedIds.includes(recommendation.id);
                    return (
                      <div key={recommendation.id} className="rounded-lg border bg-background p-3 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{recommendation.reason}</p>
                            {recommendation.currentText && (
                              <p className="mt-1 text-xs text-muted-foreground line-through">{recommendation.currentText}</p>
                            )}
                            <p className="mt-1 text-sm text-foreground">{recommendation.proposedText}</p>
                            {recommendation.evidence.length > 0 && (
                              <p className="mt-1 text-[11px] text-muted-foreground">Based on: {recommendation.evidence.join(', ')}</p>
                            )}
                          </div>
                          {applied ? (
                            <Button size="sm" variant="ghost" onClick={() => void revertRecommendation(recommendation)}>
                              <Undo2 className="h-3.5 w-3.5 mr-1" /> Undo
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => void applyRecommendation(recommendation)} disabled={!onResumeChange}>
                              <Wand2 className="h-3.5 w-3.5 mr-1" /> Apply
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {history.data && history.data.length > 1 && (
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium flex items-center gap-1.5 mb-2">
                    <History className="h-4 w-4" /> Score history
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {history.data.slice(0, 6).map((report) => (
                      <Badge key={report.id} variant="secondary">
                        {report.score}% · {new Date(report.created_at).toLocaleDateString()}
                      </Badge>
                    ))}
                  </div>
                  {history.data[1] && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Change from previous analysis: {result.score >= history.data[1].score ? '+' : ''}{result.score - history.data[1].score} points
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
