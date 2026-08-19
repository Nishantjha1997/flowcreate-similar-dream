import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { testProviderDirectly } from "@/utils/ai/directTester";

export interface AIApiKey {
  id: string;
  name: string;
  provider: string;
  /** Always masked when returned from secure endpoints. */
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

function maskKey(value: unknown): string {
  if (typeof value !== 'string' || !value) return '••••••••';
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 4)}${'•'.repeat(Math.min(24, Math.max(4, value.length - 8)))}${value.slice(-4)}`;
}

function normalizeKey(row: Record<string, unknown>): AIApiKey {
  const rawKey = typeof row.key === 'string' ? row.key : '';
  const maskedKey = typeof row.key_masked === 'string' ? row.key_masked : maskKey(rawKey);
  return {
    ...row,
    key: maskedKey,
    has_secret: Boolean(row.has_secret || rawKey),
  } as AIApiKey;
}

// Provider secrets are service-role-only. The browser always goes through the
// protected Edge Function; there is deliberately no direct-table fallback.
async function invokeSecrets<T>(
  action: 'list' | 'add' | 'update' | 'delete' | 'set-primary' | 'set-fallback',
  payload: Record<string, unknown> = {}
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-provider-secrets", {
    body: { resource: "ai", ...payload, action: action === 'list' ? undefined : action },
  });
  if (error) throw error;
  if (!data || data.error) throw new Error(String(data?.error ?? "Secure provider settings are unavailable."));
  return data as T;
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

  const { data: apiKeys = [], isLoading, error, refetch } = useQuery({
    queryKey: ["ai-api-keys"],
    queryFn: async () => {
      const response = await invokeSecrets<{ data: Record<string, unknown>[] }>('list');
      return (response.data ?? []).map(normalizeKey);
    },
  });

  const { data: tokenUsage = [], isLoading: isLoadingUsage } = useQuery({
    queryKey: ["ai-token-usage"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_token_usage").select("*").order("provider");
      if (error) {
        console.warn("[AIApiKeys] Failed to fetch ai_token_usage:", error);
        return [];
      }
      return data as AITokenUsage[];
    },
  });

  const addAPIKeyMutation = useMutation({
    mutationFn: (newKey: { name: string; provider: string; key: string }) => invokeSecrets('add', newKey),
    ...mutationOptions("API key added successfully"),
  });
  const updateAPIKeyMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<AIApiKey, "is_active">> }) => invokeSecrets('update', { id, updates }),
    ...mutationOptions("API key updated successfully"),
  });
  const deleteAPIKeyMutation = useMutation({
    mutationFn: (id: string) => invokeSecrets('delete', { id }),
    ...mutationOptions("API key deleted successfully"),
  });
  const setPrimaryMutation = useMutation({
    mutationFn: (id: string) => invokeSecrets('set-primary', { id }),
    ...mutationOptions("Primary API key updated successfully"),
  });
  const setFallbackMutation = useMutation({
    mutationFn: (id: string) => invokeSecrets('set-fallback', { id }),
    ...mutationOptions("Fallback API key updated successfully"),
  });

  // Test an existing saved key
  const testAPIKey = useCallback(async (id: string) => {
    if (testingId) return;
    setTestingId(id);
    setTestStatuses(prev => ({ ...prev, [id]: 'testing' }));

    try {
      // 1. Try edge function
      let testedOk = false;
      let replyMessage = '';

      try {
        const { data, error } = await supabase.functions.invoke("test-ai-provider", { body: { id } });
        if (!error && data?.ok) {
          testedOk = true;
          replyMessage = String(data.message ?? 'OK');
        } else if (data?.error) {
          throw new Error(data.error);
        }
      } catch (efErr) {
        console.warn("[testAPIKey] Secure test-ai-provider function failed:", efErr);
      }

      // Saved secrets are intentionally never fetched into the browser. If the
      // secure tester is unavailable, surface an actionable deployment error
      // instead of weakening the secret boundary with a direct DB request.
      if (!testedOk) {
        throw new Error("Saved-key testing is temporarily unavailable. Deploy the test-ai-provider Edge Function and try again.");
      }

      setTestStatuses(prev => ({ ...prev, [id]: 'success' }));
      toast({ title: "✅ Connection successful", description: `Provider responded: "${replyMessage.slice(0, 80)}"` });
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

  // Test a draft key before saving
  const testDraftKey = useCallback(async (provider: string, key: string) => {
    if (!provider || !key.trim() || isTestingDraft) return;
    setIsTestingDraft(true);
    setDraftTestStatus('testing');

    try {
      // 1. Try direct test first (fastest, most reliable in client admin console)
      const directResult = await testProviderDirectly(provider, key);
      if (directResult.ok) {
        setDraftTestStatus('success');
        toast({ title: "✅ Connection successful", description: `Valid ${provider} key! Response: "${(directResult.message ?? "OK").slice(0, 80)}"` });
        setTimeout(() => setDraftTestStatus('idle'), 8000);
        return;
      }

      // 2. If direct test threw CORS/network error, try edge function as backup
      try {
        const { data, error } = await supabase.functions.invoke("test-ai-provider", {
          body: { provider, key: key.trim() }
        });
        if (!error && data?.ok) {
          setDraftTestStatus('success');
          toast({ title: "✅ Connection successful", description: `Valid key! Response: "${String(data.message ?? "OK").slice(0, 80)}"` });
          setTimeout(() => setDraftTestStatus('idle'), 8000);
          return;
        }
      } catch {
        // use directResult error
      }

      throw new Error(directResult.error ?? "Provider connection failed");
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
    apiKeys, tokenUsage, isLoading, isLoadingUsage, error, refetch,
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
