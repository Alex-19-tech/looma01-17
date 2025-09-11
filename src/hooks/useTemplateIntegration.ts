import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TemplateIntegrationParams {
  categoryId?: string;
  modelId?: string;
  typeId?: string;
}

interface Template {
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

export function useTemplateIntegration({ categoryId, modelId, typeId }: TemplateIntegrationParams) {
  return useQuery({
    queryKey: ["template-integration", categoryId, modelId, typeId],
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
      return data as Template[];
    },
    enabled: !!typeId,
  });
}

// Hook to get the best template for AI workflow processing
export function useBestTemplateForWorkflow(typeId?: string) {
  const { data: templates = [] } = useTemplateIntegration({ typeId });
  
  // Return the highest scored, most used, or most recent template
  const bestTemplate = templates.length > 0 ? templates[0] : null;
  
  return {
    template: bestTemplate,
    hasTemplates: templates.length > 0,
    templateCount: templates.length,
    allTemplates: templates
  };
}

// Hook to update template performance after usage
export function useUpdateTemplatePerformance() {
  return async (templateId: string, performanceScore?: number, effectivenessRating?: number) => {
    try {
      // Update usage count
      const { error: usageError } = await supabase.rpc('update_template_usage', {
        _template_id: templateId,
        _effectiveness_rating: effectivenessRating
      });
      
      if (usageError) {
        console.error('Error updating template usage:', usageError);
        return;
      }

      // Update performance score if provided
      if (performanceScore !== undefined) {
        const { error: performanceError } = await supabase
          .from('type_templates')
          .update({ 
            performance_score: performanceScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId);

        if (performanceError) {
          console.error('Error updating template performance:', performanceError);
        }
      }
    } catch (error) {
      console.error('Error in template performance update:', error);
    }
  };
}

// Hook to select template based on user input similarity
export function useTemplateSelection(userInput: string, typeId?: string) {
  const { data: templates = [] } = useTemplateIntegration({ typeId });
  
  const selectBestTemplate = () => {
    if (templates.length === 0) return null;
    
    // Simple keyword matching for now
    const inputLower = userInput.toLowerCase();
    
    // Score templates based on keyword matches and metadata
    const scoredTemplates = templates.map(template => {
      let score = template.effectiveness_score * 0.4 + template.usage_count * 0.1;
      
      // Keyword matching in template text
      const templateLower = template.template_text.toLowerCase();
      const words = inputLower.split(' ').filter(word => word.length > 3);
      const matches = words.filter(word => templateLower.includes(word)).length;
      score += matches * 0.3;
      
      // Tag matching
      if (template.tags) {
        const tagMatches = template.tags.filter(tag => 
          inputLower.includes(tag.toLowerCase())
        ).length;
        score += tagMatches * 0.2;
      }
      
      return { ...template, calculatedScore: score };
    });
    
    // Return the highest scored template
    return scoredTemplates.sort((a, b) => b.calculatedScore - a.calculatedScore)[0];
  };
  
  return {
    selectTemplate: selectBestTemplate,
    availableTemplates: templates
  };
}