import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AIApiKey {
  id: string;
  name: string;
  provider: string;
  /** Always masked. The raw secret never crosses the browser boundary. */
  key: string;
  has_secret: boolean;
  is_active: boolean;
  is_primary: boolean;
  is_fallback: boolean;
  usage_count: number;
  last_used: string | null;
  created_at: string;
  updated_at: string;
}

export interface AITokenUsage {
  provider: string;
  total_tokens: number;
  tokens_today: number;
  tokens_this_month: number;
  cost_estimate: number;
}

export type TestStatus = 'idle' | 'testing' | 'success' | 'error';

async function invokeSecrets<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-provider-secrets", { body });
  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));
  return data as T;
}

function normalizeKey(row: Record<string, unknown>): AIApiKey {
  return {
    ...row,
    key: typeof row.key_masked === "string" ? row.key_masked : "••••••••",
    has_secret: Boolean(row.has_secret),
  } as AIApiKey;
}

export function useAIApiKeys() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["ai-api-keys"] });
  const mutationOptions = (description: string) => ({
    onSuccess: () => { void invalidate(); toast({ title: "Success", description }); },
    onError: (mutationError: Error) => toast({ title: "Error", description: mutationError.message, variant: "destructive" as const }),
  });

  // Per-key test status tracking
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  // Draft key test state
  const [draftTestStatus, setDraftTestStatus] = useState<TestStatus>('idle');
  const [isTestingDraft, setIsTestingDraft] = useState(false);

  const { data: apiKeys = [], isLoading, error } = useQuery({
    queryKey: ["ai-api-keys"],
    queryFn: async () => {
      const response = await invokeSecrets<{ data: Record<string, unknown>[] }>({ resource: "ai" });
      return (response.data ?? []).map(normalizeKey);
    },
  });

  const { data: tokenUsage = [], isLoading: isLoadingUsage } = useQuery({
    queryKey: ["ai-token-usage"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_token_usage").select("*").order("provider");
      if (error) throw error;
      return data as AITokenUsage[];
    },
  });

  const addAPIKeyMutation = useMutation({
    mutationFn: (newKey: { name: string; provider: string; key: string }) => invokeSecrets({ resource: "ai", ...newKey }),
    ...mutationOptions("API key added successfully"),
  });
  const updateAPIKeyMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<AIApiKey, "is_active">> }) => invokeSecrets({ resource: "ai", id, updates }),
    ...mutationOptions("API key updated successfully"),
  });
  const deleteAPIKeyMutation = useMutation({
    mutationFn: (id: string) => invokeSecrets({ resource: "ai", id, action: "delete" }),
    ...mutationOptions("API key deleted successfully"),
  });
  const setPrimaryMutation = useMutation({
    mutationFn: (id: string) => invokeSecrets({ resource: "ai", action: "set-primary", id }),
    ...mutationOptions("Primary API key updated successfully"),
  });
  const setFallbackMutation = useMutation({
    mutationFn: (id: string) => invokeSecrets({ resource: "ai", action: "set-fallback", id }),
    ...mutationOptions("Fallback API key updated successfully"),
  });

  const testAPIKey = useCallback(async (id: string) => {
    if (testingId) return; // prevent concurrent tests
    setTestingId(id);
    setTestStatuses(prev => ({ ...prev, [id]: 'testing' }));

    try {
      const { data, error } = await supabase.functions.invoke("test-ai-provider", { body: { id } });
      if (error) throw error;
      if (data?.error || data?.ok === false) throw new Error(String(data?.error ?? "Provider test failed"));

      setTestStatuses(prev => ({ ...prev, [id]: 'success' }));
      toast({ title: "✅ Connection successful", description: `Provider responded: "${String(data.message ?? "OK").slice(0, 80)}"` });

      setTimeout(() => setTestStatuses(prev => ({ ...prev, [id]: 'idle' })), 8000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection test failed";
      setTestStatuses(prev => ({ ...prev, [id]: 'error' }));
      toast({ title: "❌ Connection failed", description: message, variant: "destructive" });

      setTimeout(() => setTestStatuses(prev => ({ ...prev, [id]: 'idle' })), 8000);
    } finally {
      setTestingId(null);
    }
  }, [testingId, toast]);

  const testDraftKey = useCallback(async (provider: string, key: string) => {
    if (!provider || !key.trim() || isTestingDraft) return;
    setIsTestingDraft(true);
    setDraftTestStatus('testing');

    try {
      const { data, error } = await supabase.functions.invoke("test-ai-provider", {
        body: { provider, key: key.trim() }
      });
      if (error) throw error;
      if (data?.error || data?.ok === false) throw new Error(String(data?.error ?? "Provider test failed"));

      setDraftTestStatus('success');
      toast({ title: "✅ Connection successful", description: `Valid API key! Provider responded: "${String(data.message ?? "OK").slice(0, 80)}"` });

      setTimeout(() => setDraftTestStatus('idle'), 8000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection test failed";
      setDraftTestStatus('error');
      toast({ title: "❌ Connection failed", description: message, variant: "destructive" });

      setTimeout(() => setDraftTestStatus('idle'), 8000);
    } finally {
      setIsTestingDraft(false);
    }
  }, [isTestingDraft, toast]);

  return {
    apiKeys, tokenUsage, isLoading, isLoadingUsage, error,
    addAPIKey: addAPIKeyMutation.mutate, updateAPIKey: updateAPIKeyMutation.mutate,
    deleteAPIKey: deleteAPIKeyMutation.mutate, setPrimary: setPrimaryMutation.mutate,
    setFallback: setFallbackMutation.mutate, isAdding: addAPIKeyMutation.isPending,
    isUpdating: updateAPIKeyMutation.isPending, isDeleting: deleteAPIKeyMutation.isPending,
    isSettingPrimary: setPrimaryMutation.isPending, isSettingFallback: setFallbackMutation.isPending,
    testAPIKey,
    testDraftKey,
    testingId,
    testStatuses,
    draftTestStatus,
    isTestingDraft,
    isTesting: testingId !== null || isTestingDraft,
  };
}
