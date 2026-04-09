import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Calendar, Key, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductShare } from '@/hooks/useProductShare';

const ProductCard = ({ product, onAction, onNavigate, language = 'fr' }) => {
  const { name, price, description, image_url, product_type, id } = product;
  const { copyToClipboard } = useProductShare();
  
  const shareUrl = `https://spicorpinvest.com/share/${id}`;

  const getActionIcon = () => {
    switch (product_type) {
      case 'Louer': return <Key className="w-4 h-4 mr-2" />;
      case 'Réserver': return <Calendar className="w-4 h-4 mr-2" />;
      default: return <ShoppingCart className="w-4 h-4 mr-2" />;
    }
  };

  const getActionText = () => {
    if (language === 'en') {
      switch (product_type) {
        case 'Louer': return 'Rent Now';
        case 'Réserver': return 'Book Now';
        default: return 'Order Now';
      }
    }
    return `${product_type} maintenant`;
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate(id);
    }
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    onAction(product);
  };

  const handleShareClick = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    try {
      const formattedPrice = formatPrice(price);
      const message = `${name} - ${formattedPrice}\n\n${shareUrl}`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    } catch (err) {
      console.error('WhatsApp share error:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col h-full cursor-pointer relative"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100 flex-shrink-0">
        
        {/* Top Left Icons: Share & WhatsApp */}
        <div className="absolute top-2 left-2 z-20 flex gap-2">
          <button
            onClick={handleShareClick}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md flex items-center justify-center transition-all hover:scale-110 cursor-pointer text-gray-700 hover:text-blue-600 border border-gray-100/50"
            title="Partager"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleWhatsAppClick}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md flex items-center justify-center transition-all hover:scale-110 cursor-pointer text-gray-700 hover:text-[#25D366] border border-gray-100/50"
            title="Partager sur WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>

        {image_url ? (
          <img 
            src={image_url} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingCart className="w-12 h-12 opacity-20" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-gray-700 shadow-sm capitalize z-10 border border-gray-100/50">
          {product.category || 'General'}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-2 leading-tight min-h-[1.5em] group-hover:text-blue-700 transition-colors">{name}</h3>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-grow leading-relaxed">
          {description}
        </p>

        {/* Footer Section: Price & Buttons */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="text-lg font-bold text-blue-600 break-words flex-shrink-0">
              {formatPrice(price)}
            </div>
          </div>
          
          <Button 
            onClick={handleActionClick}
            size="sm"
            className={`${
              product_type === 'Louer' ? 'bg-indigo-600 hover:bg-indigo-700' :
              product_type === 'Réserver' ? 'bg-purple-600 hover:bg-purple-700' :
              'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors shadow-sm w-full rounded-[10px] mt-2`}
          >
            {getActionIcon()}
            <span className="whitespace-nowrap">{getActionText()}</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;