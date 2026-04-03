/**
 * Candidate-Job recommendation scoring engine.
 * Produces a 0-100 match score based on skills, experience level, and industry overlap.
 */

export interface CandidateProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  current_position: string | null;
  industry: string | null;
  experience_level: string | null;
  professional_summary: string | null;
  technical_skills: any;
  soft_skills: any;
  city: string | null;
  state: string | null;
  country: string | null;
  education: any;
  work_experience: any;
  certifications: any;
  projects: any;
  languages: any;
  avatar_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  website_url: string | null;
  profile_completeness: number | null;
  created_at: string;
  updated_at: string;
}

interface JobContext {
  title: string;
  description: string;
  requirements: string | null;
  experience_level: string | null;
  industry?: string | null;
  requiredSkills?: string[];
}

/** Normalize skill arrays from various JSON shapes */
function extractSkills(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((s: any) => {
      if (typeof s === 'string') return s.toLowerCase().trim();
      if (s && typeof s === 'object' && s.name) return String(s.name).toLowerCase().trim();
      if (s && typeof s === 'object' && s.skill) return String(s.skill).toLowerCase().trim();
      return '';
    }).filter(Boolean);
  }
  return [];
}

/** Extract keywords from text (requirements, description) */
function extractKeywords(text: string): string[] {
  if (!text) return [];
  // Common tech keywords / patterns
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\+\#\.]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .filter((v, i, a) => a.indexOf(v) === i);
}

/** Experience level numerical mapping for distance calc */
const EXP_LEVELS: Record<string, number> = {
  entry: 1, junior: 1, intern: 0,
  mid: 2, 'mid-level': 2, intermediate: 2,
  senior: 3, lead: 3,
  executive: 4, director: 4, manager: 3,
};

function expLevelValue(level: string | null): number {
  if (!level) return -1;
  return EXP_LEVELS[level.toLowerCase()] ?? -1;
}

/**
 * Score a candidate against a job context (0-100).
 */
export function scoreCandidate(candidate: CandidateProfile, job: JobContext): number {
  let score = 0;
  let maxScore = 0;

  // 1. Technical skills overlap (weight: 40)
  const candidateSkills = extractSkills(candidate.technical_skills);
  const candidateSoftSkills = extractSkills(candidate.soft_skills);
  const allCandidateSkills = [...candidateSkills, ...candidateSoftSkills];

  let jobSkills = job.requiredSkills?.map(s => s.toLowerCase().trim()) || [];
  if (jobSkills.length === 0 && job.requirements) {
    // Extract from requirements text
    const reqKeywords = extractKeywords(job.requirements);
    const descKeywords = extractKeywords(job.description);
    const titleKeywords = extractKeywords(job.title);
    jobSkills = [...new Set([...titleKeywords, ...reqKeywords.slice(0, 30), ...descKeywords.slice(0, 20)])];
  }

  if (jobSkills.length > 0 && allCandidateSkills.length > 0) {
    const matchCount = jobSkills.filter(js =>
      allCandidateSkills.some(cs => cs.includes(js) || js.includes(cs))
    ).length;
    const skillScore = Math.min((matchCount / Math.max(jobSkills.length, 1)) * 40, 40);
    score += skillScore;
  }
  maxScore += 40;

  // 2. Experience level match (weight: 20)
  const candidateExp = expLevelValue(candidate.experience_level);
  const jobExp = expLevelValue(job.experience_level);
  if (candidateExp >= 0 && jobExp >= 0) {
    const diff = Math.abs(candidateExp - jobExp);
    score += Math.max(20 - diff * 8, 0);
  } else if (candidateExp >= 0 || jobExp >= 0) {
    score += 10; // partial credit
  }
  maxScore += 20;

  // 3. Profile completeness bonus (weight: 15)
  const completeness = candidate.profile_completeness || 0;
  score += (completeness / 100) * 15;
  maxScore += 15;

  // 4. Work experience relevance (weight: 15)
  const workExp = Array.isArray(candidate.work_experience) ? candidate.work_experience : [];
  if (workExp.length > 0) {
    const titleKeywords = extractKeywords(job.title);
    const hasRelevantExp = workExp.some((exp: any) => {
      const expTitle = String(exp.title || exp.position || exp.role || '').toLowerCase();
      return titleKeywords.some(kw => expTitle.includes(kw));
    });
    score += hasRelevantExp ? 15 : Math.min(workExp.length * 2, 8);
  }
  maxScore += 15;

  // 5. Education / certifications (weight: 10)
  const edu = Array.isArray(candidate.education) ? candidate.education : [];
  const certs = Array.isArray(candidate.certifications) ? candidate.certifications : [];
  score += Math.min((edu.length * 3) + (certs.length * 2), 10);
  maxScore += 10;

  return Math.round(Math.min((score / maxScore) * 100, 100));
}

/**
 * Score and rank candidates for a job, returning sorted results.
 */
export function rankCandidates(
  candidates: CandidateProfile[],
  job: JobContext
): Array<CandidateProfile & { matchScore: number }> {
  return candidates
    .map(c => ({ ...c, matchScore: scoreCandidate(c, job) }))
    .sort((a, b) => b.matchScore - a.matchScore);
}
