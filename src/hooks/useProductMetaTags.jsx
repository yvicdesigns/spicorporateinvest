import React from 'react';
import { Helmet } from 'react-helmet';

// Although named as a hook file, we export a Component to properly use Helmet within the React tree
const ProductMetaTags = ({ product }) => {
  if (!product) {
    return (
      <Helmet>
        <title>SPI Shop | Products</title>
        <meta name="description" content="Discover our exclusive products." />
      </Helmet>
    );
  }

  const title = `${product.name} | SPI Shop`;
  const description = product.description || `Check out ${product.name} at SPI Shop`;
  const url = `${window.location.origin}/?product=${product.id}`;
  const image = product.image_url || '';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="product" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default ProductMetaTags;