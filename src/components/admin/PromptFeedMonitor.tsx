import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Edit, Trash2, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PromptFeed {
  id: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  raw_text: string;
  processed_templates: any;
  admin_id: string;
  status: 'pending' | 'approved' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
  };
}

const STATUS_COLORS = {
  pending: 'bg-yellow-500',
  approved: 'bg-blue-500',
  active: 'bg-green-500',
  inactive: 'bg-gray-500'
};

const STATUS_ICONS = {
  pending: Clock,
  approved: CheckCircle,
  active: CheckCircle,
  inactive: XCircle
};

export const PromptFeedMonitor = forwardRef<{ refreshFeeds: () => void }>(function PromptFeedMonitor(props, ref) {
  const { toast } = useToast();
  const [feeds, setFeeds] = useState<PromptFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedFeed, setSelectedFeed] = useState<PromptFeed | null>(null);
  const [viewMode, setViewMode] = useState<'raw' | 'templates'>('raw');

  const fetchFeeds = async () => {
    try {
      console.log('Fetching prompt feeds...');
      const { data: feedsData, error: feedsError } = await (supabase
        .from('prompt_feeds') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (feedsError) {
        console.error('Supabase error:', feedsError);
        throw feedsError;
      }

      // Fetch admin profiles separately
      const adminIds = [...new Set(feedsData?.map(feed => feed.admin_id) || [])];
      const { data: profilesData } = await (supabase
        .from('profiles') as any)
        .select('id, full_name')
        .in('id', adminIds);

      // Combine the data
      const feedsWithProfiles = feedsData?.map(feed => ({
        ...feed,
        profiles: profilesData?.find(profile => profile.id === feed.admin_id)
      })) || [];

      console.log('Successfully fetched feeds:', feedsWithProfiles.length, 'records');
      setFeeds(feedsWithProfiles as PromptFeed[]);
    } catch (error: any) {
      console.error('Fetch feeds error:', error);
      toast({
        title: "Error",
        description: `Failed to fetch prompt feeds: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refreshFeeds: fetchFeeds
  }));

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleStatusChange = async (feedId: string, newStatus: string) => {
    try {
      const { error } = await (supabase
        .from('prompt_feeds') as any)
        .update({ status: newStatus })
        .eq('id', feedId);

      if (error) throw error;

      // If activating, also activate the templates
      if (newStatus === 'active') {
        await (supabase
          .from('prompt_templates') as any)
          .update({ is_active: true })
          .eq('feed_id', feedId);
      } else {
        await (supabase
          .from('prompt_templates') as any)
          .update({ is_active: false })
          .eq('feed_id', feedId);
      }

      toast({
        title: "Status Updated",
        description: `Feed status changed to ${newStatus}.`,
      });

      fetchFeeds();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (feedId: string) => {
    if (!confirm("Are you sure you want to delete this prompt feed? This will also delete all associated templates.")) {
      return;
    }

    try {
      const { error } = await (supabase
        .from('prompt_feeds') as any)
        .delete()
        .eq('id', feedId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Prompt feed deleted successfully.",
      });

      fetchFeeds();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete prompt feed.",
        variant: "destructive",
      });
    }
  };

  const filteredFeeds = feeds.filter(feed => {
    const matchesSearch = feed.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.subcategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || feed.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || feed.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(feeds.map(feed => feed.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse">Loading prompt feeds...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by category, subcategory, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Subcategory</TableHead>
              <TableHead>Templates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeeds.map((feed) => {
              const StatusIcon = STATUS_ICONS[feed.status];
              return (
                <TableRow key={feed.id}>
                  <TableCell className="font-medium">{feed.category}</TableCell>
                  <TableCell>{feed.subcategory || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {Array.isArray(feed.processed_templates) ? feed.processed_templates.length : 0} templates
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 text-white`} />
                      <Select
                        value={feed.status}
                        onValueChange={(value) => handleStatusChange(feed.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>{feed.profiles?.full_name || 'Unknown'}</TableCell>
                  <TableCell>{format(new Date(feed.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFeed(feed)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Prompt Feed Details</DialogTitle>
                            <DialogDescription>
                              View raw text and generated templates for this feed.
                            </DialogDescription>
                          </DialogHeader>
                          {selectedFeed && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Category:</strong> {selectedFeed.category}
                                </div>
                                <div>
                                  <strong>Subcategory:</strong> {selectedFeed.subcategory || 'None'}
                                </div>
                                <div>
                                  <strong>Status:</strong> {selectedFeed.status}
                                </div>
                                <div>
                                  <strong>Templates:</strong> {Array.isArray(selectedFeed.processed_templates) ? selectedFeed.processed_templates.length : 0}
                                </div>
                              </div>
                              
                              {selectedFeed.tags && selectedFeed.tags.length > 0 && (
                                <div>
                                  <strong>Tags:</strong>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedFeed.tags.map(tag => (
                                      <Badge key={tag} variant="outline">{tag}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Button
                                    variant={viewMode === 'raw' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('raw')}
                                  >
                                    Raw Text
                                  </Button>
                                  <Button
                                    variant={viewMode === 'templates' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('templates')}
                                  >
                                    Generated Templates
                                  </Button>
                                </div>

                                {viewMode === 'raw' ? (
                                  <div className="bg-muted p-4 rounded-md">
                                    <pre className="whitespace-pre-wrap text-sm">
                                      {selectedFeed.raw_text}
                                    </pre>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {Array.isArray(selectedFeed.processed_templates) && selectedFeed.processed_templates.map((template, index) => (
                                      <Card key={index}>
                                        <CardHeader className="pb-2">
                                          <div className="flex justify-between items-start">
                                            <CardTitle className="text-sm">Template {index + 1}</CardTitle>
                                            <Badge variant="outline">Priority: {template.priority}</Badge>
                                          </div>
                                          {template.description && (
                                            <CardDescription className="text-xs">
                                              {template.description}
                                            </CardDescription>
                                          )}
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                          <div className="bg-muted p-3 rounded-md mb-2">
                                            <code className="text-sm">{template.template_text}</code>
                                          </div>
                                          {template.placeholders?.length > 0 && (
                                            <div>
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
                                    )) || <p className="text-muted-foreground">No templates generated.</p>}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(feed.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredFeeds.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No prompt feeds found matching your criteria.
        </div>
      )}
    </div>
  );
});