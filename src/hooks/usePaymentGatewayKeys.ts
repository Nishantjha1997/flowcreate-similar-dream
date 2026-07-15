import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PaymentGatewayKey {
  id: string;
  provider: "razorpay" | "stripe";
  key_id: string | null;
  key_secret: string | null;
  webhook_secret: string | null;
  is_live: boolean;
  is_active: boolean;
  last_used: string | null;
  created_at: string;
  updated_at: string;
}

export function usePaymentGatewayKeys() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gatewayKeys = [], isLoading, error } = useQuery({
    queryKey: ["payment-gateway-keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_gateway_keys")
        .select("*")
        .order("provider");

      if (error) throw error;
      return data as PaymentGatewayKey[];
    },
  });

  const saveKeyMutation = useMutation({
    mutationFn: async (input: {
      provider: "razorpay" | "stripe";
      key_id?: string;
      key_secret?: string;
      webhook_secret?: string;
      is_live: boolean;
    }) => {
      const { data, error } = await supabase
        .from("payment_gateway_keys")
        .upsert(
          {
            provider: input.provider,
            key_id: input.key_id || null,
            key_secret: input.key_secret || null,
            webhook_secret: input.webhook_secret || null,
            is_live: input.is_live,
            is_active: true,
          },
          { onConflict: "provider" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-gateway-keys"] });
      toast({ title: "Success", description: "Payment gateway keys saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("payment_gateway_keys")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-gateway-keys"] });
      toast({ title: "Success", description: "Gateway status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payment_gateway_keys").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-gateway-keys"] });
      toast({ title: "Success", description: "Gateway keys removed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    gatewayKeys,
    isLoading,
    error,
    saveKey: saveKeyMutation.mutate,
    toggleActive: toggleActiveMutation.mutate,
    deleteKey: deleteKeyMutation.mutate,
    isSaving: saveKeyMutation.isPending,
    isDeleting: deleteKeyMutation.isPending,
  };
}
