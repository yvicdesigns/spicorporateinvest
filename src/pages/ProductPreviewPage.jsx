import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useSocialMetaTags } from '@/hooks/useSocialMetaTags';
import { SocialMetaTags } from '@/components/SocialMetaTagsHelper';
import { Loader2 } from 'lucide-react';

const ProductPreviewPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('product') || searchParams.get('id') || searchParams.get('productId');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const metaTags = useSocialMetaTags(product);

  useEffect(() => {
    if (!productId) {
      navigate('/boutique', { replace: true });
      return;
    }

    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (data && !error) {
          setProduct(data);
        }
      } catch (err) {
        console.error('Failed to fetch product for preview', err);
      } finally {
        setLoading(false);
        // Delay redirection to allow crawlers to read the meta tags
        setTimeout(() => {
          navigate(`/boutique/${productId}`, { replace: true });
        }, 2000);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      {metaTags && <SocialMetaTags tags={metaTags} />}
      
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
      <h1 className="text-xl font-semibold text-gray-800">Redirection vers le produit...</h1>
      <p className="text-gray-500 mt-2">Veuillez patienter pendant que nous vous redirigeons vers la page du produit.</p>
    </div>
  );
};

export default ProductPreviewPage;