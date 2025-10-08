import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Mail, Phone, Linkedin, MapPin, Calendar,
  FileText, Star, MessageSquare, Clock
} from 'lucide-react';
import Header from '@/components/Header';

interface Application {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  candidate_linkedin: string | null;
  status: string;
  ai_match_score: number | null;
  rating: number | null;
  resume_url: string | null;
  cover_letter: string | null;
  application_data: any;
  created_at: string;
  job: {
    id: string;
    title: string;
  };
}

const ATSApplicationDetail = () => {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/ats/login');
      return;
    }
    loadApplication();
  }, [user, applicationId, navigate]);

  const loadApplication = async () => {
    if (!applicationId) return;

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs(id, title)
        `)
        .eq('id', applicationId)
        .single();

      if (error) throw error;
      setApplication(data);
      setRating(data.rating || 0);
    } catch (error: any) {
      toast({
        title: "Error loading application",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRating = async (newRating: number) => {
    if (!applicationId) return;

    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ rating: newRating })
        .eq('id', applicationId);

      if (error) throw error;

      setRating(newRating);
      toast({
        title: "Rating updated",
        description: `Candidate rated ${newRating} stars`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating rating",
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
            <p className="text-muted-foreground">Loading application...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Application not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{application.candidate_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-4">
                      Applied for: {application.job.title}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${application.candidate_email}`} className="hover:underline">
                          {application.candidate_email}
                        </a>
                      </div>
                      
                      {application.candidate_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${application.candidate_phone}`} className="hover:underline">
                            {application.candidate_phone}
                          </a>
                        </div>
                      )}
                      
                      {application.candidate_linkedin && (
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={application.candidate_linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {application.ai_match_score && (
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {application.ai_match_score}% Match
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium">Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateRating(star)}
                      className="transition-colors"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Applied on {new Date(application.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="application" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="application">Application</TabsTrigger>
                <TabsTrigger value="resume">Resume</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="application" className="space-y-4">
                {application.cover_letter && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cover Letter</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-sm">{application.cover_letter}</p>
                    </CardContent>
                  </Card>
                )}

                {application.application_data && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(application.application_data, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="resume">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {application.resume_url ? (
                      <div className="space-y-4">
                        <Button asChild>
                          <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2 h-4 w-4" />
                            View Resume
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No resume uploaded</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div className="w-px h-full bg-border" />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium">Application Submitted</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(application.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Interview
                </Button>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge>{application.status}</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSApplicationDetail;
