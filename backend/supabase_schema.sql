-- Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User credits table for persistent credit tracking
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credits INTEGER DEFAULT 10 NOT NULL CHECK (credits >= 0),
  plan VARCHAR(50) DEFAULT 'free' NOT NULL,
  subscription_status VARCHAR(20) DEFAULT 'none' CHECK (subscription_status IN ('active', 'inactive', 'none', 'cancelled', 'past_due')),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (users table is automatically managed by Supabase Auth)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  prompt TEXT,
  generated_code TEXT, -- JSON string containing all project data
  html TEXT, -- Separate column for easier access
  css TEXT, -- Separate column for easier access  
  javascript TEXT, -- Separate column for easier access
  preview_url TEXT, -- URL for live preview
  model VARCHAR(100), -- AI model used for generation
  description TEXT,
  starred BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  tech_stack JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at on user_credits
CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON user_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at on projects
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on user_credits
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Create policies for user_credits
CREATE POLICY "Users can only see own credits" ON user_credits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits" ON user_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
    FOR UPDATE USING (auth.uid() = user_id);

-- Enable Row Level Security (RLS) on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own projects
CREATE POLICY "Users can only see own projects" ON projects
    FOR ALL USING (auth.uid() = user_id);

-- Create policy for users to insert their own projects
CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own projects
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own projects
CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_starred ON projects(user_id, starred) WHERE starred = true;
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);

-- Create project_versions table for version history (future feature)
CREATE TABLE IF NOT EXISTS project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  html TEXT,
  css TEXT,
  javascript TEXT,
  metadata JSONB,
  tech_stack JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, version_number)
);

-- Enable RLS for project_versions
ALTER TABLE project_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for project_versions
CREATE POLICY "Users can manage their own project versions" ON project_versions
  FOR ALL USING (auth.uid() = user_id);

-- Create index for project versions
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON project_versions(project_id, version_number);
CREATE INDEX IF NOT EXISTS idx_project_versions_user_id ON project_versions(user_id, created_at);

-- Create templates table for storing custom user templates (future feature)
CREATE TABLE IF NOT EXISTS user_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'custom',
  prompt TEXT NOT NULL,
  html TEXT,
  css TEXT,
  javascript TEXT,
  tech_stack JSONB,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_templates
ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_templates
CREATE POLICY "Users can manage their own templates" ON user_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON user_templates
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

-- Create indexes for user_templates
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON user_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_category ON user_templates(category);
CREATE INDEX IF NOT EXISTS idx_user_templates_public ON user_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_user_templates_tags ON user_templates USING gin(tags);
