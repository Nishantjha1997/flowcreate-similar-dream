import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { UserProfile } from '@/hooks/useUserProfile';

// A "master profile" is a superset profile (stored as a JSONB blob, same
// shape as UserProfile) that resumes can be spawned from - distinct from the
// single per-account `profiles` row edited elsewhere in Account Settings.
// Most users only ever have one (their default); the schema supports several
// named ones for people who maintain very different profiles (e.g. one for
// engineering roles, one for management).

export interface MasterProfile {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  profile_data: Partial<UserProfile>;
  created_at: string;
  updated_at: string;
}

const DEFAULT_PROFILE_NAME = 'Master Profile';

export const useMasterProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['masterProfiles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('master_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as MasterProfile[];
    },
    enabled: !!user?.id,
  });

  // The profile the rest of the UI works with: the default one, or the first
  // one if none is flagged default, or undefined if the user has none yet.
  const defaultProfile = profiles.find((p) => p.is_default) ?? profiles[0];

  const createMutation = useMutation({
    mutationFn: async (initialData: Partial<UserProfile> = {}) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('master_profiles')
        .insert({
          user_id: user.id,
          name: DEFAULT_PROFILE_NAME,
          is_default: profiles.length === 0,
          profile_data: initialData as any,
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as MasterProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterProfiles'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create master profile: ${error.message}`);
    },
  });

  // Merge `updates` into the default master profile's profile_data, creating
  // one first if the user doesn't have one yet. This is the single entry
  // point both the manual edit form and the PDF-import flow use.
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user?.id) throw new Error('User not authenticated');

      if (!defaultProfile) {
        const { data, error } = await supabase
          .from('master_profiles')
          .insert({
            user_id: user.id,
            name: DEFAULT_PROFILE_NAME,
            is_default: true,
            profile_data: updates as any,
          })
          .select()
          .single();
        if (error) throw error;
        return data as unknown as MasterProfile;
      }

      const merged = { ...(defaultProfile.profile_data as object), ...updates };
      const { data, error } = await supabase
        .from('master_profiles')
        .update({ profile_data: merged as any })
        .eq('id', defaultProfile.id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as MasterProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterProfiles'] });
      toast.success('Master profile updated!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update master profile: ${error.message}`);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (profileId: string) => {
      // The DB trigger enforce_single_default_master_profile clears the
      // previous default automatically when this one is set.
      const { error } = await supabase
        .from('master_profiles')
        .update({ is_default: true })
        .eq('id', profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterProfiles'] });
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from('master_profiles').update({ name }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['masterProfiles'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase.from('master_profiles').delete().eq('id', profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterProfiles'] });
      toast.success('Master profile deleted');
    },
  });

  return {
    profiles,
    defaultProfile,
    isLoading,
    createProfile: createMutation.mutate,
    updateProfile: updateMutation.mutate,
    setDefault: setDefaultMutation.mutate,
    renameProfile: renameMutation.mutate,
    deleteProfile: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isCreating: createMutation.isPending,
  };
};
