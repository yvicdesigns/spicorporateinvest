-- Migration: Create zen_sens_content table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS zen_sens_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    alt_text TEXT,
    section TEXT,
    tags TEXT[],
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE zen_sens_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access zen_sens" ON zen_sens_content
    FOR SELECT USING (true);

CREATE POLICY "Admin write access zen_sens" ON zen_sens_content
    FOR ALL USING (auth.role() = 'authenticated');
