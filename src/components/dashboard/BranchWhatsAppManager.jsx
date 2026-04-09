import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, MessageCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { SHOP_BRANCHES } from '@/lib/shopConstants';
import { useBranchWhatsApp } from '@/hooks/useBranchWhatsApp';

const BranchWhatsAppManager = () => {
  const [configs, setConfigs] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const { updateBranchWhatsApp, loading: saving } = useBranchWhatsApp();
  const { toast } = useToast();

  useEffect(() => {
    fetchAllConfigs();
  }, []);

  const fetchAllConfigs = async () => {
    try {
      setInitialLoading(true);
      const { data, error } = await supabase
        .from('branch_whatsapp_config')
        .select('*');

      if (error) throw error;
      
      const configMap = {};
      if (data) {
        data.forEach(item => {
          configMap[item.pole_id] = item;
        });
      }
      
      // Initialize state for all branches, merging fetched data
      const initialState = {};
      SHOP_BRANCHES.forEach(branch => {
        initialState[branch.id] = {
          pole_id: branch.id,
          whatsapp_number: configMap[branch.id]?.whatsapp_number || '',
          is_enabled: configMap[branch.id]?.is_enabled !== false // Default true
        };
      });
      
      setConfigs(initialState);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast({
        title: "Error",
        description: "Failed to load branch WhatsApp configurations.",
        variant: "destructive"
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleConfigChange = (branchId, field, value) => {
    setConfigs(prev => ({
      ...prev,
      [branchId]: {
        ...prev[branchId],
        [field]: value
      }
    }));
  };

  const handleSave = async (branchId) => {
    const config = configs[branchId];
    
    if (config.is_enabled && !config.whatsapp_number) {
      toast({
        title: "Validation Error",
        description: "WhatsApp number is required when enabled.",
        variant: "destructive"
      });
      return;
    }

    if (config.whatsapp_number) {
      let cleanedNumber = config.whatsapp_number.replace(/[^0-9]/g, '');
      if (cleanedNumber.length === 9) cleanedNumber = '242' + cleanedNumber;
      
      if (!cleanedNumber.startsWith('242') || cleanedNumber.length !== 12) {
        toast({
          title: "Validation Error",
          description: "Number must start with 242 and contain exactly 9 digits (format: 242XXXXXXXXX).",
          variant: "destructive"
        });
        return;
      }
      config.whatsapp_number = cleanedNumber;
    }

    await updateBranchWhatsApp(branchId, config);
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin h-8 w-8 text-green-500" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
        <div className="bg-green-100 p-3 rounded-full">
          <MessageCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Branch WhatsApp Settings</h2>
          <p className="text-gray-600">Manage individual WhatsApp contact numbers for each shop branch.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {SHOP_BRANCHES.map(branch => {
          const config = configs[branch.id];
          return (
            <Card key={branch.id} className="shadow-md overflow-hidden hover:shadow-lg transition-shadow border-t-4 border-t-green-500">
              <CardHeader className="bg-gray-50 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{branch.name}</CardTitle>
                    <CardDescription>ID: {branch.id}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={config.is_enabled}
                      onCheckedChange={(val) => handleConfigChange(branch.id, 'is_enabled', val)}
                    />
                    <Label className="text-xs font-medium cursor-pointer">
                      {config.is_enabled ? 'Active' : 'Disabled'}
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" /> WhatsApp Number
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+</span>
                      <Input
                        type="text"
                        placeholder="242XXXXXXXXX"
                        className={`pl-8 ${!config.is_enabled ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-gray-900 border-gray-300'} focus:ring-green-500`}
                        value={config.whatsapp_number}
                        onChange={(e) => handleConfigChange(branch.id, 'whatsapp_number', e.target.value)}
                        disabled={!config.is_enabled}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500">Must be exactly 12 digits starting with 242</p>
                  </div>
                  <Button 
                    onClick={() => handleSave(branch.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    disabled={saving || (!config.is_enabled && !config.whatsapp_number && configs[branch.id].whatsapp_number === '')}
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Branch Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BranchWhatsAppManager;