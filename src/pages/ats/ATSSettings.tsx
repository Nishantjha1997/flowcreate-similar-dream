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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, Users, Settings, Trash2, UserPlus, Shield, Crown, ArrowLeft
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
  const [newMemberRole, setNewMemberRole] = useState('recruiter');
  const [isInviting, setIsInviting] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/ats/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user?.id)
        .single();

      if (memberError) throw memberError;
      setCurrentUserRole(memberData.role);

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', memberData.organization_id)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);

      const { data: teamData, error: teamError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', memberData.organization_id)
        .order('joined_at');

      if (teamError) throw teamError;
      setMembers(teamData || []);
    } catch (error: any) {
      toast({ title: "Error loading settings", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organization) return;
    try {
      const { error } = await supabase.from('organizations').update(updates).eq('id', organization.id);
      if (error) throw error;
      setOrganization({ ...organization, ...updates });
      toast({ title: "Settings updated", description: "Organization settings have been saved" });
    } catch (error: any) {
      toast({ title: "Error updating settings", description: error.message, variant: "destructive" });
    }
  };

  const inviteMember = async () => {
    if (!organization || !newMemberEmail.trim()) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    setIsInviting(true);
    try {
      // Look up user by checking if a profile with this email exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', newMemberEmail.trim())
        .single();

      if (!profile) {
        toast({
          title: "User not found",
          description: "This email is not registered on the platform. Ask them to sign up first.",
          variant: "destructive",
        });
        setIsInviting(false);
        return;
      }

      // Check if already a member
      const existingMember = members.find(m => m.user_id === profile.user_id);
      if (existingMember) {
        toast({ title: "Already a member", description: "This user is already part of your organization", variant: "destructive" });
        setIsInviting(false);
        return;
      }

      // Add as member
      const { error } = await supabase.from('organization_members').insert({
        organization_id: organization.id,
        user_id: profile.user_id,
        role: newMemberRole,
      });

      if (error) throw error;

      toast({ title: "Member added!", description: `${newMemberEmail} has been added as ${newMemberRole}` });
      setNewMemberEmail('');
      loadData();
    } catch (error: any) {
      toast({ title: "Error adding member", description: error.message, variant: "destructive" });
    } finally {
      setIsInviting(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      toast({ title: "Role updated", description: `Member role changed to ${newRole}` });
    } catch (error: any) {
      toast({ title: "Error updating role", description: error.message, variant: "destructive" });
    }
  };

  const removeMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === user?.id) {
      toast({ title: "Cannot remove yourself", description: "You can't remove yourself from the organization", variant: "destructive" });
      return;
    }
    if (!confirm("Remove this team member?")) return;

    try {
      const { error } = await supabase.from('organization_members').delete().eq('id', memberId);
      if (error) throw error;
      setMembers(members.filter(m => m.id !== memberId));
      toast({ title: "Member removed" });
    } catch (error: any) {
      toast({ title: "Error removing member", description: error.message, variant: "destructive" });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3" />;
      case 'admin': return <Shield className="h-3 w-3" />;
      default: return null;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default' as const;
      case 'admin': return 'destructive' as const;
      default: return 'secondary' as const;
    }
  };

  const canManageTeam = currentUserRole === 'owner' || currentUserRole === 'admin';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8"><p>Organization not found</p></div>
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your organization and team</p>
        </div>

        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList>
            <TabsTrigger value="organization" className="gap-2">
              <Building2 className="h-4 w-4" /> Organization
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" /> Team ({members.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>Update your organization information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input id="org-name" value={organization.name} onChange={(e) => setOrganization({ ...organization, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-description">Description</Label>
                  <Input id="org-description" value={organization.description || ''} onChange={(e) => setOrganization({ ...organization, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-industry">Industry</Label>
                    <Input id="org-industry" value={organization.industry || ''} onChange={(e) => setOrganization({ ...organization, industry: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-size">Company Size</Label>
                    <Input id="org-size" value={organization.company_size || ''} onChange={(e) => setOrganization({ ...organization, company_size: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-website">Website</Label>
                  <Input id="org-website" type="url" value={organization.website_url || ''} onChange={(e) => setOrganization({ ...organization, website_url: e.target.value })} />
                </div>
                <Button onClick={() => updateOrganization(organization)}>
                  <Settings className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <div className="space-y-6">
              {canManageTeam && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Team Member</CardTitle>
                    <CardDescription>Add an existing platform user to your organization by their email</CardDescription>
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
                      <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recruiter">Recruiter</SelectItem>
                          <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={inviteMember} disabled={isInviting}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {isInviting ? 'Adding...' : 'Add Member'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Team Members ({members.length})</CardTitle>
                  <CardDescription>Manage your organization's team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                              {member.user_id === user?.id ? 'You' : `User ${member.user_id.slice(0, 8)}...`}
                            </p>
                            <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                              {getRoleIcon(member.role)}
                              {member.role}
                            </Badge>
                          </div>
                          {member.department && (
                            <Badge variant="outline" className="mt-1">{member.department}</Badge>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>

                        {canManageTeam && member.user_id !== user?.id && member.role !== 'owner' && (
                          <div className="flex items-center gap-2">
                            <Select
                              value={member.role}
                              onValueChange={(newRole) => updateMemberRole(member.id, newRole)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="recruiter">Recruiter</SelectItem>
                                <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" onClick={() => removeMember(member.id, member.user_id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
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
