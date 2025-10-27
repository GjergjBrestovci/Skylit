-- SkyLit AI Database Schema - Combined Migration
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_credits table to track credits, unlimited access, and subscriptions per user
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 10,  -- Default 10 credits for new users
  plan VARCHAR(50) DEFAULT 'free',      -- Subscription plan: 'free', 'pro', 'enterprise'
  subscription_status VARCHAR(50) DEFAULT 'none',  -- 'active', 'inactive', 'cancelled', 'past_due'
  stripe_customer_id VARCHAR(255),      -- Stripe customer ID for payment tracking
  stripe_subscription_id VARCHAR(255),  -- Stripe subscription ID
  secret_key VARCHAR(255),              -- Secret key for unlimited access (e.g., "gjergj")
  has_unlimited_credits BOOLEAN DEFAULT FALSE,  -- True when user has unlimited credits
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_secret_key ON public.user_credits(secret_key);
CREATE INDEX IF NOT EXISTS idx_user_credits_stripe_customer ON public.user_credits(stripe_customer_id);

-- Enable Row Level Security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own credits
CREATE POLICY IF NOT EXISTS "Users can view own credits" ON public.user_credits
  FOR ALL USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE public.user_credits IS 'Tracks user credits, subscription status, and unlimited access per user';
COMMENT ON COLUMN public.user_credits.credits IS 'Number of credits remaining (decrements on website generation)';
COMMENT ON COLUMN public.user_credits.secret_key IS 'Secret key for unlimited credits access (e.g., "gjergj" for admin)';
COMMENT ON COLUMN public.user_credits.has_unlimited_credits IS 'True if user has unlimited credits (via secret key or subscription)';
COMMENT ON COLUMN public.user_credits.plan IS 'Current subscription plan: free, pro, or enterprise';
COMMENT ON COLUMN public.user_credits.subscription_status IS 'Subscription status: active, inactive, cancelled, past_due, or none';

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on every row update
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON public.user_credits;
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create projects table to store user's generated websites
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  html TEXT,
  css TEXT,
  javascript TEXT,
  preview_url VARCHAR(500),
  tech_stack VARCHAR(100) DEFAULT 'vanilla',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);

-- Enable RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own projects
CREATE POLICY IF NOT EXISTS "Users can view own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

-- Trigger for projects updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create previews table for temporary preview URLs
CREATE TABLE IF NOT EXISTS public.previews (
  id VARCHAR(50) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  html TEXT NOT NULL,
  css TEXT,
  javascript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create index for previews
CREATE INDEX IF NOT EXISTS idx_previews_user_id ON public.previews(user_id);
CREATE INDEX IF NOT EXISTS idx_previews_expires_at ON public.previews(expires_at);

-- Enable RLS for previews (public read, authenticated write)
ALTER TABLE public.previews ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read previews (for public sharing)
CREATE POLICY IF NOT EXISTS "Previews are publicly readable" ON public.previews
  FOR SELECT USING (true);

-- RLS Policy: Only authenticated users can create previews
CREATE POLICY IF NOT EXISTS "Authenticated users can create previews" ON public.previews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
