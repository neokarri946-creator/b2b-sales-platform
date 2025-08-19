-- Create analyses table for storing B2B sales analyses
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  seller_company TEXT NOT NULL,
  target_company TEXT NOT NULL,
  success_probability INTEGER CHECK (success_probability >= 0 AND success_probability <= 100),
  industry_fit TEXT,
  budget_signal TEXT,
  timing TEXT,
  key_opportunities JSONB,
  challenges JSONB,
  recommended_approach TEXT,
  email_templates JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_analyses_user_email ON analyses(user_email);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON analyses;

-- Create policy to allow users to see only their own analyses
CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (auth.email() = user_email);

-- Create policy to allow users to insert their own analyses  
CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.email() = user_email);

-- Create policy to allow users to update their own analyses
CREATE POLICY "Users can update own analyses" ON analyses
  FOR UPDATE USING (auth.email() = user_email);

-- Create policy to allow users to delete their own analyses
CREATE POLICY "Users can delete own analyses" ON analyses
  FOR DELETE USING (auth.email() = user_email);

-- Note: To use this schema:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this SQL and run it
-- 4. Your analyses table will be ready to use