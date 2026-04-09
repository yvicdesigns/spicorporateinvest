import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

// Vercel Serverless Function to generate dynamic Open Graph images
export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return new Response('Product ID is required', { status: 400 });
    }

    // Connect to Supabase to fetch product details using hardcoded values instead of process.env
    const supabaseUrl = 'https://spicorpinvest.com';
    const supabaseKey = 'public-anon-key'; // Replace with actual key if necessary, or use an API proxy
    
    let product = null;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      product = data;
    }

    const title = product?.name || 'Produit Exclusif';
    const description = product?.description 
      ? product.description.substring(0, 100) + '...'
      : 'Découvrez ce produit exceptionnel du Groupe SPI.';
    const price = product?.price 
      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(product.price)
      : '';
    const imageUrl = product?.image_url || 'https://spicorpinvest.com/default-share.jpg';

    // Format absolute URL for image fetching in Vercel Edge
    const absoluteImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `https://spicorpinvest.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f3f4f6)',
            padding: '40px 60px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Left Column - Product Image */}
          <div
            style={{
              display: 'flex',
              width: '45%',
              height: '100%',
              backgroundColor: '#f9fafb',
              borderRadius: '24px',
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
              border: '1px solid #e5e7eb',
            }}
          >
            {absoluteImageUrl ? (
              <img
                src={absoluteImageUrl}
                alt="Product"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{ fontSize: '48px', color: '#9ca3af' }}>📦</div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '50%',
              height: '100%',
              justifyContent: 'center',
              paddingLeft: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Groupe SPI
              </div>
            </div>

            <h1
              style={{
                fontSize: '56px',
                fontWeight: '800',
                color: '#111827',
                lineHeight: 1.1,
                marginBottom: '24px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </h1>

            {price && (
              <div
                style={{
                  fontSize: '42px',
                  fontWeight: '700',
                  color: '#2563eb',
                  marginBottom: '24px',
                }}
              >
                {price}
              </div>
            )}

            <p
              style={{
                fontSize: '24px',
                color: '#4b5563',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {description}
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}