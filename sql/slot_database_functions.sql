-- Slot Database Functions for Supabase
-- Create slots table
CREATE TABLE IF NOT EXISTS public.slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    
    -- Ensure unique slot names per provider
    UNIQUE(name, provider)
);

-- Create an index for faster searching
CREATE INDEX IF NOT EXISTS idx_slots_provider ON public.slots(provider);
CREATE INDEX IF NOT EXISTS idx_slots_name ON public.slots(name);
CREATE INDEX IF NOT EXISTS idx_slots_active ON public.slots(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;

-- Create policies for slots table
-- Allow everyone to read active slots
CREATE POLICY "Allow public read access to active slots" ON public.slots
    FOR SELECT USING (is_active = true);

-- Allow authenticated users to read all slots
CREATE POLICY "Allow authenticated users to read all slots" ON public.slots
    FOR SELECT USING (auth.role() = 'authenticated');

-- Only allow users with admin role to modify slots
CREATE POLICY "Only admins can insert slots" ON public.slots
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update slots" ON public.slots
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete slots" ON public.slots
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Function to get all slots with optional filtering
CREATE OR REPLACE FUNCTION get_slots(
    search_query TEXT DEFAULT NULL,
    provider_filter TEXT DEFAULT NULL,
    active_only BOOLEAN DEFAULT true
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    provider TEXT,
    image_url TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.provider,
        s.image_url,
        s.is_active,
        s.created_at,
        s.updated_at
    FROM public.slots s
    WHERE 
        (NOT active_only OR s.is_active = true)
        AND (search_query IS NULL OR s.name ILIKE '%' || search_query || '%')
        AND (provider_filter IS NULL OR s.provider = provider_filter)
    ORDER BY s.provider ASC, s.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unique providers
CREATE OR REPLACE FUNCTION get_slot_providers()
RETURNS TABLE (provider TEXT, slot_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.provider,
        COUNT(*) as slot_count
    FROM public.slots s
    WHERE s.is_active = true
    GROUP BY s.provider
    ORDER BY s.provider ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upsert a slot (insert or update)
CREATE OR REPLACE FUNCTION upsert_slot(
    slot_name TEXT,
    slot_provider TEXT,
    slot_image_url TEXT DEFAULT NULL,
    slot_is_active BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
    slot_id UUID;
BEGIN
    INSERT INTO public.slots (name, provider, image_url, is_active, created_by)
    VALUES (slot_name, slot_provider, slot_image_url, slot_is_active, auth.uid())
    ON CONFLICT (name, provider)
    DO UPDATE SET
        image_url = EXCLUDED.image_url,
        is_active = EXCLUDED.is_active,
        updated_at = timezone('utc'::text, now())
    RETURNING id INTO slot_id;
    
    RETURN slot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to bulk insert slots (for initial data import)
CREATE OR REPLACE FUNCTION bulk_insert_slots(slots_data JSONB)
RETURNS INTEGER AS $$
DECLARE
    slot_record RECORD;
    inserted_count INTEGER := 0;
    row_count_check INTEGER;
BEGIN
    -- Loop through each slot in the JSON array
    FOR slot_record IN 
        SELECT * FROM jsonb_to_recordset(slots_data) AS x(name TEXT, provider TEXT, image TEXT)
    LOOP
        -- Insert the slot, ignoring duplicates
        INSERT INTO public.slots (name, provider, image_url, created_by)
        VALUES (slot_record.name, slot_record.provider, slot_record.image, auth.uid())
        ON CONFLICT (name, provider) DO NOTHING;
        
        -- Check if the row was actually inserted
        GET DIAGNOSTICS row_count_check = ROW_COUNT;
        IF row_count_check > 0 THEN
            inserted_count := inserted_count + 1;
        END IF;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a slot
CREATE OR REPLACE FUNCTION delete_slot(slot_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM public.slots WHERE id = slot_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update slot status
CREATE OR REPLACE FUNCTION toggle_slot_status(slot_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    new_status BOOLEAN;
BEGIN
    UPDATE public.slots 
    SET 
        is_active = NOT is_active,
        updated_at = timezone('utc'::text, now())
    WHERE id = slot_id
    RETURNING is_active INTO new_status;
    
    RETURN COALESCE(new_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to slots table
DROP TRIGGER IF EXISTS update_slots_updated_at ON public.slots;
CREATE TRIGGER update_slots_updated_at
    BEFORE UPDATE ON public.slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();