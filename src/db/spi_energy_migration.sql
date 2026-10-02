-- Migration: contenu et stockage de la branche SPI Energy
-- À exécuter dans l'éditeur SQL Supabase avant d'utiliser son gestionnaire d'images.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS spi_energy_content (
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

ALTER TABLE spi_energy_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access spi_energy" ON spi_energy_content
    FOR SELECT USING (true);

CREATE POLICY "Authenticated write access spi_energy" ON spi_energy_content
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

INSERT INTO storage.buckets (id, name, public)
VALUES ('spi-energy-images', 'spi-energy-images', true)
ON CONFLICT (id) DO NOTHING;
