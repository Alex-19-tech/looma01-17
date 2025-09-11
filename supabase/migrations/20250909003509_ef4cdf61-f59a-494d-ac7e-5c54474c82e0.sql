-- Link Business & Marketing model types to relevant AI models
-- Get some representative model IDs from Business & Marketing category
UPDATE model_types 
SET model_id = (
  SELECT id FROM ai_models 
  WHERE category = 'Business & Marketing' 
    AND model_id = 'gpt-4-turbo-preview' 
  LIMIT 1
)
WHERE category = 'Business & Marketing' 
  AND type_name IN ('Market Research & Analysis', 'Strategy & Planning');

UPDATE model_types 
SET model_id = (
  SELECT id FROM ai_models 
  WHERE category = 'Business & Marketing' 
    AND model_id = 'jasper-ai' 
  LIMIT 1
)
WHERE category = 'Business & Marketing' 
  AND type_name = 'Content Creation & Campaign Design';

UPDATE model_types 
SET model_id = (
  SELECT id FROM ai_models 
  WHERE category = 'Business & Marketing' 
    AND model_id = 'hubspot-ai' 
  LIMIT 1
)
WHERE category = 'Business & Marketing' 
  AND type_name = 'Execution & Distribution';

UPDATE model_types 
SET model_id = (
  SELECT id FROM ai_models 
  WHERE category = 'Business & Marketing' 
    AND model_id = 'surfer-seo' 
  LIMIT 1
)
WHERE category = 'Business & Marketing' 
  AND type_name = 'Measurement & Optimization';