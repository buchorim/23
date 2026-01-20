-- Page Views Analytics Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_path TEXT NOT NULL,
    page_title TEXT,
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    country TEXT,
    device_type TEXT,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow insert from anyone (for tracking)
CREATE POLICY "Allow public insert" ON page_views
    FOR INSERT WITH CHECK (true);

-- Allow read for admin (via service role)
CREATE POLICY "Allow all operations" ON page_views
    FOR ALL USING (true) WITH CHECK (true);
