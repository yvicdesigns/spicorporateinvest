# Analysis Report: Pole Image Management System

## 1. Current Image Storage Architecture

### Storage Strategy
The system uses a **Hybrid Storage Model**:
1.  **Supabase Storage Buckets:** Physical files are stored here.
2.  **Supabase Database Tables:** Metadata (URLs, titles, sections, tags) is stored here to reference the files.
3.  **Hardcoded Fallbacks:** The frontend (`HomePage.jsx`, `BranchesPage.jsx`) retains hardcoded URLs as safety fallbacks if database queries fail or return no results.

### Core Components
*   **Primary Table:** `vision_images`
    *   **Purpose:** Stores "global" visual content for the website, specifically Homepage assets (Slider, Branch Cards, Gallery).
    *   **Key Columns:** `id`, `image_url`, `section` (e.g., "branch_card", "slider"), `tags` (e.g., "nouveau-concept", "sci-renaissance"), `is_active`.
*   **Storage Bucket:** `vision-assets` (used by the "Homepage Content" module).

## 2. Database Schema for the 6 Poles

The application is modular. Each Pole has its own dedicated content table and storage bucket, separate from the main homepage images.

| Pole Name | ID / Tag | Content Table | Storage Bucket | Link Logic |
|-----------|----------|---------------|----------------|------------|
| **SCI Renaissance** | `sci-renaissance` | `sci_renaissance_content` | `sci-renaissance-images` | Separate Table |
| **Fondation SPI** | `sci-espoir` | `fondation_spi_content` | `fondation-spi-images` | Separate Table |
| **Nouveau Concept** | `nouveau-concept` | `nouveau_concept_content` | `nouveau-concept-images` | Separate Table |
| **Atelier 5** | `atelier-5` | `atelier5_content` | `atelier5-images` | Separate Table |
| **La Manne** | `la-manne` | `la_manne_content` | `la-manne-images` | Separate Table |
| **SPI Alim** | `spi-alim` | `spi_alim_content` | `spi-alim-images` | Separate Table |

### Homepage "Branch Cards" vs. Internal Content
It is critical to distinguish between these two types of images:
1.  **Branch Card (Homepage):**
    *   **Stored in:** `vision_images` table.
    *   **Identified by:** `section='branch_card'` AND `tags=['nouveau-concept']`.
    *   **Managed via:** "Homepage Content" module in Dashboard.
2.  **Internal Content (Detail Page):**
    *   **Stored in:** `nouveau_concept_content` (for example).
    *   **Managed via:** "Nouveau Concept" module in Dashboard.

## 3. Dashboard Image Management Flow

### UI Path Analysis
The management logic resides in `src/components/dashboard/PoleManager.jsx`.

1.  **Initialization:**
    *   User selects a module (e.g., "Homepage Content") in `DashboardPage.jsx`.
    *   `PoleManager` initializes with the specific `tableName` (e.g., `vision_images`) and `bucketName`.
2.  **Display:**
    *   It fetches all records from the table.
    *   Tabs filter items based on the `section` column.
3.  **Creation (Upload):**
    *   User fills the "Add New Content" form.
    *   **Image:** Uploaded to Supabase Storage -> Public URL returned.
    *   **Metadata:** Inserted into Database Table with the URL.
    *   *Special Case:* If "Branch Card" section is selected, a "Associated Branch" dropdown appears to set the `tags` column.
4.  **Modification:**
    *   **Edit Metadata:** Updates title/tags in DB.
    *   **Replace Image:** Uploads new file to Storage -> Updates `image_url` in DB.

## 4. Step-by-Step: Modifying "Nouveau Concept" Pole Image (Homepage)

To change the representative card image on the Homepage:

1.  **Login** to the Dashboard.
2.  Click the **"Homepage Content"** module (Eye icon).
3.  Scroll down to **"Existing Content"**.
4.  Click the tab labeled **"Branch Card"**.
5.  Locate the image card that has the tag **"Nouveau Concept"** (visible as a small dark badge on the image).
    *   *If it doesn't exist:* Scroll up to "Add New Content".
        *   Check **"Branch Card"**.
        *   Select Associated Branch: **"Nouveau Concept"**.
        *   Upload Image & Click "Add Content Item".
6.  *If it exists:* Click the **Green Image Icon** (Replace Image) on the card.
7.  Select the new file from your computer.
8.  Click **"Upload & Replace"**.
9.  Return to the Homepage and refresh to see the change.

## 5. Historical Analysis

### How was this done previously?
Before the recent updates:
1.  **Hardcoded Code:** The "Nouveau Concept" image was likely changed by a developer editing `src/pages/HomePage.jsx` directly.
    *   *Evidence:* The file contains a `defaultImages` object with Unsplash URLs (e.g., `https://images.unsplash.com/photo-1698307663492...`).
2.  **Missing UI:** The Dashboard's `PoleManager` previously lacked the "Branch Card" section filter and the "Associated Branch" dropdown, making it impossible for a non-technical user to correctly tag an image for the homepage card slot via the UI.

### Current Status
The system is now **fully dynamic**. `HomePage.jsx` queries the database first. If a user uploads an image tagged "Nouveau Concept" in the "Branch Card" section, it overrides the hardcoded Unsplash default automatically.