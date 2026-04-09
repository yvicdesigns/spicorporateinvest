import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Mail, 
  Phone, 
  MapPin, 
  LayoutList, 
  FileText 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

const ContactManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const [data, setData] = useState({
    id: null,
    title: '',
    description: '',
    email: '',
    phone: '',
    address: 'Brazzaville, Centre-Ville, 4eme etage, tour Villarassie et Fils, face Radisson Bleue',
    map_lat: '-4.2634',
    map_lng: '15.2429',
    form_fields: [],
    is_active: true
  });

  const FIELD_TYPES = [
    { value: 'text', label: 'Single Line Text' },
    { value: 'textarea', label: 'Multi-line Text (Message)' },
    { value: 'email', label: 'Email Address' },
    { value: 'tel', label: 'Phone Number' },
    { value: 'number', label: 'Number' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('contact_content')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (result) {
        // Ensure form_fields is an array
        const safeFields = Array.isArray(result.form_fields) ? result.form_fields : [];
        setData(prev => ({ 
            ...prev, 
            ...result, 
            form_fields: safeFields,
            // Fallback to new default coordinates if not present
            map_lat: result.map_lat !== null ? result.map_lat : '-4.2634',
            map_lng: result.map_lng !== null ? result.map_lng : '15.2429'
        }));
      }
    } catch (error) {
      console.error('Error fetching contact content:', error);
      toast({
        title: "Error",
        description: "Failed to load content.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const payload = {
        title: data.title,
        description: data.description,
        email: data.email,
        phone: data.phone,
        address: data.address,
        map_lat: parseFloat(data.map_lat) || null,
        map_lng: parseFloat(data.map_lng) || null,
        form_fields: data.form_fields,
        is_active: data.is_active,
        updated_at: new Date().toISOString()
      };

      if (data.id) {
        payload.id = data.id;
      }

      const { data: savedData, error } = await supabase
        .from('contact_content')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;

      if (savedData) {
        setData(prev => ({ 
            ...prev, 
            ...savedData,
            map_lat: savedData.map_lat !== null ? savedData.map_lat : prev.map_lat,
            map_lng: savedData.map_lng !== null ? savedData.map_lng : prev.map_lng
        }));
      }

      toast({
        title: "Success",
        description: "Contact page configuration saved.",
      });
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Field Management
  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: ''
    };
    setData(prev => ({
      ...prev,
      form_fields: [...prev.form_fields, newField]
    }));
  };

  const updateField = (index, fieldKey, value) => {
    const newFields = [...data.form_fields];
    newFields[index] = { ...newFields[index], [fieldKey]: value };
    setData(prev => ({ ...prev, form_fields: newFields }));
  };

  const removeField = (index) => {
    if (window.confirm('Delete this field?')) {
      const newFields = data.form_fields.filter((_, i) => i !== index);
      setData(prev => ({ ...prev, form_fields: newFields }));
    }
  };

  const moveField = (index, direction) => {
    const newFields = [...data.form_fields];
    if (direction === 'up' && index > 0) {
      [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
    } else if (direction === 'down' && index < newFields.length - 1) {
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    }
    setData(prev => ({ ...prev, form_fields: newFields }));
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <Mail className="h-6 w-6 text-blue-600" /> Contact Page Manager
           </h2>
           <p className="text-sm text-gray-600 mt-1">Configure contact details and the inquiry form.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
           {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
           Save Changes
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
             <FileText className="h-4 w-4 mr-2" /> Page Content
          </TabsTrigger>
          <TabsTrigger value="form" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
             <LayoutList className="h-4 w-4 mr-2" /> Form Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
            <Card className="rounded-xl shadow-lg border border-gray-100">
                <CardHeader>
                    <CardTitle>Page Information</CardTitle>
                    <CardDescription>General information displayed on the contact page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Page Title</Label>
                        <Input 
                            value={data.title} 
                            onChange={(e) => setData({...data, title: e.target.value})}
                            placeholder="e.g., Contact Us"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                            value={data.description} 
                            onChange={(e) => setData({...data, description: e.target.value})}
                            placeholder="Introduction text..."
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-xl shadow-lg border border-gray-100">
                <CardHeader>
                    <CardTitle>Contact Details</CardTitle>
                    <CardDescription>How customers can reach you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</Label>
                            <Input 
                                value={data.email} 
                                onChange={(e) => setData({...data, email: e.target.value})}
                                placeholder="contact@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</Label>
                            <Input 
                                value={data.phone} 
                                onChange={(e) => setData({...data, phone: e.target.value})}
                                placeholder="+123 456 789"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Address</Label>
                        <Textarea 
                            value={data.address} 
                            onChange={(e) => setData({...data, address: e.target.value})}
                            placeholder="123 Street Name, City, Country"
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Latitude</Label>
                            <Input 
                                type="number"
                                step="any"
                                value={data.map_lat} 
                                onChange={(e) => setData({...data, map_lat: e.target.value})}
                                placeholder="-4.2634"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Longitude</Label>
                            <Input 
                                type="number"
                                step="any"
                                value={data.map_lng} 
                                onChange={(e) => setData({...data, map_lng: e.target.value})}
                                placeholder="15.2429"
                            />
                        </div>
                        <p className="col-span-2 text-xs text-gray-500">
                            Coordinates are used for the map display. Defaults to Brazzaville center if empty.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
            <Card className="rounded-xl shadow-lg border border-gray-100">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Form Fields</CardTitle>
                        <CardDescription>Customize the contact form fields.</CardDescription>
                    </div>
                    <Button onClick={addField} variant="outline" size="sm" className="bg-white text-blue-600 border-blue-300 hover:bg-blue-50">
                        <Plus className="h-4 w-4 mr-2" /> Add Field
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <AnimatePresence>
                            {data.form_fields.length === 0 ? (
                                <div className="text-center p-8 text-gray-500 border-2 border-dashed rounded-xl">
                                    No fields added yet.
                                </div>
                            ) : (
                                data.form_fields.map((field, index) => (
                                    <motion.div 
                                        key={field.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-start"
                                    >
                                        <div className="flex flex-col gap-1 mt-2">
                                            <Button size="icon" variant="ghost" className="h-6 w-6" disabled={index === 0} onClick={() => moveField(index, 'up')}><MoveUp className="h-3 w-3" /></Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6" disabled={index === data.form_fields.length - 1} onClick={() => moveField(index, 'down')}><MoveDown className="h-3 w-3" /></Button>
                                        </div>

                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500">Label</Label>
                                                <Input 
                                                    value={field.label} 
                                                    onChange={(e) => updateField(index, 'label', e.target.value)}
                                                    placeholder="Field Label"
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500">Type</Label>
                                                <Select value={field.type} onValueChange={(val) => updateField(index, 'type', val)}>
                                                    <SelectTrigger className="bg-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs text-gray-500">Placeholder</Label>
                                                <Input 
                                                    value={field.placeholder} 
                                                    onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                                                    placeholder="e.g. Enter value..."
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4 pt-6">
                                                <div className="flex items-center gap-2">
                                                    <Switch 
                                                        checked={field.required} 
                                                        onCheckedChange={(val) => updateField(index, 'required', val)}
                                                    />
                                                    <Label className="text-xs">Required</Label>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => removeField(index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ContactManager;