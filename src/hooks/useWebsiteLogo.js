import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useWebsiteLogo = () => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoSettings, setLogoSettings] = useState({
    width: 150,
    height: 'auto',
    opacity: 100,
    alignment: 'left',
    paddingX: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogo = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('website_logo')
        .select('logo_url, settings')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching logo:', error);
        setLogoUrl(null);
        return;
      }

      if (data && data.logo_url) {
        setLogoUrl(data.logo_url);
        if (data.settings) {
          // Merge defaults with fetched settings to ensure all keys exist
          setLogoSettings(prev => ({ ...prev, ...data.settings }));
        }
      } else {
        setLogoUrl(null);
      }
    } catch (error) {
      console.error('Unexpected error fetching logo:', error);
      setLogoUrl(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]);

  const uploadLogo = async (file, currentSettings = null) => {
    if (!file) return;

    try {
      setLoading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const bucketName = 'website-logo';

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // Use provided settings or fall back to current state
      const settingsToSave = currentSettings || logoSettings;

      const { error: dbError } = await supabase
        .from('website_logo')
        .insert([
          {
            logo_url: publicUrl,
            logo_name: file.name,
            settings: settingsToSave,
            updated_at: new Date().toISOString()
          }
        ]);

      if (dbError) throw dbError;

      setLogoUrl(publicUrl);
      if (currentSettings) setLogoSettings(currentSettings);
      
      toast({
        title: "Success",
        description: "Logo updated successfully.",
      });
      return publicUrl;

    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    if (!logoUrl) {
      toast({
        title: "Error",
        description: "No logo to update settings for.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // We insert a new record with the same URL but new settings to preserve history
      // First get the latest logo details to copy name/url
      const { data: currentLogo } = await supabase
        .from('website_logo')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!currentLogo) throw new Error("No logo found");

      const { error: dbError } = await supabase
        .from('website_logo')
        .insert([
          {
            logo_url: currentLogo.logo_url,
            logo_name: currentLogo.logo_name,
            settings: newSettings,
            updated_at: new Date().toISOString()
          }
        ]);

      if (dbError) throw dbError;

      setLogoSettings(newSettings);
      toast({
        title: "Settings Saved",
        description: "Logo appearance updated successfully.",
      });

    } catch (error) {
      console.error('Error updating logo settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteLogo = async () => {
    try {
      setLoading(true);
      const { error: dbError } = await supabase
        .from('website_logo')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); 

      if (dbError) throw dbError;

      setLogoUrl(null);
      setLogoSettings({ // Reset to defaults
        width: 150,
        height: 'auto',
        opacity: 100,
        alignment: 'left',
        paddingX: 0
      });
      toast({
        title: "Success",
        description: "Logo removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting logo:', error);
      toast({
        title: "Error",
        description: "Failed to remove logo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    logoUrl,
    logoSettings,
    loading,
    uploadLogo,
    updateSettings,
    deleteLogo,
    refreshLogo: fetchLogo
  };
};