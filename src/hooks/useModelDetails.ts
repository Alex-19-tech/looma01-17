import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ModelDetails {
  id: string;
  name: string;
  description: string | null;
  provider: string;
  model_id: string;
  category: string;
  priority: number;
  is_active: boolean;
}

export function useModelDetails(modelId?: string) {
  return useQuery({
    queryKey: ["model-details", modelId],
    queryFn: async (): Promise<ModelDetails | null> => {
      if (!modelId) return null;

      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .eq('id', modelId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching model details:', error);
        throw error;
      }

      return data;
    },
    enabled: !!modelId,
  });
}