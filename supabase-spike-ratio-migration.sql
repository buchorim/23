-- Migration: Add spike_ratio column to traffic_state
-- Run this in Supabase SQL Editor

-- Add spike_ratio column if not exists
ALTER TABLE traffic_state 
ADD COLUMN IF NOT EXISTS spike_ratio FLOAT DEFAULT 0.0;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'traffic_state';
