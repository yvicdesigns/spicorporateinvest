# Product Schema Details

This document contains the exact schema and query details for the `products` table in the Supabase database.

## 1. Table Information
- **Exact Table Name**: `products`
- **Primary Key Column**: `id`

## 2. Column Structure & Data Types
The `products` table has the following columns and PostgreSQL data types:
- `id`: `uuid` NOT NULL
- `branch_id`: `text` NOT NULL
- `name`: `text` NOT NULL
- `description`: `text`
- `price`: `numeric`
- `image_url`: `text`
- `product_type`: `text`
- `category`: `text`
- `is_active`: `boolean`
- `created_at`: `timestamp with time zone`
- `updated_at`: `timestamp with time zone`

## 3. Sample Product Record
*(A live record can be viewed in your browser console by calling `logProductSchema()` from `src/utils/productQueries.js`)*

Representative JSON Structure: