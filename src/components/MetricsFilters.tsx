import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface MetricsFilterState {
  cohort?: string;
  planType?: string;
  templateCategory?: string;
}

interface MetricsFiltersProps {
  filters: MetricsFilterState;
  onFiltersChange: (filters: MetricsFilterState) => void;
}

const COHORT_OPTIONS = [
  { label: "All Cohorts", value: "" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Q1 2024", value: "q1_2024" },
  { label: "Q2 2024", value: "q2_2024" },
];

const PLAN_OPTIONS = [
  { label: "All Plans", value: "" },
  { label: "Free", value: "free" },
  { label: "Pro", value: "pro" },
  { label: "Lifetime", value: "lifetime" },
];

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "" },
  { label: "Development & Code", value: "development" },
  { label: "Research & Knowledge", value: "research" },
  { label: "Creative & Design", value: "creative" },
  { label: "Business & Marketing", value: "business" },
];

export default function MetricsFilters({ filters, onFiltersChange }: MetricsFiltersProps) {
  const updateFilter = (key: keyof MetricsFilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const clearFilter = (key: keyof MetricsFilterState) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <Select value={filters.cohort || ""} onValueChange={(value) => updateFilter("cohort", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Cohort" />
          </SelectTrigger>
          <SelectContent>
            {COHORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.planType || ""} onValueChange={(value) => updateFilter("planType", value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            {PLAN_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.templateCategory || ""} onValueChange={(value) => updateFilter("templateCategory", value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Template Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.cohort && (
            <Badge variant="secondary" className="gap-1">
              Cohort: {COHORT_OPTIONS.find(o => o.value === filters.cohort)?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-muted rounded-full" 
                onClick={() => clearFilter("cohort")}
              />
            </Badge>
          )}
          {filters.planType && (
            <Badge variant="secondary" className="gap-1">
              Plan: {PLAN_OPTIONS.find(o => o.value === filters.planType)?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-muted rounded-full" 
                onClick={() => clearFilter("planType")}
              />
            </Badge>
          )}
          {filters.templateCategory && (
            <Badge variant="secondary" className="gap-1">
              Category: {CATEGORY_OPTIONS.find(o => o.value === filters.templateCategory)?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-muted rounded-full" 
                onClick={() => clearFilter("templateCategory")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}