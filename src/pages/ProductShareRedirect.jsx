import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductShareRedirect = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (productId) {
      // Redirect to the shop page with the product ID in the query string
      navigate(`/shop?product=${productId}`, { replace: true });
    } else {
      navigate('/shop', { replace: true });
    }
  }, [productId, navigate]);

  return null;
};

export default ProductShareRedirect;