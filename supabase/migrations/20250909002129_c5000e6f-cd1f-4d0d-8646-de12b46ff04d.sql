-- Add Business & Marketing AI models (avoiding duplicates by using different model_id values)
INSERT INTO public.ai_models (name, description, provider, model_id, category, priority, is_active) VALUES
('Jasper', 'AI copywriting assistant for generating high-converting ads, emails, blog posts, and landing page content.', 'jasper', 'jasper-ai', 'Business & Marketing', 95, true),
('Copy.ai', 'AI-driven content creation platform for marketers, specializing in campaign messaging, social media posts, and product descriptions.', 'copy-ai', 'copy-ai-pro', 'Business & Marketing', 90, true),
('Anyword', 'Predictive AI marketing copy tool that scores text performance and helps optimize for conversions and ROI.', 'anyword', 'anyword-pro', 'Business & Marketing', 85, true),
('HubSpot AI', 'Marketing automation suite with AI features for email personalization, lead nurturing, and CRM insights.', 'hubspot', 'hubspot-ai', 'Business & Marketing', 80, true),
('Notion AI', 'Productivity and knowledge management assistant with strong content generation for marketing docs, campaign briefs, and strategy outlines.', 'notion', 'notion-ai', 'Business & Marketing', 75, true),
('Writesonic', 'AI marketing suite with ad creation, landing page generation, and SEO optimization tools.', 'writesonic', 'writesonic-pro', 'Business & Marketing', 70, true),
('SurferSEO', 'AI-powered SEO tool that optimizes content for rankings, keyword strategy, and organic growth.', 'surfer', 'surfer-seo', 'Business & Marketing', 65, true),
('Ocoya', 'AI social media manager for creating, scheduling, and optimizing posts with real-time performance tracking.', 'ocoya', 'ocoya-pro', 'Business & Marketing', 60, true),
('Persado', 'AI messaging platform that uses emotional and behavioral data to generate highly persuasive marketing copy.', 'persado', 'persado-ai', 'Business & Marketing', 55, true),
('ChatGPT for Marketing', 'General-purpose conversational AI, widely used for brainstorming campaign ideas, drafting marketing copy, and customer engagement scripts.', 'openai', 'gpt-4-marketing', 'Business & Marketing', 50, true),
('Grok for Marketing', 'Real-time AI assistant built into X (formerly Twitter), valuable for cultural trend analysis and social-first marketing strategies.', 'x', 'grok-marketing', 'Business & Marketing', 45, true),
('Gemini for Marketing', 'Google''s multimodal AI, effective for market insights, campaign planning, and integrating text/visual research into strategy.', 'google', 'gemini-marketing', 'Business & Marketing', 40, true),
('DeepSeek for Marketing', 'Advanced reasoning AI model, strong for analyzing complex market data, segmenting audiences, and forecasting growth strategies.', 'deepseek', 'deepseek-marketing', 'Business & Marketing', 35, true);