import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

interface MetricsChartProps {
  title: string;
  icon: React.ReactNode;
  loading?: boolean;
  error?: string;
  dataCount?: number;
  lastUpdate?: Date;
  children: React.ReactElement;
  className?: string;
}

export default function MetricsChart({ 
  title, 
  icon, 
  loading, 
  error, 
  dataCount = 0,
  lastUpdate,
  children, 
  className = "" 
}: MetricsChartProps) {
  if (loading) {
    return (
      <Card className={`border-electric-blue/20 bg-white hover:shadow-lg transition-all duration-300 ${className}`}>
        <CardHeader className="flex flex-row items-center gap-2">
          {icon}
          <CardTitle className="text-electric-blue">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardHeader className="flex flex-row items-center gap-2">
          {icon}
          <CardTitle className="text-red-600">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-2">Failed to load data</p>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-electric-blue/20 bg-white hover:shadow-lg transition-all duration-300 animate-scale-in ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-electric-blue">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {dataCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {dataCount} points
            </Badge>
          )}
          {lastUpdate && (
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-green-500" />
              <span className="text-xs text-gray-500">Live</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}