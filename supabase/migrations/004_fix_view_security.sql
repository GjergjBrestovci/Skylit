-- Fix recent_projects view security
-- Issue: View may have been created with SECURITY DEFINER which bypasses RLS
-- Solution: Recreate with explicit SECURITY INVOKER to ensure RLS applies

-- Drop and recreate the view with SECURITY INVOKER (the safe default)
DROP VIEW IF EXISTS public.recent_projects;

CREATE VIEW public.recent_projects 
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.user_id,
  p.title,
  p.preview_url,
  p.tech_stack,
  p.website_type,
  p.is_favorite,
  p.created_at,
  p.updated_at,
  u.email as user_email,
  u.display_name
FROM public.projects p
JOIN public.users u ON p.user_id = u.id
WHERE p.is_archived = FALSE
ORDER BY p.created_at DESC;

-- Grant access to authenticated users (RLS on underlying tables will filter results)
GRANT SELECT ON public.recent_projects TO authenticated;

-- Add comment documenting the security model
COMMENT ON VIEW public.recent_projects IS 
  'Recent non-archived projects with user info. Uses SECURITY INVOKER so RLS policies on projects/users tables apply to the caller.';
