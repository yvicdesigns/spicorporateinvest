-- 1. Create the new branch_whatsapp_config table
CREATE TABLE IF NOT EXISTS branch_whatsapp_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pole_id text UNIQUE NOT NULL, -- using text to match shop branch IDs
    whatsapp_number text,
    is_enabled boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE branch_whatsapp_config ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Public read access for branch_whatsapp_config" 
    ON branch_whatsapp_config FOR SELECT USING (true);

CREATE POLICY "Admin write access for branch_whatsapp_config" 
    ON branch_whatsapp_config FOR ALL USING (auth.role() = 'authenticated');

-- 2. Migrate existing global config
DO $$ 
DECLARE
    global_number text;
BEGIN
    -- Get the current global number
    SELECT whatsapp_number INTO global_number FROM whatsapp_config LIMIT 1;
    
    -- If we have a global number, seed the active branches with it
    IF global_number IS NOT NULL THEN
        INSERT INTO branch_whatsapp_config (pole_id, whatsapp_number) 
        VALUES 
            ('sci-renaissance', global_number),
            ('sci-espoir', global_number),
            ('nouveau-concept', global_number),
            ('atelier-5', global_number),
            ('la-manne', global_number),
            ('spi-alim', global_number)
        ON CONFLICT (pole_id) DO NOTHING;
    END IF;
END $$;

-- 3. Drop the old global config table
DROP TABLE IF EXISTS whatsapp_config;