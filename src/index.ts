interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

// Regex to detect common social media bots and crawlers
const CRAWLER_USER_AGENTS = /bot|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|whatsapp|telegrambot|discordbot/i;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const productId = url.searchParams.get('product');
    const userAgent = request.headers.get('User-Agent') || '';

    // Check if the request is from a social media bot
    const isBot = CRAWLER_USER_AGENTS.test(userAgent);

    if (isBot) {
      // If a bot is requesting a specific product page
      if (productId) {
        // Construct the expected OG image URL
        const imageUrl = `https://spicorpinvest.com/assets/products/${productId}-og.jpg`;
        const defaultImageUrl = 'https://dfsewbhkwnqwoygynhlb.supabase.co/storage/v1/object/public/website-logo/og-image-spi.png';
        
        const title = `Produit ${productId} | SPI Corporate Invest`;
        const description = 'Découvrez ce produit exceptionnel du Groupe SPI.';
        
        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="product">
    <meta property="og:url" content="${url.href}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:site_name" content="Groupe SPI">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url.href}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    <img src="${imageUrl}" onerror="this.src='${defaultImageUrl}'" alt="${title}">
</body>
</html>`;

        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'no-store'
          }
        });
      } else {
        const title = 'SPI Corporate Invest';
        const description = 'Excellence Multisectorielle';
        const imageUrl = 'https://dfsewbhkwnqwoygynhlb.supabase.co/storage/v1/object/public/website-logo/og-image-spi.png';

        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url.href}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:site_name" content="Groupe SPI">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
</body>
</html>`;

        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Cache-Control': 'no-store'
          }
        });
      }
    }

    return fetch(request);
  },
};