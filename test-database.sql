-- Run this in Supabase SQL Editor to check if migration was applied
-- This will show you the current projects table structure

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'projects'
ORDER BY ordinal_position;
