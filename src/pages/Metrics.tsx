import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, UserCheck, UserX, BarChart3, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MetricData {
  id: string;
  metric_type: string;
  value: number;
  timestamp: string;
  metadata: any;
}

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<any>;
}

interface Alert {
  id: string;
  metric_type: string;
  alert_message: string;
  threshold_value: number;
}

const KPICard = ({ title, value, change, trend, icon: Icon }: KPICardProps) => (
  <Card className="relative overflow-hidden border-electric-blue/20 bg-card hover:border-electric-blue/40 transition-all duration-300">
    <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/5 to-transparent" />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-electric-blue" />
    </CardHeader>
    <CardContent className="relative z-10">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="flex items-center gap-1 text-xs">
        {trend === "up" ? (
          <TrendingUp className="h-3 w-3 text-green-500" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-500" />
        )}
        <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
          {change}
        </span>
      </div>
    </CardContent>
  </Card>
);

export default function Metrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMetrics(data || []);

      // Fetch alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('metric_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Set up real-time subscription
    const channel = supabase
      .channel('metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'metrics',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getLatestMetricValue = (type: string) => {
    const metric = metrics.find(m => m.metric_type === type);
    return metric ? metric.value : 0;
  };

  const getMetricTrend = (type: string) => {
    const typeMetrics = metrics.filter(m => m.metric_type === type).slice(0, 2);
    if (typeMetrics.length < 2) return { change: "0%", trend: "up" as const };
    
    const current = typeMetrics[0].value;
    const previous = typeMetrics[1].value;
    const percentChange = ((current - previous) / previous * 100).toFixed(1);
    
    return {
      change: `${Math.abs(Number(percentChange))}%`,
      trend: Number(percentChange) >= 0 ? "up" as const : "down" as const
    };
  };

  const getChartData = (type: string) => {
    return metrics
      .filter(m => m.metric_type === type)
      .reverse()
      .slice(-30)
      .map(m => ({
        date: new Date(m.timestamp).toLocaleDateString(),
        value: Number(m.value)
      }));
  };

  const funnelData = [
    { name: 'Initial Prompt', value: 1000, fill: 'hsl(var(--electric-blue))' },
    { name: 'Template Applied', value: 800, fill: 'hsl(var(--electric-blue-light))' },
    { name: 'Optimization Complete', value: 600, fill: 'hsl(var(--primary))' },
    { name: 'User Satisfied', value: 450, fill: 'hsl(var(--electric-blue-dark))' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse p-8">
          <div className="h-8 bg-muted rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <KPICard
            title="Time to Optimized Prompt"
            value={`${getLatestMetricValue('time_to_optimized').toFixed(1)}s`}
            change={getMetricTrend('time_to_optimized').change}
            trend={getMetricTrend('time_to_optimized').trend}
            icon={BarChart3}
          />
          <KPICard
            title="Conversion Rate"
            value={`${getLatestMetricValue('conversion_rate').toFixed(1)}%`}
            change={getMetricTrend('conversion_rate').change}
            trend={getMetricTrend('conversion_rate').trend}
            icon={TrendingUp}
          />
          <KPICard
            title="Retention"
            value={`${getLatestMetricValue('retention').toFixed(1)}%`}
            change={getMetricTrend('retention').change}
            trend={getMetricTrend('retention').trend}
            icon={UserCheck}
          />
          <KPICard
            title="Churn Rate"
            value={`${getLatestMetricValue('churn_rate').toFixed(1)}%`}
            change={getMetricTrend('churn_rate').change}
            trend={getMetricTrend('churn_rate').trend}
            icon={UserX}
          />
          <KPICard
            title="Growth Rate"
            value={`${getLatestMetricValue('growth_rate').toFixed(1)}%`}
            change={getMetricTrend('growth_rate').change}
            trend={getMetricTrend('growth_rate').trend}
            icon={Users}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time to Optimized Prompt Chart */}
          <Card className="border-electric-blue/20">
            <CardHeader>
              <CardTitle className="text-electric-blue">Time to Optimized Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData('time_to_optimized')}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--electric-blue))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--electric-blue))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card className="border-electric-blue/20">
            <CardHeader>
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
                  />
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    isAnimationActive
                  >
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Retention Chart */}
          <Card className="border-electric-blue/20">
            <CardHeader>
              <CardTitle className="text-electric-blue">Retention Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData('retention')}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Growth Chart */}
          <Card className="border-electric-blue/20">
            <CardHeader>
              <CardTitle className="text-electric-blue">Growth Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData('growth_rate')}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--electric-blue-light))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--electric-blue-light))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}