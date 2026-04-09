# Audit Report: "Nos Pôles d'Excellence" Section Images

## 1. Component Location
- **File Path:** `src/pages/HomePage.jsx`
- **Component Name:** `HomePage`
- **Section ID:** `#branches`
- **Render Function:** The section is rendered roughly between lines 176-218 (in the render return statement), iterating over the `branchItems` array.

## 2. Image Data Source
The images for this section use a **Hybrid Loading Strategy**:
1.  **Primary Source (Supabase):** The app attempts to fetch dynamic images from the database first.
2.  **Fallback Source (Hardcoded):** If no image is found in the database, it defaults to hardcoded URLs defined in the code.

## 3. Data Flow Analysis
### A. The Fetch Logic
Inside `src/pages/HomePage.jsx`, a `useEffect` hook triggers the image fetch: