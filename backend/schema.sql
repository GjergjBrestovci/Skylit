-- ============================================
-- Skylit Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users table (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  credits INTEGER DEFAULT 10 NOT NULL,
  has_unlimited_credits BOOLEAN DEFAULT FALSE NOT NULL,
  theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('system', 'dark', 'light')),
  notifications JSONB DEFAULT '{"productUpdates": true, "weeklySummary": false, "aiLaunches": true}'::jsonb,
  workspace JSONB DEFAULT '{"autosaveInterval": 5, "showBetaFeatures": false}'::jsonb,
  integrations JSONB DEFAULT '{"apiMirroringEnabled": false, "webhookUrl": null}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- Projects table (stores generated websites)
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT,
  enhanced_prompt TEXT,
  generated_code JSONB,
  html TEXT,
  css TEXT,
  javascript TEXT,
  preview_url TEXT,
  preview_id TEXT,
  model TEXT,
  tech_stack TEXT DEFAULT 'vanilla',
  website_type TEXT,
  theme TEXT,
  primary_color TEXT,
  accent_color TEXT,
  design_style TEXT,
  layout TEXT,
  pages TEXT[],
  features TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  last_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- Previews table (temporary storage for unsaved previews)
-- ============================================
CREATE TABLE IF NOT EXISTS public.previews (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  html TEXT NOT NULL DEFAULT '',
  css TEXT NOT NULL DEFAULT '',
  javascript TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_previews_expires_at ON public.previews(expires_at);
CREATE INDEX IF NOT EXISTS idx_previews_user_id ON public.previews(user_id);

-- Enable RLS on previews table
ALTER TABLE public.previews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read own preview" ON public.previews;
CREATE POLICY "Anyone can read own preview"
  ON public.previews FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert preview" ON public.previews;
CREATE POLICY "Anyone can insert preview"
  ON public.previews FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can delete own preview" ON public.previews;
CREATE POLICY "Anyone can delete own preview"
  ON public.previews FOR DELETE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- Cleanup function for expired previews
CREATE OR REPLACE FUNCTION public.cleanup_expired_previews()
RETURNS void AS $$
BEGIN
  DELETE FROM public.previews WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Project versions (optional: for version history)
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  html TEXT,
  css TEXT,
  javascript TEXT,
  generated_code JSONB,
  change_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, version_number)
);

-- ============================================
-- Add missing columns if table already exists
-- ============================================
DO $$
BEGIN
  -- Add is_favorite if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'is_favorite') THEN
    ALTER TABLE public.projects ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add is_archived if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'is_archived') THEN
    ALTER TABLE public.projects ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add enhanced_prompt if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'enhanced_prompt') THEN
    ALTER TABLE public.projects ADD COLUMN enhanced_prompt TEXT;
  END IF;
  
  -- Add preview_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'preview_id') THEN
    ALTER TABLE public.projects ADD COLUMN preview_id TEXT;
  END IF;
  
  -- Add tech_stack if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'tech_stack') THEN
    ALTER TABLE public.projects ADD COLUMN tech_stack TEXT DEFAULT 'vanilla';
  END IF;
  
  -- Add website_type if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'website_type') THEN
    ALTER TABLE public.projects ADD COLUMN website_type TEXT;
  END IF;
  
  -- Add last_opened_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'last_opened_at') THEN
    ALTER TABLE public.projects ADD COLUMN last_opened_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================
-- Indexes for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user_created ON public.projects(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON public.project_versions(project_id);

-- Partial indexes (created after ensuring columns exist)
DROP INDEX IF EXISTS idx_projects_is_favorite;
CREATE INDEX idx_projects_is_favorite ON public.projects(user_id, is_favorite) WHERE is_favorite = TRUE;

DROP INDEX IF EXISTS idx_projects_is_archived;
CREATE INDEX idx_projects_is_archived ON public.projects(user_id, is_archived) WHERE is_archived = TRUE;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can only access their own projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Users can access versions of their own projects
DROP POLICY IF EXISTS "Users can view own project versions" ON public.project_versions;
CREATE POLICY "Users can view own project versions"
  ON public.project_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_versions.project_id
      AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own project versions" ON public.project_versions;
CREATE POLICY "Users can insert own project versions"
  ON public.project_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_versions.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to projects table
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Trigger: Auto-create user profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Trigger: Auto-increment version number
-- ============================================
CREATE OR REPLACE FUNCTION public.set_version_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_number := COALESCE(
    (SELECT MAX(version_number) + 1 FROM public.project_versions WHERE project_id = NEW.project_id),
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_project_version_number ON public.project_versions;
CREATE TRIGGER set_project_version_number
  BEFORE INSERT ON public.project_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_version_number();

-- ============================================
-- Helper views
-- ============================================

-- View for recent projects with user info
-- Uses SECURITY INVOKER (default) so RLS policies on underlying tables apply
CREATE OR REPLACE VIEW public.recent_projects 
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

-- ============================================
-- Sample queries (for reference)
-- ============================================

-- Get all projects for a user:
-- SELECT * FROM projects WHERE user_id = 'user-uuid' ORDER BY created_at DESC;

-- Get favorite projects:
-- SELECT * FROM projects WHERE user_id = 'user-uuid' AND is_favorite = TRUE;

-- Search projects by title:
-- SELECT * FROM projects WHERE user_id = 'user-uuid' AND title ILIKE '%search%';

-- Get project with all versions:
-- SELECT p.*, pv.version_number, pv.created_at as version_created
-- FROM projects p
-- LEFT JOIN project_versions pv ON p.id = pv.project_id
-- WHERE p.id = 'project-uuid'
-- ORDER BY pv.version_number DESC;
