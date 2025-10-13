import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, MapPin, Building2, DollarSign, ArrowLeft, Upload, CheckCircle2
} from 'lucide-react';
import Header from '@/components/Header';

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  responsibilities: string | null;
  location: string | null;
  job_type: string | null;
  experience_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  organization: {
    name: string;
    description: string | null;
  };
}

const ATSApply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    candidate_linkedin: '',
    cover_letter: '',
    resume_url: ''
  });

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    if (!jobId) return;

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          requirements,
          responsibilities,
          location,
          job_type,
          experience_level,
          salary_min,
          salary_max,
          salary_currency,
          organization:organizations(name, description)
        `)
        .eq('id', jobId)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error: any) {
      toast({
        title: "Error loading job",
        description: error.message,
        variant: "destructive",
      });
      navigate('/ats/jobs/browse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job) return;

    // Basic validation
    if (!formData.candidate_name || !formData.candidate_email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          candidate_name: formData.candidate_name,
          candidate_email: formData.candidate_email,
          candidate_phone: formData.candidate_phone || null,
          candidate_linkedin: formData.candidate_linkedin || null,
          cover_letter: formData.cover_letter || null,
          resume_url: formData.resume_url || null,
          status: 'new',
          application_data: {
            source: 'careers_page',
            applied_at: new Date().toISOString()
          }
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Application submitted!",
        description: "We'll review your application and get back to you soon.",
      });
    } catch (error: any) {
      toast({
        title: "Error submitting application",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardContent className="py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">Application Submitted!</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Thank you for applying to <strong>{job.title}</strong> at <strong>{job.organization.name}</strong>.
                  We've received your application and will review it shortly.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate('/ats/jobs/browse')}>
                    Browse More Jobs
                  </Button>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Submit Another Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const formatSalary = () => {
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
          Back to Jobs
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                  <p className="text-lg font-medium">{job.organization.name}</p>
                </div>
                <CardTitle className="text-3xl mb-4">{job.title}</CardTitle>
                
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {job.location && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                  )}
                  {job.job_type && <Badge variant="secondary">{job.job_type}</Badge>}
                  {job.experience_level && <Badge variant="outline">{job.experience_level}</Badge>}
                  {formatSalary() && (
                    <Badge variant="outline" className="gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatSalary()}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">About the Role</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                </div>

                {job.responsibilities && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Responsibilities</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{job.responsibilities}</p>
                  </div>
                )}

                {job.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Apply for this Position</CardTitle>
                <CardDescription>
                  Fill out the form below to submit your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.candidate_name}
                      onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.candidate_email}
                      onChange={(e) => setFormData({ ...formData, candidate_email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.candidate_phone}
                      onChange={(e) => setFormData({ ...formData, candidate_phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.candidate_linkedin}
                      onChange={(e) => setFormData({ ...formData, candidate_linkedin: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume URL</Label>
                    <Input
                      id="resume"
                      type="url"
                      placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                      value={formData.resume_url}
                      onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover-letter">Cover Letter</Label>
                    <Textarea
                      id="cover-letter"
                      rows={6}
                      placeholder="Tell us why you're a great fit for this role..."
                      value={formData.cover_letter}
                      onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSApply;
