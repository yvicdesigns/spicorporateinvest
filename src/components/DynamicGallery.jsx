import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { Loader2, ImageOff, ZoomIn, X, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const GalleryItem = ({ img, index, setSelectedIndex, variant = 'grid', totalImages }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"
      >
        <div className="text-center p-4">
            <ImageOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <span className="text-xs text-gray-400">Image unavailable</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      data-testid={`portfolio-item-${index}`}
      className={`group relative bg-gray-100 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 ${variant === 'editorial' ? `aspect-square rounded-xl md:aspect-auto md:rounded-2xl ${index >= 6 ? 'hidden' : index >= 4 ? 'hidden md:block' : ''} ${index === 0 ? 'md:col-span-2 md:row-span-2 md:min-h-[540px]' : 'md:min-h-[260px]'}` : 'aspect-square rounded-lg'}`}
      onClick={() => setSelectedIndex(index)}
    >
      <img
        src={img.image_url}
        alt={img.alt_text || img.title || 'Gallery image'}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        onError={() => setHasError(true)}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
        <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 w-8 h-8" />
      </div>
      {img.title && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-sm font-medium truncate">{img.title}</p>
        </div>
      )}
      {variant === 'editorial' && index === 3 && totalImages > 4 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-center text-white backdrop-blur-[1px] md:hidden">
          <div>
            <strong className="block text-2xl font-bold">+{totalImages - 4}</strong>
            <span className="text-xs font-medium uppercase tracking-wider">photos</span>
          </div>
        </div>
      )}
      {variant === 'editorial' && index === 5 && totalImages > 6 && (
        <div className="absolute inset-0 hidden items-center justify-center bg-black/55 text-center text-white backdrop-blur-[1px] md:flex">
          <div>
            <strong className="block text-3xl font-bold">+{totalImages - 6}</strong>
            <span className="text-sm font-medium uppercase tracking-wider">photos</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const DynamicGallery = ({ 
  tableName = 'website_images', 
  sectionFilter = 'gallery', 
  tagFilter = null,
  orderBy = 'display_order',
  variant = 'grid'
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [error, setError] = useState(null);
  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  const showPreviousImage = () => {
    setSelectedIndex((current) => (current - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    setSelectedIndex((current) => (current + 1) % images.length);
  };

  useEffect(() => {
    fetchImages();
  }, [tableName, sectionFilter, tagFilter, orderBy]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🖼️ DynamicGallery: Fetching from ${tableName} for section '${sectionFilter}'`);
      
      let query = supabase
        .from(tableName)
        .select('*')
        .eq('is_active', true);

      // Only apply section filter if provided
      if (sectionFilter) {
        query = query.ilike('section', `%${sectionFilter}%`);
      }

      // Apply tag filter ONLY if provided and not null
      if (tagFilter) {
        query = query.contains('tags', [tagFilter]);
      }

      // Apply sorting
      query = query.order(orderBy, { ascending: orderBy === 'display_order' });

      const { data, error } = await query;

      if (error) {
        // If sorting fails (e.g. column doesn't exist), try falling back to created_at
        if (error.code === '42703') { // Undefined column
             console.warn(`Sort column '${orderBy}' not found, falling back to created_at`);
             const { data: fallbackData, error: fallbackError } = await supabase
                .from(tableName)
                .select('*')
                .eq('is_active', true)
                .ilike('section', `%${sectionFilter}%`)
                .order('created_at', { ascending: false });
             
             if (fallbackError) throw fallbackError;
             setImages(fallbackData || []);
             return;
        }
        throw error;
      }
      
      console.log(`✅ DynamicGallery: Found ${data?.length || 0} images`);
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      setError("Failed to load gallery images. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-gray-50 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col justify-center items-center h-48 bg-red-50 rounded-lg border border-red-100 text-red-500 p-4">
            <AlertTriangle className="h-10 w-10 mb-2 opacity-50" />
            <p className="mb-4 text-center">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchImages} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
        </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
        <ImageOff className="h-10 w-10 mb-2 opacity-50" />
        <p>No images found in this gallery.</p>
      </div>
    );
  }

  return (
    <>
      <div className={variant === 'editorial' ? 'grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'}>
        {images.map((img, index) => (
          <GalleryItem 
            key={img.id} 
            img={img} 
            index={index} 
            setSelectedIndex={setSelectedIndex}
            variant={variant}
            totalImages={images.length}
          />
        ))}
      </div>
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 bg-transparent border-none shadow-none text-white overflow-hidden">
             <DialogTitle className="sr-only">{selectedImage?.title || 'Aperçu du portfolio'}</DialogTitle>
             <div className="relative w-full h-full flex items-center justify-center">
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative"
                    >
                         <img 
                            src={selectedImage.image_url} 
                            alt={selectedImage.alt_text || selectedImage.title || 'Full size view'} 
                            className="max-h-[85vh] w-auto max-w-full rounded-md shadow-2xl"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/800x600?text=Image+Load+Error';
                            }}
                        />
                        <button 
                            onClick={() => setSelectedIndex(null)}
                            className="absolute -top-4 -right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {(selectedImage.description || selectedImage.title) && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4 rounded-b-md">
                                {selectedImage.title && <h4 className="font-bold text-lg">{selectedImage.title}</h4>}
                                {selectedImage.description && <p className="text-sm text-gray-200">{selectedImage.description}</p>}
                            </div>
                        )}
                        {images.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={showPreviousImage}
                              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80 md:left-5 md:h-12 md:w-12"
                              aria-label="Image précédente"
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                              type="button"
                              onClick={showNextImage}
                              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80 md:right-5 md:h-12 md:w-12"
                              aria-label="Image suivante"
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                            <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                              {selectedIndex + 1} / {images.length}
                            </div>
                          </>
                        )}
                    </motion.div>
                )}
             </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DynamicGallery;
