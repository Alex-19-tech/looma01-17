-- Enable realtime for metrics tables
ALTER TABLE public.metrics REPLICA IDENTITY FULL;
ALTER TABLE public.cohort_retention REPLICA IDENTITY FULL;
ALTER TABLE public.conversion_funnels REPLICA IDENTITY FULL;
ALTER TABLE public.metric_alerts REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cohort_retention;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversion_funnels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.metric_alerts;

-- Create indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_metrics_user_timestamp 
  ON public.metrics(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_metrics_type_timestamp 
  ON public.metrics(user_id, metric_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_cohort_retention_user_cohort 
  ON public.cohort_retention(user_id, cohort_month);

CREATE INDEX IF NOT EXISTS idx_conversion_funnels_user_timestamp 
  ON public.conversion_funnels(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_metric_alerts_user_active 
  ON public.metric_alerts(user_id, is_active) 
  WHERE is_active = true;