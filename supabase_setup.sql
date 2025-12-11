-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample users for testing
INSERT INTO users (username, email, password) VALUES 
  ('SimplyChat Official', 'simplychatofficial@outlook.com', 'simplychat.com'),
ON CONFLICT (username) DO NOTHING;

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Allow public read access to users" ON users
FOR SELECT USING (true);

CREATE POLICY "Allow insert access to users" ON users
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to own user" ON users
FOR UPDATE USING (true);

-- Create policies for messages table
CREATE POLICY "Allow insert access to messages" ON messages
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read access to own messages" ON messages
FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);

-- Grant permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE users TO anon, authenticated;
GRANT ALL ON TABLE messages TO anon, authenticated;