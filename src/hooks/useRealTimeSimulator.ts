import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UseRealTimeSimulatorOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
}

export function useRealTimeSimulator({ 
  enabled = true, 
  interval = 30000 // 30 seconds 
}: UseRealTimeSimulatorOptions = {}) {
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout>();

  const generateMetricUpdate = async () => {
    if (!user) return;

    try {
      // Randomly select a metric type to update
      const metricTypes = ['time_to_optimized', 'churn_rate', 'growth_rate', 'user_satisfaction', 'api_response_time'];
      const randomType = metricTypes[Math.floor(Math.random() * metricTypes.length)];
      
      // Generate realistic values based on metric type
      let value: number;
      switch (randomType) {
        case 'time_to_optimized':
          value = Math.random() * 60 + 15; // 15-75 seconds
          break;
        case 'churn_rate':
          value = Math.random() * 10 + 2; // 2-12%
          break;
        case 'growth_rate':
          value = Math.random() * 25 + 5; // 5-30%
          break;
        case 'user_satisfaction':
          value = Math.random() * 2 + 3; // 3-5 stars
          break;
        case 'api_response_time':
          value = Math.random() * 200 + 50; // 50-250ms
          break;
        default:
          value = Math.random() * 100;
      }

      // Add some metadata for filtering
      const metadata = {
        plan_type: Math.random() > 0.7 ? 'pro' : Math.random() > 0.5 ? 'free' : 'lifetime',
        category: ['development', 'research', 'creative', 'business'][Math.floor(Math.random() * 4)],
        simulated: true,
        source: 'realtime_simulator'
      };

      // Insert new metric
      const { error } = await supabase
        .from('metrics')
        .insert({
          user_id: user.id,
          metric_type: randomType,
          value: Math.round(value * 100) / 100,
          timestamp: new Date().toISOString(),
          metadata
        });

      if (error) {
        console.log('Simulation insert failed (expected for demo):', error.message);
      }

      // Occasionally update conversion funnel data
      if (Math.random() > 0.8) {
        const stages = ['Visitors', 'Sign Ups', 'Active Users', 'Pro Users', 'Lifetime Users'];
        const randomStage = stages[Math.floor(Math.random() * stages.length)];
        const baseUsers = randomStage === 'Visitors' ? 10000 : 
                         randomStage === 'Sign Ups' ? 1500 : 
                         randomStage === 'Active Users' ? 800 : 
                         randomStage === 'Pro Users' ? 120 : 45;
        
        const users = baseUsers + Math.floor((Math.random() - 0.5) * baseUsers * 0.1);
        
        await supabase
          .from('conversion_funnels')
          .upsert({
            user_id: user.id,
            stage: randomStage,
            users_count: users,
            conversion_rate: Math.random() * 15 + 2,
            stage_order: stages.indexOf(randomStage) + 1,
            timestamp: new Date().toISOString()
          }, { onConflict: 'user_id,stage' });
      }

      // Occasionally add a cohort retention update
      if (Math.random() > 0.9) {
        const cohortMonth = new Date();
        cohortMonth.setMonth(cohortMonth.getMonth() - Math.floor(Math.random() * 6));
        
        await supabase
          .from('cohort_retention')
          .upsert({
            user_id: user.id,
            cohort_month: cohortMonth.toISOString().substring(0, 7) + '-01',
            period_number: Math.floor(Math.random() * 6) + 1,
            retention_rate: Math.random() * 80 + 20,
            users_count: Math.floor(Math.random() * 500) + 100
          }, { onConflict: 'user_id,cohort_month,period_number' });
      }

    } catch (error) {
      console.log('Simulation error (expected for demo):', error);
    }
  };

  useEffect(() => {
    if (!enabled || !user) return;

    // Start the interval
    intervalRef.current = setInterval(generateMetricUpdate, interval);

    // Generate initial update after a short delay
    const initialTimeout = setTimeout(generateMetricUpdate, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTimeout(initialTimeout);
    };
  }, [enabled, user, interval]);

  const triggerUpdate = () => {
    generateMetricUpdate();
  };

  return {
    triggerUpdate
  };
}