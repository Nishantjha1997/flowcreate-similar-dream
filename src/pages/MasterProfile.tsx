import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDesignMode } from '@/hooks/useDesignMode';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  Plus,
  Edit,
  Trash2,
  Star,
  FileText,
  Copy,
  Loader2,
  ChevronRight,
  Home,
  Layers,
  Sparkles,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { ResumeSpawner } from '@/components/profile/ResumeSpawner';
import { TranslationPanel } from '@/components/profile/TranslationPanel';

interface MasterProfile {
  id: string;
  user_id: string;
  name: string;
  profile_data: Record<string, any>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export default function MasterProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { designMode } = useDesignMode();
  const isNeoBrutalism = designMode === 'neo-brutalism';

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MasterProfile | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'My Account', href: '/account' },
    { label: 'Master Profiles' },
  ];

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['masterProfiles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('master_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as MasterProfile[];
    },
    enabled: !!user?.id,
  });

  const createProfile = async () => {
    if (!user?.id || !newName.trim()) return;
    setIsCreating(true);

    try {
      const { error } = await supabase
        .from('master_profiles')
        .insert([{
          user_id: user.id,
          name: newName.trim(),
          profile_data: {},
          is_default: (profiles?.length || 0) === 0, // First profile is default
        }]);

      if (error) throw error;

      toast.success('Master profile created!');
      queryClient.invalidateQueries({ queryKey: ['masterProfiles'] });
      setCreateOpen(false);
      setNewName('');
    } catch (error: any) {
      toast.error('Failed to create: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsCreating(false);
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('master_profiles')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id!);

      if (error) throw error;

      toast.success('Profile deleted.');
      queryClient.invalidateQueries({ queryKey: ['masterProfiles'] });
      if (selectedProfile?.id === id) setSelectedProfile(null);
    } catch (error: any) {
      toast.error('Failed to delete: ' + (error?.message || 'Unknown error'));
    }
  };

  const setDefault = async (id: string) => {
    try {
      const { error } = await supabase
        .from('master_profiles')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user?.id!);

      if (error) throw error;

      toast.success('Default profile updated.');
      queryClient.invalidateQueries({ queryKey: ['masterProfiles'] });
    } catch (error: any) {
      toast.error('Failed to update: ' + (error?.message || 'Unknown error'));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold mb-4">Please log in to access master profiles</h2>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isNeoBrutalism ? 'neo-brutalism-page' : ''}`}>
      <Header />
      <main className="container max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isNeoBrutalism ? 'uppercase' : ''}`}>
              Master Profiles
            </h1>
            <p className="text-muted-foreground mt-1">
              Create master profiles to quickly spawn custom resumes for different roles.
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className={isNeoBrutalism ? 'border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] uppercase font-bold' : ''}>
                <Plus className="h-4 w-4 mr-2" />
                New Master Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Master Profile</DialogTitle>
                <DialogDescription>
                  A master profile is a template you can use to quickly generate tailored resumes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="profileName">Profile Name</Label>
                  <Input
                    id="profileName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Software Engineer, Data Scientist"
                    className={isNeoBrutalism ? 'border-2 border-foreground' : ''}
                  />
                </div>
                <Button
                  onClick={createProfile}
                  disabled={isCreating || !newName.trim()}
                  className="w-full"
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isCreating ? 'Creating...' : 'Create Profile'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile List */}
          <Card className={`lg:col-span-1 ${isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-base ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
                <Layers className="h-5 w-5" />
                Your Profiles
              </CardTitle>
              <CardDescription>
                {profiles?.length || 0} profile{(profiles?.length || 0) !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-10 w-10 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (!profiles || profiles.length === 0) ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Layers className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No master profiles yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Create one to get started</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <div className="p-2 space-y-1">
                    {profiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => setSelectedProfile(profile)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                          selectedProfile?.id === profile.id
                            ? isNeoBrutalism
                              ? 'bg-primary text-primary-foreground border-2 border-foreground'
                              : 'bg-primary/5 border border-primary/20'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${
                          selectedProfile?.id === profile.id
                            ? isNeoBrutalism ? 'bg-primary-foreground/20' : 'bg-primary/10'
                            : 'bg-muted'
                        }`}>
                          <User className={`h-4 w-4 ${
                            selectedProfile?.id === profile.id && !isNeoBrutalism ? 'text-primary' : ''
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{profile.name}</p>
                            {profile.is_default && (
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(profile.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight className={`h-4 w-4 shrink-0 ${
                          selectedProfile?.id === profile.id ? 'opacity-100' : 'opacity-30'
                        }`} />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Profile Detail / Actions */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedProfile ? (
              <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Select a Profile</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Choose a master profile from the list to manage it, spawn resumes, or translate content.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Profile Header */}
                <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className={`text-lg flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
                          {selectedProfile.name}
                          {selectedProfile.is_default && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-[10px]">
                              <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                              Default
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Created {new Date(selectedProfile.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {!selectedProfile.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDefault(selectedProfile.id)}
                            className={isNeoBrutalism ? 'border-2 border-foreground' : ''}
                          >
                            <Star className="h-3.5 w-3.5 mr-1" />
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProfile(selectedProfile.id)}
                          className={`text-destructive hover:text-destructive ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Resume Spawner */}
                <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
                  <CardHeader>
                    <CardTitle className={`text-base flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
                      <Copy className="h-5 w-5" />
                      Spawn Resume
                    </CardTitle>
                    <CardDescription>
                      Generate a new resume pre-filled with this master profile's data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResumeSpawner masterProfile={selectedProfile} />
                  </CardContent>
                </Card>

                {/* Translation Panel */}
                <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
                  <CardHeader>
                    <CardTitle className={`text-base flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}>
                      <Sparkles className="h-5 w-5" />
                      Translate Resume
                    </CardTitle>
                    <CardDescription>
                      Translate your resume content to another language using AI.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TranslationPanel
                      resumeData={selectedProfile.profile_data as Record<string, any>}
                      profileId={selectedProfile.id}
                      onTranslated={(data) => {
                        // Refetch profiles to get latest data
                        queryClient.invalidateQueries({ queryKey: ['masterProfiles'] });
                      }}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
