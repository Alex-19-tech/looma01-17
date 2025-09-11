-- Add Creative & Design types across all Creative models, ordered by the Creative Loop
WITH creative_models AS (
  SELECT id, name FROM public.ai_models 
  WHERE category = 'Creative & Design' AND is_active = true
),
-- Define the Creative Loop types with ordering by priority (higher first)
 type_defs AS (
  SELECT * FROM (
    VALUES
      ('Ideation / Brainstorming', 'Generating concepts, moodboards, sketches, or storyboards.', 'Lightbulb', 100),
      ('Wireframing / Structuring', 'Creating the blueprint: layouts, UX flows, information hierarchy.', 'Layout', 90),
      ('Visual Design / Styling', 'Applying colors, typography, branding, and aesthetics.', 'Palette', 80),
      ('Prototyping / Interaction Design', 'Building interactive mockups and flows (e.g., Figma, Adobe XD).', 'MousePointerClick', 70),
      ('Review & Iteration', 'Gathering feedback, refining, and finalizing the design.', 'RefreshCw', 60)
  ) AS t(type_name, type_description, icon_name, priority)
)
INSERT INTO public.model_types (
  model_id,
  type_name,
  type_description,
  category,
  icon_name,
  priority,
  is_active
)
SELECT 
  cm.id AS model_id,
  td.type_name,
  td.type_description,
  'Creative & Design' AS category,
  td.icon_name,
  td.priority,
  true AS is_active
FROM creative_models cm
CROSS JOIN type_defs td
WHERE NOT EXISTS (
  SELECT 1 FROM public.model_types mt 
  WHERE mt.model_id = cm.id 
    AND mt.type_name = td.type_name
);
