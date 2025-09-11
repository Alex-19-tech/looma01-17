import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AIModel {
  id: string;
  name: string;
  category: string;
  description: string | null;
  provider: string;
  model_id: string;
  is_active: boolean;
  priority: number;
}

interface CategoryWithModels {
  category: string;
  description: string;
  templateCount: number;
  activeCount: number;
  models: AIModel[];
}

const CATEGORY_DESCRIPTIONS = {
  "Development & Code Execution": "Build, debug, and deploy applications with AI-powered development workflows",
  "Research & Knowledge Work": "Analyze data, conduct research, and synthesize information efficiently",
  "Creative & Design": "Generate content, design assets, and creative solutions for your projects",
  "Business & Marketing": "Optimize operations, create marketing content, and drive business growth"
};

export function useModelsCatalog() {
  return useQuery({
    queryKey: ["models-catalog"],
    queryFn: async (): Promise<CategoryWithModels[]> => {
      try {
        // Fetch models from ai_models table
        const { data: models, error: modelsError } = await supabase
          .from('ai_models')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false });

        if (modelsError) {
          console.warn('No ai_models table found, using default categories:', modelsError.message);
          
          // Return default categories with zero counts if models table doesn't exist
          const defaultCategories = Object.keys(CATEGORY_DESCRIPTIONS);
          return defaultCategories.map(category => ({
            category,
            description: CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS],
            templateCount: 0,
            activeCount: 0,
            models: []
          }));
        }

        // Fetch template stats for each category
        const { data: templates, error: templatesError } = await supabase
          .from('prompt_templates')
          .select('category, is_active');

        // Process template statistics
        const templateStats = new Map<string, { total: number; active: number }>();
        templates?.forEach(template => {
          const category = template.category || "Uncategorized";
          const current = templateStats.get(category) || { total: 0, active: 0 };
          templateStats.set(category, {
            total: current.total + 1,
            active: current.active + (template.is_active ? 1 : 0)
          });
        });

        // Group models by category
        const modelsByCategory = new Map<string, AIModel[]>();
        models?.forEach(model => {
          const category = model.category;
          if (!modelsByCategory.has(category)) {
            modelsByCategory.set(category, []);
          }
          modelsByCategory.get(category)!.push(model);
        });

        // Ensure all default categories are included
        const allCategories = new Set([
          ...Object.keys(CATEGORY_DESCRIPTIONS),
          ...(models?.map(m => m.category) || [])
        ]);

        const result: CategoryWithModels[] = Array.from(allCategories).map(category => {
          const stats = templateStats.get(category) || { total: 0, active: 0 };
          const categoryModels = modelsByCategory.get(category) || [];
          
          return {
            category,
            description: CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS] || "Custom category templates and workflows",
            templateCount: stats.total,
            activeCount: stats.active,
            models: categoryModels
          };
        });

        return result.sort((a, b) => b.models.length - a.models.length);
      } catch (error) {
        console.error('Error fetching models catalog:', error);
        
        // Return default categories on any error
        const defaultCategories = Object.keys(CATEGORY_DESCRIPTIONS);
        return defaultCategories.map(category => ({
          category,
          description: CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS],
          templateCount: 0,
          activeCount: 0,
          models: []
        }));
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}