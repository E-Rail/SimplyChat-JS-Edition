-- ============================================
-- SimplyChat Database Setup
-- Run this entire script in your Supabase SQL Editor
-- ============================================

-- 1. Users table (profiles - auth handled by Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, -- matches auth.users.id
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT DEFAULT 'managed_by_supabase_auth',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Public keys table (for E2E encryption)
CREATE TABLE IF NOT EXISTS public_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_keys ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Users policies
-- ============================================
CREATE POLICY "Allow public read access to users" ON users
FOR SELECT USING (true);

CREATE POLICY "Allow insert access to users" ON users
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to own user" ON users
FOR UPDATE USING (true);

-- ============================================
-- Messages policies
-- ============================================
CREATE POLICY "Allow insert access to messages" ON messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read access to messages" ON messages
FOR SELECT USING (true);

-- ============================================
-- Public keys policies
-- ============================================
CREATE POLICY "Allow read access to public keys" ON public_keys
FOR SELECT USING (true);

CREATE POLICY "Allow insert access to public keys" ON public_keys
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to public keys" ON public_keys
FOR UPDATE USING (true);

-- ============================================
-- Grant permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE users TO anon, authenticated;
GRANT ALL ON TABLE messages TO anon, authenticated;
GRANT ALL ON TABLE public_keys TO anon, authenticated;
