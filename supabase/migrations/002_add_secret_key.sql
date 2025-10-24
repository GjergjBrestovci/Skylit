-- Create user_credits table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 10,
  plan VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'none',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  secret_key VARCHAR(255),
  has_unlimited_credits BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_secret_key ON public.user_credits(secret_key);
CREATE INDEX IF NOT EXISTS idx_user_credits_stripe_customer ON public.user_credits(stripe_customer_id);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY IF NOT EXISTS "Users can view own credits" ON public.user_credits
  FOR ALL USING (auth.uid() = user_id);

-- Add comments
COMMENT ON COLUMN public.user_credits.secret_key IS 'Secret key for unlimited credits access (e.g., "gjergj" for admin)';
COMMENT ON COLUMN public.user_credits.has_unlimited_credits IS 'True if user has unlimited credits (via secret key or subscription)';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON public.user_credits;
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

