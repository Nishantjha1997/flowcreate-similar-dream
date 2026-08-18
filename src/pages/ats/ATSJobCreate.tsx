import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';

const ATSJobCreate = () => {
  const { jobId } = useParams<{ jobId?: string }>();
  const isEditing = Boolean(jobId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingJob, setIsFetchingJob] = useState(isEditing);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    location: '',
    job_type: '',
    experience_level: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    status: 'draft',
  });

  useEffect(() => {
    if (!user) {
      navigate('/ats/login');
      return;
    }
    loadOrganization();
  }, [user, navigate]);

  useEffect(() => {
    if (jobId && user) {
      loadJob(jobId);
    }
  }, [jobId, user]);

  const loadOrganization = async () => {
    if (!user) return;

    try {
      const { data: membership, error } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (error) throw error;
      if (!membership) {
        navigate('/ats/onboarding');
        return;
      }

      setOrganizationId(membership.organization_id);
    } catch (error: any) {
      toast({
        title: "Error loading organization",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadJob = async (id: string) => {
    setIsFetchingJob(true);
    try {
      const { data: job, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (job) {
        setFormData({
          title: job.title || '',
          description: job.description || '',
          requirements: job.requirements || '',
          responsibilities: job.responsibilities || '',
          location: job.location || '',
          job_type: job.job_type || '',
          experience_level: job.experience_level || '',
          salary_min: job.salary_min ? String(job.salary_min) : '',
          salary_max: job.salary_max ? String(job.salary_max) : '',
          salary_currency: job.salary_currency || 'USD',
          status: job.status || 'draft',
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading job details",
        description: error.message,
        variant: "destructive",
      });
      navigate('/ats/jobs');
    } finally {
      setIsFetchingJob(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !organizationId) return;

    setIsLoading(true);

    try {
      if (isEditing && jobId) {
        const { error } = await supabase
          .from('jobs')
          .update({
            title: formData.title,
            description: formData.description,
            requirements: formData.requirements || null,
            responsibilities: formData.responsibilities || null,
            location: formData.location || null,
            job_type: formData.job_type || null,
            experience_level: formData.experience_level || null,
            salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
            salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
            salary_currency: formData.salary_currency,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', jobId);

        if (error) throw error;

        toast({
          title: "Job updated successfully!",
          description: formData.status === 'published' 
            ? "Your changes are now live"
            : "Your draft has been updated",
        });

        navigate(`/ats/jobs/${jobId}`);
      } else {
        const { data: job, error } = await supabase
          .from('jobs')
          .insert({
            organization_id: organizationId,
            created_by: user.id,
            title: formData.title,
            description: formData.description,
            requirements: formData.requirements || null,
            responsibilities: formData.responsibilities || null,
            location: formData.location || null,
            job_type: formData.job_type || null,
            experience_level: formData.experience_level || null,
            salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
            salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
            salary_currency: formData.salary_currency,
            status: formData.status,
          })
          .select()
          .single();

        if (error) throw error;

        // Create default pipeline stages
        const defaultStages = [
          { name: 'Applied', stage_order: 1, color: '#6366f1' },
          { name: 'Phone Screen', stage_order: 2, color: '#8b5cf6' },
          { name: 'Interview', stage_order: 3, color: '#ec4899' },
          { name: 'Offer', stage_order: 4, color: '#10b981' },
          { name: 'Hired', stage_order: 5, color: '#22c55e' },
        ];

        const stages = defaultStages.map(stage => ({
          job_id: job.id,
          ...stage,
        }));

        const { error: stagesError } = await supabase
          .from('pipeline_stages')
          .insert(stages);

        if (stagesError) throw stagesError;

        toast({
          title: "Job created successfully!",
          description: formData.status === 'published' 
            ? "Your job is now live and accepting applications"
            : "Your job has been saved as a draft",
        });

        navigate(`/ats/jobs/${job.id}`);
      }
    } catch (error: any) {
      toast({
        title: isEditing ? "Error updating job" : "Error creating job",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingJob) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
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
          onClick={() => navigate(isEditing && jobId ? `/ats/jobs/${jobId}` : '/ats/jobs')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isEditing ? 'Back to Job Details' : 'Back to Jobs'}
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}</CardTitle>
              <CardDescription>
                {isEditing ? 'Update the details and requirements for this role' : 'Fill in the details for your new position'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Frontend Developer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA or Remote"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_type">Job Type</Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <Select
                    value={formData.experience_level}
                    onValueChange={(value) => setFormData({ ...formData, experience_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead/Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary_min">Min Salary</Label>
                    <Input
                      id="salary_min"
                      type="number"
                      placeholder="50000"
                      value={formData.salary_min}
                      onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary_max">Max Salary</Label>
                    <Input
                      id="salary_max"
                      type="number"
                      placeholder="100000"
                      value={formData.salary_max}
                      onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary_currency">Currency</Label>
                    <Select
                      value={formData.salary_currency}
                      onValueChange={(value) => setFormData({ ...formData, salary_currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role, company culture, and what makes this opportunity unique..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    disabled={isLoading}
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    placeholder="List key responsibilities and what the candidate will be working on..."
                    value={formData.responsibilities}
                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                    disabled={isLoading}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="List required skills, experience, and qualifications..."
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    disabled={isLoading}
                    rows={5}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => setFormData({ ...formData, status: 'draft' })}
                    className="w-full sm:w-auto"
                  >
                    {isEditing ? 'Save as Draft' : 'Save as Draft'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    onClick={() => setFormData({ ...formData, status: 'published' })}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (isEditing ? 'Updating...' : 'Publishing...') : (isEditing ? 'Update & Publish' : 'Publish Job')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ATSJobCreate;
