import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useShopVisibility = () => {
  const [shopVisible, setShopVisible] = useState(false);
  const [shopVisibilityLoading, setShopVisibilityLoading] = useState(true);

  const refreshShopVisibility = useCallback(async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'shop_visibility')
      .maybeSingle();
    setShopVisible(data?.value?.visible === true);
    setShopVisibilityLoading(false);
  }, []);

  useEffect(() => { refreshShopVisibility(); }, [refreshShopVisibility]);

  const updateShopVisibility = useCallback(async (visible) => {
    const { error } = await supabase.from('site_settings').upsert({
      key: 'shop_visibility',
      value: { visible: Boolean(visible) },
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });
    if (!error) setShopVisible(Boolean(visible));
    return { error };
  }, []);

  return { shopVisible, shopVisibilityLoading, updateShopVisibility, refreshShopVisibility };
};
