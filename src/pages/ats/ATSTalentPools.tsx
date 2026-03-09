import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ArrowLeft, Plus, Search, Users, Trash2, Eye, UserPlus, FolderOpen
} from 'lucide-react';
import Header from '@/components/Header';

interface TalentPool {
  id: string;
  name: string;
  description: string | null;
  tags: string[] | null;
  created_at: string;
  candidateCount?: number;
}

interface TalentPoolCandidate {
  id: string;
  candidate_name: string;
  candidate_email: string;
  notes: string | null;
  added_at: string;
}

const ATSTalentPools = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [pools, setPools] = useState<TalentPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Create pool
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPool, setNewPool] = useState({ name: '', description: '', tags: '' });
  const [isCreating, setIsCreating] = useState(false);

  // View pool detail
  const [selectedPool, setSelectedPool] = useState<TalentPool | null>(null);
  const [poolCandidates, setPoolCandidates] = useState<TalentPoolCandidate[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  // Add candidate
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '', notes: '' });
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/ats/login'); return; }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    if (!user) return;
    try {
      const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (memberError) throw memberError;
      if (!membership) { navigate('/ats/onboarding'); return; }
      setOrganizationId(membership.organization_id);

      const { data: poolsData, error: poolsError } = await supabase
        .from('talent_pools')
        .select('*')
        .eq('organization_id', membership.organization_id)
        .order('created_at', { ascending: false });

      if (poolsError) throw poolsError;

      // Get candidate counts
      const poolIds = (poolsData || []).map(p => p.id);
      let counts: Record<string, number> = {};
      if (poolIds.length > 0) {
        const { data: candidates } = await supabase
          .from('talent_pool_candidates')
          .select('talent_pool_id')
          .in('talent_pool_id', poolIds);
        (candidates || []).forEach((c: any) => {
          counts[c.talent_pool_id] = (counts[c.talent_pool_id] || 0) + 1;
        });
      }

      setPools((poolsData || []).map(p => ({ ...p, candidateCount: counts[p.id] || 0 })));
    } catch (error: any) {
      toast({ title: "Error loading talent pools", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const createPool = async () => {
    if (!user || !organizationId || !newPool.name.trim()) return;
    setIsCreating(true);
    try {
      const { error } = await supabase.from('talent_pools').insert({
        organization_id: organizationId,
        created_by: user.id,
        name: newPool.name.trim(),
        description: newPool.description.trim() || null,
        tags: newPool.tags ? newPool.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      if (error) throw error;
      toast({ title: "Talent pool created!" });
      setIsCreateOpen(false);
      setNewPool({ name: '', description: '', tags: '' });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const deletePool = async (poolId: string) => {
    if (!confirm("Delete this talent pool and all its candidates?")) return;
    try {
      await supabase.from('talent_pool_candidates').delete().eq('talent_pool_id', poolId);
      const { error } = await supabase.from('talent_pools').delete().eq('id', poolId);
      if (error) throw error;
      toast({ title: "Talent pool deleted" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const viewPoolDetail = async (pool: TalentPool) => {
    setSelectedPool(pool);
    setIsDetailOpen(true);
    setLoadingCandidates(true);
    try {
      const { data, error } = await supabase
        .from('talent_pool_candidates')
        .select('*')
        .eq('talent_pool_id', pool.id)
        .order('added_at', { ascending: false });
      if (error) throw error;
      setPoolCandidates(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoadingCandidates(false);
    }
  };

  const addCandidate = async () => {
    if (!user || !selectedPool || !newCandidate.name.trim() || !newCandidate.email.trim()) return;
    setIsAddingCandidate(true);
    try {
      const { error } = await supabase.from('talent_pool_candidates').insert({
        talent_pool_id: selectedPool.id,
        added_by: user.id,
        candidate_name: newCandidate.name.trim(),
        candidate_email: newCandidate.email.trim(),
        notes: newCandidate.notes.trim() || null,
      });
      if (error) throw error;
      toast({ title: "Candidate added!" });
      setIsAddCandidateOpen(false);
      setNewCandidate({ name: '', email: '', notes: '' });
      viewPoolDetail(selectedPool);
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsAddingCandidate(false);
    }
  };

  const removeCandidate = async (candidateId: string) => {
    try {
      const { error } = await supabase.from('talent_pool_candidates').delete().eq('id', candidateId);
      if (error) throw error;
      setPoolCandidates(prev => prev.filter(c => c.id !== candidateId));
      toast({ title: "Candidate removed" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredPools = pools.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Talent Pools</h1>
            <p className="text-muted-foreground">Organize and nurture candidates for future positions</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Pool
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredPools.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Talent Pools</h3>
              <p className="text-muted-foreground mb-4">Create talent pools to organize candidates for future hiring needs</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Your First Pool
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPools.map((pool) => (
              <Card key={pool.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pool.name}</CardTitle>
                      {pool.description && (
                        <CardDescription className="mt-1">{pool.description}</CardDescription>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deletePool(pool.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{pool.candidateCount} candidates</span>
                  </div>
                  {pool.tags && pool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {pool.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => viewPoolDetail(pool)}>
                      <Eye className="mr-1 h-3 w-3" /> View
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => { setSelectedPool(pool); setIsAddCandidateOpen(true); }}>
                      <UserPlus className="mr-1 h-3 w-3" /> Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Pool Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Talent Pool</DialogTitle>
              <DialogDescription>Organize candidates into groups for future positions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pool Name *</Label>
                <Input value={newPool.name} onChange={(e) => setNewPool({ ...newPool, name: e.target.value })} placeholder="e.g., Senior Engineers" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={newPool.description} onChange={(e) => setNewPool({ ...newPool, description: e.target.value })} placeholder="What kind of candidates belong here?" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input value={newPool.tags} onChange={(e) => setNewPool({ ...newPool, tags: e.target.value })} placeholder="engineering, senior, react" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={createPool} disabled={isCreating || !newPool.name.trim()}>
                {isCreating ? 'Creating...' : 'Create Pool'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pool Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedPool?.name}</DialogTitle>
              <DialogDescription>{selectedPool?.description || 'Talent pool candidates'}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mb-2">
              <Button size="sm" onClick={() => setIsAddCandidateOpen(true)}>
                <UserPlus className="mr-1 h-3 w-3" /> Add Candidate
              </Button>
            </div>
            {loadingCandidates ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : poolCandidates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No candidates in this pool yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {poolCandidates.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.candidate_name}</TableCell>
                      <TableCell>{c.candidate_email}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{c.notes || '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(c.added_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeCandidate(c.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Candidate Dialog */}
        <Dialog open={isAddCandidateOpen} onOpenChange={setIsAddCandidateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Candidate</DialogTitle>
              <DialogDescription>Add a candidate to {selectedPool?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={newCandidate.email} onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={newCandidate.notes} onChange={(e) => setNewCandidate({ ...newCandidate, notes: e.target.value })} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCandidateOpen(false)}>Cancel</Button>
              <Button onClick={addCandidate} disabled={isAddingCandidate || !newCandidate.name.trim() || !newCandidate.email.trim()}>
                {isAddingCandidate ? 'Adding...' : 'Add Candidate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ATSTalentPools;
