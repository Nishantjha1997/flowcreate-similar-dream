import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ResumeShare {
  id: string;
  resume_id: string;
  user_id: string;
  share_token: string;
  is_active: boolean;
  allow_comments: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResumeComment {
  id: string;
  share_id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  section_ref: string | null;
  is_resolved: boolean;
  created_at: string;
}

/**
 * Hook for managing resume shares and comments.
 * - Owners can create, list, and toggle shares.
 * - Public users can fetch share details and add comments.
 */
export function useResumeSharing() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // ── Create a new share link ──
  const createShare = useCallback(async (resumeId: string, options?: { allowComments?: boolean; expiresAt?: string }) => {
    if (!user?.id) {
      toast.error('You must be logged in to share a resume.');
      return null;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('resume_shares')
        .insert([{
          resume_id: resumeId,
          user_id: user.id,
          allow_comments: options?.allowComments ?? true,
          expires_at: options?.expiresAt ?? null,
        }])
        .select('*')
        .single();

      if (error) throw error;

      toast.success('Share link created!');
      queryClient.invalidateQueries({ queryKey: ['resumeShares', resumeId] });
      return data as ResumeShare;
    } catch (error: any) {
      toast.error('Failed to create share: ' + (error?.message || 'Unknown error'));
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user, queryClient]);

  // ── Toggle share active state ──
  const toggleShareActive = useCallback(async (shareId: string, isActive: boolean) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('resume_shares')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', shareId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(isActive ? 'Share link activated.' : 'Share link deactivated.');
      queryClient.invalidateQueries({ queryKey: ['resumeShares'] });
    } catch (error: any) {
      toast.error('Failed to update share: ' + (error?.message || 'Unknown error'));
    }
  }, [user, queryClient]);

  // ── Toggle allow_comments on a share ──
  const toggleAllowComments = useCallback(async (shareId: string, allowComments: boolean) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('resume_shares')
        .update({ allow_comments: allowComments, updated_at: new Date().toISOString() })
        .eq('id', shareId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(allowComments ? 'Comments enabled.' : 'Comments disabled.');
      queryClient.invalidateQueries({ queryKey: ['resumeShares'] });
    } catch (error: any) {
      toast.error('Failed to update share: ' + (error?.message || 'Unknown error'));
    }
  }, [user, queryClient]);

  // ── Delete a share ──
  const deleteShare = useCallback(async (shareId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('resume_shares')
        .delete()
        .eq('id', shareId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Share link deleted.');
      queryClient.invalidateQueries({ queryKey: ['resumeShares'] });
    } catch (error: any) {
      toast.error('Failed to delete share: ' + (error?.message || 'Unknown error'));
    }
  }, [user, queryClient]);

  // ── Add a comment (public — no auth required) ──
  const addComment = useCallback(async (
    shareId: string,
    authorName: string,
    content: string,
    authorEmail?: string,
    sectionRef?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('resume_comments')
        .insert([{
          share_id: shareId,
          author_name: authorName,
          author_email: authorEmail ?? null,
          content,
          section_ref: sectionRef ?? null,
        }])
        .select('*')
        .single();

      if (error) throw error;

      toast.success('Comment added!');
      queryClient.invalidateQueries({ queryKey: ['resumeComments', shareId] });
      return data as ResumeComment;
    } catch (error: any) {
      toast.error('Failed to add comment: ' + (error?.message || 'Unknown error'));
      return null;
    }
  }, [queryClient]);

  // ── Resolve a comment (owner only) ──
  const resolveComment = useCallback(async (commentId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('resume_comments')
        .update({ is_resolved: true })
        .eq('id', commentId);

      if (error) throw error;

      toast.success('Comment resolved.');
      queryClient.invalidateQueries({ queryKey: ['resumeComments'] });
    } catch (error: any) {
      toast.error('Failed to resolve comment: ' + (error?.message || 'Unknown error'));
    }
  }, [user, queryClient]);

  return {
    isCreating,
    createShare,
    toggleShareActive,
    toggleAllowComments,
    deleteShare,
    addComment,
    resolveComment,
  };
}

/**
 * Fetch a share by its token (public — no auth required).
 * Also fetches the linked resume data via the share.
 */
export function useShareByToken(token: string | undefined) {
  return useQuery({
    queryKey: ['shareByToken', token],
    queryFn: async () => {
      if (!token) return null;

      // Fetch the share
      const { data: share, error: shareError } = await supabase
        .from('resume_shares')
        .select('*')
        .eq('share_token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (shareError) throw shareError;
      if (!share) return null;

      // Check expiry
      if (share.expires_at && new Date(share.expires_at) < new Date()) {
        return { share: share as ResumeShare, resume: null, expired: true };
      }

      // Fetch the linked resume (public read via RLS policy)
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('id, resume_data, template_id, updated_at')
        .eq('id', share.resume_id)
        .maybeSingle();

      if (resumeError) throw resumeError;

      return {
        share: share as ResumeShare,
        resume: resume ?? null,
        expired: false,
      };
    },
    enabled: !!token,
    retry: 1,
    staleTime: 60_000,
  });
}

/**
 * Fetch comments for a share (public — no auth required).
 */
export function useShareComments(shareId: string | undefined) {
  return useQuery({
    queryKey: ['resumeComments', shareId],
    queryFn: async () => {
      if (!shareId) return [];
      const { data, error } = await supabase
        .from('resume_comments')
        .select('*')
        .eq('share_id', shareId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ResumeComment[];
    },
    enabled: !!shareId,
    staleTime: 30_000,
  });
}

/**
 * Fetch all shares for a resume (owner only).
 */
export function useResumeShares(resumeId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['resumeShares', resumeId],
    queryFn: async () => {
      if (!resumeId || !user?.id) return [];
      const { data, error } = await supabase
        .from('resume_shares')
        .select('*')
        .eq('resume_id', resumeId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ResumeShare[];
    },
    enabled: !!resumeId && !!user?.id,
  });
}
