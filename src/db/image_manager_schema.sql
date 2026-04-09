-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Website Images Table
DROP TABLE IF EXISTS website_images;
CREATE TABLE website_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    image_name TEXT NOT NULL,
    description TEXT,
    alt_text TEXT,
    section TEXT, -- Used for categorization (e.g., 'slider', 'gallery', 'branch_card')
    tags TEXT[], -- Array of strings for flexible tagging
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE website_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for website_images" ON website_images FOR SELECT USING (true);
CREATE POLICY "Admin write access for website_images" ON website_images FOR ALL USING (auth.role() = 'authenticated');

-- 2. Sci Renaissance Content
DROP TABLE IF EXISTS sci_renaissance_content;
CREATE TABLE sci_renaissance_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sci_renaissance_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access sci_renaissance" ON sci_renaissance_content FOR SELECT USING (true);
CREATE POLICY "Admin write access sci_renaissance" ON sci_renaissance_content FOR ALL USING (auth.role() = 'authenticated');

-- 3. Fondation SPI Content
DROP TABLE IF EXISTS fondation_spi_content;
CREATE TABLE fondation_spi_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE fondation_spi_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access fondation_spi" ON fondation_spi_content FOR SELECT USING (true);
CREATE POLICY "Admin write access fondation_spi" ON fondation_spi_content FOR ALL USING (auth.role() = 'authenticated');

-- 4. Nouveau Concept Content
DROP TABLE IF EXISTS nouveau_concept_content;
CREATE TABLE nouveau_concept_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE nouveau_concept_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access nouveau_concept" ON nouveau_concept_content FOR SELECT USING (true);
CREATE POLICY "Admin write access nouveau_concept" ON nouveau_concept_content FOR ALL USING (auth.role() = 'authenticated');

-- 5. La Manne Content
DROP TABLE IF EXISTS la_manne_content;
CREATE TABLE la_manne_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE la_manne_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access la_manne" ON la_manne_content FOR SELECT USING (true);
CREATE POLICY "Admin write access la_manne" ON la_manne_content FOR ALL USING (auth.role() = 'authenticated');

-- 6. SPI Beauty Content
DROP TABLE IF EXISTS spi_beauty_content;
CREATE TABLE spi_beauty_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE spi_beauty_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access spi_beauty" ON spi_beauty_content FOR SELECT USING (true);
CREATE POLICY "Admin write access spi_beauty" ON spi_beauty_content FOR ALL USING (auth.role() = 'authenticated');

-- 7. SPI Alim Content
DROP TABLE IF EXISTS spi_alim_content;
CREATE TABLE spi_alim_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE spi_alim_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access spi_alim" ON spi_alim_content FOR SELECT USING (true);
CREATE POLICY "Admin write access spi_alim" ON spi_alim_content FOR ALL USING (auth.role() = 'authenticated');

-- 8. RSE Content
DROP TABLE IF EXISTS rse_content;
CREATE TABLE rse_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE rse_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for rse_content" ON rse_content FOR SELECT USING (true);
CREATE POLICY "Admin write access for rse_content" ON rse_content FOR ALL USING (auth.role() = 'authenticated');

-- 9. Atelier 1-6 Content Tables
-- Atelier 1
DROP TABLE IF EXISTS atelier_1_content;
CREATE TABLE atelier_1_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE atelier_1_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access atelier_1" ON atelier_1_content FOR SELECT USING (true);
CREATE POLICY "Admin write access atelier_1" ON atelier_1_content FOR ALL USING (auth.role() = 'authenticated');

-- Atelier 2
DROP TABLE IF EXISTS atelier_2_content;
CREATE TABLE atelier_2_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE atelier_2_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access atelier_2" ON atelier_2_content FOR SELECT USING (true);
CREATE POLICY "Admin write access atelier_2" ON atelier_2_content FOR ALL USING (auth.role() = 'authenticated');

-- Atelier 3
DROP TABLE IF EXISTS atelier_3_content;
CREATE TABLE atelier_3_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE atelier_3_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access atelier_3" ON atelier_3_content FOR SELECT USING (true);
CREATE POLICY "Admin write access atelier_3" ON atelier_3_content FOR ALL USING (auth.role() = 'authenticated');

-- Atelier 4
DROP TABLE IF EXISTS atelier_4_content;
CREATE TABLE atelier_4_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE atelier_4_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access atelier_4" ON atelier_4_content FOR SELECT USING (true);
CREATE POLICY "Admin write access atelier_4" ON atelier_4_content FOR ALL USING (auth.role() = 'authenticated');

-- Atelier 5
DROP TABLE IF EXISTS atelier_5_content;
CREATE TABLE atelier_5_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE atelier_5_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access atelier_5" ON atelier_5_content FOR SELECT USING (true);
CREATE POLICY "Admin write access atelier_5" ON atelier_5_content FOR ALL USING (auth.role() = 'authenticated');

-- Atelier 6
DROP TABLE IF EXISTS atelier_6_content;
CREATE TABLE atelier_6_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    description TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE atelier_6_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access atelier_6" ON atelier_6_content FOR SELECT USING (true);
CREATE POLICY "Admin write access atelier_6" ON atelier_6_content FOR ALL USING (auth.role() = 'authenticated');

-- 10. Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('website-assets', 'website-assets', true)
ON CONFLICT (id) DO NOTHING;