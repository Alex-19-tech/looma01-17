import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Sparkles, TrendingUp } from "lucide-react";

interface Template {
  id: string;
  template_text: string;
  placeholders: string[];
  priority: number;
  category: string;
  subcategory?: string;
  tags?: string[];
  usage_count?: number;
  effectiveness_score?: number;
  match_score?: number;
}

interface TemplateSelectorProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
  onPreviewTemplate: (template: Template) => void;
  userInput: string;
  selectedModel?: string;
  modelTemplateCategory?: string;
}

export function TemplateSelector({ 
  templates, 
  onSelectTemplate, 
  onPreviewTemplate, 
  userInput 
}: TemplateSelectorProps) {
  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No matching templates found. Proceeding with custom prompt optimization.
          </p>
        </CardContent>
      </Card>
    );
  }

  const highlightPlaceholders = (text: string, placeholders: string[]) => {
    let highlightedText = text;
    placeholders.forEach(placeholder => {
      const regex = new RegExp(`{${placeholder}}`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<span class="bg-primary/20 text-primary px-1 rounded">{${placeholder}}</span>`
      );
    });
    return highlightedText;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Recommended Templates</h3>
        <Badge variant="secondary">{templates.length} found</Badge>
      </div>
      
      {templates.map((template, index) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                  {index === 0 && (
                    <Badge variant="default" className="text-xs">
                      Best Match
                    </Badge>
                  )}
                  {template.subcategory || template.category}
                  {template.match_score && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(template.match_score * 100)}% match
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  {template.usage_count !== undefined && (
                    <span className="flex items-center gap-1 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      Used {template.usage_count} times
                    </span>
                  )}
                  {template.effectiveness_score && template.effectiveness_score > 0 && (
                    <span className="text-xs">
                      {(template.effectiveness_score * 100).toFixed(0)}% effective
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPreviewTemplate(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onSelectTemplate(template)}
                >
                  Use Template
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div
                className="text-sm bg-muted/50 p-3 rounded-md"
                dangerouslySetInnerHTML={{
                  __html: highlightPlaceholders(
                    template.template_text.substring(0, 200) + 
                    (template.template_text.length > 200 ? '...' : ''),
                    template.placeholders || []
                  )
                }}
              />
              
              {template.placeholders && template.placeholders.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground">Placeholders:</span>
                  {template.placeholders.map(placeholder => (
                    <Badge key={placeholder} variant="outline" className="text-xs">
                      {placeholder}
                    </Badge>
                  ))}
                </div>
              )}
              
              {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don't see what you're looking for?
            </p>
            <Button variant="outline" size="sm">
              Continue with Custom Prompt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}