import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ModelTypeCard } from "@/components/models/ModelTypeCard";
import { DataFeedModal } from "@/components/models/DataFeedModal";
import { TemplateManagerModal } from "@/components/models/TemplateManagerModal";
import { useModelDetails } from "@/hooks/useModelDetails";
import { useModelTypes } from "@/hooks/useModelTypes";
import { useState } from "react";

interface SelectedType {
  id: string;
  name: string;
  description: string;
  modelId: string;
  modelName: string;
  category: string;
}

export default function ModelDetails() {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  console.log('📄 ModelDetails component rendered with modelId:', modelId);
  
  const [feedModalOpen, setFeedModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<SelectedType | null>(null);

  const { data: model, isLoading: modelLoading, error: modelError } = useModelDetails(modelId);
  const { data: types = [], isLoading: typesLoading, error: typesError } = useModelTypes(modelId);

  const handleBack = () => {
    navigate("/admin");
  };

  const handleTypeClick = (type: any) => {
    if (model) {
      setSelectedType({
        id: type.id,
        name: type.type_name,
        description: type.type_description,
        modelId: model.id,
        modelName: model.name,
        category: model.category
      });
      setFeedModalOpen(true);
    }
  };

  const handleTypeLongPress = (type: any) => {
    if (model) {
      setSelectedType({
        id: type.id,
        name: type.type_name,
        description: type.type_description,
        modelId: model.id,
        modelName: model.name,
        category: model.category
      });
      setTemplateModalOpen(true);
    }
  };

  if (modelLoading || typesLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          {/* Header Skeleton */}
          <div className="border-b bg-card">
            <div className="container mx-auto">
              <div className="flex items-center gap-4 py-6">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-8 w-64" />
              </div>
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="container mx-auto py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (modelError || typesError || !model) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto py-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Error Loading Model</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Unable to load model details. Please try again later.
                </p>
                <Button onClick={handleBack} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Categories
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <div className="border-b bg-card">
          <div className="container mx-auto">
            <div className="flex items-center gap-4 py-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  console.log('🔙 Back button clicked in ModelDetails');
                  console.log('🎯 Event target:', e.target);
                  console.log('🎯 Current target:', e.currentTarget);
                  e.preventDefault();
                  e.stopPropagation();
                  handleBack();
                }}
                className="h-10 w-10 p-0 relative z-10"
              >
                <ArrowLeft className="w-5 h-5 pointer-events-none" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{model.name}</h1>
                <p className="text-sm text-muted-foreground">{model.category}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                {model.category === "Research & Knowledge Work" ? "Research Types" : "Available Types"}
              </h2>
              <p className="text-muted-foreground text-sm">
                Select a type to feed data or long press to manage templates
              </p>
            </div>

            {types.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No types available for this model yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {types.map((type) => (
                  <ModelTypeCard
                    key={type.id}
                    type={type}
                    onClick={() => handleTypeClick(type)}
                    onLongPress={() => handleTypeLongPress(type)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {selectedType && (
          <>
            <DataFeedModal
              open={feedModalOpen}
              onOpenChange={setFeedModalOpen}
              selectedType={selectedType}
            />
            <TemplateManagerModal
              open={templateModalOpen}
              onOpenChange={setTemplateModalOpen}
              selectedType={selectedType}
            />
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}