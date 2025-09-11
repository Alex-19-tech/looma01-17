-- Add usage_count and performance_score columns if they don't exist in type_templates
DO $$ 
BEGIN
  -- Check if usage_count column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'type_templates' AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE type_templates ADD COLUMN usage_count integer DEFAULT 0;
  END IF;

  -- Check if performance_score column exists, if not add it  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'type_templates' AND column_name = 'performance_score'
  ) THEN
    ALTER TABLE type_templates ADD COLUMN performance_score numeric DEFAULT 0.0;
  END IF;
END $$;