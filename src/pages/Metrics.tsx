import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, Cell, AreaChart, Area, BarChart, Bar } from "recharts";
import { AlertTriangle, Clock, Users, TrendingUp, TrendingDown, Target, Download, FileText, Settings, Wifi, WifiOff, Activity, BarChart3, Database, Zap } from "lucide-react";
import { subDays, formatDistanceToNow } from "date-fns";
import MetricsDateFilter, { DateRange } from "@/components/MetricsDateFilter";
import MetricsFilters, { MetricsFilterState } from "@/components/MetricsFilters";
import { useMetricsData } from "@/hooks/useMetricsData";
import { useMetricsExport } from "@/hooks/useMetricsExport";
import { useRealTimeSimulator } from "@/hooks/useRealTimeSimulator";
import { useToast } from "@/hooks/use-toast";

export default function Metrics() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [filters, setFilters] = useState<MetricsFilterState>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const { metrics, cohortData, conversionData, templateUsageData, alerts, loading, error, refetch } = useMetricsData(dateRange, filters);
  const { exportToCSV, exportToPDF, exportToJSON, isExporting } = useMetricsExport();
  const { triggerUpdate } = useRealTimeSimulator({ enabled: true, interval: 45000 });

  // Update timestamp when data changes
  useEffect(() => {
    if (!loading && (metrics.length > 0 || cohortData.length > 0 || conversionData.length > 0)) {
      setLastUpdate(new Date());
      
      // Show toast notification for data updates (only after initial load)
      if (lastUpdate && Date.now() - lastUpdate.getTime() > 5000) {
        toast({
          title: "Data Updated",
          description: "Metrics have been refreshed with real-time data",
        });
      }
    }
  }, [metrics, cohortData, conversionData, loading]);

  const handleExport = async (format: 'csv' | 'pdf' | 'json') => {
    const exportData = { 
      metrics, 
      cohortData, 
      conversionData,
      templateUsageData,
      summary: {
        totalMetrics: metrics.length,
        totalCohorts: cohortData.length,
        totalConversions: conversionData.length,
        dateRange,
        filters,
        exportedAt: new Date().toISOString()
      }
    };
    
    let result;
    switch (format) {
      case 'csv':
        result = await exportToCSV(exportData, dateRange, filters);
        break;
      case 'pdf':
        result = await exportToPDF(exportData, dateRange, filters);
        break;
      case 'json':
        result = await exportToJSON(exportData, dateRange, filters);
        break;
      default:
        return;
    }
    
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

  const getMetricsSummary = () => {
    const totalRecords = metrics.length + cohortData.length + conversionData.length;
    const latestMetric = metrics.length > 0 ? new Date(Math.max(...metrics.map(m => new Date(m.timestamp).getTime()))) : null;
    
    return {
      totalRecords,
      metricsCount: metrics.length,
      cohortCount: cohortData.length,
      conversionCount: conversionData.length,
      latestMetric,
      dataHealth: totalRecords > 0 ? 'healthy' : 'no-data'
    };
  };

  const summary = getMetricsSummary();
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
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-electric-blue" />
              <h2 className="text-lg font-semibold text-electric-blue">Analytics Dashboard</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Real-time status indicator with more detail */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border">
              {error ? (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 hidden sm:inline">Offline</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <Wifi className="h-4 w-4 text-green-500" />
                    <Activity className="h-3 w-3 text-green-500 animate-pulse" />
                  </div>
                  <span className="text-sm text-green-600 hidden sm:inline">Live</span>
                </>
              )}
            </div>

            {/* Data summary badge */}
            <Badge variant="outline" className="gap-1 hidden md:flex">
              <Database className="h-3 w-3" />
              {summary.totalRecords} records
            </Badge>

            {/* Last updated indicator */}
            {summary.latestMetric && (
              <span className="text-xs text-gray-500 hidden lg:inline">
                Updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
              </span>
            )}
            
            {/* Export buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={isExporting || summary.totalRecords === 0}
              className="gap-2 transition-all duration-200 hover:scale-105"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              disabled={isExporting || summary.totalRecords === 0}
              className="gap-2 transition-all duration-200 hover:scale-105"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">JSON</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              disabled={isExporting || summary.totalRecords === 0}
              className="gap-2 transition-all duration-200 hover:scale-105"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                triggerUpdate();
                refetch();
              }}
              disabled={loading}
              className="gap-2 transition-all duration-200 hover:scale-105"
            >
              <Zap className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Simulate Data</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="gap-2 transition-all duration-200 hover:scale-105"
            >
              <Settings className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 p-6 max-w-7xl mx-auto">
        {/* Data Summary Overview */}
        <div className="mb-8 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-electric-blue/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-electric-blue">{summary.metricsCount}</div>
                <div className="text-sm text-gray-600">Metrics Points</div>
              </CardContent>
            </Card>
            <Card className="border-electric-blue/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-electric-blue">{summary.cohortCount}</div>
                <div className="text-sm text-gray-600">Cohort Records</div>
              </CardContent>
            </Card>
            <Card className="border-electric-blue/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-electric-blue">{summary.conversionCount}</div>
                <div className="text-sm text-gray-600">Conversion Stages</div>
              </CardContent>
            </Card>
            <Card className="border-electric-blue/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-electric-blue">{templateUsageData.length}</div>
                <div className="text-sm text-gray-600">Active Templates</div>
              </CardContent>
            </Card>
          </div>
        </div>
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50 animate-fade-in">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
                className="ml-4 text-red-600 border-red-200 hover:bg-red-100"
              >
                Retry
              </Button>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters & Date Range</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Total Records: {summary.totalRecords}</span>
                </div>
                {isExporting && (
                  <Badge variant="secondary" className="animate-pulse">
                    Exporting...
                  </Badge>
                )}
                {summary.dataHealth === 'no-data' && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Sample Data Mode
                  </Badge>
                )}
              </div>
            </div>
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

        {/* Charts Grid with Enhanced Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Time to Optimized Prompt - Area Chart */}
          <Card className="border-electric-blue/20 bg-white lg:col-span-2 xl:col-span-1 hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-electric-blue" />
                <CardTitle className="text-electric-blue">Time to Optimized Prompt</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {getChartData('time_to_optimized').length} points
              </Badge>
            </CardHeader>
            <CardContent>
              {getChartData('time_to_optimized').length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No timing data available</p>
                    <p className="text-sm">Data will appear as users interact with prompts</p>
                  </div>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card className="border-electric-blue/20 bg-white hover:shadow-lg transition-all duration-300 animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-electric-blue" />
                <CardTitle className="text-electric-blue">Conversion Funnel</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {getFunnelChartData().length} stages
              </Badge>
            </CardHeader>
            <CardContent>
              {getFunnelChartData().length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No conversion data</p>
                    <p className="text-sm">Funnel data will appear as users progress</p>
                  </div>
                </div>
              ) : (
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
              )}
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-electric-blue" />
                <CardTitle className="text-electric-blue">Top Templates Usage</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {templateUsageData.length} templates
              </Badge>
            </CardHeader>
            <CardContent>
              {templateUsageData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No template usage data</p>
                    <p className="text-sm">Data will show as templates are used</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={templateUsageData} layout="horizontal">
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
                      {templateUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || 'hsl(var(--electric-blue))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}