-- Traffic Surge Protection System
-- Run this in Supabase SQL Editor

-- Traffic State Table (singleton)
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

-- Insert initial state
INSERT INTO traffic_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Traffic Configuration Table
CREATE TABLE IF NOT EXISTS traffic_config (
    key TEXT PRIMARY KEY,
    value FLOAT NOT NULL,
    description TEXT
);

-- Insert default configuration
INSERT INTO traffic_config (key, value, description) VALUES
    ('spike_trigger_percentage', 120, 'Percentage above baseline to trigger spike mode'),
    ('hard_overload_percentage', 160, 'Percentage above baseline for hard reject all'),
    ('max_concurrent_users', 200000, 'Maximum allowed concurrent users'),
    ('recovery_rate', 0.05, 'How fast to recover (0-1, higher = faster)'),
    ('baseline_alpha', 0.1, 'EMA alpha for baseline calculation (lower = slower adaptation)'),
    ('window_seconds', 60, 'Traffic measurement window in seconds')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE traffic_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow all on traffic_state" ON traffic_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on traffic_config" ON traffic_config FOR ALL USING (true) WITH CHECK (true);

-- Function to update traffic state atomically
CREATE OR REPLACE FUNCTION update_traffic_state(
    p_increment_request BOOLEAN DEFAULT true,
    p_increment_concurrent INTEGER DEFAULT 0
)
RETURNS TABLE (
    is_allowed BOOLEAN,
    reject_reason TEXT,
    current_spike_ratio FLOAT.
    current_concurrent INTEGER
) AS $$
DECLARE
    v_state traffic_state%ROWTYPE;
    v_spike_trigger FLOAT;
    v_hard_overload FLOAT;
    v_max_concurrent FLOAT;
    v_recovery_rate FLOAT;
    v_baseline_alpha FLOAT;
    v_window_seconds FLOAT;
    v_new_baseline FLOAT;
    v_new_traffic FLOAT;
    v_spike_ratio FLOAT;
    v_now TIMESTAMPTZ := NOW();
    v_window_elapsed FLOAT;
    v_is_allowed BOOLEAN := true;
    v_reject_reason TEXT := NULL;
    v_new_recovery FLOAT;
BEGIN
    -- Lock and get current state
    SELECT * INTO v_state FROM traffic_state WHERE id = 1 FOR UPDATE;
    
    -- Get config values
    SELECT value INTO v_spike_trigger FROM traffic_config WHERE key = 'spike_trigger_percentage';
    SELECT value INTO v_hard_overload FROM traffic_config WHERE key = 'hard_overload_percentage';
    SELECT value INTO v_max_concurrent FROM traffic_config WHERE key = 'max_concurrent_users';
    SELECT value INTO v_recovery_rate FROM traffic_config WHERE key = 'recovery_rate';
    SELECT value INTO v_baseline_alpha FROM traffic_config WHERE key = 'baseline_alpha';
    SELECT value INTO v_window_seconds FROM traffic_config WHERE key = 'window_seconds';
    
    -- Calculate window elapsed
    v_window_elapsed := EXTRACT(EPOCH FROM (v_now - v_state.window_start));
    
    -- Reset window if expired
    IF v_window_elapsed >= v_window_seconds THEN
        -- Calculate current traffic (requests per second)
        v_new_traffic := v_state.request_count_window / GREATEST(v_window_elapsed, 1);
        
        -- Update baseline with EMA
        v_new_baseline := v_baseline_alpha * v_new_traffic + (1 - v_baseline_alpha) * v_state.baseline_traffic;
        v_new_baseline := GREATEST(v_new_baseline, 1); -- Minimum baseline of 1
        
        -- Reset window
        UPDATE traffic_state SET
            baseline_traffic = v_new_baseline,
            current_traffic = v_new_traffic,
            window_start = v_now,
            request_count_window = CASE WHEN p_increment_request THEN 1 ELSE 0 END,
            last_updated = v_now
        WHERE id = 1;
        
        v_state.current_traffic := v_new_traffic;
        v_state.baseline_traffic := v_new_baseline;
        v_state.request_count_window := 1;
    ELSE
        -- Increment request count in window
        IF p_increment_request THEN
            UPDATE traffic_state SET
                request_count_window = request_count_window + 1,
                last_updated = v_now
            WHERE id = 1;
        END IF;
        
        -- Estimate current traffic
        v_new_traffic := (v_state.request_count_window + 1) / GREATEST(v_window_elapsed, 1);
        v_state.current_traffic := v_new_traffic;
    END IF;
    
    -- Update concurrent users
    IF p_increment_concurrent != 0 THEN
        UPDATE traffic_state SET
            concurrent_users = GREATEST(0, concurrent_users + p_increment_concurrent)
        WHERE id = 1;
        v_state.concurrent_users := GREATEST(0, v_state.concurrent_users + p_increment_concurrent);
    END IF;
    
    -- Calculate spike ratio
    v_spike_ratio := (v_state.current_traffic / GREATEST(v_state.baseline_traffic, 1)) * 100;
    
    -- Decision logic
    IF v_spike_ratio >= v_hard_overload THEN
        -- Hard overload - reject all
        v_is_allowed := false;
        v_reject_reason := 'hard_overload';
        v_new_recovery := 0;
    ELSIF v_spike_ratio >= v_spike_trigger THEN
        -- Spike detected - gradual rejection
        v_new_recovery := GREATEST(0, v_state.recovery_progress - v_recovery_rate * 2);
        IF random() > v_state.recovery_progress THEN
            v_is_allowed := false;
            v_reject_reason := 'spike_rejection';
        END IF;
    ELSIF v_state.concurrent_users >= v_max_concurrent THEN
        -- Max concurrent users exceeded
        v_is_allowed := false;
        v_reject_reason := 'max_concurrent';
    ELSE
        -- Normal - gradual recovery
        v_new_recovery := LEAST(1.0, v_state.recovery_progress + v_recovery_rate);
    END IF;
    
    -- Update recovery progress
    IF v_new_recovery IS NOT NULL AND v_new_recovery != v_state.recovery_progress THEN
        UPDATE traffic_state SET
            recovery_progress = v_new_recovery,
            is_overloaded = (v_new_recovery < 0.5)
        WHERE id = 1;
    END IF;
    
    -- Return result
    RETURN QUERY SELECT 
        v_is_allowed,
        v_reject_reason,
        v_spike_ratio,
        v_state.concurrent_users;
END;
$$ LANGUAGE plpgsql;

-- Function to get traffic state (read-only, no locking)
CREATE OR REPLACE FUNCTION get_traffic_state()
RETURNS TABLE (
    baseline_traffic FLOAT,
    current_traffic FLOAT,
    spike_ratio FLOAT,
    concurrent_users INTEGER,
    is_overloaded BOOLEAN,
    recovery_progress FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.baseline_traffic,
        ts.current_traffic,
        (ts.current_traffic / GREATEST(ts.baseline_traffic, 1)) * 100 as spike_ratio,
        ts.concurrent_users,
        ts.is_overloaded,
        ts.recovery_progress
    FROM traffic_state ts
    WHERE ts.id = 1;
END;
$$ LANGUAGE plpgsql;
