import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useImageManager } from '@/hooks/useImageManager';
import { 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  MoveUp, 
  MoveDown, 
  Image as ImageIcon,
  Info,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';

const AboutManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    id: null,
    title: '',
    description: '',
    sections: []
  });
  
  // Section Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(null); // null = new, object = edit
  const [sectionForm, setSectionForm] = useState({
    id: '',
    title: '',
    content: '',
    image_url: '',
    display_order: 0
  });
  
  const { uploadBucketImage } = useImageManager();
  const { toast } = useToast();
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: result, error } = await supabase
        .from('about_content')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (result) {
        // Ensure sections is an array (handle legacy or null)
        const safeSections = Array.isArray(result.sections) ? result.sections : [];
        setData({ ...result, sections: safeSections });
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
      toast({
        title: "Error",
        description: "Failed to load content.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMainSave = async () => {
    try {
      setSaving(true);
      
      // Prepare payload. If id is null, we remove it so Supabase creates a new row
      // However, for upsert with a known table structure where we want a singleton, 
      // we can just pass the ID if it exists, or let it generate one.
      const payload = {
        title: data.title,
        description: data.description,
        sections: data.sections,
        updated_at: new Date().toISOString()
      };

      if (data.id) {
        payload.id = data.id;
      }

      const { data: savedData, error } = await supabase
        .from('about_content')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;

      // Update local state with the returned data (crucial for getting the new ID if it was an insert)
      if (savedData) {
        setData(prev => ({ ...prev, ...savedData }));
      }

      toast({
        title: "Success",
        description: "About page content saved successfully.",
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

  const openSectionDialog = (section = null) => {
    if (section) {
      setCurrentSection(section);
      setSectionForm({ ...section });
    } else {
      setCurrentSection(null);
      setSectionForm({
        id: crypto.randomUUID(),
        title: '',
        content: '',
        image_url: '',
        display_order: data.sections.length
      });
    }
    setIsDialogOpen(true);
  };

  const handleSectionImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadBucketImage(file, 'about-images', 'section');
      if (url) {
        setSectionForm(prev => ({ ...prev, image_url: url }));
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not upload image.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const saveSection = () => {
    if (!sectionForm.title) {
        toast({ title: "Validation Error", description: "Title is required", variant: "destructive" });
        return;
    }

    let newSections = [...data.sections];
    
    if (currentSection) {
      // Edit existing
      newSections = newSections.map(s => s.id === sectionForm.id ? sectionForm : s);
    } else {
      // Add new
      newSections.push(sectionForm);
    }

    // Sort by display order implicitly or keep array order
    setData(prev => ({ ...prev, sections: newSections }));
    setIsDialogOpen(false);
  };

  const deleteSection = (id) => {
    if (window.confirm('Delete this section?')) {
      const newSections = data.sections.filter(s => s.id !== id);
      setData(prev => ({ ...prev, sections: newSections }));
    }
  };

  const moveSection = (index, direction) => {
    const newSections = [...data.sections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    setData(prev => ({ ...prev, sections: newSections }));
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
      {/* Header Actions */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             <Info className="h-6 w-6 text-blue-600" /> About Page Manager
           </h2>
           <p className="text-sm text-gray-600 mt-1">Manage the company story, mission, and vision.</p>
        </div>
        <Button onClick={handleMainSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
           {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
           Save All Changes
        </Button>
      </div>

      {/* Main Content Form */}
      <Card className="rounded-xl shadow-lg border border-gray-100">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">Hero Section</CardTitle>
          <CardDescription>The main title and introduction displayed at the top of the page.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input 
              id="title" 
              value={data.title} 
              onChange={(e) => setData({...data, title: e.target.value})}
              className="font-bold text-lg"
              placeholder="e.g., Notre Histoire & Vision"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Main Description</Label>
            <Textarea 
              id="desc" 
              value={data.description} 
              onChange={(e) => setData({...data, description: e.target.value})}
              className="h-24"
              placeholder="Brief introduction..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections Manager */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Content Sections</h3>
            <Button onClick={() => openSectionDialog()} variant="outline" size="sm" className="bg-white text-blue-600 border-blue-300 hover:bg-blue-50">
                <Plus className="h-4 w-4 mr-2" /> Add Section
            </Button>
        </div>

        <div className="grid gap-4">
            <AnimatePresence>
                {data.sections.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-gray-500">
                        No sections added yet. Click "Add Section" to begin.
                    </div>
                ) : (
                    data.sections.map((section, index) => (
                        <motion.div 
                            key={section.id || index}
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center"
                        >
                             {/* Drag Handle / Order */}
                             <div className="flex md:flex-col gap-1">
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-gray-400 hover:text-blue-600"
                                    disabled={index === 0}
                                    onClick={() => moveSection(index, 'up')}
                                >
                                    <MoveUp className="h-4 w-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-gray-400 hover:text-blue-600"
                                    disabled={index === data.sections.length - 1}
                                    onClick={() => moveSection(index, 'down')}
                                >
                                    <MoveDown className="h-4 w-4" />
                                </Button>
                             </div>

                             {/* Image Preview */}
                             <div className="w-full md:w-32 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                {section.image_url ? (
                                    <img src={section.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon className="h-8 w-8" />
                                    </div>
                                )}
                             </div>

                             {/* Content */}
                             <div className="flex-grow min-w-0 text-center md:text-left">
                                <h4 className="font-bold text-gray-900">{section.title}</h4>
                                <p className="text-sm text-gray-500 line-clamp-2">{section.content}</p>
                             </div>

                             {/* Actions */}
                             <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => openSectionDialog(section)}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Button variant="destructive" size="icon" className="h-9 w-9" onClick={() => deleteSection(section.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                             </div>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* Edit Section Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{currentSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
                <DialogDescription>Add details for this specific block of content.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                        value={sectionForm.title} 
                        onChange={(e) => setSectionForm({...sectionForm, title: e.target.value})}
                        placeholder="Section Title"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea 
                        value={sectionForm.content} 
                        onChange={(e) => setSectionForm({...sectionForm, content: e.target.value})}
                        placeholder="Detailed text content..."
                        className="h-32"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Image</Label>
                    <div className="flex gap-4 items-start">
                        <div className="w-32 h-24 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                            {sectionForm.image_url ? (
                                <>
                                    <img src={sectionForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => setSectionForm({...sectionForm, image_url: ''})}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </>
                            ) : (
                                <ImageIcon className="h-8 w-8 text-gray-300" />
                            )}
                            {uploadingImage && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin h-5 w-5" /></div>}
                        </div>
                        <div className="flex-1 space-y-2">
                            <Input type="file" accept="image/*" onChange={handleSectionImageUpload} disabled={uploadingImage} />
                            <p className="text-xs text-gray-500">Supported formats: JPG, PNG, WEBP. Max 5MB.</p>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveSection} disabled={uploadingImage}>
                    {currentSection ? 'Update Section' : 'Add Section'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AboutManager;