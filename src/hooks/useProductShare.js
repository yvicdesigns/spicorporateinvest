import { useToast } from '@/components/ui/use-toast';

export const useProductShare = () => {
  const { toast } = useToast();

  const getShareUrl = (productId) => {
    return `${window.location.origin}/?product=${productId}`;
  };

  const getShareText = (product) => {
    if (!product) return '';
    const price = new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XAF', 
      maximumFractionDigits: 0 
    }).format(product.price);
    return `${product.name} - ${price}`;
  };

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Link copied to clipboard!",
        duration: 3000,
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = (product, branchWhatsAppNumber = '242000000000', language = 'fr') => {
    const price = new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XAF', 
      maximumFractionDigits: 0 
    }).format(product.price);

    const text = language === 'fr' 
      ? `Bonjour, je suis intéressé par le produit: *${product.name}* (${price}). Pouvez-vous me donner plus d'informations?`
      : `Hello, I am interested in the product: *${product.name}* (${price}). Can you give me more information?`;
      
    window.open(`https://wa.me/${branchWhatsAppNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return { getShareUrl, getShareText, copyToClipboard, shareViaWhatsApp };
};