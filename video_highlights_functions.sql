-- Video highlights table and functions for dashboard display

-- Create video highlights table
CREATE TABLE IF NOT EXISTS video_highlights (
    id SERIAL PRIMARY KEY,
    slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 12),
    title VARCHAR(200) NOT NULL DEFAULT 'Highlight',
    description TEXT DEFAULT 'Amazing moment from stream',
    url TEXT,
    duration VARCHAR(20) DEFAULT '0:15',
    views VARCHAR(20) DEFAULT '1.2K',
    updated_by UUID REFERENCES user_profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(slot_number)
);

-- Create index for quick retrieval
CREATE INDEX IF NOT EXISTS idx_video_highlights_slot ON video_highlights(slot_number);

-- Function to get all video highlights ordered by slot number
CREATE OR REPLACE FUNCTION get_video_highlights()
RETURNS TABLE (
    id INTEGER,
    slot_number INTEGER,
    title VARCHAR(200),
    description TEXT,
    url TEXT,
    duration VARCHAR(20),
    views VARCHAR(20),
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vh.id,
        vh.slot_number,
        vh.title,
        vh.description,
        vh.url,
        vh.duration,
        vh.views,
        vh.updated_at
    FROM video_highlights vh
    ORDER BY vh.slot_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update or insert video highlight (upsert)
CREATE OR REPLACE FUNCTION upsert_video_highlight(
    p_slot_number INTEGER,
    p_title VARCHAR(200),
    p_description TEXT,
    p_url TEXT,
    p_updated_by UUID,
    p_duration VARCHAR(20) DEFAULT '0:15',
    p_views VARCHAR(20) DEFAULT '1.2K'
)
RETURNS BOOLEAN AS $$
DECLARE
    updater_role user_role;
BEGIN
    -- Check if updater has admin permissions
    SELECT role INTO updater_role 
    FROM user_profiles 
    WHERE id = p_updated_by;
    
    IF updater_role NOT IN ('superadmin', 'admin') THEN
        RAISE EXCEPTION 'Insufficient permissions to update video highlights';
    END IF;
    
    -- Validate slot number
    IF p_slot_number < 1 OR p_slot_number > 12 THEN
        RAISE EXCEPTION 'Slot number must be between 1 and 12';
    END IF;
    
    -- Upsert the video highlight
    INSERT INTO video_highlights (
        slot_number,
        title,
        description,
        url,
        duration,
        views,
        updated_by,
        updated_at
    ) VALUES (
        p_slot_number,
        p_title,
        p_description,
        p_url,
        p_duration,
        p_views,
        p_updated_by,
        NOW()
    )
    ON CONFLICT (slot_number) 
    DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        url = EXCLUDED.url,
        duration = EXCLUDED.duration,
        views = EXCLUDED.views,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to batch update multiple video highlights
CREATE OR REPLACE FUNCTION batch_update_video_highlights(
    p_highlights JSONB,
    p_updated_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    updater_role user_role;
    highlight JSONB;
BEGIN
    -- Check if updater has admin permissions
    SELECT role INTO updater_role 
    FROM user_profiles 
    WHERE id = p_updated_by;
    
    IF updater_role NOT IN ('superadmin', 'admin') THEN
        RAISE EXCEPTION 'Insufficient permissions to update video highlights';
    END IF;
    
    -- Loop through each highlight and update
    FOR highlight IN SELECT * FROM jsonb_array_elements(p_highlights)
    LOOP
        PERFORM upsert_video_highlight(
            (highlight->>'slot_number')::INTEGER,
            highlight->>'title',
            highlight->>'description',
            highlight->>'url',
            p_updated_by,
            COALESCE(highlight->>'duration', '0:15'),
            COALESCE(highlight->>'views', '1.2K')
        );
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset a video highlight slot
CREATE OR REPLACE FUNCTION reset_video_highlight(
    p_slot_number INTEGER,
    p_updated_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    updater_role user_role;
BEGIN
    -- Check if updater has admin permissions
    SELECT role INTO updater_role 
    FROM user_profiles 
    WHERE id = p_updated_by;
    
    IF updater_role NOT IN ('superadmin', 'admin') THEN
        RAISE EXCEPTION 'Insufficient permissions to reset video highlights';
    END IF;
    
    -- Reset the video highlight to defaults
    PERFORM upsert_video_highlight(
        p_slot_number,
        'Highlight ' || p_slot_number,
        'Amazing moment from stream',
        '',
        p_updated_by,
        '0:15',
        '1.2K'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize default video highlights (run this once)
INSERT INTO video_highlights (slot_number, title, description, url, duration, views)
SELECT 
    generate_series(1, 12) as slot_number,
    'Highlight ' || generate_series(1, 12) as title,
    'Amazing moment from stream' as description,
    '' as url,
    '0:15' as duration,
    '1.2K' as views
ON CONFLICT (slot_number) DO NOTHING;