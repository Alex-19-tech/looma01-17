-- Create ai_models table for dynamic model management
CREATE TABLE public.ai_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  provider TEXT NOT NULL DEFAULT 'openai',
  model_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_models
CREATE POLICY "Admins can manage all ai_models" 
ON public.ai_models 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active models" 
ON public.ai_models 
FOR SELECT 
USING (auth.role() = 'authenticated' AND is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ai_models_updated_at
BEFORE UPDATE ON public.ai_models
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample model data
INSERT INTO public.ai_models (name, category, description, provider, model_id, priority) VALUES
('GPT-4o', 'Development & Code Execution', 'Advanced reasoning and coding capabilities', 'openai', 'gpt-4o', 100),
('Claude 3.5 Sonnet', 'Development & Code Execution', 'Excellent for complex reasoning and coding', 'anthropic', 'claude-3-5-sonnet-20241022', 95),
('Lovable Dev', 'Development & Code Execution', 'Specialized for web development', 'lovable', 'lovable-dev', 90),
('GPT-4 Vision', 'Creative & Design', 'Image analysis and creative tasks', 'openai', 'gpt-4-vision-preview', 85),
('DALL-E 3', 'Creative & Design', 'Advanced image generation', 'openai', 'dall-e-3', 80),
('Midjourney', 'Creative & Design', 'High-quality artistic image generation', 'midjourney', 'midjourney', 75),
('Claude 3 Haiku', 'Research & Knowledge Work', 'Fast, accurate research and analysis', 'anthropic', 'claude-3-haiku-20240307', 70),
('Grok Beta', 'Research & Knowledge Work', 'Real-time information and analysis', 'xai', 'grok-beta', 65),
('GPT-4 Turbo', 'Business & Marketing', 'Business strategy and marketing content', 'openai', 'gpt-4-turbo-preview', 60),
('Claude 3 Opus', 'Business & Marketing', 'Strategic planning and analysis', 'anthropic', 'claude-3-opus-20240229', 55);