import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

// Storage bucket for images
const STORAGE_BUCKET = 'pole-images';
// Table name
const TABLE_NAME = 'vision_images';

export const useImageManager = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleError = (error, action) => {
    console.error(`Error ${action}:`, error);
    
    let description = `Failed to ${action}.`;
    
    if (error?.message?.includes('Bucket not found') || error?.error === 'Bucket not found') {
        description = `Storage Error: The bucket '${STORAGE_BUCKET}' does not exist. Please configure your Supabase storage.`;
    } else if (error?.message) {
        description += ` ${error.message}`;
    }

    toast({
      title: "Operation Failed",
      description: description,
      variant: "destructive"
    });
    return null;
  };

  const fetchImages = useCallback(async ({ section, tag, limit } = {}) => {
    try {
      setLoading(true);
      let query = supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (section) {
        query = query.eq('section', section);
      }
      
      // Filter by tag if provided (using array containment)
      if (tag) {
        query = query.contains('tags', [tag]);
      }
      
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Ensure URLs point to the correct bucket (fix for potential legacy data)
      const fixedData = data?.map(img => ({
        ...img,
        image_url: img.image_url ? img.image_url.replace('vision-assets', STORAGE_BUCKET).replace('website-images', STORAGE_BUCKET) : img.image_url
      }));

      return fixedData || [];
    } catch (error) {
      return handleError(error, 'fetch images');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Generic upload function that strictly handles storage upload without DB side effects
  // Useful for independent tables like 'news'
  const uploadBucketImage = useCallback(async (file, bucketName, folderPath = 'uploads') => {
    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${folderPath}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      return handleError(error, 'upload bucket image');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const uploadImage = useCallback(async (file, metadata) => {
    try {
      setLoading(true);
      
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const folder = metadata.section || 'general';
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      // 2. Insert metadata into Database
      const { data, error: dbError } = await supabase
        .from(TABLE_NAME)
        .insert([{
          image_url: publicUrl,
          image_name: metadata.name || file.name,
          description: metadata.description || '',
          alt_text: metadata.alt_text || '',
          section: metadata.section || 'general',
          tags: metadata.tags || [],
          display_order: metadata.display_order || 0,
          is_active: true
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      toast({ title: "Success", description: "Image uploaded successfully" });
      return data;
    } catch (error) {
      return handleError(error, 'upload image');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const replaceBranchImage = useCallback(async (file, branchId, branchName) => {
     try {
        setLoading(true);
        const section = branchId === 'slider' ? 'slider' : 'branch_card';

        const metadata = {
            name: `${branchName} Main Image`,
            description: `Main display image for ${branchName}`,
            alt_text: branchName,
            section: section,
            tags: [branchId] 
        };

        let targetBucket = STORAGE_BUCKET;

        const fileExt = file.name.split('.').pop();
        const folder = section === 'slider' ? 'sliders' : 'branch_cards';
        const fileName = `${folder}/${branchId}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from(targetBucket)
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from(targetBucket)
            .getPublicUrl(fileName);

        const { data, error: dbError } = await supabase
            .from(TABLE_NAME)
            .insert([{
                image_url: publicUrl,
                image_name: metadata.name,
                description: metadata.description,
                alt_text: metadata.alt_text,
                section: metadata.section,
                tags: metadata.tags,
                is_active: true,
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (dbError) throw dbError;

        toast({ title: "Image Updated", description: `Successfully updated image for ${branchName}` });
        return data;

     } catch (error) {
         return handleError(error, 'replace branch image');
     } finally {
         setLoading(false);
     }
  }, [toast]);

  const updateImage = useCallback(async (id, updates) => {
    try {
      setLoading(true);
      const cleanUpdates = {
        image_name: updates.image_name,
        description: updates.description,
        alt_text: updates.alt_text,
        section: updates.section,
        tags: updates.tags,
        display_order: updates.display_order,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast({ title: "Success", description: "Image updated" });
      return data;
    } catch (error) {
      return handleError(error, 'update image');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteImage = useCallback(async (id, imageUrl) => {
    try {
      setLoading(true);
      const { error: dbError } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      if (imageUrl) {
        try {
            const url = new URL(imageUrl);
            const pathParts = url.pathname.split('/object/public/');
            if (pathParts.length > 1) {
                const fullPath = pathParts[1]; 
                const [bucket, ...rest] = fullPath.split('/');
                const filePath = rest.join('/');
                if (bucket && filePath) {
                     await supabase.storage.from(bucket).remove([filePath]);
                }
            }
        } catch (e) {
            console.warn("Could not parse image URL for deletion from storage", e);
        }
      }

      toast({ title: "Success", description: "Image deleted" });
      return true;
    } catch (error) {
      return handleError(error, 'delete image');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchImages,
    uploadImage,
    uploadBucketImage,
    replaceBranchImage,
    updateImage,
    deleteImage
  };
};