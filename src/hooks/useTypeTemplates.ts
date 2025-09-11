import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TypeTemplate {
  id: string;
  template_text: string;
  tags: string[];
  priority: number;
  effectiveness_score: number;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  metadata: any;
}

export function useTypeTemplates(typeId?: string) {
  return useQuery({
    queryKey: ["type-templates", typeId],
    queryFn: async () => {
      if (!typeId) return [];
      
      const { data, error } = await supabase
        .from('type_templates')
        .select('*')
        .eq('type_id', typeId)
        .eq('is_active', true)
        .order('effectiveness_score', { ascending: false })
        .order('usage_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TypeTemplate[];
    },
    enabled: !!typeId,
  });
}

// Hook to get the best template for a specific type
export function useBestTemplate(typeId?: string) {
  const { data: templates = [] } = useTypeTemplates(typeId);
  
  // Return the highest scored, most used, or most recent template
  const bestTemplate = templates.length > 0 ? templates[0] : null;
  
  return bestTemplate;
}

// Hook to update template usage
export function useUpdateTemplateUsage() {
  return async (templateId: string, effectivenessRating?: number) => {
    const { error } = await supabase.rpc('update_template_usage', {
      _template_id: templateId,
      _effectiveness_rating: effectivenessRating
    });
    
    if (error) {
      console.error('Error updating template usage:', error);
    }
  };
}