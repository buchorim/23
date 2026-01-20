-- ===========================================
-- COMBINED SQL MIGRATION - EASY.STORE
-- Jalankan file ini di Supabase SQL Editor
-- Aman dijalankan berulang kali (IF NOT EXISTS)
-- ===========================================

-- =====================
-- 1. ANNOUNCEMENTS
-- =====================
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

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read active" ON announcements;
CREATE POLICY "Allow public read active" ON announcements
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Allow all operations" ON announcements;
CREATE POLICY "Allow all operations" ON announcements
    FOR ALL USING (true) WITH CHECK (true);


-- =====================
-- 2. PAGE VIEWS (Analytics)
-- =====================
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

-- Archive table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_archived ON page_views(is_archived);
CREATE INDEX IF NOT EXISTS idx_archive_created_at ON page_views_archive(created_at DESC);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views_archive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert" ON page_views;
CREATE POLICY "Allow public insert" ON page_views
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations" ON page_views;
CREATE POLICY "Allow all operations" ON page_views
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read archive" ON page_views_archive;
CREATE POLICY "Allow read archive" ON page_views_archive
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin operations on archive" ON page_views_archive;
CREATE POLICY "Allow admin operations on archive" ON page_views_archive
    FOR ALL USING (true) WITH CHECK (true);


-- =====================
-- 3. TRAFFIC PROTECTION
-- =====================
CREATE TABLE IF NOT EXISTS traffic_state (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    baseline_traffic FLOAT DEFAULT 10.0,
    current_traffic FLOAT DEFAULT 0.0,
    concurrent_users INTEGER DEFAULT 0,
    is_overloaded BOOLEAN DEFAULT false,
    recovery_progress FLOAT DEFAULT 1.0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    window_start TIMESTAMPTZ DEFAULT NOW(),
    request_count_window INTEGER DEFAULT 0
);

INSERT INTO traffic_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS traffic_config (
    key TEXT PRIMARY KEY,
    value FLOAT NOT NULL,
    description TEXT
);

INSERT INTO traffic_config (key, value, description) VALUES
    ('spike_trigger_percentage', 120, 'Percentage above baseline to trigger spike mode'),
    ('hard_overload_percentage', 160, 'Percentage above baseline for hard reject all'),
    ('max_concurrent_users', 200000, 'Maximum allowed concurrent users'),
    ('recovery_rate', 0.05, 'How fast to recover (0-1, higher = faster)'),
    ('baseline_alpha', 0.1, 'EMA alpha for baseline calculation'),
    ('window_seconds', 60, 'Traffic measurement window in seconds')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE traffic_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on traffic_state" ON traffic_state;
CREATE POLICY "Allow all on traffic_state" ON traffic_state 
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on traffic_config" ON traffic_config;
CREATE POLICY "Allow all on traffic_config" ON traffic_config 
    FOR ALL USING (true) WITH CHECK (true);


-- =====================
-- 4. ARCHIVE FUNCTION
-- =====================
CREATE OR REPLACE FUNCTION archive_old_page_views()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
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


-- =====================
-- DONE!
-- =====================
SELECT 'All migrations completed successfully!' as status;
