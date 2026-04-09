# Product Data & Image Storage Investigation Report

Date: 2026-02-23

## 1. Product Data Storage

### Data Source
All product data is stored remotely in a Supabase PostgreSQL database. The application interfaces with this database using the official `@supabase/supabase-js` client initialized in `src/lib/customSupabaseClient.js`.

### Table Structure (`products` table)
The products table contains the following schema based on the database analysis:
- `id` (uuid, Primary Key)
- `branch_id` (text) - Associates the product with a specific SPI Group branch
- `name` (text) - Product name
- `description` (text) - Product details
- `price` (numeric) - Product price (formatted dynamically in XAF)
- `image_url` (text) - URL pointing to the product's image
- `product_type` (text) - Defines the action type (e.g., 'Louer', 'Réserver', or default order)
- `category` (text) - Product categorization
- `is_active` (boolean) - Toggles visibility on the storefront
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

### Fetching Logic
- **Storefront (`ShopPage.jsx`)**: Fetches all active products using `supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })`.
- **Details Page (`ProductDetailPage.jsx`)**: Fetches individual records by matching the UUID from the URL parameter: `supabase.from('products').select('*').eq('id', productId).single()`.

---

## 2. Product Image Storage

### Image URL Formats
Based on the codebase (`ProductDetailPage.jsx` and `ProductCard.jsx`), image URLs are stored as text strings in the `image_url` column. The application handles them as follows:
- **Absolute URLs**: The code explicitly checks if `image_url` starts with `http` (`product.image_url?.startsWith('http')`). This allows maximum flexibility, supporting both Supabase Storage URLs (e.g., `https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[image-name]`) and external HTTPS URLs.
- **Fallback Mechanism**: If no valid URL is found, the system defaults to `https://spicorpinvest.com/default-share.jpg` or displays a placeholder `<ShoppingCart />` icon.

### Storage Buckets
While the `products` table stores the URL strings, the actual images uploaded via the platform's dashboard are stored in branch-specific Supabase storage buckets, such as:
- `spi-alim-images`
- `spi-beauty-images`
- `la-manne-images`
- `atelier1-images` through `atelier6-images`
- `sci-renaissance-images`

---

## 3. Current Product Page Implementation

### Routing & Data Flow
1. **Standard Routing**: Users navigating to `/product/:id` or `/shop/:id` are routed to `ProductDetailPage.jsx`. The `:id` parameter is extracted via `useParams()` and used to fetch the product from Supabase.
2. **Legacy/Query Routing**: Legacy URLs formatted as `/?product=[id]` are intercepted in `App.jsx`. 
   - Normal users are redirected to `/product/:id`.
   - Social media crawlers (bots) are routed to `/preview?product=[id]` (`ProductPreviewPage.jsx`) to ensure meta tags are properly scraped before rendering the UI.
3. **Redirect Handler**: `ProductRedirectPage.jsx` provides a dedicated fallback for redirecting `?product=` queries to the modern `/product/:id` path.

### Meta Tags & SEO
`ProductDetailPage.jsx` utilizes `react-helmet` to inject critical SEO and Open Graph metadata directly into the document head:
- **Title**: `{product.name} | Groupe SPI`
- **Description**: Truncated product description.
- **Open Graph (og:*)**: `og:title`, `og:description`, `og:image` (absolute HTTPS URL), `og:url`, and `og:type` (set to `product`).
- **Twitter Cards**: Configured as `summary_large_image` with corresponding title, description, and image tags.

---

## 4. Existing Supabase Setup & Social Sharing

### Related Tables
Beyond `products`, the ecosystem utilizes:
- **`orders`**: Tracks purchases (`id`, `product_id`, `customer_name`, `customer_email`, `customer_phone`, `quantity`, `total_price`, `status`).
- **`branch_whatsapp_config`**: Used by `ProductCard.jsx` to dynamically route WhatsApp inquiries to the correct branch's contact number based on the product's `branch_id`.

### Open Graph Image Generation (`api/og.jsx`)
The platform includes an advanced dynamic Open Graph image generation system located in `api/og.jsx`.
- **Technology**: Uses `@vercel/og` (Vercel Edge Functions).
- **Functionality**: Takes a `?productId=` parameter, queries the Supabase `products` table directly from the Edge, and dynamically renders an image containing the product's actual image, title, price, and description.
- **Usage**: This is hooked into `src/hooks/useSocialMetaTags.js` via the `getProductOGImageUrl(product.id)` utility, ensuring that when links are shared on social media, they display a beautifully formatted, customized preview card rather than just a static image.