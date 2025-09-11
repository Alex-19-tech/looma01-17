-- First, remove the existing model_types for Business & Marketing to avoid duplicates
DELETE FROM model_types WHERE category = 'Business & Marketing';

-- Insert all 5 types for each AI model in Business & Marketing category
INSERT INTO model_types (type_name, type_description, category, model_id, priority, is_active)
SELECT 
  type_data.type_name,
  type_data.type_description,
  'Business & Marketing',
  ai_models.id,
  type_data.priority,
  true
FROM ai_models
CROSS JOIN (
  VALUES 
    ('Market Research & Analysis', 'Identifying customer needs, trends, competitors, and market opportunities through data analysis and research methodologies.', 50),
    ('Strategy & Planning', 'Defining positioning, messaging, target channels, campaign goals, and comprehensive marketing strategies.', 40),
    ('Content Creation & Campaign Design', 'Crafting compelling ads, emails, social posts, offers, and creative assets for marketing campaigns.', 30),
    ('Execution & Distribution', 'Launching and managing campaigns across chosen platforms, channels, and touchpoints.', 20),
    ('Measurement & Optimization', 'Tracking KPIs, conducting A/B testing, analyzing performance data, and iterating for improved ROI.', 10)
) AS type_data(type_name, type_description, priority)
WHERE ai_models.category = 'Business & Marketing' AND ai_models.is_active = true;