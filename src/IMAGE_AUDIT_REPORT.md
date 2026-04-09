# Image Audit Report

## Overview
This report documents all hardcoded image references found in the codebase. These should be migrated to the `website_images` database table.

## Hardcoded Images Analysis

### 1. HomePage.jsx
- **Branch Cards**: 6 hardcoded images used for the branch preview cards.
  - `sci-renaissance`: Unsplash URL (Building)
  - `sci-espoir`: Unsplash URL (Family home)
  - `nouveau-concept`: Unsplash URL (Car)
  - `atelier-5`: Unsplash URL (Haircut/Salon)
  - `la-manne`: Unsplash URL (Green field)
  - `spi-alim`: Unsplash URL (Gourmet products)
- **Usage**: Card headers/thumbnails.
- **Suggested Category**: `branch_card`

### 2. BranchesPage.jsx
- **Branch Cards**: Replicates the 6 hardcoded images from HomePage, but in a grid layout.
- **Usage**: Full width card images.
- **Suggested Category**: `branch_card`

### 3. AboutPage.jsx
- **History Section**: 1 image (`photo-1552581234...`).
- **Mission Section**: 1 image (`photo-1612627652758...`).
- **Vision Section**: 1 image (`photo-1612899326912...`).
- **Usage**: Half-width section illustrations.
- **Suggested Category**: `about`

### 4. NewsPage.jsx
- **News Articles**: 6 hardcoded news items with Unsplash URLs.
- **Usage**: Article thumbnails.
- **Suggested Category**: `news`

### 5. RSEPage.jsx
- **Engagement Section**: 1 image (`photo-1691109972364...`).
- **Usage**: Section illustration.
- **Suggested Category**: `rse`

### 6. BranchDetailPage.jsx
- **Translations Object**: Contains hardcoded `galleryImages` arrays for each of the 6 branches (3 images per branch = 18 images total).
- **Usage**: Slider/Hero background and Gallery grid fallback.
- **Suggested Category**: `branch_gallery` (tagged with specific branch ID)

### 7. Header.jsx / Footer.jsx
- **Logo/Icons**: No hardcoded external image URLs found (uses Lucide icons or text).

## Migration Plan
1.  Create `website_images` table.
2.  Upload these assets to Supabase Storage (bucket: `website-assets`).
3.  Create database records pointing to these assets with appropriate categories.
4.  Update components to fetch from `website_images` using `useImageManager` hook.