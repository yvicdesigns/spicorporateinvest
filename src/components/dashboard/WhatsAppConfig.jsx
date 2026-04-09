import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { MessageCircle, Save, Loader2, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBranchWhatsApp } from '@/hooks/useBranchWhatsApp';
import { SHOP_BRANCHES } from '@/lib/shopConstants';

const WhatsAppConfig = () => {
  const [selectedBranch, setSelectedBranch] = useState(SHOP_BRANCHES[0].id);
  const [config, setConfig] = useState({ whatsapp_number: '', is_enabled: true });
  const { getBranchWhatsApp, updateBranchWhatsApp, loading } = useBranchWhatsApp();
  const { toast } = useToast();

  useEffect(() => {
    loadBranchConfig(selectedBranch);
  }, [selectedBranch]);

  const loadBranchConfig = async (branchId) => {
    const data = await getBranchWhatsApp(branchId);
    if (data) {
      setConfig({
        whatsapp_number: data.whatsapp_number || '',
        is_enabled: data.is_enabled
      });
    } else {
      setConfig({ whatsapp_number: '', is_enabled: true });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (config.is_enabled && config.whatsapp_number) {
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
    await updateBranchWhatsApp(selectedBranch, config);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="shadow-lg border-t-4 border-t-green-500">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-3 rounded-full">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">WhatsApp Routing</CardTitle>
              <CardDescription>
                Configure specific WhatsApp contact numbers per branch.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label>Select Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {SHOP_BRANCHES.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base text-gray-900 font-semibold">Enable WhatsApp Contact</Label>
                  <p className="text-sm text-gray-500">Allow customers to contact this branch via WhatsApp.</p>
                </div>
                <Switch 
                  checked={config.is_enabled}
                  onCheckedChange={(val) => setConfig({...config, is_enabled: val})}
                />
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Label htmlFor="whatsapp_number" className="text-gray-700 font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4" /> WhatsApp Number
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+</span>
                  <Input
                    id="whatsapp_number"
                    type="text"
                    placeholder="242XXXXXXXXX"
                    className={`pl-8 ${!config.is_enabled ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-900'} border-gray-300 focus:ring-green-500`}
                    value={config.whatsapp_number}
                    onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })}
                    disabled={!config.is_enabled}
                  />
                </div>
                <p className="text-xs text-gray-500">12 digits starting with 242 (Congo Brazzaville).</p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WhatsAppConfig;