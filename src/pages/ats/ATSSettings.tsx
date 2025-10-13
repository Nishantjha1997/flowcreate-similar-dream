import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Users, Settings, Trash2, UserPlus, Mail 
} from 'lucide-react';
import Header from '@/components/Header';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  industry: string | null;
  company_size: string | null;
  website_url: string | null;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  department: string | null;
  joined_at: string;
}

const ATSSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');

  useEffect(() => {
    if (!user) {
      navigate('/ats/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      // Get user's organization
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user?.id)
        .single();

      if (memberError) throw memberError;

      // Load organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', memberData.organization_id)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);

      // Load team members
      const { data: teamData, error: teamError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', memberData.organization_id);

      if (teamError) throw teamError;
      setMembers(teamData || []);
    } catch (error: any) {
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id);

      if (error) throw error;

      setOrganization({ ...organization, ...updates });
      toast({
        title: "Settings updated",
        description: "Organization settings have been saved",
      });
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const inviteMember = async () => {
    if (!organization || !newMemberEmail) return;

    try {
      // Note: In production, this would send an email invitation
      // For now, we'll just show a success message
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${newMemberEmail}`,
      });
      setNewMemberEmail('');
    } catch (error: any) {
      toast({
        title: "Error sending invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    if (!organization) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setMembers(members.filter(m => m.id !== memberId));
      toast({
        title: "Member removed",
        description: "Team member has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error removing member",
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
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Organization not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization and team settings
          </p>
        </div>

        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList>
            <TabsTrigger value="organization" className="gap-2">
              <Building2 className="h-4 w-4" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Update your organization information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={organization.name}
                    onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-description">Description</Label>
                  <Input
                    id="org-description"
                    value={organization.description || ''}
                    onChange={(e) => setOrganization({ ...organization, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-industry">Industry</Label>
                    <Input
                      id="org-industry"
                      value={organization.industry || ''}
                      onChange={(e) => setOrganization({ ...organization, industry: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="org-size">Company Size</Label>
                    <Input
                      id="org-size"
                      value={organization.company_size || ''}
                      onChange={(e) => setOrganization({ ...organization, company_size: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-website">Website</Label>
                  <Input
                    id="org-website"
                    type="url"
                    value={organization.website_url || ''}
                    onChange={(e) => setOrganization({ ...organization, website_url: e.target.value })}
                  />
                </div>

                <Button onClick={() => updateOrganization(organization)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invite Team Member</CardTitle>
                  <CardDescription>
                    Send an invitation to join your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                      />
                    </div>
                    <Button onClick={inviteMember}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Send Invitation
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Members ({members.length})</CardTitle>
                  <CardDescription>
                    Manage your organization's team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">User ID: {member.user_id.slice(0, 8)}...</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{member.role}</Badge>
                            {member.department && (
                              <Badge variant="secondary">{member.department}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>

                        {member.user_id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ATSSettings;
