-- Add Business & Marketing model types in marketing cycle sequence
INSERT INTO public.model_types (type_name, type_description, category, priority, is_active) VALUES
('Market Research & Analysis', 'Identifying customer needs, trends, competitors, and market opportunities through data analysis and research methodologies.', 'Business & Marketing', 50, true),
('Strategy & Planning', 'Defining positioning, messaging, target channels, campaign goals, and comprehensive marketing strategies.', 'Business & Marketing', 40, true),
('Content Creation & Campaign Design', 'Crafting compelling ads, emails, social posts, offers, and creative assets for marketing campaigns.', 'Business & Marketing', 30, true),
('Execution & Distribution', 'Launching and managing campaigns across chosen platforms, channels, and touchpoints.', 'Business & Marketing', 20, true),
('Measurement & Optimization', 'Tracking KPIs, conducting A/B testing, analyzing performance data, and iterating for improved ROI.', 'Business & Marketing', 10, true);