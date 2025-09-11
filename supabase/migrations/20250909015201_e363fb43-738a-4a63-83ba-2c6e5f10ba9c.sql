-- Enable realtime for type_templates table
ALTER TABLE public.type_templates REPLICA IDENTITY FULL;

-- Add the table to realtime publication if not already added
DO $$
BEGIN
    -- Check if table is already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'type_templates'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.type_templates;
    END IF;
END $$;