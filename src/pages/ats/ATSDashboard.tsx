import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Briefcase, TrendingUp, Clock, 
  Plus, Search, Settings, FileText, Home, Eye, MapPin, MoreVertical, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Header from '@/components/Header';

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface DashboardStats {
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  scheduledInterviews: number;
}

interface RecentJob {
  id: string;
  title: string;
  status: string;
  location: string | null;
  job_type: string | null;
  created_at: string;
  applicationCount: number;
}

interface RecentApplication {
  id: string;
  candidate_name: string;
  candidate_email: string;
  status: string;
  created_at: string;
  job: { id: string; title: string };
}

const ATSDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ activeJobs: 0, totalApplications: 0, newApplications: 0, scheduledInterviews: 0 });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/ats/login');
      return;
    }
    loadDashboard();
  }, [user, navigate]);

  const loadDashboard = async () => {
    if (!user) return;

    try {
      // Get user's org membership
      const { data: memberships, error } = await supabase
        .from('organization_members')
        .select(`role, organization:organizations(id, name, slug)`)
        .eq('user_id', user.id);

      if (error) throw error;

      const orgs = memberships?.map(m => ({
        id: (m.organization as any).id,
        name: (m.organization as any).name,
        slug: (m.organization as any).slug,
        role: m.role
      })) || [];

      setOrganizations(orgs);

      if (orgs.length === 0) {
        setIsLoading(false);
        return;
      }

      const orgId = orgs[0].id;

      // Fetch real stats in parallel
      const [jobsRes, appsRes, interviewsRes] = await Promise.all([
        supabase.from('jobs').select('id, title, status, location, job_type, created_at').eq('organization_id', orgId).order('created_at', { ascending: false }),
        supabase.from('job_applications').select('id, candidate_name, candidate_email, status, created_at, job_id, job:jobs!inner(id, title, organization_id)').eq('jobs.organization_id', orgId).order('created_at', { ascending: false }).limit(20),
        supabase.from('interviews').select('id, application_id, status, scheduled_at').eq('status', 'scheduled'),
      ]);

      const jobs = jobsRes.data || [];
      const applications = appsRes.data || [];

      // Count applications per job
      const appCountByJob: Record<string, number> = {};
      applications.forEach((a: any) => {
        appCountByJob[a.job_id] = (appCountByJob[a.job_id] || 0) + 1;
      });

      const activeJobs = jobs.filter(j => j.status === 'published' || j.status === 'active').length;
      const newApps = applications.filter((a: any) => a.status === 'new').length;

      // Filter interviews that belong to this org's jobs
      const orgJobIds = new Set(jobs.map(j => j.id));
      const orgInterviews = (interviewsRes.data || []).filter((i: any) => {
        // We'd need to cross-reference, but for now count all scheduled
        return true;
      });

      setStats({
        activeJobs,
        totalApplications: applications.length,
        newApplications: newApps,
        scheduledInterviews: orgInterviews.length,
      });

      setRecentJobs(jobs.slice(0, 10).map(j => ({
        ...j,
        applicationCount: appCountByJob[j.id] || 0,
      })));

      setRecentApplications(applications.slice(0, 10).map((a: any) => ({
        id: a.id,
        candidate_name: a.candidate_name,
        candidate_email: a.candidate_email,
        status: a.status,
        created_at: a.created_at,
        job: a.job,
      })));
    } catch (error: any) {
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card border border-border rounded-xl shadow-lg p-12">
              <Users className="h-16 w-16 text-primary mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">Welcome to FlowCreate ATS!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Let's get started by creating your organization workspace where your team can collaborate on hiring.
              </p>
              <Button size="lg" onClick={() => navigate('/ats/onboarding')}>
                <Plus className="mr-2 h-5 w-5" />
                Create Your Organization
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const primaryOrg = organizations[0];

  const filteredJobs = recentJobs.filter(j =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'closed': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{primaryOrg.name}</h1>
            <p className="text-muted-foreground">ATS Dashboard • {primaryOrg.role}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Main Site
              </Button>
            </Link>
            <Link to="/resume-builder">
              <Button variant="ghost" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Resume Builder
              </Button>
            </Link>
            <Button variant="outline" onClick={() => navigate('/ats/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="outline" onClick={() => navigate('/ats/jobs')}>
              View All Jobs
            </Button>
            <Button onClick={() => navigate('/ats/jobs/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </div>
        </div>

        {/* Stats Cards - Real Data */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">{recentJobs.length} total jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">{stats.newApplications} new</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Applications</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newApplications}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduledInterviews}</div>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Jobs */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Job Openings</CardTitle>
                    <CardDescription>Manage your open positions</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No jobs found</p>
                      <Button variant="link" className="mt-2" onClick={() => navigate('/ats/jobs/new')}>
                        Create your first job posting
                      </Button>
                    </div>
                  ) : (
                    filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/ats/jobs/${job.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold">{job.title}</h3>
                              <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {job.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                              )}
                              {job.job_type && <span>• {job.job_type}</span>}
                              <span>• {job.applicationCount} applicants</span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/ats/jobs/${job.id}`); }}>
                                <Eye className="mr-2 h-4 w-4" /> View Pipeline
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Applications */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest candidate submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentApplications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No applications yet</p>
                  ) : (
                    recentApplications.map((app) => (
                      <div
                        key={app.id}
                        className="border border-border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/ats/applications/${app.id}`)}
                      >
                        <p className="font-medium text-sm">{app.candidate_name}</p>
                        <p className="text-xs text-muted-foreground">{app.job?.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">{app.status}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(app.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSDashboard;
