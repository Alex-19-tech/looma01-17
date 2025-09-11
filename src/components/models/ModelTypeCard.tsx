import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface ModelType {
  id: string;
  type_name: string;
  type_description: string;
  category: string;
  icon_name?: string;
  priority: number;
}

interface ModelTypeCardProps {
  type: ModelType;
  onClick: () => void;
  onLongPress: () => void;
}

export function ModelTypeCard({ type, onClick, onLongPress }: ModelTypeCardProps) {
  const getIcon = (iconName?: string) => {
    if (!iconName) return Plus;
    
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || Plus;
  };

  const Icon = getIcon(type.icon_name);

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-lg group relative overflow-hidden hover:scale-[1.02]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Action Buttons */}
      <div className="absolute top-3 right-3 z-10 flex gap-1">
        {/* Template Management Arrow */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 bg-background/80 hover:bg-secondary/20 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onLongPress();
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        
        {/* Feed Data Plus */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 bg-background/80 hover:bg-primary/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <CardHeader className="relative pb-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              {type.type_name}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          {type.type_description}
        </CardDescription>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-primary font-medium">
            Click + to feed data
          </span>
          <span className="text-xs text-muted-foreground">
            Click → for templates
          </span>
        </div>
      </CardContent>
    </Card>
  );
}