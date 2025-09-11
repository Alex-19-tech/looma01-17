import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryGrid } from "@/components/admin/CategoryGrid";
import { useModelsCatalog } from "@/hooks/useModelsCatalog";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: categories = [], isLoading, error } = useModelsCatalog();

  // Check if user is admin - need to implement proper admin check
  const isAdmin = user?.email === 'admin@prelix.com' || true; // Temporary: allow all users for testing

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin interface.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleCategoryExpand = (category: string) => {
    // Category expand functionality - no toast needed, just expand
    console.log('📂 Category expanded:', category);
  };

  const handleModelClick = (modelId: string) => {
    console.log('🏠 Admin handleModelClick called with:', modelId);
    // Navigation is handled by CategoryCard - no additional action needed
  };

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <div className="container mx-auto py-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Settings className="h-5 w-5" />
                  Workflow Manager Error
                </CardTitle>
                <CardDescription>
                  Unable to load category data. Please check your Supabase connection.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <img 
                  src="/Looma.svg" 
                  alt="Prelix" 
                  className="h-12 w-12" 
                />
                <div>
                  <h1 className="text-3xl font-bold">Workflow Manager</h1>
                  <p className="text-muted-foreground">Manage workflow categories and templates</p>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-8">
          <div className="space-y-8">
            <CategoryGrid 
              categories={categories}
              isLoading={isLoading}
              onCategoryExpand={handleCategoryExpand}
              onModelClick={handleModelClick}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}