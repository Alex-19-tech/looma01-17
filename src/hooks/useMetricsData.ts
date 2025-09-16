import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "@/components/MetricsDateFilter";
import { MetricsFilterState } from "@/components/MetricsFilters";
import { subDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

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

// Mock data generators for demonstration
const generateMockMetrics = (dateRange: DateRange): MetricData[] => {
  const metrics: MetricData[] = [];
  const metricTypes = ['time_to_optimized', 'churn_rate', 'growth_rate', 'user_satisfaction', 'api_response_time'];
  
  let currentDate = new Date(dateRange.from);
  const endDate = new Date(dateRange.to);
  
  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    metricTypes.forEach(type => {
      const baseValue = getBaseValueForMetric(type);
      const variance = baseValue * 0.3; // 30% variance
      const value = Math.max(0, baseValue + (Math.random() - 0.5) * 2 * variance);
      
      metrics.push({
        id: `${type}-${currentDate.getTime()}`,
        metric_type: type,
        value: Math.round(value * 100) / 100,
        timestamp: currentDate.toISOString(),
        metadata: {}
      });
    });
    
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return metrics;
};

const getBaseValueForMetric = (type: string): number => {
  switch (type) {
    case 'time_to_optimized': return 45; // seconds
    case 'churn_rate': return 5; // percentage
    case 'growth_rate': return 15; // percentage
    case 'user_satisfaction': return 4.2; // out of 5
    case 'api_response_time': return 120; // milliseconds
    default: return 100;
  }
};

const generateMockCohortData = (): CohortData[] => {
  const cohorts = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'];
  const data: CohortData[] = [];
  
  cohorts.forEach(cohort => {
    for (let period = 1; period <= 6; period++) {
      const baseRetention = period === 1 ? 100 : 100 / Math.pow(1.3, period - 1);
      const retention = Math.max(5, baseRetention + (Math.random() - 0.5) * 20);
      const users = Math.floor(1000 / Math.pow(1.3, period - 1) + (Math.random() - 0.5) * 200);
      
      data.push({
        cohort_month: cohort,
        period_number: period,
        retention_rate: Math.round(retention * 100) / 100,
        users_count: Math.max(10, users)
      });
    }
  });
  
  return data;
};

const generateMockConversionData = (): ConversionData[] => {
  const stages = [
    { name: 'Visitors', order: 1, base: 10000 },
    { name: 'Sign Ups', order: 2, base: 1500 },
    { name: 'Active Users', order: 3, base: 800 },
    { name: 'Pro Users', order: 4, base: 120 },
    { name: 'Lifetime Users', order: 5, base: 45 }
  ];
  
  return stages.map((stage, index) => {
    const users = stage.base + Math.floor((Math.random() - 0.5) * stage.base * 0.3);
    const prevUsers = index === 0 ? users : stages[index - 1].base;
    const conversionRate = index === 0 ? 100 : (users / prevUsers) * 100;
    
    return {
      stage: stage.name,
      users_count: users,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      stage_order: stage.order
    };
  });
};

export function useMetricsData(dateRange: DateRange, filters: MetricsFilterState) {
  const { user } = useAuth();
  const [rawMetrics, setRawMetrics] = useState<MetricData[]>([]);
  const [rawCohortData, setRawCohortData] = useState<CohortData[]>([]);
  const [rawConversionData, setRawConversionData] = useState<ConversionData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced data fetching with better error handling and real-time integration
  const fetchAllData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Create sample data if none exists
      await ensureSampleDataExists(user.id);

      // Fetch all data with improved queries
      const [metricsResult, cohortResult, conversionResult, alertsResult] = await Promise.allSettled([
        supabase
          .from('metrics')
          .select('*')
          .eq('user_id', user.id)
          .gte('timestamp', dateRange.from.toISOString())
          .lte('timestamp', dateRange.to.toISOString())
          .order('timestamp', { ascending: true })
          .limit(1000),
        
        supabase
          .from('cohort_retention')
          .select('*')
          .eq('user_id', user.id)
          .order('cohort_month', { ascending: true })
          .limit(100),
        
        supabase
          .from('conversion_funnels')
          .select('*')
          .eq('user_id', user.id)
          .gte('timestamp', dateRange.from.toISOString())
          .lte('timestamp', dateRange.to.toISOString())
          .order('stage_order', { ascending: true }),
        
        supabase
          .from('metric_alerts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
      ]);

      // Process results with better error handling
      const metrics = metricsResult.status === 'fulfilled' && metricsResult.value.data
        ? metricsResult.value.data
        : generateMockMetrics(dateRange);
      
      const cohortData = cohortResult.status === 'fulfilled' && cohortResult.value.data
        ? cohortResult.value.data
        : generateMockCohortData();
      
      const conversionData = conversionResult.status === 'fulfilled' && conversionResult.value.data
        ? conversionResult.value.data
        : generateMockConversionData();
      
      const alertsData = alertsResult.status === 'fulfilled' && alertsResult.value.data
        ? alertsResult.value.data
        : [];

      setRawMetrics(metrics);
      setRawCohortData(cohortData);
      setRawConversionData(conversionData);
      setAlerts(alertsData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load metrics data. Using sample data for demonstration.');
      
      // Use mock data as fallback
      setRawMetrics(generateMockMetrics(dateRange));
      setRawCohortData(generateMockCohortData());
      setRawConversionData(generateMockConversionData());
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [user, dateRange]);

  // Enhanced filtering with proper filter application
  const filteredData = useMemo(() => {
    const fromTime = startOfDay(dateRange.from).getTime();
    const toTime = endOfDay(dateRange.to).getTime();

    const metrics = rawMetrics.filter(metric => {
      const metricTime = new Date(metric.timestamp).getTime();
      const inDateRange = metricTime >= fromTime && metricTime <= toTime;
      
      // Apply metadata-based filtering
      if (filters.planType && filters.planType !== 'all') {
        const planType = metric.metadata?.plan_type;
        if (planType !== filters.planType) return false;
      }
      
      if (filters.templateCategory && filters.templateCategory !== 'all') {
        const category = metric.metadata?.category;
        if (category !== filters.templateCategory) return false;
      }
      
      return inDateRange;
    });

    // Filter cohort data based on filters
    const cohortData = rawCohortData.filter(cohort => {
      if (filters.cohort && filters.cohort !== 'all') {
        const cohortMonth = new Date(cohort.cohort_month);
        const now = new Date();
        
        switch (filters.cohort) {
          case 'this_week':
            return cohortMonth >= subDays(now, 7);
          case 'this_month':
            return cohortMonth.getMonth() === now.getMonth() && 
                   cohortMonth.getFullYear() === now.getFullYear();
          case 'q1_2024':
            return cohortMonth.getFullYear() === 2024 && cohortMonth.getMonth() < 3;
          case 'q2_2024':
            return cohortMonth.getFullYear() === 2024 && cohortMonth.getMonth() >= 3 && cohortMonth.getMonth() < 6;
          default:
            return true;
        }
      }
      return true;
    });

    // Filter conversion data - no specific filtering needed as it's aggregate data
    const conversionData = rawConversionData;

    return { metrics, cohortData, conversionData };
  }, [rawMetrics, rawCohortData, rawConversionData, dateRange, filters]);

  useEffect(() => {
    fetchAllData();
  }, [user, dateRange]);

  useEffect(() => {
    if (!user) return;

    // Set up comprehensive real-time subscriptions
    const channel = supabase
      .channel('metrics-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'metrics',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time metrics update:', payload);
          fetchAllData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cohort_retention',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time cohort update:', payload);
          fetchAllData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversion_funnels',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time conversion update:', payload);
          fetchAllData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'metric_alerts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time alerts update:', payload);
          fetchAllData();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAllData]);

  return {
    ...filteredData,
    alerts,
    loading,
    error,
    refetch: fetchAllData
  };
}

// Helper function to ensure sample data exists for demonstration
async function ensureSampleDataExists(userId: string) {
  try {
    // Check if any metrics exist
    const { count } = await supabase
      .from('metrics')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (count === 0) {
      // Create sample metrics data
      const sampleMetrics = generateMockMetrics({
        from: subDays(new Date(), 30),
        to: new Date()
      }).map(metric => ({
        ...metric,
        user_id: userId,
        id: undefined // Let Supabase generate the ID
      }));

      await supabase.from('metrics').insert(sampleMetrics);

      // Create sample cohort data
      const sampleCohortData = generateMockCohortData().map(cohort => ({
        ...cohort,
        user_id: userId,
        id: undefined
      }));

      await supabase.from('cohort_retention').insert(sampleCohortData);

      // Create sample conversion data
      const sampleConversionData = generateMockConversionData().map(conversion => ({
        ...conversion,
        user_id: userId,
        timestamp: new Date().toISOString(),
        id: undefined
      }));

      await supabase.from('conversion_funnels').insert(sampleConversionData);
    }
  } catch (error) {
    console.log('Sample data creation skipped:', error.message);
    // Silent fail - mock data will be used instead
  }
}