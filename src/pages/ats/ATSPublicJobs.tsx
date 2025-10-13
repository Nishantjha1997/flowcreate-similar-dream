import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Briefcase, MapPin, Clock, DollarSign, Search, Building2, Filter
} from 'lucide-react';
import Header from '@/components/Header';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string | null;
  job_type: string | null;
  experience_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  published_at: string | null;
  organization: {
    name: string;
    slug: string;
  };
}

const ATSPublicJobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const orgSlug = searchParams.get('org');
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    loadJobs();
  }, [orgSlug]);

  const loadJobs = async () => {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          location,
          job_type,
          experience_level,
          salary_min,
          salary_max,
          salary_currency,
          published_at,
          organization:organizations(name, slug)
        `)
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

      if (orgSlug) {
        // Get organization first
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('slug', orgSlug)
          .single();
        
        if (orgData) {
          setOrganization(orgData);
          query = query.eq('organization_id', orgData.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
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

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSalary = (job: Job) => {
    if (!job.salary_min && !job.salary_max) return null;
    const currency = job.salary_currency || 'USD';
    if (job.salary_min && job.salary_max) {
      return `${currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`;
    }
    if (job.salary_min) {
      return `From ${currency} ${job.salary_min.toLocaleString()}`;
    }
    return `Up to ${currency} ${job.salary_max?.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading job openings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          {organization ? (
            <>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">{organization.name}</h1>
              </div>
              <p className="text-xl text-muted-foreground mb-2">Career Opportunities</p>
              {organization.description && (
                <p className="text-muted-foreground max-w-2xl mx-auto">{organization.description}</p>
              )}
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-4">Browse Open Positions</h1>
              <p className="text-xl text-muted-foreground">Find your next opportunity</p>
            </>
          )}
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for jobs, keywords, or skills..."
              className="pl-12 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="max-w-4xl mx-auto mb-6">
          <p className="text-muted-foreground">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'position' : 'positions'} available
          </p>
        </div>

        {/* Job Listings */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Jobs Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search terms' : 'Check back soon for new opportunities'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card 
                key={job.id} 
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/ats/apply/${job.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                        {!orgSlug && (
                          <>
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.organization.name}
                            </div>
                            <span>•</span>
                          </>
                        )}
                        {job.location && (
                          <>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <span>•</span>
                          </>
                        )}
                        {job.job_type && (
                          <>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {job.job_type}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.experience_level && (
                          <Badge variant="secondary">{job.experience_level}</Badge>
                        )}
                        {formatSalary(job) && (
                          <Badge variant="outline" className="gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatSalary(job)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <CardDescription className="line-clamp-2 text-base">
                    {job.description.substring(0, 200)}...
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Posted {new Date(job.published_at!).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <Button>
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ATSPublicJobs;
