-- Migration: Add blocked_ips table for IP blocking
-- Run this in Supabase SQL Editor

-- Blocked IPs Table
CREATE TABLE IF NOT EXISTS blocked_ips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL UNIQUE,
    reason TEXT DEFAULT 'Auto-blocked: excessive requests',
    request_count INTEGER DEFAULT 0,
    blocked_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_permanent BOOLEAN DEFAULT false
);

-- Index for fast IP lookup
CREATE INDEX IF NOT EXISTS idx_blocked_ips_address ON blocked_ips(ip_address);

-- Enable RLS
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

-- RLS Policy - allow all for now (admin-only access via service role)
CREATE POLICY "Allow all on blocked_ips" ON blocked_ips 
    FOR ALL USING (true) WITH CHECK (true);

-- Add IP tracking column to traffic_state
ALTER TABLE traffic_state 
ADD COLUMN IF NOT EXISTS ip_request_counts JSONB DEFAULT '{}';

-- Insert sample data (optional - comment out if not needed)
-- INSERT INTO blocked_ips (ip_address, reason, is_permanent) 
-- VALUES ('192.168.1.100', 'Test block', false);
