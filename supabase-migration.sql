-- Easy.Store Documentation Platform
-- Complete Database Schema
-- Run this in Supabase SQL Editor

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT '📦',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content JSONB DEFAULT '{}',
    thumbnail_url TEXT,
    meta_description TEXT,
    published BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    settings JSONB DEFAULT '{"showTitle": true, "showCategory": true, "showUpdated": true, "showToc": false, "contentWidth": "medium"}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SITE SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Public read published documents" ON documents;
DROP POLICY IF EXISTS "Public read settings" ON site_settings;
DROP POLICY IF EXISTS "Service role full access categories" ON categories;
DROP POLICY IF EXISTS "Service role full access documents" ON documents;
DROP POLICY IF EXISTS "Service role full access settings" ON site_settings;

-- Public read policies
CREATE POLICY "Public read categories" ON categories 
    FOR SELECT USING (true);

CREATE POLICY "Public read published documents" ON documents 
    FOR SELECT USING (published = true);

CREATE POLICY "Public read settings" ON site_settings 
    FOR SELECT USING (true);

-- Service role full access (for admin operations)
CREATE POLICY "Service role full access categories" ON categories 
    FOR ALL USING (true);

CREATE POLICY "Service role full access documents" ON documents 
    FOR ALL USING (true);

CREATE POLICY "Service role full access settings" ON site_settings 
    FOR ALL USING (true);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category_id);
CREATE INDEX IF NOT EXISTS idx_documents_slug ON documents(slug);
CREATE INDEX IF NOT EXISTS idx_documents_published ON documents(published);
CREATE INDEX IF NOT EXISTS idx_documents_featured ON documents(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING gin(tags);

-- =====================================================
-- DEFAULT DATA
-- =====================================================
-- Insert default font setting
INSERT INTO site_settings (key, value) 
VALUES ('font', '{"name": "Inter", "url": null, "isCustom": false}')
ON CONFLICT (key) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, slug, icon, display_order) VALUES
('YouTube Premium', 'youtube-premium', '🎬', 1),
('Spotify', 'spotify', '🎵', 2),
('Netflix', 'netflix', '📺', 3),
('Disney+', 'disney-plus', '✨', 4)
ON CONFLICT (slug) DO NOTHING;
