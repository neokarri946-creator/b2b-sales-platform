-- Create users table to sync with Clerk
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free',
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  analyses_count INTEGER DEFAULT 0,
  monthly_analyses_used INTEGER DEFAULT 0,
  monthly_reset_date TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);

-- Update the analyses table to link with users
ALTER TABLE analyses 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Create index for user_id in analyses
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check and reset monthly analyses
CREATE OR REPLACE FUNCTION check_monthly_reset()
RETURNS TRIGGER AS $$
BEGIN
    -- If it's a new month, reset the counter
    IF NEW.monthly_reset_date IS NULL OR 
       DATE_TRUNC('month', NEW.monthly_reset_date) < DATE_TRUNC('month', NOW()) THEN
        NEW.monthly_analyses_used = 0;
        NEW.monthly_reset_date = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to check monthly reset before updating analyses count
CREATE TRIGGER check_monthly_analyses_reset 
BEFORE UPDATE OF analyses_count ON users
FOR EACH ROW EXECUTE FUNCTION check_monthly_reset();