import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, Cell, AreaChart, Area, BarChart, Bar } from "recharts";
import { AlertTriangle, Clock, Users, TrendingUp, TrendingDown, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MetricData {
  id: string;
  metric_type: string;
  value: number;
  timestamp: string;
  metadata: any;
}

interface CohortData {
  cohort_month: string;
  period_number: number;
  retention_rate: number;
  users_count: number;
}

interface ConversionData {
  stage: string;
  users_count: number;
  conversion_rate: number;
  stage_order: number;
}

interface Alert {
  id: string;
  metric_type: string;
  alert_message: string;
  threshold_value: number;
}

export default function Metrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [conversionData, setConversionData] = useState<ConversionData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    if (!user) return;
    
    try {
      // Fetch metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (metricsError) throw metricsError;
      setMetrics(metricsData || []);

      // Fetch cohort retention data
      const { data: cohortRetentionData, error: cohortError } = await supabase
        .from('cohort_retention')
        .select('*')
        .eq('user_id', user.id)
        .order('cohort_month', { ascending: true });

      if (cohortError) throw cohortError;
      setCohortData(cohortRetentionData || []);

      // Fetch conversion funnel data
      const { data: funnelData, error: funnelError } = await supabase
        .from('conversion_funnels')
        .select('*')
        .eq('user_id', user.id)
        .order('stage_order', { ascending: true });

      if (funnelError) throw funnelError;
      setConversionData(funnelData || []);

      // Fetch alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('metric_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Set up real-time subscriptions for all tables
    const metricsChannel = supabase
      .channel('metrics-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'metrics',
          filter: `user_id=eq.${user?.id}`
        },
        () => fetchAllData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cohort_retention',
          filter: `user_id=eq.${user?.id}`
        },
        () => fetchAllData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversion_funnels',
          filter: `user_id=eq.${user?.id}`
        },
        () => fetchAllData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(metricsChannel);
    };
  }, [user]);

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
      { name: 'Refactoring', usage: 240, fill: 'hsl(var(--muted))' }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse p-8">
          <div className="h-8 bg-muted rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 flex items-center justify-center">
              <img src="/Looma.svg" alt="Prelix" className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Prelix</h1>
            <div className="h-6 w-px bg-border mx-4"></div>
            <h2 className="text-lg font-semibold text-electric-blue">Metrics</h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 p-6 max-w-7xl mx-auto">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-4">
            {alerts.map((alert) => (
              <Alert key={alert.id} className="border-amber-500/20 bg-amber-500/5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-700">
                  {alert.alert_message || `${alert.metric_type} threshold of ${alert.threshold_value} triggered`}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Time to Optimized Prompt - Area Chart */}
          <Card className="border-electric-blue/20 lg:col-span-2 xl:col-span-1">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value}s`, 'Time']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--electric-blue))" 
                    fillOpacity={1}
                    fill="url(#timeGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card className="border-electric-blue/20">
            <CardHeader className="flex flex-row items-center gap-2">
              <Target className="h-5 w-5 text-electric-blue" />
              <CardTitle className="text-electric-blue">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Funnel
                    dataKey="value"
                    data={getFunnelChartData()}
                    isAnimationActive
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
          <Card className="border-electric-blue/20 lg:col-span-2 xl:col-span-1">
            <CardHeader className="flex flex-row items-center gap-2">
              <Users className="h-5 w-5 text-electric-blue" />
              <CardTitle className="text-electric-blue">Cohort Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getCohortChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="cohort" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="period_1" 
                    stroke="hsl(var(--electric-blue))" 
                    strokeWidth={2}
                    name="Period 1"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="period_2" 
                    stroke="hsl(var(--electric-blue-light))" 
                    strokeWidth={2}
                    name="Period 2"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="period_3" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Period 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Churn Rate - Bar Chart */}
          <Card className="border-electric-blue/20">
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <CardTitle className="text-electric-blue">Churn Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData('churn_rate')}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value}%`, 'Churn Rate']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--destructive))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Growth Rate - Line Chart */}
          <Card className="border-electric-blue/20">
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <CardTitle className="text-electric-blue">Growth Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData('growth_rate')}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value}%`, 'Growth Rate']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--green-500))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--green-500))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Templates Usage - Horizontal Bar Chart */}
          <Card className="border-electric-blue/20 lg:col-span-2 xl:col-span-1">
            <CardHeader className="flex flex-row items-center gap-2">
              <Target className="h-5 w-5 text-electric-blue" />
              <CardTitle className="text-electric-blue">Top Templates Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getTemplateUsageData()} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [value, 'Usage Count']}
                  />
                  <Bar 
                    dataKey="usage" 
                    radius={[0, 4, 4, 0]}
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