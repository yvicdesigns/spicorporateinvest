import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useBranchWhatsApp = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatNumber = (num) => {
    let cleaned = num.replace(/[^0-9]/g, '');
    if (cleaned.length === 9) {
      cleaned = '242' + cleaned;
    }
    return cleaned;
  };

  const getBranchWhatsApp = useCallback(async (branchId) => {
    if (!branchId) return null;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('branch_whatsapp_config')
        .select('*')
        .eq('pole_id', branchId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching branch WhatsApp config:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBranchWhatsApp = useCallback(async (branchId, config) => {
    try {
      setLoading(true);
      const payload = {
        pole_id: branchId,
        whatsapp_number: formatNumber(config.whatsapp_number),
        is_enabled: config.is_enabled !== undefined ? config.is_enabled : true,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('branch_whatsapp_config')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating branch WhatsApp config:', error);
      toast({
        title: "Error",
        description: "Failed to create configuration.",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateBranchWhatsApp = useCallback(async (branchId, config) => {
    try {
      setLoading(true);
      const payload = {
        pole_id: branchId,
        whatsapp_number: formatNumber(config.whatsapp_number),
        is_enabled: config.is_enabled !== undefined ? config.is_enabled : true,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('branch_whatsapp_config')
        .upsert(payload, { onConflict: 'pole_id' })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Branch WhatsApp configuration saved.",
      });
      return { success: true, data };
    } catch (error) {
      console.error('Error updating branch WhatsApp config:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration.",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    getBranchWhatsApp,
    createBranchWhatsApp,
    updateBranchWhatsApp
  };
};