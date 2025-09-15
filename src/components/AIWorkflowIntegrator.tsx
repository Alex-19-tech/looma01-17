import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTemplateIntegration, useBestTemplateForWorkflow, useTemplateSelection, useUpdateTemplatePerformance } from "@/hooks/useTemplateIntegration";
import { useModelTypes } from "@/hooks/useModelTypes";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Sparkles, Target, Zap, FileText, TrendingUp } from "lucide-react";

interface AIWorkflowIntegratorProps {
  onProcessComplete?: (result: any) => void;
  className?: string;
}

export function AIWorkflowIntegrator({ onProcessComplete, className }: AIWorkflowIntegratorProps) {
  const [userInput, setUserInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<any>(null);
  
  const { toast } = useToast();
  
  // Fetch individual models directly
  const { data: models = [] } = useQuery({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('ai_models') as any)
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });
      
      if (error) throw error;
      return data as any;
    }
  });
  
  const { data: types = [] } = useModelTypes(selectedModel);
  
  const { template, hasTemplates, templateCount } = useBestTemplateForWorkflow(selectedType);
  const { selectTemplate, availableTemplates } = useTemplateSelection(userInput, selectedType);
  const updateTemplatePerformance = useUpdateTemplatePerformance();

  const selectedModelData = models.find((m: any) => m.id === selectedModel);

  const handleProcessInput = async () => {
    if (!userInput.trim() || !selectedModel || !selectedType) {
      toast({
        title: "Missing Information",
        description: "Please select a model, type, and enter your input.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get the best template for this input
      const selectedTemplate = selectTemplate();
      
      let processedPrompt = userInput;
      let templateUsed = null;

      if (selectedTemplate) {
        // Enhance the input with the template
        processedPrompt = `${selectedTemplate.template_text}\n\nUser Request: ${userInput}`;
        templateUsed = selectedTemplate;
        
        toast({
          title: "Template Applied",
          description: `Using template: ${selectedTemplate.metadata?.title || 'Untitled Template'}`,
        });
      }

      // Call the AI workflow edge function
      const { data, error } = await supabase.functions.invoke('ai-workflow', {
        body: {
          prompt: processedPrompt,
          model: selectedModelData?.model_id || selectedModel,
          type_id: selectedType,
          template_id: templateUsed?.id,
          original_input: userInput
        }
      });

      if (error) throw error;

      setProcessingResult(data);
      
      // Update template performance if one was used
      if (templateUsed && data.success) {
        await updateTemplatePerformance(
          templateUsed.id,
          data.performance_score || 1.0,
          data.effectiveness_rating || 1.0
        );
      }

      toast({
        title: "Processing Complete",
        description: "Your request has been processed successfully!",
      });

      onProcessComplete?.(data);

    } catch (error) {
      console.error('Error processing input:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setUserInput("");
    setSelectedModel("");
    setSelectedType("");
    setProcessingResult(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Workflow Integrator
          </CardTitle>
          <CardDescription>
            Submit requests with intelligent template matching and AI processing
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Model Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Choose AI model..." />
              </SelectTrigger>
              <SelectContent>
                {models.map((model: any) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {model.category}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Type Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedType} onValueChange={setSelectedType} disabled={!selectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Choose request type..." />
              </SelectTrigger>
              <SelectContent>
                {types.map((type: any) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.type_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && hasTemplates && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                {templateCount} template{templateCount !== 1 ? 's' : ''} available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Input Area */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Your Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your request here... The system will automatically apply the best matching template."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-24 resize-y"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-muted-foreground">
              {userInput.length} characters
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearAll} disabled={isProcessing}>
                Clear All
              </Button>
              <Button 
                onClick={handleProcessInput} 
                disabled={isProcessing || !userInput.trim() || !selectedModel || !selectedType}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Process Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Preview */}
      {selectedType && availableTemplates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Available Templates ({availableTemplates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableTemplates.slice(0, 3).map((template: any) => (
                <div key={template.id} className="p-3 bg-muted/50 rounded text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">
                      {template.metadata?.title || `Template #${template.id.slice(-6)}`}
                    </span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        Score: {template.effectiveness_score}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Used: {template.usage_count}x
                      </Badge>
                    </div>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">
                    {template.template_text.slice(0, 100)}...
                  </p>
                </div>
              ))}
              {availableTemplates.length > 3 && (
                <p className="text-center text-sm text-muted-foreground">
                  +{availableTemplates.length - 3} more templates available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Result */}
      {processingResult && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Processing Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded overflow-auto max-h-64">
              {JSON.stringify(processingResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}