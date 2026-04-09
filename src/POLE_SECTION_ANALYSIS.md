# Audit Report: "Nos Pôles d'Excellence" Section

## 1. Overview
The "Nos Pôles d'Excellence" section is the primary navigation hub on the Homepage, directing users to the 6 specific business divisions of Groupe SPI.

**File Location:** `src/pages/HomePage.jsx`
**Section ID:** `#branches`

## 2. Displayed Branches (Poles)
The section displays exactly **6 poles**. The text content is currently **hardcoded** within the `translations` object inside `HomePage.jsx` (lines 31-50 for FR, 91-110 for EN), not fetched from the database.

| ID | Title (FR) | Subtitle (FR) | Icon Used |
|----|------------|---------------|-----------|
| `sci-renaissance` | SCI Renaissance | Immobilier d'Exception | `Building` |
| `sci-espoir` | Fondation SPI | Valorisation Patrimoniale | `HandHeart` |
| `nouveau-concept` | Nouveau Concept | Mobilité Intelligente | `Car` |
| `atelier-5` | Atelier 5 | Art du Bien-Être | `Scissors` |
| `la-manne` | La Manne | Agriculture d'Avenir | `Flower` |
| `spi-alim` | SPI Alim | Gastronomie & Terroirs | `Utensils` |

## 3. Image Loading Strategy
The images use a **Hybrid Loading System**:

1.  **Primary Source (Dynamic):**
    *   **Database Table:** `vision_images`
    *   **Query:** `SELECT * FROM vision_images WHERE is_active = true AND section ILIKE '%branch_card%'`
    *   **Mapping:** Images are mapped to cards via the `tags` column (e.g., a tag of `'sci-renaissance'` matches the card ID).
2.  **Fallback Source (Hardcoded):**
    *   If no dynamic image is found for a specific ID, it reverts to the `defaultImages` object defined in code (lines 142-149).
    *   **Fallback URLs:**
        *   *Renaissance:* `https://images.unsplash.com/photo-1619425054357-781d9be681a0`
        *   *Espoir:* `https://images.unsplash.com/photo-1671621556393-72aae2f654e5`
        *   *Nouveau Concept:* `https://images.unsplash.com/photo-1698307663492-928dcdd4d960`
        *   *Atelier 5:* `https://images.unsplash.com/photo-1653919551040-ad7759283d50`
        *   *La Manne:* `https://images.unsplash.com/photo-1643621204445-2681f6815937`
        *   *SPI Alim:* `https://images.unsplash.com/photo-1672702959512-af149104c388`

## 4. Component Structure & Layout
*   **Grid System:** Uses CSS Grid with responsive breakpoints:
    *   Mobile: 1 column (`grid-cols-1`)
    *   Tablet: 2 columns (`md:grid-cols-2`)
    *   Desktop: 3 columns (`lg:grid-cols-3`)
    *   Gap: `gap-8` (32px)
*   **Card Design:**
    *   **Container:** `motion.div` with `rounded-2xl`, `shadow-lg`, and `overflow-hidden`.
    *   **Image Area:** Top 192px (`h-48`) with a gradient overlay (`bg-gradient-to-t from-black/50 to-transparent`).
    *   **Icon:** Floating white square with the pole's specific color icon in the bottom-left of the image area.
    *   **Content Area:** Contains Subtitle (Colored), Title (Dark Blue), Description (Gray), and a "Découvrir" button with an arrow.
*   **Interactions:**
    *   **Hover:** The whole card lifts up (`hover:-translate-y-2` effect implied via logic or css) and image zooms (`group-hover:scale-110`).
    *   **Click:** Triggers `navigateTo('branch-detail', branch.id)`.

## 5. Data Flow Summary
1.  **Mount:** Component mounts.
2.  **Fetch:** `useEffect` calls Supabase `vision_images` table.
3.  **Render:** 
    *   Iterates through the hardcoded `branchItems` array.
    *   For each item, calls `getImage(branch.id)` to check if a dynamic image exists.
    *   Renders card with text from code and image from DB (or fallback).