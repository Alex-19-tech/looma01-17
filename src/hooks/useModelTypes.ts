import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ModelType {
  id: string;
  type_name: string;
  type_description: string;
  category: string;
  icon_name: string | null;
  priority: number;
}

export function useModelTypes(modelId?: string) {
  return useQuery({
    queryKey: ["model-types", modelId],
    queryFn: async (): Promise<ModelType[]> => {
      if (!modelId) return [];

      const { data, error } = await supabase
        .rpc('get_model_types_by_model_id', { _model_id: modelId });

      if (error) {
        console.error('Error fetching model types:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!modelId,
  });
}