
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  usage: number;
  createdAt: string;
  templateKey: string;
  featured?: boolean;
  atsOptimized?: boolean;
}

export function useTemplates() {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["resume-templates"],
    queryFn: async (): Promise<Template[]> => {
      const { data, error } = await supabase
        .from("resume_templates")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;

      return (data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description || "",
        isActive: t.is_active,
        usage: t.usage_count || 0,
        createdAt: t.created_at?.split("T")[0] || "",
        templateKey: t.template_key,
        featured: t.is_featured,
        atsOptimized: t.is_ats_optimized,
      }));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) return;
      const { error } = await supabase
        .from("resume_templates")
        .update({ is_active: !template.isActive })
        .eq("id", templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume-templates"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from("resume_templates")
        .delete()
        .eq("id", templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume-templates"] });
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newTemplate: Omit<Template, "id" | "usage" | "createdAt">) => {
      const { error } = await supabase.from("resume_templates").insert({
        name: newTemplate.name,
        template_key: newTemplate.templateKey,
        category: newTemplate.category,
        description: newTemplate.description,
        is_active: newTemplate.isActive,
        is_featured: newTemplate.featured || false,
        is_ats_optimized: newTemplate.atsOptimized || false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume-templates"] });
    },
  });

  const toggleTemplate = (templateId: string) => {
    toggleMutation.mutate(templateId);
  };

  const deleteTemplate = (templateId: string) => {
    deleteMutation.mutate(templateId);
  };

  const addTemplate = (newTemplate: Omit<Template, "id" | "usage" | "createdAt">) => {
    addMutation.mutate(newTemplate);
  };

  return {
    templates,
    isLoading,
    toggleTemplate,
    deleteTemplate,
    addTemplate,
  };
}
