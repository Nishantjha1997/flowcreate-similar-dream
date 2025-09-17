import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AIApiKey {
  id: string;
  name: string;
  provider: string;
  key: string;
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

export function useAIApiKeys() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiKeys = [], isLoading, error } = useQuery({
    queryKey: ["ai-api-keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_api_keys")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as AIApiKey[];
    },
  });

  const { data: tokenUsage = [], isLoading: isLoadingUsage } = useQuery({
    queryKey: ["ai-token-usage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_token_usage")
        .select("*")
        .order("provider");
      
      if (error) throw error;
      return data as AITokenUsage[];
    },
  });

  const addAPIKeyMutation = useMutation({
    mutationFn: async (newKey: { name: string; provider: string; key: string }) => {
      const { data, error } = await supabase
        .from("ai_api_keys")
        .insert([{
          name: newKey.name,
          provider: newKey.provider,
          key: newKey.key,
          is_active: true,
          is_primary: apiKeys.length === 0, // First key becomes primary
          is_fallback: false,
          usage_count: 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-api-keys"] });
      toast({
        title: "Success",
        description: "API key added successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateAPIKeyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AIApiKey> }) => {
      const { data, error } = await supabase
        .from("ai_api_keys")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-api-keys"] });
      toast({
        title: "Success",
        description: "API key updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteAPIKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_api_keys")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-api-keys"] });
      toast({
        title: "Success",
        description: "API key deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, remove primary status from all keys
      await supabase
        .from("ai_api_keys")
        .update({ is_primary: false })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all

      // Then set the selected key as primary
      const { data, error } = await supabase
        .from("ai_api_keys")
        .update({ is_primary: true, is_active: true })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-api-keys"] });
      toast({
        title: "Success",
        description: "Primary API key updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const setFallbackMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, remove fallback status from all keys
      await supabase
        .from("ai_api_keys")
        .update({ is_fallback: false })
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all

      // Then set the selected key as fallback
      const { data, error } = await supabase
        .from("ai_api_keys")
        .update({ is_fallback: true, is_active: true })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-api-keys"] });
      toast({
        title: "Success",
        description: "Fallback API key updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    apiKeys,
    tokenUsage,
    isLoading,
    isLoadingUsage,
    error,
    addAPIKey: addAPIKeyMutation.mutate,
    updateAPIKey: updateAPIKeyMutation.mutate,
    deleteAPIKey: deleteAPIKeyMutation.mutate,
    setPrimary: setPrimaryMutation.mutate,
    setFallback: setFallbackMutation.mutate,
    isAdding: addAPIKeyMutation.isPending,
    isUpdating: updateAPIKeyMutation.isPending,
    isDeleting: deleteAPIKeyMutation.isPending,
    isSettingPrimary: setPrimaryMutation.isPending,
    isSettingFallback: setFallbackMutation.isPending
  };
}