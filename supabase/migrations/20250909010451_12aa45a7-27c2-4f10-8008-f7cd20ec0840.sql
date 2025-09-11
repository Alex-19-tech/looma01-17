-- Add new types to the Development & Code Execution category
INSERT INTO public.model_types (type_name, type_description, category, priority, is_active) VALUES
('Coding / Authoring Prompts', 'Generate source code from natural language or structured requirements (e.g., build functions, apps, or modules).', 'Development & Code Execution', 5, true),
('Execution / Run Prompts', 'Simulate or run code to show results, outputs, or explain program behavior step by step.', 'Development & Code Execution', 4, true),
('Debugging Prompts', 'Identify errors, trace issues, and propose fixes for faulty or inefficient code.', 'Development & Code Execution', 3, true),
('Testing Prompts', 'Generate or validate unit, integration, or automated tests to ensure correctness and reliability.', 'Development & Code Execution', 2, true),
('Deployment / DevOps Prompts', 'Automate CI/CD pipelines, containerization, and environment setup for production or staging.', 'Development & Code Execution', 1, true);