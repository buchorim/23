-- User Icons Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_icons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_icons ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read" ON user_icons
    FOR SELECT USING (true);

-- Allow all operations (for admin)
CREATE POLICY "Allow all operations" ON user_icons
    FOR ALL USING (true) WITH CHECK (true);
