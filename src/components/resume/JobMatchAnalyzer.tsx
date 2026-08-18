import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AppDialogContent } from '@/components/ui/app-dialog';
import { Target, CheckCircle2, XCircle, Lightbulb, Crown, Wand2, History, Undo2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { ResumeData } from '@/utils/types';
import { captureError } from '@/lib/monitoring';
import { getEdgeFunctionErrorMessage } from '@/utils/edgeFunctionError';
import { JobDescriptionInput } from '@/components/JobDescriptionInput';
import { useAuth } from '@/hooks/useAuth';
import { useAIQuota } from '@/hooks/useAIQuota';
import { generateAIContent } from '@/utils/ai/universalAIGenerator';
import {
  applyJobRecommendation,
  buildAddSkillRecommendation,
  formatRoleAtCompany,
  hashJobDescription,
  normalizeJobMatchResult,
  type JobMatchResult,
  type JobRecommendation,
} from '@/utils/jobMatch';

interface JobMatchAnalyzerProps {
  resume: ResumeData;
  resumeId?: string | null;
  onResumeChange?: (resume: ResumeData) => Promise<void> | void;
  onCreateTailoredVersion?: (resume: ResumeData, suggestedName?: string) => Promise<void>;
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
      let parsed: any = null;

      // 1. Try Edge function first
      try {
        const { data, error: fnError } = await supabase.functions.invoke('gemini-suggest', {
          body: {
            context: 'job_match',
            resume,
            jobDescription: jobDescription.trim(),
            maxTokens: 1800,
          },
        });

        if (!fnError && (data?.jobMatch || data?.suggestion)) {
          parsed = data.jobMatch ?? JSON.parse(data.suggestion as string);
        }
      } catch (efErr) {
        console.warn('[JobMatchAnalyzer] Edge function failed, trying direct AI generator:', efErr);
      }

      // 2. Direct Universal AI Generator Fallback
      if (!parsed) {
        const rd = resume as Record<string, any>;
        const experience = Array.isArray(rd.experience)
          ? rd.experience.map((e: any, i: number) => `[${i}] ${e.title || ''} at ${e.company || ''}: ${e.description || ''}`).join('\n')
          : 'Not specified';

        const prompt = `You are an ATS resume-matching expert. Compare the resume to the job description. Return ONLY valid JSON with no markdown wrapping.
RESUME:
Summary: ${rd.personal?.summary || 'Not specified'}
Skills: ${Array.isArray(rd.skills) ? rd.skills.join(', ') : 'Not specified'}
Experience:\n${experience}
Education:\n${Array.isArray(rd.education) ? rd.education.map((e: any) => `- ${e.degree || ''}, ${e.school || ''}`).join('\n') : 'Not specified'}

JOB DESCRIPTION:\n${jobDescription.trim()}

Return this exact JSON shape:
{"score":75,"breakdown":{"skills":80,"experience":75,"keywords":70,"education":75},"matchedKeywords":[],"missingKeywords":[],"suggestions":[],"recommendations":[],"company":"","role":""}`;

        const directResult = await generateAIContent({
          prompt,
          maxTokens: 2000,
          timeoutMs: 60000,
        });

        if (directResult.text) {
          const cleanJson = directResult.text.replace(/```json|```/g, '').trim();
          parsed = JSON.parse(cleanJson);
        }
      }

      if (!parsed) {
        throw new Error('AI analysis failed. Please verify your active API key in Admin > AI Providers.');
      }

      const normalized = normalizeJobMatchResult(parsed);
      setResult(normalized);
      setAppliedIds([]);
      const jdHash = await hashJobDescription(jobDescription);
      const { data: report, error: reportError } = await supabase
        .from('job_match_reports')
        .insert({
          user_id: user?.id,
          resume_id: resumeId || null,
          job_title: normalized.role || null,
          company: normalized.company || null,
          jd_text: jobDescription.trim(),
          jd_hash: jdHash,
          score: normalized.score,
          score_breakdown: normalized.breakdown,
          matched_keywords: normalized.matchedKeywords,
          missing_keywords: normalized.missingKeywords,
          recommendations: normalized.recommendations as unknown as Json,
        })
        .select('id')
        .maybeSingle();
      if (reportError) throw reportError;
      void history.refetch();
      void quota.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
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
    score >= 75 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive';

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
      <AppDialogContent size="lg">
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
            {loading ? <Spinner size="sm" className="mr-2" /> : <Target className="h-4 w-4 mr-2" />}
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
                {formatRoleAtCompany(result.role, result.company) && (
                  <p className="text-sm font-medium text-foreground mb-1">
                    {formatRoleAtCompany(result.role, result.company)}
                  </p>
                )}
                <div className={`text-4xl font-bold ${scoreColor(result.score)}`}>{result.score}%</div>
                <p className="text-sm text-muted-foreground">Match Score</p>
                <Progress value={result.score} className="mt-2" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(result.breakdown).map(([label, value]) => (
                  <div key={label} className="rounded-lg border bg-muted/30 p-2 text-center">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold">{value}%</p>
                  </div>
                ))}
              </div>

              {result.matchedKeywords.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" /> Already in your resume
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedKeywords.map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-success border-success/30 bg-success/10">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {result.missingKeywords.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-warning" /> Missing from your resume
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((kw, i) => {
                      const recommendation = buildAddSkillRecommendation(kw);
                      const added = appliedIds.includes(recommendation.id);
                      return (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-warning border-warning/30 bg-warning/10 gap-1 pr-1"
                        >
                          {kw}
                          <button
                            type="button"
                            onClick={() => void (added ? revertRecommendation(recommendation) : applyRecommendation(recommendation))}
                            disabled={!onResumeChange}
                            className="ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium bg-warning/20 hover:bg-warning/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={onResumeChange ? undefined : 'Open this resume in the builder to apply changes'}
                          >
                            {added ? 'Added ✓' : '+ Add to skills'}
                          </button>
                        </Badge>
                      );
                    })}
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
                      <p className="text-xs text-muted-foreground mt-1">Review each change. MakeCV never changes your resume silently.</p>
                    </div>
                    {onCreateTailoredVersion && resumeId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void onCreateTailoredVersion(workingResume, formatRoleAtCompany(result.role, result.company) ?? undefined)}
                      >
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
                              <p className="mt-1 text-xs text-muted-foreground">Based on: {recommendation.evidence.join(', ')}</p>
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
                      Since your last analysis: {history.data[1].score}% → {result.score}%
                      {' '}({result.score >= history.data[1].score ? '+' : ''}{result.score - history.data[1].score} points)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </AppDialogContent>
    </Dialog>
  );
}
