-- Site Settings Table
-- Untuk menyimpan pengaturan global seperti font, warna, dll

CREATE TABLE IF NOT EXISTS site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "Public read settings" ON site_settings 
    FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "Service role full access settings" ON site_settings 
    FOR ALL USING (auth.role() = 'service_role');

-- Insert default font setting
INSERT INTO site_settings (key, value) 
VALUES ('font', '{"name": "Inter", "url": null, "isCustom": false}')
ON CONFLICT (key) DO NOTHING;
