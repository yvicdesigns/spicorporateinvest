# Dynamic Open Graph Image Generation Setup

This application uses `@vercel/og` to dynamically generate perfectly formatted Open Graph (OG) images (1200x630px) for every product. This ensures that when users share products on social media (Facebook, WhatsApp, LinkedIn, Twitter), the preview card looks incredibly professional, displaying the product image, title, price, and Groupe SPI branding.

## How It Works

1. **The API Endpoint (`api/og.jsx`)**: We created a Vercel Serverless/Edge Function that accepts a `productId` query parameter.
2. **Data Fetching**: The function connects to Supabase, retrieves the specific product's details (image, name, price, description).
3. **Image Generation**: `@vercel/og` takes a React-like component structure (JSX) with inline styles and converts it into a static PNG image on the fly.
4. **Meta Tags Integration**: The `useSocialMetaTags` hook and the `ProductPreviewPage` set the `og:image` property to exactly `https://spicorpinvest.com/api/og?productId=[id]`.
5. **Crawler Interception**: When Facebook/WhatsApp crawls the URL, they read the `og:image` tag, call the `/api/og` endpoint, and display the beautiful dynamically generated image.

## Requirements & Deployment Note

Because `@vercel/og` relies on the Vercel Edge Runtime, **the `api/og.jsx` endpoint requires this application to be deployed on Vercel** to function correctly. Local testing in Vite will not natively execute the `/api/og` folder without the Vercel CLI. 

If deploying on Vercel:
- Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are added to your Vercel Environment Variables so the Edge function can fetch the product data.

## How to Test

1. **Deploy to Vercel**: Ensure the app is deployed with the correct environment variables.
2. **Test the Image Endpoint Directly**: Open a browser and navigate to:
   `https://spicorpinvest.com/api/og?productId=[YOUR_PRODUCT_ID]`
   You should see a generated image.
3. **Facebook Sharing Debugger**: 
   - Go to: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - Enter your product URL (e.g., `https://spicorpinvest.com/preview?productId=[id]`)
   - Click "Debug" and check the link preview.
4. **WhatsApp Testing**: Send the product link in a WhatsApp chat and wait a few seconds for the preview card to load.

## Troubleshooting

- **Image not loading in previews**: Check if the Vercel Edge Function logs show any errors (e.g., missing Supabase environment variables).
- **Text overflowing**: The `/api/og` endpoint uses Webkit line clamping to prevent extremely long titles from overflowing the 1200x630 container.
- **Product Image missing**: Ensure the product image URLs in Supabase are absolute or properly formatted relative URLs that the edge function can resolve.