import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Edit, RefreshCw } from "lucide-react";

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
}

interface TemplatePreviewProps {
  template: Template | null;
  userInput: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (template: Template, filledTemplate: string, placeholderValues: Record<string, string>) => void;
}

export function TemplatePreview({ 
  template, 
  userInput, 
  isOpen, 
  onClose, 
  onConfirm 
}: TemplatePreviewProps) {
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [filledTemplate, setFilledTemplate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [customTemplate, setCustomTemplate] = useState("");

  React.useEffect(() => {
    if (template) {
      // Auto-populate placeholders with user input analysis
      const autoValues = extractPlaceholderValues(userInput, template.placeholders || []);
      setPlaceholderValues(autoValues);
      
      // Generate filled template
      const filled = fillTemplate(template.template_text, autoValues);
      setFilledTemplate(filled);
      setCustomTemplate(filled);
    }
  }, [template, userInput]);

  const extractPlaceholderValues = (input: string, placeholders: string[]): Record<string, string> => {
    const values: Record<string, string> = {};
    
    placeholders.forEach(placeholder => {
      switch (placeholder.toLowerCase()) {
        case 'topic':
        case 'subject':
          // Extract main topic from user input
          const topicMatch = input.match(/(?:about|for|regarding|on)\s+([^,.!?]+)/i);
          values[placeholder] = topicMatch ? topicMatch[1].trim() : input.split(' ').slice(0, 3).join(' ');
          break;
        case 'style':
          const styleKeywords = ['formal', 'casual', 'professional', 'creative', 'technical'];
          const foundStyle = styleKeywords.find(style => input.toLowerCase().includes(style));
          values[placeholder] = foundStyle || 'professional';
          break;
        case 'target_audience':
        case 'audience':
          const audienceMatch = input.match(/(?:for|to|audience)\s+([^,.!?]+)/i);
          values[placeholder] = audienceMatch ? audienceMatch[1].trim() : 'general audience';
          break;
        case 'length':
          if (input.includes('short')) values[placeholder] = 'brief';
          else if (input.includes('long') || input.includes('detailed')) values[placeholder] = 'comprehensive';
          else values[placeholder] = 'medium';
          break;
        default:
          values[placeholder] = '';
      }
    });
    
    return values;
  };

  const fillTemplate = (template: string, values: Record<string, string>): string => {
    let filled = template;
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'gi');
      filled = filled.replace(regex, value || `{${key}}`);
    });
    return filled;
  };

  const handlePlaceholderChange = (placeholder: string, value: string) => {
    const newValues = { ...placeholderValues, [placeholder]: value };
    setPlaceholderValues(newValues);
    
    const filled = fillTemplate(template?.template_text || '', newValues);
    setFilledTemplate(filled);
    setCustomTemplate(filled);
  };

  const handleConfirm = () => {
    if (template) {
      onConfirm(template, isEditing ? customTemplate : filledTemplate, placeholderValues);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Template Preview
            <Badge variant="outline">{template.category}</Badge>
            {template.subcategory && (
              <Badge variant="secondary">{template.subcategory}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Review and customize the template before applying it to your prompt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Priority:</span>
                  <span className="ml-2 font-medium">{template.priority}/10</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Used:</span>
                  <span className="ml-2 font-medium">{template.usage_count || 0} times</span>
                </div>
              </div>
              
              {template.tags && template.tags.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Placeholder Values */}
          {template.placeholders && template.placeholders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Customize Placeholders</CardTitle>
                <CardDescription>
                  Values have been auto-filled based on your input. Modify as needed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.placeholders.map(placeholder => (
                  <div key={placeholder}>
                    <Label htmlFor={placeholder} className="text-sm font-medium">
                      {placeholder.replace('_', ' ').toUpperCase()}
                    </Label>
                    <Input
                      id={placeholder}
                      value={placeholderValues[placeholder] || ''}
                      onChange={(e) => handlePlaceholderChange(placeholder, e.target.value)}
                      placeholder={`Enter ${placeholder.replace('_', ' ')}`}
                      className="mt-1"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Template Preview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Generated Prompt</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'View Preview' : 'Edit Manually'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={customTemplate}
                  onChange={(e) => setCustomTemplate(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Edit the prompt template..."
                />
              ) : (
                <div className="bg-muted/50 p-4 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {filledTemplate}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const filled = fillTemplate(template.template_text, placeholderValues);
                  setFilledTemplate(filled);
                  setCustomTemplate(filled);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleConfirm}>
                <Check className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}