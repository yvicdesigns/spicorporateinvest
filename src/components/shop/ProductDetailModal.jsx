import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Calendar, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ProductDetailModal = ({ product, isOpen, onClose, language = 'fr' }) => {
  const navigate = useNavigate();

  if (!product) return null;

  const { name, price, description, image_url, product_type, id } = product;

  const handleClose = () => {
    onClose();
    // Remove the product query parameter from the URL smoothly without reload
    navigate('/boutique', { replace: true });
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getActionIcon = () => {
    switch (product_type) {
      case 'Louer': return <Key className="w-5 h-5 mr-2" />;
      case 'Réserver': return <Calendar className="w-5 h-5 mr-2" />;
      default: return <ShoppingCart className="w-5 h-5 mr-2" />;
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col md:flex-row h-full overflow-y-auto">
              <div className="w-full md:w-1/2 bg-gray-100 min-h-[300px] relative">
                {image_url ? (
                  <img
                    src={image_url}
                    alt={name}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 absolute inset-0">
                    <ShoppingCart className="w-20 h-20 opacity-20" />
                  </div>
                )}
              </div>

              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                    {product.category || 'General'}
                  </span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{name}</h2>
                
                <div className="text-3xl font-bold text-blue-600 mb-6">
                  {formatPrice(price)}
                </div>

                <div className="prose prose-sm text-gray-600 mb-8 flex-grow">
                  <p className="whitespace-pre-line leading-relaxed">{description}</p>
                </div>

                <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-gray-100">
                  <Button 
                    onClick={() => {
                      navigate(`/checkout/${id}`);
                    }}
                    size="lg"
                    className={`w-full text-lg h-14 rounded-xl shadow-md ${
                      product_type === 'Louer' ? 'bg-indigo-600 hover:bg-indigo-700' :
                      product_type === 'Réserver' ? 'bg-purple-600 hover:bg-purple-700' :
                      'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {getActionIcon()}
                    <span>{getActionText()}</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="w-full mt-2"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailModal;