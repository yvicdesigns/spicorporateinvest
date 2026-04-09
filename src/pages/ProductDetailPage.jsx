import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, ShoppingCart, ShieldCheck, Truck, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ProductDetailPage = ({ language = 'fr' }) => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
          
        if (productError) throw productError;
        setProduct(productData);
      } catch (err) {
        console.error('Error loading product:', err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProductDetails();
  }, [productId]);

  const handleAddToCart = () => {
    navigate(`/checkout/${product?.id}`);
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const truncateString = (str, num) => {
    if (!str) return '';
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
    </div>
  );

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h2>
        <p className="text-gray-600 mb-6">Le produit que vous cherchez n'existe pas ou a été retiré.</p>
        <Button onClick={() => navigate('/shop')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la boutique
        </Button>
      </div>
    );
  }

  const productUrl = `https://spicorpinvest.com/product/${product.id}`;
  const fallbackImage = 'https://spicorpinvest.com/default-share.jpg';
  const imageUrl = product.image_url?.startsWith('http') ? product.image_url : fallbackImage;
  const metaDescription = truncateString(product.description || `Achetez ${product.name} sur Groupe SPI.`, 160);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 pb-20 pt-8"
    >
      <Helmet>
        <title>{product.name} | Groupe SPI</title>
        <meta name="description" content={metaDescription} />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={imageUrl} />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={productUrl} />
        <meta name="twitter:title" content={product.name} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>

      <div className="container-custom mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate('/shop')} className="mb-6 hover:bg-gray-100 pl-0">
          <ArrowLeft className="w-5 h-5 mr-2" /> Retour à la boutique
        </Button>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="bg-gray-100 h-[400px] lg:h-[600px] flex items-center justify-center relative group overflow-hidden">
              {product.image_url ? (
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src={product.image_url} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <ShoppingCart className="w-24 h-24 text-gray-300" />
              )}
            </div>

            <div className="p-8 lg:p-12 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {product.category || 'General'}
                  </Badge>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h1>
                <div className="text-3xl font-bold text-blue-600 mb-6">{formatPrice(product.price)}</div>
                <p className="text-gray-600 leading-relaxed text-lg mb-8">{product.description}</p>
              </div>

              <div className="mt-auto space-y-6">
                <Button size="lg" onClick={handleAddToCart} className="w-full text-lg h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all hover:shadow-lg">
                  {product.product_type === 'Louer' ? 'Louer maintenant' : product.product_type === 'Réserver' ? 'Réserver maintenant' : 'Commander maintenant'}
                </Button>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                   <div className="flex flex-col items-center text-center p-2">
                     <ShieldCheck className="w-6 h-6 text-green-500 mb-2" />
                     <span className="text-xs text-gray-500 font-medium">Paiement Sécurisé</span>
                   </div>
                   <div className="flex flex-col items-center text-center p-2">
                     <Truck className="w-6 h-6 text-blue-500 mb-2" />
                     <span className="text-xs text-gray-500 font-medium">Livraison Rapide</span>
                   </div>
                   <div className="flex flex-col items-center text-center p-2">
                     <Clock className="w-6 h-6 text-purple-500 mb-2" />
                     <span className="text-xs text-gray-500 font-medium">Support 24/7</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductDetailPage;