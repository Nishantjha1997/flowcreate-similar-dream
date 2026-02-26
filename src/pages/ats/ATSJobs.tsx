import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Briefcase, MapPin, DollarSign, Users, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Header from '@/components/Header';

interface Job {
  id: string;
  title: string;
  status: string;
  location: string | null;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  created_at: string;
  _count?: {
    applications: number;
  };
}

const ATSJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/ats/login');
      return;
    }
    loadOrganizationAndJobs();
  }, [user, navigate]);

  const loadOrganizationAndJobs = async () => {
    if (!user) return;

    try {
      // Get user's organization
      const { data: memberships, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (memberError) throw memberError;
      if (!memberships) {
        navigate('/ats/onboarding');
        return;
      }

      setOrganizationId(memberships.organization_id);

      // Load jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('organization_id', memberships.organization_id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch application counts per job
      const jobIds = (jobsData || []).map(j => j.id);
      let appCounts: Record<string, number> = {};
      if (jobIds.length > 0) {
        const { data: apps } = await supabase
          .from('job_applications')
          .select('job_id')
          .in('job_id', jobIds);
        (apps || []).forEach((a: any) => {
          appCounts[a.job_id] = (appCounts[a.job_id] || 0) + 1;
        });
      }

      setJobs((jobsData || []).map(j => ({
        ...j,
        _count: { applications: appCounts[j.id] || 0 },
      })));
    } catch (error: any) {
      toast({
        title: "Error loading jobs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'draft': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
      case 'closed': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Job Openings</h1>
            <p className="text-muted-foreground">Manage your job postings and applications</p>
          </div>
          <Button onClick={() => navigate('/ats/jobs/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Try a different search term' : 'Create your first job posting to start hiring'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/ats/jobs/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Job
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <Card 
                key={job.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/ats/jobs/${job.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                        )}
                        {job.job_type && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.job_type}
                          </div>
                        )}
                        {job.salary_min && job.salary_max && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary_currency} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ats/jobs/${job.id}/edit`);
                        }}>
                          Edit Job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/ats/jobs/${job.id}`);
                        }}>
                          View Applications
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{job._count?.applications || 0} applicants</span>
                    </div>
                    <span className="text-muted-foreground">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSJobs;
