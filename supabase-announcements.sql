-- Announcements Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    active BOOLEAN DEFAULT true,
    show_once BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read access for active announcements
CREATE POLICY "Allow public read active" ON announcements
    FOR SELECT USING (active = true);

-- Allow all operations (for admin)
CREATE POLICY "Allow all operations" ON announcements
    FOR ALL USING (true) WITH CHECK (true);
