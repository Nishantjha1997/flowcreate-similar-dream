import { useState } from "react";
import { useAdminATSStats } from "@/hooks/useAdminATSStats";
import { useAdminOrganizations, AdminOrganization } from "@/hooks/useAdminOrganizations";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2, Briefcase, Users, FileText, Calendar, Gift, Search, Plus,
  ExternalLink, Trash2, Eye, TrendingUp, MapPin, UserPlus, UserMinus, Globe,
} from "lucide-react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ATSManagementProps {
  isAdmin: boolean;
}

export const ATSManagement = ({ isAdmin }: ATSManagementProps) => {
  const { data: stats, isLoading: loadingStats } = useAdminATSStats(isAdmin);
  const { data: organizations = [], isLoading: loadingOrgs, refetch } = useAdminOrganizations(isAdmin);
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<AdminOrganization | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [newOrgIndustry, setNewOrgIndustry] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [newOrgWebsite, setNewOrgWebsite] = useState("");
  const [newOrgSize, setNewOrgSize] = useState("");
  const [newOrgOwnerEmail, setNewOrgOwnerEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Member management state
  const [addMemberEmail, setAddMemberEmail] = useState("");
  const [addMemberRole, setAddMemberRole] = useState("member");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // Jobs tab
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");

  // Applications tab
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("all");

  // Fetch all jobs for admin
  const { data: allJobs = [], isLoading: loadingJobs } = useQuery({
    queryKey: ["admin-all-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, status, location, job_type, created_at, organization:organizations(name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Fetch all applications for admin
  const { data: allApplications = [], isLoading: loadingApps } = useQuery({
    queryKey: ["admin-all-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id, candidate_name, candidate_email, status, rating, ai_match_score, created_at, job:jobs(id, title, organization:organizations(name))")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  // Fetch org members when details dialog is open
  const { data: orgMembers = [], isLoading: loadingMembers, refetch: refetchMembers } = useQuery({
    queryKey: ["admin-org-members", selectedOrg?.id],
    queryFn: async () => {
      if (!selectedOrg) return [];
      const { data, error } = await supabase.functions.invoke('admin-add-org-member', {
        body: { action: 'list', organizationId: selectedOrg.id }
      });
      if (error) throw error;
      return data?.members || [];
    },
    enabled: !!selectedOrg && isDetailsOpen,
  });

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (org.industry?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredJobs = allJobs.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(jobSearch.toLowerCase());
    const matchesStatus = jobStatusFilter === "all" || job.status === jobStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredApps = allApplications.filter((app: any) => {
    const matchesSearch = app.candidate_name.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.candidate_email.toLowerCase().includes(appSearch.toLowerCase());
    const matchesStatus = appStatusFilter === "all" || app.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim() || !newOrgSlug.trim()) {
      toast({ title: "Error", description: "Name and slug are required", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const { data: orgData, error } = await supabase.from("organizations").insert({
        name: newOrgName.trim(),
        slug: newOrgSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        industry: newOrgIndustry.trim() || null,
        description: newOrgDescription.trim() || null,
        website_url: newOrgWebsite.trim() || null,
        company_size: newOrgSize || null,
      }).select().single();
      if (error) throw error;

      // If owner email provided, add them as owner
      if (newOrgOwnerEmail.trim() && orgData) {
        try {
          await supabase.functions.invoke('admin-add-org-member', {
            body: { action: 'add', organizationId: orgData.id, email: newOrgOwnerEmail.trim(), role: 'owner' }
          });
        } catch (e: any) {
          toast({ title: "Warning", description: `Org created but could not add owner: ${e.message}` });
        }
      }

      toast({ title: "Success", description: "Organization created successfully" });
      setIsCreateDialogOpen(false);
      setNewOrgName(""); setNewOrgSlug(""); setNewOrgIndustry("");
      setNewOrgDescription(""); setNewOrgWebsite(""); setNewOrgSize(""); setNewOrgOwnerEmail("");
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setIsCreating(false); }
  };

  const handleAddMember = async () => {
    if (!addMemberEmail.trim() || !selectedOrg) return;
    setIsAddingMember(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-add-org-member', {
        body: { action: 'add', organizationId: selectedOrg.id, email: addMemberEmail.trim(), role: addMemberRole }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Member added", description: `${addMemberEmail} added as ${addMemberRole}` });
      setAddMemberEmail("");
      refetchMembers();
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setIsAddingMember(false); }
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemovingMemberId(memberId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-add-org-member', {
        body: { action: 'remove', memberId }
      });
      if (error) throw error;
      toast({ title: "Member removed" });
      refetchMembers();
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setRemovingMemberId(null); }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-add-org-member', {
        body: { action: 'update-role', memberId, role: newRole }
      });
      if (error) throw error;
      toast({ title: "Role updated" });
      refetchMembers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!confirm("Are you sure? This will delete all jobs, applications, and members.")) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("organizations").delete().eq("id", orgId);
      if (error) throw error;
      toast({ title: "Success", description: "Organization deleted" });
      setIsDetailsOpen(false); setSelectedOrg(null); refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setIsDeleting(false); }
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'published') updates.published_at = new Date().toISOString();
      if (newStatus === 'closed') updates.closed_at = new Date().toISOString();
      const { error } = await supabase.from("jobs").update(updates).eq("id", jobId);
      if (error) throw error;
      toast({ title: "Job status updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const statCards = [
    { label: "Organizations", value: stats?.totalOrganizations || 0, icon: Building2, color: "text-blue-600" },
    { label: "Active Jobs", value: stats?.activeJobs || 0, icon: Briefcase, color: "text-green-600" },
    { label: "Draft Jobs", value: stats?.draftJobs || 0, icon: FileText, color: "text-yellow-600" },
    { label: "Total Applications", value: stats?.totalApplications || 0, icon: Users, color: "text-purple-600" },
    { label: "New Applications", value: stats?.newApplications || 0, icon: TrendingUp, color: "text-pink-600" },
    { label: "Scheduled Interviews", value: stats?.scheduledInterviews || 0, icon: Calendar, color: "text-cyan-600" },
    { label: "Pending Offers", value: stats?.pendingOffers || 0, icon: Gift, color: "text-orange-600" },
    { label: "Total Members", value: stats?.totalMembers || 0, icon: Users, color: "text-indigo-600" },
  ];

  if (loadingStats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <GlassCard key={index} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organizations">Organizations ({organizations.length})</TabsTrigger>
          <TabsTrigger value="jobs">All Jobs ({allJobs.length})</TabsTrigger>
          <TabsTrigger value="applications">All Applications ({allApplications.length})</TabsTrigger>
        </TabsList>

        {/* Organizations Tab */}
        <TabsContent value="organizations">
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold">Organizations</h3>
                <p className="text-sm text-muted-foreground">Manage all registered companies</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search organizations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-64" />
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Organization
                </Button>
              </div>
            </div>

            {loadingOrgs ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : filteredOrgs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No organizations found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Jobs</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrgs.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                              {org.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{org.name}</p>
                              <p className="text-xs text-muted-foreground">/{org.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{org.industry ? <Badge variant="secondary">{org.industry}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell>{org.memberCount}</TableCell>
                        <TableCell>{org.jobCount}</TableCell>
                        <TableCell>{org.applicationCount}</TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(org.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedOrg(org); setIsDetailsOpen(true); }}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteOrganization(org.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold">All Jobs</h3>
                <p className="text-sm text-muted-foreground">Manage job postings across all organizations</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search jobs..." value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} className="pl-9 w-64" />
                </div>
                <Select value={jobStatusFilter} onValueChange={setJobStatusFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingJobs ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job: any) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell className="text-muted-foreground">{job.organization?.name || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={job.status === 'published' ? 'default' : job.status === 'closed' ? 'destructive' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{job.location || '—'}</TableCell>
                        <TableCell>{job.job_type || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(job.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {job.status === 'draft' && (
                              <Button variant="ghost" size="sm" onClick={() => updateJobStatus(job.id, 'published')}>Publish</Button>
                            )}
                            {job.status === 'published' && (
                              <Button variant="ghost" size="sm" onClick={() => updateJobStatus(job.id, 'closed')}>Close</Button>
                            )}
                            {job.status === 'closed' && (
                              <Button variant="ghost" size="sm" onClick={() => updateJobStatus(job.id, 'published')}>Reopen</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold">All Applications</h3>
                <p className="text-sm text-muted-foreground">View candidate applications across all organizations</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search candidates..." value={appSearch} onChange={(e) => setAppSearch(e.target.value)} className="pl-9 w-64" />
                </div>
                <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="offered">Offered</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingApps ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Applied</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApps.map((app: any) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.candidate_name}</TableCell>
                        <TableCell className="text-muted-foreground">{app.candidate_email}</TableCell>
                        <TableCell>{app.job?.title || '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{app.job?.organization?.name || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={app.status === 'hired' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{app.rating ? `${app.rating}/5` : '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(app.created_at), "MMM d, yyyy")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Create Organization Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Company Portal</DialogTitle>
            <DialogDescription>Set up a new company account on the ATS platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label htmlFor="org-name">Company Name *</Label>
              <Input id="org-name" value={newOrgName} onChange={(e) => { setNewOrgName(e.target.value); setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} placeholder="Acme Corporation" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">URL Slug *</Label>
              <Input id="org-slug" value={newOrgSlug} onChange={(e) => setNewOrgSlug(e.target.value)} placeholder="acme-corporation" />
              <p className="text-xs text-muted-foreground">Public URL: /careers/{newOrgSlug || "company-slug"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org-industry">Industry</Label>
                <Input id="org-industry" value={newOrgIndustry} onChange={(e) => setNewOrgIndustry(e.target.value)} placeholder="Technology" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-size">Company Size</Label>
                <Select value={newOrgSize} onValueChange={setNewOrgSize}>
                  <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="501-1000">501-1000</SelectItem>
                    <SelectItem value="1000+">1000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-website">Website</Label>
              <Input id="org-website" value={newOrgWebsite} onChange={(e) => setNewOrgWebsite(e.target.value)} placeholder="https://acme.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-desc">Description</Label>
              <Textarea id="org-desc" value={newOrgDescription} onChange={(e) => setNewOrgDescription(e.target.value)} placeholder="Brief company description..." rows={2} />
            </div>
            <div className="space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
              <Label htmlFor="org-owner" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Owner Email (optional)
              </Label>
              <Input id="org-owner" type="email" value={newOrgOwnerEmail} onChange={(e) => setNewOrgOwnerEmail(e.target.value)} placeholder="owner@acme.com" />
              <p className="text-xs text-muted-foreground">This user will be added as the organization owner. They must already have an account.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOrganization} disabled={isCreating}>{isCreating ? "Creating..." : "Create Company Portal"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Organization Details + Member Management Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {selectedOrg?.name.charAt(0)}
              </div>
              {selectedOrg?.name}
            </DialogTitle>
            <DialogDescription>Organization details, members, and statistics</DialogDescription>
          </DialogHeader>
          {selectedOrg && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Slug</p><p className="font-medium">/{selectedOrg.slug}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Industry</p><p className="font-medium">{selectedOrg.industry || "Not set"}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Company Size</p><p className="font-medium">{selectedOrg.companySize || "Not set"}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Created</p><p className="font-medium">{format(new Date(selectedOrg.createdAt), "MMM d, yyyy")}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/30 border border-border"><p className="text-2xl font-bold text-primary">{selectedOrg.memberCount}</p><p className="text-xs text-muted-foreground">Members</p></div>
                <div className="text-center p-3 rounded-lg bg-muted/30 border border-border"><p className="text-2xl font-bold text-primary">{selectedOrg.jobCount}</p><p className="text-xs text-muted-foreground">Jobs</p></div>
                <div className="text-center p-3 rounded-lg bg-muted/30 border border-border"><p className="text-2xl font-bold text-primary">{selectedOrg.applicationCount}</p><p className="text-xs text-muted-foreground">Applications</p></div>
              </div>

              {/* Member Management */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Team Members</h4>
                
                {/* Add Member */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input placeholder="user@email.com" type="email" value={addMemberEmail} onChange={(e) => setAddMemberEmail(e.target.value)} />
                  </div>
                  <Select value={addMemberRole} onValueChange={setAddMemberRole}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleAddMember} disabled={isAddingMember || !addMemberEmail.trim()}>
                    <UserPlus className="h-4 w-4 mr-1" /> {isAddingMember ? "Adding..." : "Add"}
                  </Button>
                </div>

                {/* Members List */}
                {loadingMembers ? (
                  <div className="space-y-2"><Skeleton className="h-10" /><Skeleton className="h-10" /></div>
                ) : orgMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No members yet. Add the first member above.</p>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-xs">Email</TableHead>
                          <TableHead className="text-xs">Role</TableHead>
                          <TableHead className="text-xs">Joined</TableHead>
                          <TableHead className="text-xs text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orgMembers.map((member: any) => (
                          <TableRow key={member.id}>
                            <TableCell className="text-sm">{member.email}</TableCell>
                            <TableCell>
                              <Select defaultValue={member.role} onValueChange={(val) => handleUpdateMemberRole(member.id, val)}>
                                <SelectTrigger className="w-[100px] h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="owner">Owner</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="recruiter">Recruiter</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{format(new Date(member.joined_at), "MMM d, yyyy")}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-7" disabled={removingMemberId === member.id} onClick={() => handleRemoveMember(member.id)}>
                                <UserMinus className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" onClick={() => selectedOrg && handleDeleteOrganization(selectedOrg.id)} disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" /> {isDeleting ? "Deleting..." : "Delete Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
