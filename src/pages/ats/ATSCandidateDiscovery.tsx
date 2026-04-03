import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  ArrowLeft, Search, Users, MapPin, Briefcase, GraduationCap,
  Star, Filter, ChevronDown, ExternalLink, Sparkles, UserCheck, Globe, Github
} from 'lucide-react';
import Header from '@/components/Header';
import { CandidateProfile, scoreCandidate, rankCandidates } from '@/utils/candidateScoring';

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  experience_level: string | null;
}

const ATSCandidateDiscovery = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expFilter, setExpFilter] = useState<string>('all');
  const [selectedJobId, setSelectedJobId] = useState<string>('none');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/ats/login'); return; }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    if (!user) return;
    try {
      // Check org membership
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!membership) { navigate('/ats/onboarding'); return; }

      // Load discoverable candidates and org jobs in parallel
      const [candidatesRes, jobsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, user_id, full_name, current_position, industry, experience_level, professional_summary, technical_skills, soft_skills, city, state, country, education, work_experience, certifications, projects, languages, avatar_url, linkedin_url, github_url, portfolio_url, website_url, profile_completeness, created_at, updated_at')
          .eq('is_discoverable', true)
          .not('full_name', 'is', null)
          .order('updated_at', { ascending: false }),
        supabase
          .from('jobs')
          .select('id, title, description, requirements, experience_level')
          .eq('organization_id', membership.organization_id)
          .in('status', ['published', 'active', 'draft'])
          .order('created_at', { ascending: false })
      ]);

      if (candidatesRes.error) throw candidatesRes.error;
      setCandidates((candidatesRes.data || []) as unknown as CandidateProfile[]);
      setJobs(jobsRes.data || []);
    } catch (error: any) {
      toast({ title: "Error loading candidates", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;

  const scoredCandidates = useMemo(() => {
    let filtered = candidates;

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => {
        const skills = Array.isArray(c.technical_skills) ? c.technical_skills.join(' ').toLowerCase() : '';
        return (
          (c.full_name || '').toLowerCase().includes(q) ||
          (c.current_position || '').toLowerCase().includes(q) ||
          (c.professional_summary || '').toLowerCase().includes(q) ||
          (c.industry || '').toLowerCase().includes(q) ||
          skills.includes(q)
        );
      });
    }

    // Experience filter
    if (expFilter !== 'all') {
      filtered = filtered.filter(c => c.experience_level === expFilter);
    }

    // Score against selected job
    if (selectedJob) {
      return rankCandidates(filtered, {
        title: selectedJob.title,
        description: selectedJob.description,
        requirements: selectedJob.requirements,
        experience_level: selectedJob.experience_level,
      });
    }

    return filtered.map(c => ({ ...c, matchScore: 0 }));
  }, [candidates, searchQuery, expFilter, selectedJob]);

  const extractSkillsList = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map((s: any) => typeof s === 'string' ? s : s?.name || s?.skill || '').filter(Boolean);
    return [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading candidate pool...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/ats/dashboard')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-primary" />
              Candidate Discovery
            </h1>
            <p className="text-muted-foreground">
              Browse {candidates.length} candidates who've opted in • Match against your jobs for AI-powered scoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              <Users className="h-3.5 w-3.5 mr-1" />
              {scoredCandidates.length} results
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, skills, position, industry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={expFilter} onValueChange={setExpFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Match against job..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No job matching</SelectItem>
                  {jobs.map(j => (
                    <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {scoredCandidates.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Candidates Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms or filters' : 'No candidates have opted into discovery yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {scoredCandidates.map((candidate) => {
              const skills = extractSkillsList(candidate.technical_skills);
              const workExp = Array.isArray(candidate.work_experience) ? candidate.work_experience : [];

              return (
                <Card
                  key={candidate.id}
                  className="hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 flex-shrink-0">
                        <AvatarImage src={candidate.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {(candidate.full_name || '?').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-lg">{candidate.full_name}</h3>
                            <p className="text-muted-foreground text-sm">
                              {candidate.current_position || 'No position listed'}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {(candidate.city || candidate.country) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {[candidate.city, candidate.state, candidate.country].filter(Boolean).join(', ')}
                                </span>
                              )}
                              {candidate.experience_level && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {candidate.experience_level}
                                </Badge>
                              )}
                              {candidate.industry && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {candidate.industry}
                                </span>
                              )}
                            </div>
                          </div>

                          {selectedJob && candidate.matchScore > 0 && (
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className={`text-2xl font-bold ${
                                candidate.matchScore >= 70 ? 'text-green-600' :
                                candidate.matchScore >= 40 ? 'text-amber-600' : 'text-muted-foreground'
                              }`}>
                                {candidate.matchScore}%
                              </div>
                              <span className="text-xs text-muted-foreground">Match</span>
                              <Progress 
                                value={candidate.matchScore} 
                                className="w-16 h-1.5 mt-1" 
                              />
                            </div>
                          )}
                        </div>

                        {/* Skills */}
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {skills.slice(0, 8).map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs font-normal">
                                {typeof skill === 'string' ? skill : String(skill)}
                              </Badge>
                            ))}
                            {skills.length > 8 && (
                              <Badge variant="outline" className="text-xs">
                                +{skills.length - 8} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Summary preview */}
                        {candidate.professional_summary && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {candidate.professional_summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Candidate Detail Modal */}
        <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            {selectedCandidate && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedCandidate.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                        {(selectedCandidate.full_name || '?').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="text-xl">{selectedCandidate.full_name}</DialogTitle>
                      <DialogDescription>
                        {selectedCandidate.current_position || 'No position listed'}
                        {selectedCandidate.industry && ` • ${selectedCandidate.industry}`}
                      </DialogDescription>
                    </div>
                    {selectedJob && (selectedCandidate as any).matchScore > 0 && (
                      <div className="ml-auto text-center">
                        <div className={`text-3xl font-bold ${
                          (selectedCandidate as any).matchScore >= 70 ? 'text-green-600' :
                          (selectedCandidate as any).matchScore >= 40 ? 'text-amber-600' : 'text-muted-foreground'
                        }`}>
                          {(selectedCandidate as any).matchScore}%
                        </div>
                        <span className="text-xs text-muted-foreground">Match Score</span>
                      </div>
                    )}
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Location & Links */}
                  <div className="flex flex-wrap gap-3">
                    {(selectedCandidate.city || selectedCandidate.country) && (
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {[selectedCandidate.city, selectedCandidate.state, selectedCandidate.country].filter(Boolean).join(', ')}
                      </Badge>
                    )}
                    {selectedCandidate.experience_level && (
                      <Badge variant="outline" className="capitalize">{selectedCandidate.experience_level} level</Badge>
                    )}
                    {selectedCandidate.linkedin_url && (
                      <a href={selectedCandidate.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-primary/10">
                          <ExternalLink className="h-3 w-3" /> LinkedIn
                        </Badge>
                      </a>
                    )}
                    {selectedCandidate.github_url && (
                      <a href={selectedCandidate.github_url} target="_blank" rel="noopener noreferrer">
                        <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-primary/10">
                          <Github className="h-3 w-3" /> GitHub
                        </Badge>
                      </a>
                    )}
                    {selectedCandidate.portfolio_url && (
                      <a href={selectedCandidate.portfolio_url} target="_blank" rel="noopener noreferrer">
                        <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-primary/10">
                          <Globe className="h-3 w-3" /> Portfolio
                        </Badge>
                      </a>
                    )}
                  </div>

                  {/* Summary */}
                  {selectedCandidate.professional_summary && (
                    <div>
                      <h4 className="font-semibold mb-2">Professional Summary</h4>
                      <p className="text-sm text-muted-foreground">{selectedCandidate.professional_summary}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {extractSkillsList(selectedCandidate.technical_skills).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {extractSkillsList(selectedCandidate.technical_skills).map((skill, i) => (
                          <Badge key={i} variant="secondary">{String(skill)}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {extractSkillsList(selectedCandidate.soft_skills).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Soft Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {extractSkillsList(selectedCandidate.soft_skills).map((skill, i) => (
                          <Badge key={i} variant="outline">{String(skill)}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Experience */}
                  {Array.isArray(selectedCandidate.work_experience) && selectedCandidate.work_experience.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" /> Work Experience
                      </h4>
                      <div className="space-y-3">
                        {selectedCandidate.work_experience.slice(0, 5).map((exp: any, i: number) => (
                          <div key={i} className="border-l-2 border-primary/30 pl-3">
                            <p className="font-medium text-sm">{exp.title || exp.position || exp.role || 'Untitled'}</p>
                            <p className="text-xs text-muted-foreground">
                              {exp.company || exp.organization || 'Unknown Company'}
                              {exp.startDate && ` • ${exp.startDate}`}
                              {exp.endDate && ` - ${exp.endDate}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {Array.isArray(selectedCandidate.education) && selectedCandidate.education.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> Education
                      </h4>
                      <div className="space-y-2">
                        {selectedCandidate.education.map((edu: any, i: number) => (
                          <div key={i} className="border-l-2 border-primary/30 pl-3">
                            <p className="font-medium text-sm">{edu.degree || edu.field || 'Degree'}</p>
                            <p className="text-xs text-muted-foreground">
                              {edu.school || edu.institution || ''}
                              {edu.year && ` • ${edu.year}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Profile Completeness */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">Profile Completeness</h4>
                      <span className="text-sm text-muted-foreground">{selectedCandidate.profile_completeness || 0}%</span>
                    </div>
                    <Progress value={selectedCandidate.profile_completeness || 0} className="h-2" />
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ATSCandidateDiscovery;
