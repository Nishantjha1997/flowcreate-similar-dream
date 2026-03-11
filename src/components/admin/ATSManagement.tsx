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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<AdminOrganization | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [newOrgIndustry, setNewOrgIndustry] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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
      const { error } = await supabase.from("organizations").insert({
        name: newOrgName.trim(),
        slug: newOrgSlug.trim().toLowerCase().replace(/\s+/g, "-"),
        industry: newOrgIndustry.trim() || null,
      });
      if (error) throw error;
      toast({ title: "Success", description: "Organization created successfully" });
      setIsCreateDialogOpen(false);
      setNewOrgName(""); setNewOrgSlug(""); setNewOrgIndustry("");
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setIsCreating(false); }
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>Add a new company to the ATS platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Company Name *</Label>
              <Input id="org-name" value={newOrgName} onChange={(e) => { setNewOrgName(e.target.value); setNewOrgSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }} placeholder="Acme Corporation" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">URL Slug *</Label>
              <Input id="org-slug" value={newOrgSlug} onChange={(e) => setNewOrgSlug(e.target.value)} placeholder="acme-corporation" />
              <p className="text-xs text-muted-foreground">Public URL: /careers/{newOrgSlug || "company-slug"}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-industry">Industry</Label>
              <Input id="org-industry" value={newOrgIndustry} onChange={(e) => setNewOrgIndustry(e.target.value)} placeholder="Technology" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOrganization} disabled={isCreating}>{isCreating ? "Creating..." : "Create Organization"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Organization Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {selectedOrg?.name.charAt(0)}
              </div>
              {selectedOrg?.name}
            </DialogTitle>
            <DialogDescription>Organization details and statistics</DialogDescription>
          </DialogHeader>
          {selectedOrg && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Slug</p><p className="font-medium">/{selectedOrg.slug}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Industry</p><p className="font-medium">{selectedOrg.industry || "Not set"}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Company Size</p><p className="font-medium">{selectedOrg.companySize || "Not set"}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground">Created</p><p className="font-medium">{format(new Date(selectedOrg.createdAt), "MMM d, yyyy")}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30"><p className="text-2xl font-bold text-blue-600">{selectedOrg.memberCount}</p><p className="text-sm text-muted-foreground">Members</p></div>
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30"><p className="text-2xl font-bold text-green-600">{selectedOrg.jobCount}</p><p className="text-sm text-muted-foreground">Jobs</p></div>
                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30"><p className="text-2xl font-bold text-purple-600">{selectedOrg.applicationCount}</p><p className="text-sm text-muted-foreground">Applications</p></div>
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
