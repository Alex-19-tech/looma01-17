import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";

interface SelectedType {
  id: string;
  name: string;
  description: string;
  modelId: string;
  modelName: string;
  category: string;
}

interface DataFeedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedType: SelectedType;
}

export function DataFeedModal({ open, onOpenChange, selectedType }: DataFeedModalProps) {
  const [rawText, setRawText] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!rawText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some data to feed.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit data.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Use AI to process the raw text into optimized templates
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('prompt-processor', {
        body: {
          rawText: rawText.trim(),
          category: selectedType.category,
          subcategory: selectedType.name,
          tags: [selectedType.modelName, selectedType.name],
          adminId: user.id,
          typeId: selectedType.id,
          modelId: selectedType.modelId
        }
      });

      if (aiError) {
        console.error('AI processing error:', aiError);
        console.log('Falling back to direct template insertion');
        // Fallback to direct storage if AI fails
        const { error: directError } = await (supabase
          .from('type_templates') as any)
          .insert({
            type_id: selectedType.id,
            template_text: rawText.trim(),
            is_active: true,
            priority: 1,
            effectiveness_score: 0.0,
            usage_count: 0,
            tags: [selectedType.modelName, selectedType.name],
            placeholders: {},
            metadata: {
              user_id: user.id,
              model_id: selectedType.modelId,
              category: selectedType.category,
              model_name: selectedType.modelName,
              type_name: selectedType.name,
              title: title.trim() || null,
              created_by: 'user_feed_direct'
            }
          });

        if (directError) throw directError;

        console.log('✅ Direct template inserted successfully:', { type_id: selectedType.id, template_text: rawText.trim().substring(0, 100) + '...' });

        toast({
          title: "Template Created",
          description: "Your data has been saved as a template (AI processing unavailable).",
        });
      } else if (aiResult?.success) {
        console.log('✅ AI templates created successfully:', aiResult.templates_count, 'templates for type_id:', selectedType.id);
        // AI processing succeeded, templates are already stored
        toast({
          title: "AI Templates Created",
          description: `Created ${aiResult.templates_count} optimized template(s) from your data!`,
        });
      } else {
        throw new Error('AI processing failed');
      }

      setRawText("");
      setTitle("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting template:', error);
      toast({
        title: "Error",
        description: "Failed to process your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Feed Data to {selectedType.name}
          </DialogTitle>
          <DialogDescription>
            Submit data that will instantly become available as a template for {selectedType.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Information */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{selectedType.category}</Badge>
            <Badge variant="outline">{selectedType.modelName}</Badge>
            <Badge variant="outline">{selectedType.name}</Badge>
          </div>

          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            <strong>{selectedType.name}:</strong> {selectedType.description}
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-title">Template Title (Optional)</Label>
              <Input
                id="template-title"
                placeholder={`Brief description of your ${selectedType.name.toLowerCase()} template...`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="raw-data">Raw Data</Label>
            <Textarea
              id="raw-data"
              placeholder={`Enter your ${selectedType.name.toLowerCase()} data here...`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="min-h-32 resize-y"
            />
              <div className="text-xs text-muted-foreground">
                {rawText.length} characters
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !rawText.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Data
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}