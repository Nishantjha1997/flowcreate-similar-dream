import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, Briefcase, TrendingUp, Clock, 
  Plus, Search, Filter, MoreVertical, Settings, FileText, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

const ATSDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/ats/login');
      return;
    }

    loadOrganizations();
  }, [user, navigate]);

  const loadOrganizations = async () => {
    if (!user) return;

    try {
      const { data: memberships, error } = await supabase
        .from('organization_members')
        .select(`
          role,
          organization:organizations (
            id,
            name,
            slug
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const orgs = memberships?.map(m => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role
      })) || [];

      setOrganizations(orgs);
    } catch (error: any) {
      toast({
        title: "Error loading organizations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = () => {
    navigate('/ats/onboarding');
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

  // If no organizations, show onboarding
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
              <Button size="lg" onClick={handleCreateOrganization}>
                <Plus className="mr-2 h-5 w-5" />
                Create Your Organization
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For now, if they have one org, auto-select it
  const primaryOrg = organizations[0];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{primaryOrg.name}</h1>
            <p className="text-muted-foreground">ATS Dashboard</p>
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

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">248</div>
              <p className="text-xs text-muted-foreground">+18% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time to Hire</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18 days</div>
              <p className="text-xs text-muted-foreground">-3 days improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">Across 8 positions</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity / Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Job Openings</CardTitle>
                <CardDescription>Manage your open positions and candidates</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search jobs..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder job items */}
              <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Senior Frontend Developer</h3>
                    <p className="text-sm text-muted-foreground">Engineering • San Francisco • Full-time</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">42 applicants</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">8 in review</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">3 interviewing</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>More jobs coming soon...</p>
                <Button variant="link" className="mt-2">
                  Create your first job posting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ATSDashboard;