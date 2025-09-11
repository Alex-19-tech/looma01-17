-- Add template integration fields to chat_messages table
ALTER TABLE chat_messages ADD COLUMN template_id UUID REFERENCES prompt_templates(id);
ALTER TABLE chat_messages ADD COLUMN template_applied BOOLEAN DEFAULT false;

-- Add template usage tracking to prompt_templates
ALTER TABLE prompt_templates ADD COLUMN usage_count INT DEFAULT 0;
ALTER TABLE prompt_templates ADD COLUMN effectiveness_score DECIMAL(3,2) DEFAULT 0.0;

-- Create function to get active templates by category
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

-- Create function to match templates to user input
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

-- Create function to update template usage
CREATE OR REPLACE FUNCTION update_template_usage(
  _template_id UUID,
  _effectiveness_rating DECIMAL(3,2) DEFAULT NULL
)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
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