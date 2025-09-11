-- Add Creative & Design AI models
INSERT INTO public.ai_models (name, description, provider, model_id, category, priority, is_active) VALUES
('MidJourney', 'AI image generator known for highly artistic, stylized visuals. Great for moodboards, concept art, and brand identity exploration.', 'midjourney', 'midjourney-v6', 'Creative & Design', 95, true),
('DALL·E 3', 'OpenAI''s image generator, strong for creative design mockups, illustrations, and visual storytelling.', 'openai', 'dall-e-3', 'Creative & Design', 90, true),
('Stable Diffusion', 'Open-source image generation model that offers flexibility and customization for both artistic and commercial projects.', 'stability', 'stable-diffusion-xl', 'Creative & Design', 85, true),
('Runway Gen-2', 'AI video generation platform for creating cinematic clips, ads, and prototypes directly from text or image prompts.', 'runway', 'gen-2', 'Creative & Design', 80, true),
('Pika Labs', 'Emerging AI video generation tool, ideal for social content and fast-moving creative campaigns.', 'pika', 'pika-v1', 'Creative & Design', 75, true),
('Canva AI', 'User-friendly design platform enhanced with AI for presentations, social media posts, and branding materials.', 'canva', 'canva-ai', 'Creative & Design', 70, true),
('Adobe Firefly', 'AI design companion integrated into Adobe products, useful for generative fills, mockups, and branded assets.', 'adobe', 'firefly', 'Creative & Design', 65, true),
('Figma AI', 'Collaborative design platform enhanced with AI features for wireframing, prototyping, and creative iteration.', 'figma', 'figma-ai', 'Creative & Design', 60, true),
('ChatGPT', 'General-purpose conversational AI, widely used for creative ideation, scriptwriting, and design briefs.', 'openai', 'gpt-4', 'Creative & Design', 55, true),
('Grok', 'Real-time AI assistant built into X (formerly Twitter), helpful for tracking cultural design trends and creative inspiration.', 'x', 'grok-beta', 'Creative & Design', 50, true),
('Gemini', 'Google''s multimodal AI, effective for combining text, image, and video workflows in creative pipelines.', 'google', 'gemini-pro', 'Creative & Design', 45, true),
('DeepSeek', 'Advanced reasoning AI model, strong for analyzing design feedback, optimizing creative strategies, and exploring new directions.', 'deepseek', 'deepseek-v2', 'Creative & Design', 40, true);