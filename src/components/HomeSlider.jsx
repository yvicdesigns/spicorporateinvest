import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, FileSearch, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomeSlider = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchAndCombineImages = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      console.log('🔄 HomeSlider: Starting fetch...');

      // 1. Parallel Fetch: Storage files AND Database metadata
      const [storageResult, dbResult] = await Promise.all([
        supabase.storage
          .from('vision-assets')
          .list('slider', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
          }),
        supabase
          .from('vision_images')
          .select('*')
          .ilike('section', '%slider%') 
          .eq('is_active', true)
          .order('display_order', { ascending: true })
      ]);

      if (storageResult.error) throw new Error(`Storage Error: ${storageResult.error.message}`);
      
      const storageFiles = storageResult.data || [];
      const dbRecords = dbResult.data || [];

      console.log(`📊 Fetch Complete: Found ${dbRecords.length} DB records and ${storageFiles.length} storage files.`);

      // 2. Filter valid image files
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const validStorageFiles = storageFiles.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return imageExtensions.includes(ext) && file.metadata;
      });

      // 3. Prepare Storage Map
      const fileMap = new Map();
      validStorageFiles.forEach(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('vision-assets')
          .getPublicUrl(`slider/${file.name}`);
        
        fileMap.set(file.name, { ...file, publicUrl });
      });

      const finalImages = [];
      const processedFileNames = new Set();
      const getBaseName = (name) => name ? name.split('.')[0] : '';

      // 4. Match DB Records to Storage Files
      dbRecords.forEach(record => {
        let matchedFile = null;

        // Priority 1: Exact Image Name
        if (record.image_name && fileMap.has(record.image_name)) {
          matchedFile = fileMap.get(record.image_name);
        }

        // Priority 2: Base Name (DB 'foo' matches Storage 'foo.jpg')
        if (!matchedFile && record.image_name) {
          for (const [fileName, file] of fileMap.entries()) {
            if (getBaseName(fileName) === record.image_name) {
              matchedFile = file;
              break;
            }
          }
        }

        // Priority 3: URL Matching (DB url contains storage filename)
        if (!matchedFile && record.image_url) {
          for (const [fileName, file] of fileMap.entries()) {
            if (record.image_url.includes(fileName)) {
              matchedFile = file;
              break;
            }
            if (record.image_url.includes(getBaseName(fileName))) {
              matchedFile = file;
              break;
            }
          }
        }

        // If we found a file for this record
        if (matchedFile) {
          finalImages.push({
            id: record.id,
            title: record.title && record.title.trim() !== '' 
              ? record.title 
              : getBaseName(matchedFile.name).replace(/[-_]/g, ' '),
            description: record.description || '',
            image_url: matchedFile.publicUrl,
            image_name: matchedFile.name,
            alt_text: record.alt_text || record.title || matchedFile.name,
            display_order: record.display_order ?? 9999,
            source: 'database'
          });
          processedFileNames.add(matchedFile.name);
        } else if (record.image_url && record.image_url.startsWith('http')) {
            // Priority 4: If it's a full URL record without storage match
            finalImages.push({
              id: record.id,
              title: record.title || 'Untitled',
              description: record.description || '',
              image_url: record.image_url,
              image_name: record.image_name || 'external',
              alt_text: record.alt_text || record.title,
              display_order: record.display_order ?? 9999,
              source: 'database-url-only'
            });
        }
      });

      // 5. Add Orphaned Files
      validStorageFiles.forEach(file => {
        if (!processedFileNames.has(file.name)) {
          const cleanName = getBaseName(file.name).replace(/[-_]/g, ' ');
          finalImages.push({
            id: file.id,
            title: cleanName,
            description: '', 
            image_url: fileMap.get(file.name).publicUrl,
            image_name: file.name,
            alt_text: file.name,
            display_order: 10000,
            source: 'storage'
          });
        }
      });

      // 6. Sort
      finalImages.sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        return a.image_name.localeCompare(b.image_name);
      });

      console.log(`✅ Loaded ${finalImages.length} images`);
      setImages(finalImages);

    } catch (error) {
      console.error('❌ HomeSlider Error:', error);
      setFetchError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndCombineImages();
  }, []);

  // Auto-play
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => handleNext(), 6000);
    return () => clearInterval(interval);
  }, [images.length, currentIndex]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const containerStyle = {
    height: '400px',
    aspectRatio: '19/9',
    width: 'auto', 
    maxWidth: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center bg-black rounded-2xl mx-auto overflow-hidden" style={containerStyle}>
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Loading visuals...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
        <div className="bg-red-50/50 rounded-2xl flex flex-col items-center justify-center text-red-500 p-6 mx-auto backdrop-blur-sm" style={containerStyle}>
            <AlertCircle className="h-10 w-10 mb-2" />
            <p className="font-medium mb-4">Visuals Unavailable</p>
            <Button variant="outline" size="sm" onClick={fetchAndCombineImages} className="bg-white/80 hover:bg-white">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
        </div>
    );
  }

  if (images.length === 0) {
    return (
        <div className="bg-gray-100/50 rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8 mx-auto" style={containerStyle}>
            <FileSearch className="h-12 w-12 mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700">No Images Found</h3>
        </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="flex justify-center w-full py-8">
        <div className="relative overflow-hidden rounded-2xl group isolate bg-black mx-auto" style={containerStyle}>
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
            key={`${currentImage.id}-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
            >
            <img
                src={currentImage.image_url}
                alt={currentImage.alt_text}
                className="w-full h-full object-cover block"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute inset-0 p-6 md:p-10 md:pb-20 z-10 w-full pointer-events-none flex flex-col justify-start md:justify-end">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 md:mt-0" 
                >
                    <h3 className="text-xl md:text-2xl font-bold drop-shadow-lg tracking-tight text-white capitalize">
                        {currentImage.title}
                    </h3>
                    {currentImage.description && (
                        <p className="text-sm opacity-90 text-gray-100 mt-1 font-medium drop-shadow-md max-w-2xl">
                            {currentImage.description}
                        </p>
                    )}
                </motion.div>
            </div>
            </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
            <>
                <div className="absolute bottom-14 right-6 flex gap-3 z-20 md:bottom-20 md:right-6">
                <Button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full p-0 h-10 w-10 border border-white/10 transition-all hover:scale-105 shadow-lg"
                    size="icon"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full p-0 h-10 w-10 border border-white/10 transition-all hover:scale-105 shadow-lg"
                    size="icon"
                >
                    <ArrowRight className="h-5 w-5" />
                </Button>
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 md:hidden pointer-events-none">
                    {images.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all shadow-sm ${idx === currentIndex ? 'bg-white w-6 shadow-sm' : 'bg-white/40 w-2'}`} />
                    ))}
                </div>
            </>
        )}
        </div>
    </div>
  );
};

export default HomeSlider;