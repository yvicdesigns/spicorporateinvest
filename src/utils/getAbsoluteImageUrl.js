/**
 * Converts relative image URLs to absolute URLs using the domain https://spicorpinvest.com
 * Handles Supabase storage URLs and ensures all image URLs in meta tags are fully qualified.
 */
export const getAbsoluteImageUrl = (url, fallback = 'https://spicorpinvest.com/default-share.jpg') => {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = 'https://spicorpinvest.com';
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
};

export default getAbsoluteImageUrl;