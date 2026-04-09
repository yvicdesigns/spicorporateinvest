import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProductRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const productId = searchParams.get('product');
    // Simulated small delay to show loading state if needed, though usually instant
    const timer = setTimeout(() => {
      if (productId) {
        navigate(`/boutique/${productId}`, { replace: true });
      } else {
        navigate('/boutique', { replace: true });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 font-medium">Redirection en cours...</p>
      </div>
    </div>
  );
};

export default ProductRedirectPage;