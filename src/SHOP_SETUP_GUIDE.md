# Shop System Setup Guide

## 1. Database Configuration
The shop system uses two main tables: `products` and `orders`.

### Products Table Structure
- `id`: UUID (Primary Key)
- `branch_id`: Text (Slug matching frontend IDs, e.g., 'sci-renaissance')
- `name`: Text (Product Name)
- `description`: Text
- `price`: Numeric (XAF)
- `image_url`: Text
- `product_type`: Text (Enum: 'Louer', 'Réserver', 'Commander')
- `category`: Text
- `is_active`: Boolean
- `created_at`: Timestamp

### Orders Table Structure
- `id`: UUID (Primary Key)
- `product_id`: UUID (Foreign Key)
- `customer_name`: Text
- `customer_email`: Text
- `customer_phone`: Text
- `branch_id`: Text
- `status`: Text ('pending')

## 2. Row Level Security (RLS)
- **Products**: Public Read, Admin Write.
- **Orders**: Public Insert, Admin Read/Update.

## 3. WhatsApp Integration
The system uses the WhatsApp "Click to Chat" API (`wa.me`).
- Configuration is handled in `src/lib/shopConstants.js`.
- Each branch has a configured WhatsApp number in this file.
- **To update numbers**: Edit the `whatsapp` field in `SHOP_BRANCHES` array in `src/lib/shopConstants.js`.

Example Message generated:
> "Bonjour SCI Renaissance, Je souhaite louer Appartement Luxueux. Nom: Jean Dupont..."

## 4. Image Management
- Product images are stored in Supabase Storage.
- Recommended Bucket: `pole-images` (Folder: `products/`).
- The `ProductsManager` automatically handles uploads to this path.

## 5. Adding Data
1. Log in to the Dashboard (`/dashboard`).
2. Navigate to the **Boutique / Shop** tab.
3. Click "Add Product".
4. Fill in the form:
   - **Branch**: Select the owner branch.
   - **Type**: Select 'Louer' for Real Estate/Cars, 'Réserver' for Wellness, 'Commander' for Food.
   - **Image**: Upload a high-quality image.
5. Click Save.

## 6. Testing
- Go to `/shop`.
- Filter by branch or category.
- Click "Commander/Louer" on a product.
- Fill out the checkout form.
- Click "Confirm via WhatsApp" and ensure it opens WhatsApp with the pre-filled message.