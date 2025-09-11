-- Enhance the match_templates_to_input function to support model-based filtering
-- This update adds an optional model parameter to filter templates by model category

-- Drop the existing function
DROP FUNCTION IF EXISTS public.match_templates_to_input(_user_input text, _category text, _limit integer);

-- Create the enhanced function with optional model parameter
CREATE OR REPLACE FUNCTION public.match_templates_to_input(
  _user_input text, 
  _category text, 
  _limit integer DEFAULT 3,
  _model text DEFAULT NULL
)
RETURNS TABLE(
  id uuid, 
  template_text text, 
  placeholders jsonb, 
  priority integer, 
  category text, 
  subcategory text, 
  tags text[], 
  match_score numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Define model-to-category mapping within the function
  WITH model_category_mapping AS (
    SELECT CASE _model
      WHEN 'gpt-4o' THEN 'Development & Code Execution'
      WHEN 'claude-3-5-sonnet-20241022' THEN 'Development & Code Execution'
      WHEN 'lovable-dev' THEN 'Development & Code Execution'
      WHEN 'midjourney' THEN 'Creative & Design'
      WHEN 'grok-beta' THEN 'Research & Knowledge Work'
      ELSE _category -- Fall back to provided category if model not found
    END AS target_category
  )
  SELECT 
    pt.id,
    pt.template_text,
    pt.placeholders,
    pt.priority,
    pt.category,
    pt.subcategory,
    pt.tags,
    -- Enhanced scoring with model category preference
    CASE 
      WHEN pt.tags IS NOT NULL AND array_length(pt.tags, 1) > 0 THEN
        (SELECT COUNT(*) * 0.3 FROM unnest(pt.tags) tag 
         WHERE lower(_user_input) LIKE '%' || lower(tag) || '%')
      ELSE 0
    END +
    CASE 
      WHEN lower(pt.template_text) LIKE '%' || lower(substring(_user_input from 1 for 50)) || '%' THEN 0.4
      ELSE 0
    END +
    (pt.priority * 0.1) +
    (pt.effectiveness_score * 0.2) +
    -- Bonus points for matching model's preferred category
    CASE 
      WHEN _model IS NOT NULL AND pt.category = (SELECT target_category FROM model_category_mapping) THEN 0.5
      ELSE 0
    END AS match_score
  FROM prompt_templates pt, model_category_mapping mcm
  WHERE pt.is_active = true
    AND (
      -- If model is provided, filter by model's category; otherwise use provided category
      (_model IS NOT NULL AND pt.category = mcm.target_category) OR
      (_model IS NULL AND pt.category = _category)
    )
  ORDER BY match_score DESC, pt.priority DESC
  LIMIT _limit;
$function$;