/**
 * Constructs the OG image URL for a given product ID.
 * This points to the Vercel Edge Function that dynamically generates the preview image.
 */
export const getProductOGImageUrl = (productId) => {
  if (!productId) return 'https://spicorpinvest.com/default-share.jpg';
  return `https://spicorpinvest.com/api/og?productId=${productId}`;
};

export default getProductOGImageUrl;