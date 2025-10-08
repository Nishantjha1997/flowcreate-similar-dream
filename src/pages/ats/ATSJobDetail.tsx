import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MoreVertical, Plus, Mail, Phone, Linkedin, Star } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Header from '@/components/Header';

interface PipelineStage {
  id: string;
  name: string;
  stage_order: number;
  color: string;
}

interface Application {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  candidate_linkedin: string | null;
  status: string;
  ai_match_score: number | null;
  rating: number | null;
  created_at: string;
  current_stage_id: string | null;
}

interface Job {
  id: string;
  title: string;
  status: string;
  location: string | null;
  job_type: string | null;
}

const ATSJobDetail = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/ats/login');
      return;
    }
    loadJobDetails();
  }, [user, jobId, navigate]);

  const loadJobDetails = async () => {
    if (!jobId) return;

    try {
      // Load job
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // Load pipeline stages
      const { data: stagesData, error: stagesError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('job_id', jobId)
        .order('stage_order');

      if (stagesError) throw stagesError;
      setStages(stagesData || []);

      // Load applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);

    } catch (error: any) {
      toast({
        title: "Error loading job details",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getApplicationsByStage = (stageId: string) => {
    return applications.filter(app => app.current_stage_id === stageId);
  };

  const getUnassignedApplications = () => {
    return applications.filter(app => !app.current_stage_id);
  };

  const moveApplication = async (applicationId: string, newStageId: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ current_stage_id: newStageId })
        .eq('id', applicationId);

      if (error) throw error;

      // Refresh applications
      loadJobDetails();
      
      toast({
        title: "Application moved",
        description: "Candidate has been moved to the new stage",
      });
    } catch (error: any) {
      toast({
        title: "Error moving application",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Job not found</p>
        </div>
      </div>
    );
  }

  const unassignedApps = getUnassignedApplications();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/ats/jobs')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {job.location && <span>{job.location}</span>}
                {job.job_type && <span>• {job.job_type}</span>}
                <span>• {applications.length} applicants</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                {job.status}
              </Badge>
              <Button variant="outline" onClick={() => navigate(`/ats/jobs/${jobId}/edit`)}>
                Edit Job
              </Button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Unassigned Column */}
          {unassignedApps.length > 0 && (
            <div className="flex-shrink-0 w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>New Applications</span>
                    <Badge variant="secondary">{unassignedApps.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <ScrollArea className="h-[calc(100vh-20rem)]">
                    <div className="space-y-2">
                      {unassignedApps.map((app) => (
                        <ApplicationCard
                          key={app.id}
                          application={app}
                          stages={stages}
                          onMove={moveApplication}
                          onClick={() => navigate(`/ats/applications/${app.id}`)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pipeline Stages */}
          {stages.map((stage) => {
            const stageApps = getApplicationsByStage(stage.id);
            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: stage.color }}
                        />
                        <span>{stage.name}</span>
                      </div>
                      <Badge variant="secondary">{stageApps.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <ScrollArea className="h-[calc(100vh-20rem)]">
                      <div className="space-y-2">
                        {stageApps.map((app) => (
                          <ApplicationCard
                            key={app.id}
                            application={app}
                            stages={stages}
                            onMove={moveApplication}
                            onClick={() => navigate(`/ats/applications/${app.id}`)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface ApplicationCardProps {
  application: Application;
  stages: PipelineStage[];
  onMove: (appId: string, stageId: string) => void;
  onClick: () => void;
}

const ApplicationCard = ({ application, stages, onMove, onClick }: ApplicationCardProps) => {
  return (
    <Card 
      className="p-3 hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-sm mb-1">{application.candidate_name}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            {application.candidate_email}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}>
              View Details
            </DropdownMenuItem>
            {stages.map((stage) => (
              <DropdownMenuItem 
                key={stage.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(application.id, stage.id);
                }}
              >
                Move to {stage.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {application.candidate_phone && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Phone className="h-3 w-3" />
          {application.candidate_phone}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t">
        {application.ai_match_score && (
          <Badge variant="outline" className="text-xs">
            {application.ai_match_score}% match
          </Badge>
        )}
        {application.rating && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < application.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        )}
        <span className="text-xs text-muted-foreground">
          {new Date(application.created_at).toLocaleDateString()}
        </span>
      </div>
    </Card>
  );
};

export default ATSJobDetail;
