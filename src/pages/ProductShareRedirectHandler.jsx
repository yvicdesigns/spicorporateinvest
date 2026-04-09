import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ProductShareRedirectHandler = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (productId) {
      navigate(`/boutique/${productId}`, { replace: true });
    } else {
      navigate('/boutique', { replace: true });
    }
  }, [productId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
};

export default ProductShareRedirectHandler;