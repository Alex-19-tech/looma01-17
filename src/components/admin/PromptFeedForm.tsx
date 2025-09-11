import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Loader2, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const CATEGORIES = [
  "Development & Code Execution",
  "Research & Knowledge Work", 
  "Creative & Design",
  "Business & Marketing"
];

const SUBCATEGORIES = {
  "Development & Code Execution": ["Debugging", "Refactoring", "Code Review", "Testing", "Documentation"],
  "Research & Knowledge Work": ["Literature Review", "Data Analysis", "Report Writing", "Survey Design"],
  "Creative & Design": ["UI/UX Design", "Content Creation", "Branding", "Copywriting"],
  "Business & Marketing": ["Strategy", "Content Marketing", "SEO", "Customer Research"]
};

interface PromptFeedFormProps {
  onSuccess?: () => void;
}

export function PromptFeedForm({ onSuccess }: PromptFeedFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [rawText, setRawText] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewTemplates, setPreviewTemplates] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePreview = async () => {
    if (!rawText.trim() || !category) {
      toast({
        title: "Missing Information",
        description: "Please provide raw text and select a category.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('prompt-processor', {
        body: {
          rawText,
          category,
          subcategory: subcategory || null,
          tags: tags.length > 0 ? tags : null,
          adminId: user?.id,
          preview: true
        }
      });

      if (error) throw error;

      if (data.success) {
        setPreviewTemplates(data.processed_templates || []);
        setShowPreview(true);
      } else {
        throw new Error(data.error || "Failed to process prompts");
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      toast({
        title: "Preview Failed",
        description: error.message || "Failed to preview prompt templates.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!rawText.trim() || !category) {
      toast({
        title: "Missing Information",
        description: "Please provide raw text and select a category.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('prompt-processor', {
        body: {
          rawText,
          category,
          subcategory: subcategory || null,
          tags: tags.length > 0 ? tags : null,
          adminId: user?.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Prompts Processed Successfully",
          description: `Created ${data.templates_count} prompt templates.`,
        });
        
        // Reset form
        setRawText("");
        setCategory("");
        setSubcategory("");
        setTags([]);
        setPreviewTemplates([]);
        setShowPreview(false);
        
        // Notify parent component of success
        onSuccess?.();
      } else {
        throw new Error(data.error || "Failed to process prompts");
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process and save prompt templates.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="raw-text">Raw Prompt Text</Label>
          <Textarea
            id="raw-text"
            placeholder="Paste your raw prompt text here. The system will automatically parse it into structured templates with appropriate placeholders..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="min-h-[200px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory (Optional)</Label>
            <Select 
              value={subcategory} 
              onValueChange={setSubcategory}
              disabled={!category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subcategory" />
              </SelectTrigger>
              <SelectContent>
                {category && SUBCATEGORIES[category as keyof typeof SUBCATEGORIES]?.map((subcat) => (
                  <SelectItem key={subcat} value={subcat}>
                    {subcat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (Optional)</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button type="button" variant="outline" size="sm" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePreview}
                disabled={isProcessing || !rawText.trim() || !category}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Preview Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Preview Generated Templates</DialogTitle>
                <DialogDescription>
                  Review the AI-generated prompt templates before saving them.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {previewTemplates.map((template, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-sm">Template {index + 1}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">Priority: {template.priority}</Badge>
                        {template.placeholders?.length > 0 && (
                          <Badge variant="secondary">
                            {template.placeholders.length} placeholders
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">{template.description}</p>
                      <div className="bg-muted p-3 rounded-md">
                        <code className="text-sm">{template.template_text}</code>
                      </div>
                      {template.placeholders?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Placeholders:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.placeholders.map((placeholder: string) => (
                              <Badge key={placeholder} variant="outline" className="text-xs">
                                {placeholder}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleSubmit}
            disabled={isProcessing || !rawText.trim() || !category}
            className="flex-1"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isProcessing ? "Processing..." : "Process & Save"}
          </Button>
        </div>
    </div>
  );
}