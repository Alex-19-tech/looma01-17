-- Create model_types table to store types for each model/category
CREATE TABLE public.model_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES public.ai_models(id) ON DELETE CASCADE,
  type_name TEXT NOT NULL,
  type_description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon_name TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(model_id, type_name)
);

-- Create user_feeds table to store raw user input data
CREATE TABLE public.user_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  model_id UUID REFERENCES public.ai_models(id) ON DELETE CASCADE,
  type_id UUID REFERENCES public.model_types(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  category TEXT NOT NULL,
  model_name TEXT NOT NULL,
  type_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  admin_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create type_templates table to store templates generated from user feeds
CREATE TABLE public.type_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID REFERENCES public.user_feeds(id) ON DELETE CASCADE,
  type_id UUID REFERENCES public.model_types(id) ON DELETE CASCADE,
  template_text TEXT NOT NULL,
  placeholders JSONB,
  tags TEXT[],
  priority INTEGER DEFAULT 0,
  effectiveness_score NUMERIC DEFAULT 0.0,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.model_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.type_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for model_types
CREATE POLICY "Authenticated users can view active model types"
  ON public.model_types FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Admins can manage all model types"
  ON public.model_types FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_feeds
CREATE POLICY "Users can create their own feeds"
  ON public.user_feeds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feeds"
  ON public.user_feeds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all feeds"
  ON public.user_feeds FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for type_templates
CREATE POLICY "Authenticated users can view active templates"
  ON public.type_templates FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Admins can manage all type templates"
  ON public.type_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at columns
CREATE TRIGGER update_model_types_updated_at
  BEFORE UPDATE ON public.model_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_feeds_updated_at
  BEFORE UPDATE ON public.user_feeds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_type_templates_updated_at
  BEFORE UPDATE ON public.type_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default Research & Knowledge Work model types
INSERT INTO public.model_types (model_id, type_name, type_description, category, icon_name, priority) 
SELECT 
  am.id,
  type_data.type_name,
  type_data.type_description,
  'Research & Knowledge Work',
  type_data.icon_name,
  type_data.priority
FROM public.ai_models am
CROSS JOIN (
  VALUES 
    ('Descriptive Research', 'Defines what is happening through surveys, observations, and case studies', 'Search', 5),
    ('Analytical Research', 'Investigates why it''s happening by analyzing relationships and patterns', 'TrendingUp', 4),
    ('Applied Research', 'Focuses on solving practical, real-world problems (common in business and tech)', 'Target', 3),
    ('Quantitative Research', 'Uses numbers, statistics, and measurable data to validate findings', 'BarChart3', 2),
    ('Qualitative Research', 'Uses interviews, focus groups, content analysis to uncover depth and meaning', 'MessageSquare', 1)
) AS type_data(type_name, type_description, icon_name, priority)
WHERE am.category = 'Research & Knowledge Work';

-- Create function to get model types by model ID
CREATE OR REPLACE FUNCTION public.get_model_types_by_model_id(_model_id UUID)
RETURNS TABLE(
  id UUID,
  type_name TEXT,
  type_description TEXT,
  category TEXT,
  icon_name TEXT,
  priority INTEGER
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT 
    mt.id,
    mt.type_name,
    mt.type_description,
    mt.category,
    mt.icon_name,
    mt.priority
  FROM model_types mt
  WHERE mt.model_id = _model_id 
    AND mt.is_active = true
  ORDER BY mt.priority DESC, mt.type_name ASC;
$function$;