import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, MessageSquare, Layout } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from 'framer-motion';

// Custom TikTok Icon (since Lucide doesn't have it by default)
const TikTokIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19.5 2h-15C3.67 2 3 2.67 3 3.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5ZM13 18.25c0 .14-.11.25-.25.25H9.5c-.14 0-.25-.11-.25-.25V9.76c0-.14.11-.25.25-.25h3.25c.14 0 .25.11.25.25v8.49ZM15 7.75c0 .14-.11.25-.25.25h-3.5c-.14 0-.25-.11-.25-.25V3.76c0-.14.11-.25.25-.25h3.5c.14 0 .25.11.25.25v3.99Z" />
  </svg>
);


const FooterManager = ({ poles = [] }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedPoleId, setSelectedPoleId] = useState('global');
  const { toast } = useToast();
  
  // Default values for the content object
  const defaultContentData = {
    description_fr: '',
    description_en: '',
    email: '',
    phone: '',
    location_fr: '',
    location_en: '',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    tiktok_url: ''
  };

  // Form data state - flattened for easier binding
  const [formData, setFormData] = useState({
    id: null,
    pole_id: 'global',
    ...defaultContentData
  });

  // Combine static global option with dynamic poles
  const footerOptions = [
    { id: 'global', label: 'Global Site Footer' },
    ...poles.filter(p => p.id !== 'footer').map(p => ({ id: p.id, label: `${p.label} Footer` }))
  ];

  useEffect(() => {
    fetchConfig(selectedPoleId);
  }, [selectedPoleId]);

  const fetchConfig = async (poleId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('footer_configuration')
        .select('*')
        .eq('pole_id', poleId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching footer config:', error);
        toast({
            title: "Error",
            description: "Failed to load footer configuration.",
            variant: "destructive"
        });
        return;
      }
      
      if (data) {
        // Extract content from the JSONB column and merge with defaults
        const content = data.content || {};
        setFormData({
            id: data.id,
            pole_id: data.pole_id,
            ...defaultContentData,
            ...content
        });
      } else {
        // Reset form for this new pole, preserving the pole_id
        setFormData({ 
            id: null, 
            pole_id: poleId,
            ...defaultContentData 
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Separate metadata from content
      const { id, pole_id, ...contentFields } = formData;

      // Prepare data for upsert - putting all fields into 'content' JSONB
      const dataToSave = {
        pole_id: selectedPoleId,
        content: contentFields
      };

      // Include ID if it exists to ensure update instead of insert (though onConflict handles pole_id)
      if (id) {
          dataToSave.id = id;
      }

      const { data, error } = await supabase
        .from('footer_configuration')
        .upsert(dataToSave, { onConflict: 'pole_id' })
        .select()
        .single();

      if (error) throw error;

      if (data) {
          // Update state with saved data
          const content = data.content || {};
          setFormData({
              id: data.id,
              pole_id: data.pole_id,
              ...defaultContentData,
              ...content
          });
      }

      toast({
        title: "Success",
        description: `Footer for ${footerOptions.find(o => o.id === selectedPoleId)?.label} updated successfully!`,
      });
    } catch (error) {
      console.error('Error saving footer config:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Footer Settings</h2>
           <p className="text-sm text-gray-600 mt-1">Manage footer content and contact info for the site or specific branches.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
                <Layout className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <select 
                    className="h-10 w-[200px] md:w-[250px] rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
                    value={selectedPoleId}
                    onChange={(e) => setSelectedPoleId(e.target.value)}
                >
                    {footerOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                </select>
            </div>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
            </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-xl shadow-lg border border-gray-100">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="ml-3 text-lg text-gray-600">Loading footer data...</p>
        </div>
      ) : (
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <TabsTrigger value="general" className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-colors duration-200 rounded-lg">General & Contact</TabsTrigger>
          <TabsTrigger value="social" className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-colors duration-200 rounded-lg">Social Media</TabsTrigger>
          <TabsTrigger value="content" className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-colors duration-200 rounded-lg">Text Content</TabsTrigger>
        </TabsList>

        {/* General & Contact Tab */}
        <TabsContent value="general" className="mt-6">
          <Card className="rounded-xl shadow-lg border border-gray-100">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-bold text-gray-900">Contact Information</CardTitle>
              <CardDescription className="text-gray-600">
                Details displayed in the contact section of the footer for <strong className="text-blue-600">{footerOptions.find(o => o.id === selectedPoleId)?.label}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 font-medium">
                    <Mail className="w-4 h-4 text-blue-500" /> Email Address
                  </Label>
                  <Input 
                    id="email" 
                    name="email" 
                    value={formData.email || ''} 
                    onChange={handleInputChange} 
                    placeholder="contact@example.com"
                    className="border-gray-300 focus-visible:ring-blue-500 text-gray-900"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700 font-medium">
                    <Phone className="w-4 h-4 text-blue-500" /> Phone Number
                  </Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone || ''} 
                    onChange={handleInputChange} 
                    placeholder="+123 456 789"
                    className="border-gray-300 focus-visible:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                 <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Location / Address</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location_fr" className="flex items-center gap-2 text-gray-700 font-medium">
                        <MapPin className="w-4 h-4 text-blue-500" /> Address (French)
                      </Label>
                      <Input 
                        id="location_fr" 
                        name="location_fr" 
                        value={formData.location_fr || ''} 
                        onChange={handleInputChange} 
                        placeholder="Adresse en français"
                        className="border-gray-300 focus-visible:ring-blue-500 text-gray-900"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location_en" className="flex items-center gap-2 text-gray-700 font-medium">
                        <MapPin className="w-4 h-4 text-red-500" /> Address (English)
                      </Label>
                      <Input 
                        id="location_en" 
                        name="location_en" 
                        value={formData.location_en || ''} 
                        onChange={handleInputChange} 
                        placeholder="Address in English"
                        className="border-gray-300 focus-visible:ring-blue-500 text-gray-900"
                      />
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="mt-6">
          <Card className="rounded-xl shadow-lg border border-gray-100">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-bold text-gray-900">Social Media Links</CardTitle>
              <CardDescription className="text-gray-600">
                Links to your social profiles. Leave empty to hide the icon.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facebook_url" className="flex items-center gap-2 text-gray-700 font-medium">
                  <Facebook className="w-4 h-4 text-blue-600" /> Facebook URL
                </Label>
                <Input 
                  id="facebook_url" 
                  name="facebook_url" 
                  value={formData.facebook_url || ''} 
                  onChange={handleInputChange} 
                  placeholder="https://facebook.com/yourpage"
                  className="border-gray-300 focus-visible:ring-blue-500 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram_url" className="flex items-center gap-2 text-gray-700 font-medium">
                  <Instagram className="w-4 h-4 text-pink-600" /> Instagram URL
                </Label>
                <Input 
                  id="instagram_url" 
                  name="instagram_url" 
                  value={formData.instagram_url || ''} 
                  onChange={handleInputChange} 
                  placeholder="https://instagram.com/yourprofile"
                  className="border-gray-300 focus-visible:ring-blue-500 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url" className="flex items-center gap-2 text-gray-700 font-medium">
                  <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn URL
                </Label>
                <Input 
                  id="linkedin_url" 
                  name="linkedin_url" 
                  value={formData.linkedin_url || ''} 
                  onChange={handleInputChange} 
                  placeholder="https://linkedin.com/company/yourcompany"
                  className="border-gray-300 focus-visible:ring-blue-500 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok_url" className="flex items-center gap-2 text-gray-700 font-medium">
                  <TikTokIcon className="w-4 h-4 text-gray-800" /> TikTok URL
                </Label>
                <Input 
                  id="tiktok_url" 
                  name="tiktok_url" 
                  value={formData.tiktok_url || ''} 
                  onChange={handleInputChange} 
                  placeholder="https://tiktok.com/@yourprofile"
                  className="border-gray-300 focus-visible:ring-blue-500 text-gray-900"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Text Content Tab */}
        <TabsContent value="content" className="mt-6">
          <Card className="rounded-xl shadow-lg border border-gray-100">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-bold text-gray-900">Footer Description</CardTitle>
              <CardDescription className="text-gray-600">
                The short paragraph text displayed in the first column of the footer.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="space-y-2">
                  <Label htmlFor="description_fr" className="flex items-center gap-2 text-gray-700 font-medium">
                    <MessageSquare className="w-4 h-4 text-blue-500" /> Description (French)
                  </Label>
                  <Textarea 
                    id="description_fr" 
                    name="description_fr" 
                    value={formData.description_fr || ''} 
                    onChange={handleInputChange} 
                    placeholder="Description en français..."
                    className="h-28 border-gray-300 focus-visible:ring-blue-500 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 text-right">{formData.description_fr?.length || 0} characters</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description_en" className="flex items-center gap-2 text-gray-700 font-medium">
                    <MessageSquare className="w-4 h-4 text-red-500" /> Description (English)
                  </Label>
                  <Textarea 
                    id="description_en" 
                    name="description_en" 
                    value={formData.description_en || ''} 
                    onChange={handleInputChange} 
                    placeholder="Description in English..."
                    className="h-28 border-gray-300 focus-visible:ring-blue-500 text-gray-900"
                  />
                  <p className="text-xs text-gray-500 text-right">{formData.description_en?.length || 0} characters</p>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </motion.div>
  );
};

export default FooterManager;