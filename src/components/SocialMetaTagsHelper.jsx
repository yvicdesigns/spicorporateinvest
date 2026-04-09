import React from 'react';
import { Helmet } from 'react-helmet';
import { getAbsoluteImageUrl } from '@/utils/getAbsoluteImageUrl';

/**
 * Sanitizes and truncates description to max 160 characters for SEO/Meta tags
 * Removes special characters that might break meta tags.
 */
export const sanitizeDescription = (desc) => {
  if (!desc) return 'Découvrez nos produits et services exclusifs avec le Groupe SPI.';
  // Remove HTML tags and extra quotes/newlines
  let clean = desc.replace(/(<([^>]+)>)/gi, '').replace(/["'\n\r]/g, ' ').trim();
  return clean.length > 160 ? clean.substring(0, 157) + '...' : clean;
};

/**
 * Generates an absolute canonical URL
 */
export const getCanonicalUrl = (path = '') => {
  const baseUrl = 'https://spicorpinvest.com';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Validates and formats image URLs for social sharing ensuring they are absolute
 */
export const validateAndFormatImageUrl = (url, fallback = 'https://spicorpinvest.com/default-share.jpg') => {
  return getAbsoluteImageUrl(url, fallback);
};

/**
 * Formats price with currency symbol for display or specific text contexts
 */
export const formatPriceWithCurrency = (price, lang = 'fr') => {
  if (!price && price !== 0) return '';
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Reusable utility component for rendering Helmet meta tags
 */
export const SocialMetaTags = ({ tags }) => {
  if (!tags) return null;

  return (
    <Helmet>
      <title>{tags.title}</title>
      <meta name="description" content={tags.description} />
      <link rel="canonical" href={tags.url} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={tags.title} />
      <meta property="og:description" content={tags.description} />
      <meta property="og:image" content={tags.image} />
      <meta property="og:url" content={tags.url} />
      <meta property="og:type" content={tags.type || 'product'} />
      {tags.price && <meta property="product:price:amount" content={tags.priceAmount} />}
      {tags.price && <meta property="product:price:currency" content={tags.currency} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={tags.title} />
      <meta name="twitter:description" content={tags.description} />
      <meta name="twitter:image" content={tags.image} />
    </Helmet>
  );
};