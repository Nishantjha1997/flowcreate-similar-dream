import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PaymentGatewayKey {
  id: string;
  provider: "razorpay" | "stripe";
  key_id: string | null;
  key_secret: string | null;
  webhook_secret: string | null;
  has_secret: boolean;
  has_webhook_secret: boolean;
  is_live: boolean;
  is_active: boolean;
  last_used: string | null;
  created_at: string;
  updated_at: string;
}

async function invokeSecrets<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-provider-secrets", { body });
  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));
  return data as T;
}

function normalizeGateway(row: Record<string, unknown>): PaymentGatewayKey {
  return {
    ...row,
    key_secret: typeof row.key_secret_masked === "string" ? row.key_secret_masked : null,
    webhook_secret: typeof row.webhook_secret_masked === "string" ? row.webhook_secret_masked : null,
    has_secret: Boolean(row.has_secret),
    has_webhook_secret: Boolean(row.has_webhook_secret),
  } as PaymentGatewayKey;
}

export function usePaymentGatewayKeys() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["payment-gateway-keys"] });
  const mutationOptions = (description: string) => ({
    onSuccess: () => { void invalidate(); toast({ title: "Success", description }); },
    onError: (mutationError: Error) => toast({ title: "Error", description: mutationError.message, variant: "destructive" as const }),
  });

  const { data: gatewayKeys = [], isLoading, error } = useQuery({
    queryKey: ["payment-gateway-keys"],
    queryFn: async () => {
      const response = await invokeSecrets<{ data: Record<string, unknown>[] }>({ resource: "payment" });
      return (response.data ?? []).map(normalizeGateway);
    },
  });

  const saveKeyMutation = useMutation({
    mutationFn: (input: { provider: "razorpay" | "stripe"; key_id?: string; key_secret?: string; webhook_secret?: string; is_live: boolean }) =>
      invokeSecrets({ resource: "payment", ...input }),
    ...mutationOptions("Payment gateway keys saved"),
  });
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      invokeSecrets({ resource: "payment", action: "toggle-active", id, is_active }),
    ...mutationOptions("Gateway status updated"),
  });
  const deleteKeyMutation = useMutation({
    mutationFn: (id: string) => invokeSecrets({ resource: "payment", action: "delete", id }),
    ...mutationOptions("Gateway keys removed"),
  });

  return {
    gatewayKeys, isLoading, error,
    saveKey: saveKeyMutation.mutate,
    toggleActive: toggleActiveMutation.mutate,
    deleteKey: deleteKeyMutation.mutate,
    isSaving: saveKeyMutation.isPending,
    isDeleting: deleteKeyMutation.isPending,
  };
}
