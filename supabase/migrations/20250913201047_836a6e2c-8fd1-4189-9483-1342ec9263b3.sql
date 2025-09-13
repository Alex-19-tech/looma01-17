-- Create metrics tables for Prelix dashboard

-- Main metrics table for storing KPI data
CREATE TABLE public.metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL, -- 'time_to_optimized', 'conversion_rate', 'retention', 'churn_rate', 'growth_rate'
  value NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

-- User can view their own metrics
CREATE POLICY "Users can view their own metrics" 
ON public.metrics 
FOR SELECT 
USING (auth.uid() = user_id);

-- User can insert their own metrics  
CREATE POLICY "Users can insert their own metrics" 
ON public.metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Conversion funnel table
CREATE TABLE public.conversion_funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage TEXT NOT NULL, -- 'initial_prompt', 'template_applied', 'optimization_complete', 'user_satisfied'
  stage_order INTEGER NOT NULL,
  users_count INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0.0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS  
ALTER TABLE public.conversion_funnels ENABLE ROW LEVEL SECURITY;

-- Policies for conversion funnel
CREATE POLICY "Users can view their funnel data" 
ON public.conversion_funnels 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert funnel data" 
ON public.conversion_funnels 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Cohort retention table
CREATE TABLE public.cohort_retention (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cohort_month DATE NOT NULL,
  period_number INTEGER NOT NULL, -- 0 for month 0, 1 for month 1, etc.
  users_count INTEGER NOT NULL DEFAULT 0,
  retention_rate NUMERIC DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cohort_retention ENABLE ROW LEVEL SECURITY;

-- Policies for cohort retention
CREATE POLICY "Users can view their cohort data" 
ON public.cohort_retention 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert cohort data" 
ON public.cohort_retention 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Alerts table for threshold triggers
CREATE TABLE public.metric_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  comparison_operator TEXT NOT NULL DEFAULT 'lt', -- 'lt', 'gt', 'eq'
  is_active BOOLEAN NOT NULL DEFAULT true,
  alert_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.metric_alerts ENABLE ROW LEVEL SECURITY;

-- Policies for alerts
CREATE POLICY "Users can manage their own alerts" 
ON public.metric_alerts 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for metric_alerts
CREATE TRIGGER update_metric_alerts_updated_at
BEFORE UPDATE ON public.metric_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for demo purposes
INSERT INTO public.metrics (user_id, metric_type, value, timestamp) 
SELECT 
  gen_random_uuid(),
  metric_type,
  (random() * 100)::numeric,
  now() - (interval '1 day' * generate_series(1, 30))
FROM unnest(ARRAY['time_to_optimized', 'conversion_rate', 'retention', 'churn_rate', 'growth_rate']) AS metric_type;

-- Add indexes for better performance
CREATE INDEX idx_metrics_user_id_type_timestamp ON public.metrics(user_id, metric_type, timestamp DESC);
CREATE INDEX idx_conversion_funnels_user_id ON public.conversion_funnels(user_id);
CREATE INDEX idx_cohort_retention_user_id ON public.cohort_retention(user_id);
CREATE INDEX idx_metric_alerts_user_id_active ON public.metric_alerts(user_id, is_active);