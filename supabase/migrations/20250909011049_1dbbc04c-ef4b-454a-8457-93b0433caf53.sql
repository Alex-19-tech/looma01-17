-- Link all Development & Code Execution types to all Development & Code Execution models
-- First, get all model IDs for Development & Code Execution category
WITH dev_models AS (
  SELECT id FROM ai_models WHERE category = 'Development & Code Execution'
),
dev_types AS (
  SELECT id, type_name, type_description, category, priority FROM model_types 
  WHERE category = 'Development & Code Execution' AND model_id IS NULL
)
-- Create a cross join to link each type to each model
INSERT INTO model_types (type_name, type_description, category, priority, model_id, is_active)
SELECT 
  dt.type_name, 
  dt.type_description, 
  dt.category, 
  dt.priority, 
  dm.id as model_id,
  true as is_active
FROM dev_types dt
CROSS JOIN dev_models dm;

-- Remove the original unlinked types
DELETE FROM model_types 
WHERE category = 'Development & Code Execution' AND model_id IS NULL;