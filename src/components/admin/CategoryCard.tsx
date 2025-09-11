import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TrendingUp, FileText, Activity, ChevronDown, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface AIModel {
  id: string;
  name: string;
  description: string | null;
  provider: string;
  model_id: string;
  priority: number;
}

interface CategoryCardProps {
  category: string;
  description: string;
  templateCount: number;
  activeCount: number;
  models: AIModel[];
  onExpand?: () => void;
  onModelClick?: (modelId: string) => void;
}

export function CategoryCard({ 
  category, 
  description, 
  templateCount, 
  activeCount, 
  models,
  onExpand,
  onModelClick
}: CategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const activePercentage = templateCount > 0 ? Math.round((activeCount / templateCount) * 100) : 0;
  
  const getActivityStatus = () => {
    if (activePercentage >= 80) return { label: "High Activity", variant: "default" as const };
    if (activePercentage >= 50) return { label: "Moderate Activity", variant: "secondary" as const };
    return { label: "Low Activity", variant: "outline" as const };
  };

  const activityStatus = getActivityStatus();

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
    onExpand?.();
  };

  const handleModelClick = (modelId: string) => {
    console.log('🚀 CategoryCard handleModelClick called with:', modelId);
    console.log('🔄 Navigating to:', `/models/${modelId}`);
    navigate(`/models/${modelId}`);
    console.log('✅ Navigation completed');
    onModelClick?.(modelId);
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CollapsibleTrigger asChild>
          <div 
            className="cursor-pointer w-full"
            onClick={handleCardClick}
          >
            <CardHeader className="relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {category}
                    </CardTitle>
                    <ChevronDown 
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    {description}
                  </CardDescription>
                </div>
                <Badge variant={activityStatus.variant} className="ml-2">
                  <Activity className="w-3 h-3 mr-1" />
                  {activityStatus.label}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="relative">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{templateCount}</p>
                    <p className="text-xs text-muted-foreground">Templates</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{activeCount}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{models.length}</p>
                    <p className="text-xs text-muted-foreground">Models</p>
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-secondary/20 rounded-full h-2 mb-3">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${activePercentage}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {activePercentage}% Active
                </span>
                <span className="text-xs text-primary font-medium">
                  {isExpanded ? 'Click to collapse' : 'Click to expand models'}
                </span>
              </div>
            </CardContent>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-6 pb-6">
          <div className="border-t border-border/50 pt-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Available Models</h4>
            {models.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No models available in this category</p>
            ) : (
              <div className="space-y-2">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card/50 hover:bg-accent/50 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-medium text-foreground">{model.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          {model.provider}
                        </Badge>
                      </div>
                      {model.description && (
                        <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-8 w-8 p-0 hover:bg-primary/10 relative z-10"
                      onMouseDown={(e) => {
                        console.log('🖱️ Arrow button mouseDown for model:', model.id, model.name);
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        console.log('🖱️ Arrow button clicked for model:', model.id, model.name);
                        console.log('🎯 Event target:', e.target);
                        console.log('🎯 Current target:', e.currentTarget);
                        e.preventDefault();
                        e.stopPropagation();
                        handleModelClick(model.id);
                      }}
                    >
                      <ArrowRight className="w-4 h-4 pointer-events-none" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}