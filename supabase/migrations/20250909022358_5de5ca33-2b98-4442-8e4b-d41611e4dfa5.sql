-- Add performance tracking fields to type_templates table
ALTER TABLE type_templates ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE type_templates ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 1.00;
ALTER TABLE type_templates ADD COLUMN IF NOT EXISTS user_satisfaction_score DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE type_templates ADD COLUMN IF NOT EXISTS context_match_accuracy DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE type_templates ADD COLUMN IF NOT EXISTS generation_latency_ms INTEGER DEFAULT 0;
ALTER TABLE type_templates ADD COLUMN IF NOT EXISTS semantic_embedding VECTOR(1536);
ALTER TABLE type_templates ADD COLUMN IF NOT EXISTS template_quality_score DECIMAL(3,2) DEFAULT 0.00;

-- Create template analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS template_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'view', 'select', 'use', 'feedback'
  context_data JSONB DEFAULT '{}',
  performance_score DECIMAL(3,2),
  response_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  feedback_rating INTEGER, -- 1-5 rating
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for template_analytics
ALTER TABLE template_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for template_analytics
CREATE POLICY "Users can create their own analytics" 
ON template_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics" 
ON template_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" 
ON template_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_template_analytics_template_id ON template_analytics(template_id);
CREATE INDEX IF NOT EXISTS idx_template_analytics_user_id ON template_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_template_analytics_action_type ON template_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_template_analytics_created_at ON template_analytics(created_at);

-- Add index for semantic search
CREATE INDEX IF NOT EXISTS idx_type_templates_semantic_embedding ON type_templates USING ivfflat (semantic_embedding vector_cosine_ops);

-- Update template usage function to include performance tracking
CREATE OR REPLACE FUNCTION public.update_template_usage_enhanced(_template_id uuid, _effectiveness_rating numeric DEFAULT NULL::numeric, _response_time_ms integer DEFAULT NULL, _success boolean DEFAULT true)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  UPDATE type_templates 
  SET 
    usage_count = usage_count + 1,
    last_used_at = now(),
    effectiveness_score = CASE 
      WHEN _effectiveness_rating IS NOT NULL THEN 
        (effectiveness_score * usage_count + _effectiveness_rating) / (usage_count + 1)
      ELSE effectiveness_score
    END,
    success_rate = CASE 
      WHEN _success THEN 
        (success_rate * usage_count + 1.00) / (usage_count + 1)
      ELSE 
        (success_rate * usage_count + 0.00) / (usage_count + 1)
    END,
    generation_latency_ms = COALESCE(_response_time_ms, generation_latency_ms)
  WHERE id = _template_id;
$function$;

-- Create function to get template recommendations based on similarity
CREATE OR REPLACE FUNCTION public.get_template_recommendations(_user_input text, _type_id uuid DEFAULT NULL, _limit integer DEFAULT 5)
 RETURNS TABLE(id uuid, template_text text, placeholders jsonb, priority integer, effectiveness_score numeric, match_score numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    tt.id,
    tt.template_text,
    tt.placeholders,
    tt.priority,
    tt.effectiveness_score,
    -- Calculate match score based on multiple factors
    CASE 
      WHEN tt.tags IS NOT NULL AND array_length(tt.tags, 1) > 0 THEN
        (SELECT COUNT(*) * 0.3 FROM unnest(tt.tags) tag 
         WHERE lower(_user_input) LIKE '%' || lower(tag) || '%')
      ELSE 0
    END +
    CASE 
      WHEN lower(tt.template_text) LIKE '%' || lower(substring(_user_input from 1 for 50)) || '%' THEN 0.4
      ELSE 0
    END +
    (tt.priority * 0.1) +
    (tt.effectiveness_score * 0.15) +
    (tt.success_rate * 0.05) AS match_score
  FROM type_templates tt
  WHERE tt.is_active = true
    AND (_type_id IS NULL OR tt.type_id = _type_id)
  ORDER BY match_score DESC, tt.effectiveness_score DESC, tt.usage_count DESC
  LIMIT _limit;
$function$;