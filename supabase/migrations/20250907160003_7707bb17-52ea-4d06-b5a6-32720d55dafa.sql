-- Create table for storing raw prompt feeds
CREATE TABLE public.prompt_feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[],
  raw_text TEXT NOT NULL,
  processed_templates JSONB,
  admin_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing individual prompt templates
CREATE TABLE public.prompt_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_id UUID REFERENCES public.prompt_feeds(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[],
  template_text TEXT NOT NULL,
  placeholders JSONB,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prompt_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for prompt_feeds (admin only)
CREATE POLICY "Admins can manage all prompt feeds" 
ON public.prompt_feeds 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for prompt_templates (admin manage, authenticated users read active ones)
CREATE POLICY "Admins can manage all prompt templates" 
ON public.prompt_templates 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active templates" 
ON public.prompt_templates 
FOR SELECT 
USING (auth.role() = 'authenticated' AND is_active = true);

-- Create function to update timestamps
CREATE TRIGGER update_prompt_feeds_updated_at
BEFORE UPDATE ON public.prompt_feeds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompt_templates_updated_at
BEFORE UPDATE ON public.prompt_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_prompt_feeds_category ON public.prompt_feeds(category);
CREATE INDEX idx_prompt_feeds_status ON public.prompt_feeds(status);
CREATE INDEX idx_prompt_feeds_admin_id ON public.prompt_feeds(admin_id);
CREATE INDEX idx_prompt_templates_category ON public.prompt_templates(category);
CREATE INDEX idx_prompt_templates_active ON public.prompt_templates(is_active);