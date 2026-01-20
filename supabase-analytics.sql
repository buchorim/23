-- Page Views Analytics Table (Updated with archival support)
-- Run this in Supabase SQL Editor

-- Main table for active data (last 10 years)
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT false
);

-- Archive table for data older than 10 years (read-only, download only)
CREATE TABLE IF NOT EXISTS page_views_archive (
    id UUID PRIMARY KEY,
    page_path TEXT NOT NULL,
    page_title TEXT,
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    country TEXT,
    device_type TEXT,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    archived_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for active data
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_archived ON page_views(is_archived);

-- Index for archive
CREATE INDEX IF NOT EXISTS idx_archive_created_at ON page_views_archive(created_at DESC);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views_archive ENABLE ROW LEVEL SECURITY;

-- Policies for page_views
CREATE POLICY "Allow public insert" ON page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all operations" ON page_views
    FOR ALL USING (true) WITH CHECK (true);

-- Policies for archive (read only)
CREATE POLICY "Allow read archive" ON page_views_archive
    FOR SELECT USING (true);

CREATE POLICY "Allow admin operations on archive" ON page_views_archive
    FOR ALL USING (true) WITH CHECK (true);

-- Function to archive old data (run via cron or manually)
CREATE OR REPLACE FUNCTION archive_old_page_views()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Move data older than 10 years to archive
    WITH moved_rows AS (
        DELETE FROM page_views
        WHERE created_at < NOW() - INTERVAL '10 years'
        RETURNING *
    )
    INSERT INTO page_views_archive (
        id, page_path, page_title, visitor_id, session_id,
        referrer, user_agent, country, device_type,
        duration_seconds, created_at, archived_at
    )
    SELECT 
        id, page_path, page_title, visitor_id, session_id,
        referrer, user_agent, country, device_type,
        duration_seconds, created_at, NOW()
    FROM moved_rows;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Comment: Run SELECT archive_old_page_views() periodically to move old data
