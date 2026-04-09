import { useMemo } from 'react';
import { 
  sanitizeDescription, 
  getCanonicalUrl, 
  formatPriceWithCurrency 
} from '@/components/SocialMetaTagsHelper';
import { getProductOGImageUrl } from '@/utils/getProductOGImageUrl';

export const useSocialMetaTags = (product, language = 'fr') => {
  return useMemo(() => {
    if (!product) return null;

    const title = `${product.name} | Groupe SPI`;
    const description = sanitizeDescription(product.description);
    const url = getCanonicalUrl(`/boutique/${product.id}`);
    // Use the dynamic OG image generator endpoint
    const image = getProductOGImageUrl(product.id);
    const formattedPrice = formatPriceWithCurrency(product.price, language);

    return {
      title,
      description,
      url,
      image,
      price: formattedPrice,
      priceAmount: product.price?.toString() || '0',
      currency: 'XAF',
      type: 'product'
    };
  }, [product, language]);
};

export default useSocialMetaTags;