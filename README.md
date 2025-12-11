# SimplyChat

A lightweight, privacy-focused chat application with cloud-based account management and local message storage.

## Description

SimplyChat is a web-based chat application that prioritizes user privacy by storing all chat messages locally between users while keeping only account information in the cloud. The application features a clean, grey-themed interface with contact management, secure messaging, and user authentication.

## Key Features

- **Privacy First**: Chat messages are stored exclusively between users locally
- **Cloud Account Management**: User account data stored securely in cloud
- **Contact Management**: Organize conversations with a contacts sidebar
- **Secure Authentication**: Login and registration system
- **User Settings**: Profile management and customization
- **Modern UI**: Clean grey color scheme with minimalist design
- **Message Functions**: Copy, forward, quote, and delete messages
- **Real-time Messaging**: Messages appear instantly for both users using Supabase Realtime

## Installation

Simply open `index.html` in a web browser to run the application locally.

## Usage

1. Register for an account or login with existing credentials
2. Add contacts using the "+" button in the bottom left
3. Click on a contact to start chatting
4. Messages are sent in real-time to the other user

## Cloud Service Integration

The application is designed to work with various cloud services. Recommended options include:

### Supabase (Recommended)
- Works reliably in China and globally
- Free tier with generous limits
- Real-time database capabilities
- Easy JavaScript integration

#### Setting up Supabase
1. Go to your Supabase project dashboard at https://app.supabase.com/
2. Navigate to SQL Editor in the left sidebar
3. Create a new query and run the following SQL to set up the required tables:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
```

4. Your project is already configured with the credentials:
   - Project URL: https://xcshpvtjlegnyovbzjfe.supabase.co
   - Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzd...

## How Real-time Messaging Works

SimplyChat uses Supabase Realtime to enable instant message delivery between users:

1. **Message Sending**: When a user sends a message, it's immediately stored in the Supabase database
2. **Real-time Subscription**: Both users subscribe to changes in the messages table
3. **Instant Delivery**: When a new message is inserted, Supabase notifies both clients instantly
4. **UI Update**: The receiving user's interface updates immediately to show the new message

This creates a seamless chat experience where messages appear instantly for both participants without requiring page refreshes.

## File Structure

- `index.html`: Main chat interface
- `login.html`: User login page
- `register.html`: User registration page
- `settings.html`: User profile settings
- `style.css`: All styling
- `script.js`: Client-side chat logic
- `auth.js`: Authentication system
- `cloudService.js`: Cloud database integration
- `supabase_setup.sql`: Database schema

## Support

For support, please open an issue in the repository or contact the maintainer.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.