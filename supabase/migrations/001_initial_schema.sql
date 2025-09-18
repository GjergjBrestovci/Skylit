-- SkyLit AI Production Database Schema
-- This file contains the complete database schema for production deployment

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  subscription_type VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  stripe_customer_id VARCHAR(255),
  credits_remaining INTEGER DEFAULT 10,
  credits_total INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  domain VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  template VARCHAR(100),
  generated_code JSONB,
  deployment_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project generations table (for AI generation history)
CREATE TABLE public.project_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  generated_code JSONB NOT NULL,
  generation_type VARCHAR(50) DEFAULT 'full',
  model_used VARCHAR(100),
  tokens_used INTEGER DEFAULT 0,
  generation_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
  credits_per_month INTEGER NOT NULL,
  max_projects INTEGER,
  features JSONB,
  price_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit transactions table
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'usage', 'refill', 'bonus', 'refund'
  credits_delta INTEGER NOT NULL, -- positive for additions, negative for usage
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  preview_image VARCHAR(500),
  base_code JSONB NOT NULL,
  features JSONB,
  is_premium BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API keys table (for future API access)
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  permissions JSONB DEFAULT '["read"]'::jsonb,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_project_generations_project_id ON public.project_generations(project_id);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR ALL USING (auth.uid() = auth_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
  FOR ALL USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- Project generations policies
CREATE POLICY "Users can view own project generations" ON public.project_generations
  FOR ALL USING (auth.uid() = (
    SELECT u.auth_id FROM public.users u 
    JOIN public.projects p ON p.user_id = u.id 
    WHERE p.id = project_id
  ));

-- Subscription policies
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR ALL USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- Credit transaction policies
CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions
  FOR ALL USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- API keys policies
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = user_id));

-- Templates are publicly readable
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates are publicly readable" ON public.templates
  FOR SELECT USING (true);

-- Subscription plans are publicly readable
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscription plans are publicly readable" ON public.subscription_plans
  FOR SELECT USING (true);

-- Functions for common operations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user credits
CREATE OR REPLACE FUNCTION public.update_user_credits(
  user_uuid UUID,
  credit_delta INTEGER,
  transaction_description TEXT DEFAULT NULL,
  project_uuid UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update user credits
  UPDATE public.users 
  SET 
    credits_remaining = credits_remaining + credit_delta,
    updated_at = NOW()
  WHERE id = user_uuid;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (
    user_id, 
    project_id, 
    transaction_type, 
    credits_delta, 
    description
  ) VALUES (
    user_uuid,
    project_uuid,
    CASE WHEN credit_delta > 0 THEN 'refill' ELSE 'usage' END,
    credit_delta,
    transaction_description
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, stripe_price_id, credits_per_month, max_projects, features, price_cents) VALUES
  ('Free', 'price_free', 10, 3, '["Basic templates", "Email support"]'::jsonb, 0),
  ('Pro', 'price_pro_monthly', 100, 20, '["All templates", "Priority support", "Custom domains"]'::jsonb, 1999),
  ('Enterprise', 'price_enterprise_monthly', 500, 100, '["All features", "API access", "Dedicated support"]'::jsonb, 9999);

-- Insert default templates
INSERT INTO public.templates (name, description, category, base_code, features) VALUES
  ('Landing Page', 'Modern landing page with hero section and CTA', 'Business', 
   '{"html": "<div>Landing page template</div>", "css": "/* Landing page styles */", "js": "// Landing page scripts"}'::jsonb,
   '["Responsive design", "SEO optimized", "Contact form"]'::jsonb),
  ('Portfolio', 'Professional portfolio website', 'Personal',
   '{"html": "<div>Portfolio template</div>", "css": "/* Portfolio styles */", "js": "// Portfolio scripts"}'::jsonb,
   '["Project showcase", "About section", "Contact form"]'::jsonb),
  ('E-commerce', 'Modern e-commerce store', 'Business',
   '{"html": "<div>E-commerce template</div>", "css": "/* E-commerce styles */", "js": "// E-commerce scripts"}'::jsonb,
   '["Product catalog", "Shopping cart", "Payment integration"]'::jsonb);
