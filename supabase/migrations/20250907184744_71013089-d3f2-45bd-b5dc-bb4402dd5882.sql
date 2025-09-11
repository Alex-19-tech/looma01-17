-- Fix function search path security warnings by setting search_path
DROP FUNCTION get_active_templates_by_category(TEXT, TEXT);
DROP FUNCTION match_templates_to_input(TEXT, TEXT, INT);
DROP FUNCTION update_template_usage(UUID, DECIMAL);

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION get_active_templates_by_category(
  _category TEXT,
  _subcategory TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  template_text TEXT,
  placeholders JSONB,
  priority INT,
  category TEXT,
  subcategory TEXT,
  tags TEXT[],
  usage_count INT,
  effectiveness_score DECIMAL(3,2)
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pt.id,
    pt.template_text,
    pt.placeholders,
    pt.priority,
    pt.category,
    pt.subcategory,
    pt.tags,
    pt.usage_count,
    pt.effectiveness_score
  FROM prompt_templates pt
  WHERE pt.is_active = true
    AND pt.category = _category
    AND (_subcategory IS NULL OR pt.subcategory = _subcategory)
  ORDER BY pt.priority DESC, pt.effectiveness_score DESC, pt.usage_count DESC;
$$;

CREATE OR REPLACE FUNCTION match_templates_to_input(
  _user_input TEXT,
  _category TEXT,
  _limit INT DEFAULT 3
)
RETURNS TABLE(
  id UUID,
  template_text TEXT,
  placeholders JSONB,
  priority INT,
  category TEXT,
  subcategory TEXT,
  tags TEXT[],
  match_score DECIMAL(3,2)
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pt.id,
    pt.template_text,
    pt.placeholders,
    pt.priority,
    pt.category,
    pt.subcategory,
    pt.tags,
    -- Simple keyword matching score (can be enhanced with vector similarity later)
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
    (pt.effectiveness_score * 0.2) AS match_score
  FROM prompt_templates pt
  WHERE pt.is_active = true
    AND pt.category = _category
  ORDER BY match_score DESC, pt.priority DESC
  LIMIT _limit;
$$;

CREATE OR REPLACE FUNCTION update_template_usage(
  _template_id UUID,
  _effectiveness_rating DECIMAL(3,2) DEFAULT NULL
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE prompt_templates 
  SET 
    usage_count = usage_count + 1,
    effectiveness_score = CASE 
      WHEN _effectiveness_rating IS NOT NULL THEN 
        (effectiveness_score * usage_count + _effectiveness_rating) / (usage_count + 1)
      ELSE effectiveness_score
    END
  WHERE id = _template_id;
$$;