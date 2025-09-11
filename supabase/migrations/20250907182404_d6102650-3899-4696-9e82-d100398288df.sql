-- Temporarily allow authenticated users to view prompt feeds for development
CREATE POLICY "Authenticated users can view prompt feeds (dev)" 
ON public.prompt_feeds 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Also allow authenticated users to create prompt feeds for development
CREATE POLICY "Authenticated users can create prompt feeds (dev)" 
ON public.prompt_feeds 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = admin_id);