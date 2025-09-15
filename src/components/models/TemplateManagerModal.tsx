import { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings2, Eye, Edit, Trash2, Calendar, User, FileText } from "lucide-react";
import { format } from "date-fns";

interface SelectedType {
  id: string;
  name: string;
  description: string;
  modelId: string;
  modelName: string;
  category: string;
}

interface TemplateManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedType: SelectedType;
}

interface TypeTemplate {
  id: string;
  template_text: string;
  tags: string[];
  priority: number;
  effectiveness_score: number;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

export function TemplateManagerModal({ open, onOpenChange, selectedType }: TemplateManagerModalProps) {
  const queryClient = useQueryClient();

  // Fetch templates for this type
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["type-templates", selectedType.id],
    queryFn: async () => {
      console.log('🔍 Fetching templates for type_id:', selectedType.id);
      const { data, error } = await (supabase
        .from('type_templates') as any)
        .select('*')
        .eq('type_id', selectedType.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('📄 Found templates:', data?.length || 0, 'for type_id:', selectedType.id);
      return data as TypeTemplate[];
    },
    enabled: open && !!selectedType.id,
  });

  // Real-time updates for templates
  useEffect(() => {
    if (!open || !selectedType.id) return;

    const channel = supabase
      .channel('template-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'type_templates',
          filter: `type_id=eq.${selectedType.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["type-templates", selectedType.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, selectedType.id, queryClient]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Template Manager - {selectedType.name}
          </DialogTitle>
          <DialogDescription>
            View and manage all active templates for {selectedType.name} in {selectedType.category}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Active Templates Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Active Templates</h3>
            </div>
            {templatesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : templates.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No templates created yet for this type.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use the + button to feed data and create your first template.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                       <div className="flex items-center justify-between">
                         <CardTitle className="text-base flex items-center gap-2">
                           <FileText className="w-4 h-4" />
                           {(template as any).metadata?.title || `Template #${template.id.slice(-6)}`}
                         </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">
                            Score: {template.effectiveness_score}
                          </Badge>
                          <Badge variant="outline">
                            Used: {template.usage_count}x
                          </Badge>
                        </div>
                      </div>
                       <div className="flex items-center gap-4 text-sm text-muted-foreground">
                         <div className="flex items-center gap-1">
                           <Calendar className="w-4 h-4" />
                           {format(new Date(template.created_at), 'MMM d, yyyy')}
                         </div>
                         {(template as any).metadata?.user_id && (
                           <div className="flex items-center gap-1">
                             <User className="w-4 h-4" />
                             User Fed
                           </div>
                         )}
                       </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-mono bg-muted/50 p-3 rounded line-clamp-4 mb-3">
                        {template.template_text}
                      </p>
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Full
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}