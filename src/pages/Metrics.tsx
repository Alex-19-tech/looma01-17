import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, Cell, AreaChart, Area, BarChart, Bar } from "recharts";
import { AlertTriangle, Clock, Users, TrendingUp, TrendingDown, Target, Download, FileText, Settings } from "lucide-react";
import { subDays } from "date-fns";
import MetricsDateFilter, { DateRange } from "@/components/MetricsDateFilter";
import MetricsFilters, { MetricsFilterState } from "@/components/MetricsFilters";
import { useMetricsData } from "@/hooks/useMetricsData";
import { useMetricsExport } from "@/hooks/useMetricsExport";
import { useToast } from "@/hooks/use-toast";

export default function Metrics() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [filters, setFilters] = useState<MetricsFilterState>({});
  
  const { metrics, cohortData, conversionData, alerts, loading, error, refetch } = useMetricsData(dateRange, filters);
  const { exportToCSV, exportToPDF, isExporting } = useMetricsExport();

  const handleExport = async (format: 'csv' | 'pdf') => {
    const exportData = { metrics, cohortData, conversionData };
    
    const result = format === 'csv' 
      ? await exportToCSV(exportData, dateRange, filters)
      : await exportToPDF(exportData, dateRange, filters);
    
    if (result.success) {
      toast({
        title: "Export Successful",
        description: `Metrics data exported as ${format.toUpperCase()}`,
      });
    } else {
      toast({
        title: "Export Failed", 
        description: result.error || "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const getChartData = (type: string) => {
    return metrics
      .filter(m => m.metric_type === type)
      .reverse()
      .slice(-30)
      .map(m => ({
        date: new Date(m.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Number(m.value),
        timestamp: m.timestamp
      }));
  };

  const getCohortChartData = () => {
    const cohortMap = new Map();
    cohortData.forEach(item => {
      const cohort = item.cohort_month;
      if (!cohortMap.has(cohort)) {
        cohortMap.set(cohort, {});
      }
      cohortMap.get(cohort)[`period_${item.period_number}`] = item.retention_rate;
    });

    return Array.from(cohortMap.entries()).map(([cohort, data]) => ({
      cohort: new Date(cohort).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      ...data
    }));
  };

  const getFunnelChartData = () => {
    return conversionData.map(item => ({
      name: item.stage,
      value: item.users_count,
      fill: item.stage_order === 1 ? 'hsl(var(--electric-blue))' :
            item.stage_order === 2 ? 'hsl(var(--electric-blue-light))' :
            item.stage_order === 3 ? 'hsl(var(--primary))' : 
            'hsl(var(--electric-blue-dark))'
    }));
  };

  const getTemplateUsageData = () => {
    return [
      { name: 'Code Generation', usage: 450, fill: 'hsl(var(--electric-blue))' },
      { name: 'Bug Fixing', usage: 380, fill: 'hsl(var(--electric-blue-light))' },
      { name: 'Documentation', usage: 320, fill: 'hsl(var(--primary))' },
      { name: 'Testing', usage: 280, fill: 'hsl(var(--electric-blue-dark))' },
      { name: 'Refactoring', usage: 240, fill: '#64748b' }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 flex items-center justify-center">
                <img src="/Looma.svg" alt="Preflix" className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Preflix</h1>
              <div className="h-6 w-px bg-gray-300 mx-4"></div>
              <h2 className="text-lg font-semibold text-electric-blue">Metrics</h2>
            </div>
          </div>
        </div>
        <div className="pt-24 p-6 max-w-7xl mx-auto">
          <div className="mb-8 space-y-4">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-10 w-full max-w-2xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 flex items-center justify-center">
              <img src="/Looma.svg" alt="Preflix" className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Preflix</h1>
            <div className="h-6 w-px bg-gray-300 mx-4"></div>
            <h2 className="text-lg font-semibold text-electric-blue">Metrics</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="gap-2 transition-all duration-200 hover:scale-105"
            >
              <FileText className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="gap-2 transition-all duration-200 hover:scale-105"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="gap-2 transition-all duration-200 hover:scale-105"
            >
              <Settings className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 p-6 max-w-7xl mx-auto">
        {/* Error State */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50 animate-fade-in">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-4 animate-fade-in">
            {alerts.map((alert) => (
              <Alert key={alert.id} className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  {alert.alert_message || `${alert.metric_type} threshold of ${alert.threshold_value} triggered`}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Filters and Controls */}
        <div className="mb-8 space-y-6 animate-fade-in">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Date Range</h3>
            <div className="flex flex-col lg:flex-row gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <MetricsDateFilter 
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Filters</label>
                <MetricsFilters 
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Time to Optimized Prompt - Area Chart */}
          <Card className="border-electric-blue/20 bg-white lg:col-span-2 xl:col-span-1 hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader className="flex flex-row items-center gap-2">
              <Clock className="h-5 w-5 text-electric-blue" />
              <CardTitle className="text-electric-blue">Time to Optimized Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={getChartData('time_to_optimized')}>
                  <defs>
                    <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--electric-blue))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--electric-blue))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value}s`, 'Time']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--electric-blue))" 
                    fillOpacity={1}
                    fill="url(#timeGradient)"
                    strokeWidth={2}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card className="border-electric-blue/20 bg-white hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader className="flex flex-row items-center gap-2">
              <Target className="h-5 w-5 text-electric-blue" />
              <CardTitle className="text-electric-blue">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [`${value} users`, name]}
                  />
                  <Funnel
                    dataKey="value"
                    data={getFunnelChartData()}
                    isAnimationActive
                    animationDuration={1000}
                  >
                    {getFunnelChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cohort Retention Chart */}
          <Card className="border-electric-blue/20 bg-white lg:col-span-2 xl:col-span-1 hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader className="flex flex-row items-center gap-2">
              <Users className="h-5 w-5 text-electric-blue" />
              <CardTitle className="text-electric-blue">Cohort Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getCohortChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="cohort" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [`${value}%`, name]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="period_1" 
                    stroke="hsl(var(--electric-blue))" 
                    strokeWidth={2}
                    name="Period 1"
                    animationDuration={1000}
                    dot={{ fill: 'hsl(var(--electric-blue))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--electric-blue))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="period_2" 
                    stroke="hsl(var(--electric-blue-light))" 
                    strokeWidth={2}
                    name="Period 2"
                    animationDuration={1200}
                    dot={{ fill: 'hsl(var(--electric-blue-light))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--electric-blue-light))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="period_3" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Period 3"
                    animationDuration={1400}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Churn Rate - Bar Chart */}
          <Card className="border-electric-blue/20 bg-white hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <CardTitle className="text-electric-blue">Churn Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData('churn_rate')}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Churn Rate']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Growth Rate - Line Chart */}
          <Card className="border-electric-blue/20 bg-white hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <CardTitle className="text-electric-blue">Growth Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData('growth_rate')}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Growth Rate']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#22c55e' }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Templates Usage - Horizontal Bar Chart */}
          <Card className="border-electric-blue/20 bg-white lg:col-span-2 xl:col-span-1 hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader className="flex flex-row items-center gap-2">
              <Target className="h-5 w-5 text-electric-blue" />
              <CardTitle className="text-electric-blue">Top Templates Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getTemplateUsageData()} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#64748b"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [`${value} uses`, 'Usage Count']}
                  />
                  <Bar 
                    dataKey="usage" 
                    radius={[0, 4, 4, 0]}
                    animationDuration={1000}
                  >
                    {getTemplateUsageData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}