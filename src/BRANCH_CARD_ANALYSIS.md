# Branch Card Image System Analysis

## 1. Current State Assessment
**Status:** Partially Implemented / Disconnected

**Findings:**
1.  **Missing Category:** The "Branch Card" category was referenced in the frontend code (`HomePage.jsx`, `BranchesPage.jsx`) but was **not** available in the Dashboard's `PoleManager` as a selectable section.
2.  **Data Disconnect:** The frontend attempted to fetch images with `category: 'branch_card'`, but since no interface existed to save images with this metadata, it always fell back to hardcoded URLs.
3.  **Storage Location:** 
    - The logical place for these images is the `vision_images` table (Homepage Content), as they represent the high-level entry points to the branches.
    - Currently, `PoleManager.jsx` (used for `vision_images`) did not support a "Branch Card" section or a way to tag images with a specific branch ID (e.g., 'sci-renaissance').

## 2. Data Flow Architecture
**Previous Flow (Broken):**
`BranchesPage` -> calls `useImageManager` -> queries DB for `branch_card` -> Returns Empty -> Component uses `defaultImages` object.

**New Flow (Implemented):**
1.  **Dashboard (Admin):** 
    - User goes to "Homepage Content".
    - Uploads image.
    - Selects Section: "Branch Card".
    - Selects Target Branch: "SCI Renaissance" (dropdown appears dynamically).
    - System saves to `vision_images` table with `section=['branch_card']` and `tags=['sci-renaissance']`.

2.  **Frontend (User):**
    - `BranchesPage`/`HomePage` queries `vision_images` table.
    - Filters for records where `section` contains "branch_card".
    - Maps the images based on their `tags` to the specific card UI.
    - Displays dynamic image (or fallback if specific tag not found).

## 3. Implementation Details
- **Component Modified:** `src/components/dashboard/PoleManager.jsx`
    - Added "Branch Card" to `availableSections`.
    - Added "Associated Branch" dropdown that writes to the `tags` column.
- **Pages Updated:** `src/pages/BranchesPage.jsx` & `src/pages/HomePage.jsx`
    - Removed reliance on opaque hooks.
    - Implemented direct Supabase queries to `vision_images` for robust fetching.

## 4. Required Database Permissions
- Ensure `vision_images` table has `tags` column (confirmed in schema).
- Ensure RLS policies allow public read and authenticated write (confirmed).