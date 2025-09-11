-- Remove one of the duplicate Lovable.dev entries
-- Keep the one with name 'Lovable.dev' and remove the one with name 'Lovable Dev'
DELETE FROM ai_models 
WHERE category = 'Development & Code Execution' 
AND name = 'Lovable Dev' 
AND model_id = 'lovable-dev';