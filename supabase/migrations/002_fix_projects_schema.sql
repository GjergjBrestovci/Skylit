-- Fix projects table schema to match controller expectations
-- Run this in Supabase Dashboard > SQL Editor

-- Add missing columns to projects table
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS prompt TEXT,
  ADD COLUMN IF NOT EXISTS generated_code TEXT,
  ADD COLUMN IF NOT EXISTS model VARCHAR(100);

-- Migrate existing 'name' to 'title' if needed
UPDATE public.projects 
SET title = name 
WHERE title IS NULL AND name IS NOT NULL;

-- Make title NOT NULL after migration
ALTER TABLE public.projects 
  ALTER COLUMN title SET NOT NULL;

-- Keep 'name' column for backward compatibility but populate it from title
UPDATE public.projects 
SET name = title 
WHERE name IS NULL;

-- Update comments
COMMENT ON COLUMN public.projects.title IS 'Project title (primary field used by controllers)';
COMMENT ON COLUMN public.projects.name IS 'Project name (kept for backward compatibility)';
COMMENT ON COLUMN public.projects.prompt IS 'User prompt/description for website generation';
COMMENT ON COLUMN public.projects.generated_code IS 'Full generated code JSON (includes html, css, js)';
COMMENT ON COLUMN public.projects.model IS 'AI model used for generation (e.g., gpt-4, claude-3)';
