import { CategoryCard } from "./CategoryCard";

interface AIModel {
  id: string;
  name: string;
  description: string | null;
  provider: string;
  model_id: string;
  priority: number;
}

interface CategoryWithModels {
  category: string;
  description: string;
  templateCount: number;
  activeCount: number;
  models: AIModel[];
}

interface CategoryGridProps {
  categories: CategoryWithModels[];
  isLoading?: boolean;
  onCategoryExpand?: (category: string) => void;
  onModelClick?: (modelId: string) => void;
}

export function CategoryGrid({ categories, isLoading, onCategoryExpand, onModelClick }: CategoryGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div 
            key={index}
            className="h-48 bg-muted/20 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map((category) => (
        <CategoryCard
          key={category.category}
          category={category.category}
          description={category.description}
          templateCount={category.templateCount}
          activeCount={category.activeCount}
          models={category.models}
          onExpand={() => onCategoryExpand?.(category.category)}
          onModelClick={onModelClick}
        />
      ))}
    </div>
  );
}