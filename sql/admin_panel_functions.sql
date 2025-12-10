-- Additional functions for admin panel analytics

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    total_users BIGINT,
    new_users_count BIGINT,
    active_users_count BIGINT,
    role_distribution JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day' * days_back) as new_users,
            COUNT(*) FILTER (WHERE last_login >= NOW() - INTERVAL '1 day' * days_back) as active_users
        FROM user_profiles 
        WHERE is_active = true
    ),
    roles AS (
        SELECT 
            jsonb_object_agg(role::text, role_count) as distribution
        FROM (
            SELECT role, COUNT(*) as role_count
            FROM user_profiles 
            WHERE is_active = true
            GROUP BY role
        ) role_stats
    )
    SELECT 
        s.total,
        s.new_users,
        s.active_users,
        r.distribution
    FROM stats s
    CROSS JOIN roles r;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get detailed user list with pagination
CREATE OR REPLACE FUNCTION get_users_with_pagination(
    page_offset INTEGER DEFAULT 0,
    page_limit INTEGER DEFAULT 50,
    role_filter user_role DEFAULT NULL,
    search_term TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    twitch_id VARCHAR(50),
    twitch_username VARCHAR(100),
    display_name VARCHAR(100),
    email VARCHAR(255),
    profile_image_url TEXT,
    role user_role,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_users AS (
        SELECT *
        FROM user_profiles up
        WHERE 
            (role_filter IS NULL OR up.role = role_filter) AND
            (search_term IS NULL OR 
             up.display_name ILIKE '%' || search_term || '%' OR
             up.twitch_username ILIKE '%' || search_term || '%' OR
             up.email ILIKE '%' || search_term || '%')
    ),
    total_count AS (
        SELECT COUNT(*) as count FROM filtered_users
    )
    SELECT 
        fu.*,
        tc.count as total_count
    FROM filtered_users fu
    CROSS JOIN total_count tc
    ORDER BY fu.created_at DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely update user roles with logging
CREATE OR REPLACE FUNCTION update_user_role_with_log(
    target_user_id UUID,
    new_role user_role,
    updated_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    old_role user_role;
    updater_role user_role;
BEGIN
    -- Get current role of target user
    SELECT role INTO old_role 
    FROM user_profiles 
    WHERE id = target_user_id;
    
    -- Get role of user making the change
    SELECT role INTO updater_role 
    FROM user_profiles 
    WHERE id = updated_by;
    
    -- Check if updater has permission
    IF updater_role NOT IN ('superadmin', 'admin') THEN
        RAISE EXCEPTION 'Insufficient permissions to update roles';
    END IF;
    
    -- Prevent non-superadmins from creating superadmins
    IF new_role = 'superadmin' AND updater_role != 'superadmin' THEN
        RAISE EXCEPTION 'Only superadmins can assign superadmin role';
    END IF;
    
    -- Update the role
    UPDATE user_profiles 
    SET 
        role = new_role,
        updated_at = NOW()
    WHERE id = target_user_id;
    
    -- Log the change (you could create an audit table for this)
    INSERT INTO user_role_changes (
        user_id, 
        old_role, 
        new_role, 
        changed_by, 
        changed_at
    ) VALUES (
        target_user_id, 
        old_role, 
        new_role, 
        updated_by, 
        NOW()
    ) ON CONFLICT DO NOTHING; -- In case table doesn't exist yet
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Create audit table for role changes
CREATE TABLE IF NOT EXISTS user_role_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    old_role user_role,
    new_role user_role,
    changed_by UUID REFERENCES user_profiles(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT
);

-- Create custom roles table for dynamic role management
CREATE TABLE IF NOT EXISTS custom_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    color VARCHAR(7) DEFAULT '#747d8c',
    icon VARCHAR(10) DEFAULT '🔑',
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for custom roles
CREATE INDEX IF NOT EXISTS idx_custom_roles_name ON custom_roles(role_name);
CREATE INDEX IF NOT EXISTS idx_custom_roles_active ON custom_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_role_changes_user_id ON user_role_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_changes_changed_at ON user_role_changes(changed_at);

-- Function to create a custom role
CREATE OR REPLACE FUNCTION create_custom_role(
    p_role_name VARCHAR(50),
    p_display_name VARCHAR(100),
    p_description TEXT,
    p_permissions JSONB,
    p_created_by UUID,
    p_color VARCHAR(7) DEFAULT '#747d8c',
    p_icon VARCHAR(10) DEFAULT '🔑'
)
RETURNS UUID AS $$
DECLARE
    creator_role user_role;
    new_role_id UUID;
BEGIN
    -- Check if creator is superadmin
    SELECT role INTO creator_role 
    FROM user_profiles 
    WHERE id = p_created_by;
    
    IF creator_role != 'superadmin' THEN
        RAISE EXCEPTION 'Only superadmins can create custom roles';
    END IF;
    
    -- Validate role name (no spaces, lowercase, alphanumeric + underscore)
    IF p_role_name !~ '^[a-z0-9_]+$' THEN
        RAISE EXCEPTION 'Role name must be lowercase alphanumeric with underscores only';
    END IF;
    
    -- Insert the custom role
    INSERT INTO custom_roles (
        role_name,
        display_name,
        description,
        permissions,
        color,
        icon,
        created_by
    ) VALUES (
        p_role_name,
        p_display_name,
        p_description,
        p_permissions,
        p_color,
        p_icon,
        p_created_by
    ) RETURNING id INTO new_role_id;
    
    RETURN new_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all custom roles
CREATE OR REPLACE FUNCTION get_custom_roles()
RETURNS TABLE (
    id UUID,
    role_name VARCHAR(50),
    display_name VARCHAR(100),
    description TEXT,
    permissions JSONB,
    color VARCHAR(7),
    icon VARCHAR(10),
    created_by UUID,
    creator_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cr.id,
        cr.role_name,
        cr.display_name,
        cr.description,
        cr.permissions,
        cr.color,
        cr.icon,
        cr.created_by,
        up.display_name as creator_name,
        cr.created_at,
        cr.is_active
    FROM custom_roles cr
    LEFT JOIN user_profiles up ON cr.created_by = up.id
    WHERE cr.is_active = true
    ORDER BY cr.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update custom role permissions
CREATE OR REPLACE FUNCTION update_custom_role(
    p_role_id UUID,
    p_updated_by UUID,
    p_display_name VARCHAR(100) DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_permissions JSONB DEFAULT NULL,
    p_color VARCHAR(7) DEFAULT NULL,
    p_icon VARCHAR(10) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    updater_role user_role;
BEGIN
    -- Check if updater is superadmin
    SELECT role INTO updater_role 
    FROM user_profiles 
    WHERE id = p_updated_by;
    
    IF updater_role != 'superadmin' THEN
        RAISE EXCEPTION 'Only superadmins can update custom roles';
    END IF;
    
    -- Update the custom role (only update non-null values)
    UPDATE custom_roles 
    SET 
        display_name = COALESCE(p_display_name, display_name),
        description = COALESCE(p_description, description),
        permissions = COALESCE(p_permissions, permissions),
        color = COALESCE(p_color, color),
        icon = COALESCE(p_icon, icon),
        updated_at = NOW()
    WHERE id = p_role_id AND is_active = true;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete/deactivate custom role
CREATE OR REPLACE FUNCTION delete_custom_role(
    p_role_id UUID,
    p_deleted_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    deleter_role user_role;
BEGIN
    -- Check if deleter is superadmin
    SELECT role INTO deleter_role 
    FROM user_profiles 
    WHERE id = p_deleted_by;
    
    IF deleter_role != 'superadmin' THEN
        RAISE EXCEPTION 'Only superadmins can delete custom roles';
    END IF;
    
    -- Deactivate the role (soft delete)
    UPDATE custom_roles 
    SET 
        is_active = false,
        updated_at = NOW()
    WHERE id = p_role_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;