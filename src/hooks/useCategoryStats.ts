import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CategoryStats {
  category: string;
  description: string;
  templateCount: number;
  activeCount: number;
}

const CATEGORY_DESCRIPTIONS = {
  "Development & Code Execution": "Build, debug, and deploy applications with AI-powered development workflows",
  "Research & Knowledge Work": "Analyze data, conduct research, and synthesize information efficiently",
  "Creative & Design": "Generate content, design assets, and creative solutions for your projects",
  "Business & Marketing": "Optimize operations, create marketing content, and drive business growth"
};

const DEFAULT_CATEGORIES = [
  "Development & Code Execution",
  "Research & Knowledge Work",
  "Creative & Design",
  "Business & Marketing"
];

export function useCategoryStats() {
  return useQuery({
    queryKey: ["category-stats"],
    queryFn: async (): Promise<CategoryStats[]> => {
      try {
        // Try to fetch from prompt_templates table if it exists
        const { data: templates, error } = await supabase
          .from('prompt_templates')
          .select('category, is_active');

        if (error) {
          console.warn('No prompt_templates table found, using default categories:', error.message);
          // Return default categories with zero counts if table doesn't exist
          return DEFAULT_CATEGORIES.map(category => ({
            category,
            description: CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS] || "Manage templates for this category",
            templateCount: 0,
            activeCount: 0
          }));
        }

        // Process the data to get category statistics
        const categoryStats = new Map<string, { total: number; active: number }>();
        
        templates?.forEach(template => {
          const category = template.category || "Uncategorized";
          const current = categoryStats.get(category) || { total: 0, active: 0 };
          categoryStats.set(category, {
            total: current.total + 1,
            active: current.active + (template.is_active ? 1 : 0)
          });
        });

        // Ensure all default categories are included
        const result: CategoryStats[] = DEFAULT_CATEGORIES.map(category => {
          const stats = categoryStats.get(category) || { total: 0, active: 0 };
          return {
            category,
            description: CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS] || "Manage templates for this category",
            templateCount: stats.total,
            activeCount: stats.active
          };
        });

        // Add any additional categories from the database
        categoryStats.forEach((stats, category) => {
          if (!DEFAULT_CATEGORIES.includes(category)) {
            result.push({
              category,
              description: "Custom category templates and workflows",
              templateCount: stats.total,
              activeCount: stats.active
            });
          }
        });

        return result;
      } catch (error) {
        console.error('Error fetching category stats:', error);
        // Return default categories on any error
        return DEFAULT_CATEGORIES.map(category => ({
          category,
          description: CATEGORY_DESCRIPTIONS[category as keyof typeof CATEGORY_DESCRIPTIONS] || "Manage templates for this category",
          templateCount: 0,
          activeCount: 0
        }));
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}