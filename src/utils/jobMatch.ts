import type { ResumeData } from '@/utils/types';

export type JobRecommendationType =
  | 'rewrite_bullet'
  | 'improve_summary'
  | 'add_skill'
  | 'grammar'
  | 'remove_repetition';

export interface JobRecommendation {
  id: string;
  type: JobRecommendationType;
  section: 'experience' | 'personal' | 'skills';
  entryIndex?: number;
  skill?: string;
  currentText?: string;
  proposedText: string;
  reason: string;
  evidence: string[];
  confidence: number;
  requiresConfirmation: true;
}

export interface JobMatchResult {
  score: number;
  breakdown: {
    skills: number;
    experience: number;
    keywords: number;
    education: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  recommendations: JobRecommendation[];
}

const recommendationTypes = new Set<JobRecommendationType>([
  'rewrite_bullet', 'improve_summary', 'add_skill', 'grammar', 'remove_repetition',
]);

function strings(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim()).slice(0, max);
}

export function normalizeJobMatchResult(value: unknown): JobMatchResult {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const breakdown = (raw.breakdown && typeof raw.breakdown === 'object' ? raw.breakdown : {}) as Record<string, unknown>;
  const number = (input: unknown, fallback = 0) => typeof input === 'number' && Number.isFinite(input)
    ? Math.max(0, Math.min(100, Math.round(input))) : fallback;
  const recommendations: JobRecommendation[] = Array.isArray(raw.recommendations)
    ? raw.recommendations.flatMap((item, index) => {
      if (!item || typeof item !== 'object') return [];
      const candidate = item as Record<string, unknown>;
      const type = candidate.type;
      const section = candidate.section;
      const proposedText = typeof candidate.proposedText === 'string' ? candidate.proposedText.trim() : '';
      if (!recommendationTypes.has(type as JobRecommendationType) ||
          !['experience', 'personal', 'skills'].includes(String(section)) || !proposedText) return [];
      return [{
        id: typeof candidate.id === 'string' ? candidate.id : `recommendation-${index + 1}`,
        type: type as JobRecommendationType,
        section: section as JobRecommendation['section'],
        entryIndex: typeof candidate.entryIndex === 'number' ? Math.max(0, Math.floor(candidate.entryIndex)) : undefined,
        skill: typeof candidate.skill === 'string' ? candidate.skill.trim() : undefined,
        currentText: typeof candidate.currentText === 'string' ? candidate.currentText : undefined,
        proposedText,
        reason: typeof candidate.reason === 'string' ? candidate.reason.trim().slice(0, 500) : 'Suggested improvement',
        evidence: strings(candidate.evidence, 4),
        confidence: number(candidate.confidence, 70) / 100,
        requiresConfirmation: true as const,
      }];
    }).slice(0, 12) : [];

  return {
    score: number(raw.score),
    breakdown: {
      skills: number(breakdown.skills),
      experience: number(breakdown.experience),
      keywords: number(breakdown.keywords),
      education: number(breakdown.education),
    },
    matchedKeywords: strings(raw.matchedKeywords, 15),
    missingKeywords: strings(raw.missingKeywords, 15),
    suggestions: strings(raw.suggestions, 8),
    recommendations,
  };
}

export function applyJobRecommendation(resume: ResumeData, recommendation: JobRecommendation): ResumeData | null {
  const next = structuredClone(resume) as ResumeData;
  if (recommendation.section === 'personal' && recommendation.type === 'improve_summary') {
    if (recommendation.currentText && next.personal.summary !== recommendation.currentText) return null;
    next.personal.summary = recommendation.proposedText;
    return next;
  }
  if (recommendation.section === 'skills' && recommendation.type === 'add_skill') {
    const skill = recommendation.skill || recommendation.proposedText;
    if (!skill || next.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) return next;
    next.skills = [...next.skills, skill];
    return next;
  }
  if (recommendation.section === 'experience' && typeof recommendation.entryIndex === 'number') {
    const entry = next.experience[recommendation.entryIndex];
    if (!entry || !recommendation.currentText || entry.description !== recommendation.currentText) return null;
    entry.description = recommendation.proposedText;
    return next;
  }
  return null;
}

export async function hashJobDescription(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
