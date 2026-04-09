import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Trash2, Upload, Plus, FileImage as ImageIcon, Layout, Type, Edit, Save, ImagePlus, MonitorPlay, Star, Info, PanelTop, Grid, RefreshCw, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";

const PoleManager = ({ poleName, tableName, bucketName = 'pole-images' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  
  // New state for image replacement
  const [replacingImageItem, setReplacingImageItem] = useState(null);
  const [replacingImageFile, setReplacingImageFile] = useState(null);

  const { toast } = useToast();

  // Form State
  const [newItem, setNewItem] = useState({
    sections: ['gallery'], 
    title: '',
    description: '',
    image: null,
    targetBranch: '' // For Branch Cards
  });

  // Defined sections available in the system
  const availableSections = [
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'slider', label: 'Slider', icon: MonitorPlay },
    { id: 'hero', label: 'Hero', icon: PanelTop },
    { id: 'branch_card', label: 'Branch Card', icon: LayoutTemplate },
    { id: 'features', label: 'Features', icon: Star },
    { id: 'about', label: 'About', icon: Info },
    { id: 'branch_details', label: 'Branch Details', icon: Grid }
  ];

  // Branch IDs for tagging
  const branchIds = [
    { id: 'sci-renaissance', label: 'SCI Renaissance' },
    { id: 'sci-espoir', label: 'Fondation SPI' },
    { id: 'nouveau-concept', label: 'Nouveau Concept' },
    { id: 'atelier-5', label: 'Atelier 5' },
    { id: 'la-manne', label: 'La Manne' },
    { id: 'spi-alim', label: 'SPI Alim' }
  ];

  const getSectionIcon = (sectionId) => {
    const section = availableSections.find(s => s.id === sectionId);
    const Icon = section ? section.icon : Layout;
    return <Icon className="w-3 h-3" />;
  };

  useEffect(() => {
    fetchItems();
  }, [tableName]);

  const parseSections = (sectionData) => {
    if (!sectionData) return [];
    if (sectionData === 'nouveau_concept') return ['nouveau_concept'];

    try {
      const parsed = JSON.parse(sectionData);
      if (Array.isArray(parsed)) return parsed;
      return [sectionData]; 
    } catch (e) {
      return [sectionData];
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Failed to load content. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file, sectionPrefix = 'general') => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${sectionPrefix}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

        if (uploadError) {
            if (uploadError.message.includes('Bucket not found') || uploadError.error === 'Bucket not found') {
                throw new Error(`Storage bucket '${bucketName}' not found.`);
            }
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
  };

  const handleSyncFromBucket = async () => {
    if (!bucketName) {
      toast({ title: "Configuration Error", description: "No bucket configured for this section.", variant: "destructive" });
      return;
    }
    if (!window.confirm(`This will scan the storage bucket '${bucketName}' and add any missing images to the database. Continue?`)) {
      return;
    }

    try {
      setIsSyncing(true);
      let createdCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      const foldersToScan = ['', 'gallery', 'slider', 'hero', 'features', 'branch_card', 'about', 'branch_details', 'uploads', 'general'];
      if (tableName === 'nouveau_concept_content') foldersToScan.push('nouveau_concept');

      const { data: existingRecords, error: dbError } = await supabase
        .from(tableName)
        .select('image_url');
      
      if (dbError) throw dbError;
      
      const existingUrls = new Set(existingRecords?.map(r => r.image_url) || []);

      for (const folder of foldersToScan) {
        const { data: files, error: listError } = await supabase
          .storage
          .from(bucketName)
          .list(folder, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });

        if (listError) continue;
        if (!files || files.length === 0) continue;

        for (const file of files) {
          if (file.name.startsWith('.')) continue; 
          if (file.id === null) continue; 

          const filePath = folder ? `${folder}/${file.name}` : file.name;
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

          if (existingUrls.has(publicUrl)) {
            skippedCount++;
            continue;
          }

          const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const title = cleanName.replace(/[-_]/g, ' ');
          
          let sectionValue;
          if (tableName === 'nouveau_concept_content') {
             sectionValue = "nouveau_concept"; 
          } else {
             const mappedSection = availableSections.find(s => s.id === folder);
             sectionValue = mappedSection ? JSON.stringify([mappedSection.id]) : JSON.stringify(['gallery']);
          }

          const { error: insertError } = await supabase
            .from(tableName)
            .insert({
              image_url: publicUrl,
              title: title,
              description: "",
              section: sectionValue,
              category: 'image',
              is_active: true,
              content: ""
            });

          if (insertError) {
            console.error(`Failed to insert ${filePath}:`, insertError);
            errorCount++;
          } else {
            createdCount++;
            existingUrls.add(publicUrl);
          }
        }
      }

      toast({
        title: "Sync Complete",
        description: `Added ${createdCount} new images. Skipped ${skippedCount} existing.`,
        variant: errorCount > 0 ? "warning" : "default"
      });

      if (createdCount > 0) fetchItems();

    } catch (error) {
      console.error("Sync Critical Error:", error);
      toast({ title: "Sync Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleSection = (sectionId, isEditing = false) => {
    if (isEditing && editingItem) {
      let currentSections = parseSections(editingItem.section);
      const newSections = currentSections.includes(sectionId)
        ? currentSections.filter(id => id !== sectionId)
        : [...currentSections, sectionId];
      
      // If we are unchecking branch_card, maybe clear tags? Keeping it simple for now.
      setEditingItem({ ...editingItem, section: JSON.stringify(newSections) });
    } else {
      const currentSections = newItem.sections;
      const newSections = currentSections.includes(sectionId)
        ? currentSections.filter(id => id !== sectionId)
        : [...currentSections, sectionId];
      
      setNewItem({ ...newItem, sections: newSections });
      
      // Clear target branch if branch_card is unchecked
      if (!newSections.includes('branch_card')) {
        setNewItem(prev => ({ ...prev, targetBranch: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newItem.image && !newItem.title) {
        toast({ title: "Validation Error", description: "Please provide at least a title or an image.", variant: "destructive" });
        return;
    }

    if (newItem.sections.length === 0) {
      toast({ title: "Validation Error", description: "Please select at least one section.", variant: "destructive" });
      return;
    }

    // Validation for Branch Card
    if (newItem.sections.includes('branch_card') && !newItem.targetBranch) {
        toast({ title: "Validation Error", description: "Please select an Associated Branch for the Branch Card.", variant: "destructive" });
        return;
    }

    try {
      setUploading(true);
      let imageUrl = null;
      const folderPrefix = newItem.sections[0] || 'uploads';

      if (newItem.image) {
        imageUrl = await handleImageUpload(newItem.image, folderPrefix);
      }

      const finalSection = tableName === 'nouveau_concept_content' ? "nouveau_concept" : JSON.stringify(newItem.sections);
      
      // Prepare payload
      const payload = {
        section: finalSection, 
        title: newItem.title,
        description: newItem.description,
        image_url: imageUrl,
        is_active: true,
      };

      // Add tag if Branch Card and table supports it (vision_images does)
      if (newItem.sections.includes('branch_card') && newItem.targetBranch) {
          payload.tags = [newItem.targetBranch];
      }

      const { error } = await supabase
        .from(tableName)
        .insert([payload]);

      if (error) throw error;

      toast({ title: "Success", description: "Content added successfully!" });
      setNewItem({ sections: ['gallery'], title: '', description: '', image: null, targetBranch: '' });
      const fileInput = document.getElementById(`file-upload-${poleName}`);
      if(fileInput) fileInput.value = "";
      
      fetchItems();
    } catch (error) {
      console.error('Error saving content:', error);
      toast({ title: "Error", description: error.message || "Failed to save content", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const currentSections = parseSections(editingItem.section);
    if (currentSections.length === 0) {
      toast({ title: "Validation Error", description: "Please select at least one section.", variant: "destructive" });
      return;
    }

    try {
      setUploading(true);
      const normalizedSections = currentSections.map(s => s.toLowerCase());
      const finalSection = tableName === 'nouveau_concept_content' ? "nouveau_concept" : JSON.stringify(normalizedSections);

      const updateData = {
        title: editingItem.title,
        description: editingItem.description,
        section: finalSection, 
        is_active: editingItem.is_active !== undefined ? editingItem.is_active : true,
        updated_at: new Date().toISOString()
      };

      // Update tags if editing item has branch_card section
      if (currentSections.includes('branch_card') && editingItem.tags) {
         updateData.tags = editingItem.tags;
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', editingItem.id);

      if (error) throw error;

      toast({ title: "Success", description: `Content updated successfully!`, variant: "default" });
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({ title: "Error", description: "Error updating content: " + error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleReplaceImageSubmit = async (e) => {
    e.preventDefault();
    if (!replacingImageItem || !replacingImageFile) return;

    try {
      setUploading(true);
      const sections = parseSections(replacingImageItem.section);
      const prefix = sections[0] || 'uploads';
      const imageUrl = await handleImageUpload(replacingImageFile, prefix);

      const { error } = await supabase
        .from(tableName)
        .update({
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', replacingImageItem.id);

      if (error) throw error;

      toast({ title: "Success", description: "Image replaced successfully!" });
      setReplacingImageItem(null);
      setReplacingImageFile(null);
      fetchItems();
    } catch (error) {
      console.error('Error replacing image:', error);
      toast({ title: "Error", description: error.message || "Failed to replace image.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // eslint-disable-next-line no-restricted-globals
      if (window.confirm('Are you sure you want to delete this item?')) {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) throw error;
        toast({ title: "Deleted", description: "Item removed successfully." });
        setItems(items.filter(item => item.id !== id));
      }
    } catch (error) {
       console.error('Error deleting:', error);
       toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
    }
  };

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => {
        const itemSections = parseSections(item.section);
        return itemSections.some(s => s.toLowerCase() === filter.toLowerCase());
      });

  // Helper to determine if we should show tags input
  const supportsTags = tableName === 'vision_images' || tableName === 'website_images';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
      
      {/* Add Content Form */}
      <Card className="p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <Plus className="w-6 h-6 text-blue-600" />
                Add New Content for {poleName}
            </h3>
            
            <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSyncFromBucket} 
                disabled={isSyncing || loading || uploading}
                title="Scan bucket for missing images"
                className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 shadow-sm"
            >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync from Bucket'}
            </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-medium text-gray-700">Sections (Select where this content appears)</Label>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 border p-4 rounded-lg bg-gray-50/50 shadow-inner">
                {availableSections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`section-${section.id}`} 
                      checked={newItem.sections.includes(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                      className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                    />
                    <Label 
                      htmlFor={`section-${section.id}`} 
                      className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2 text-gray-700"
                    >
                      {React.createElement(section.icon, { className: "w-3.5 h-3.5 text-gray-500" })}
                      {section.label}
                    </Label>
                  </div>
                ))}
              </div>
              
              {/* Conditional Tag Input for Branch Cards */}
              {supportsTags && newItem.sections.includes('branch_card') && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2"
                >
                    <Label className="text-blue-700 font-semibold mb-1 block">Associated Branch (Required for Branch Cards)</Label>
                    <Select 
                        value={newItem.targetBranch} 
                        onValueChange={(val) => setNewItem({...newItem, targetBranch: val})}
                    >
                        <SelectTrigger className="border-blue-200 bg-blue-50">
                            <SelectValue placeholder="Select which branch this image represents" />
                        </SelectTrigger>
                        <SelectContent>
                            {branchIds.map(branch => (
                                <SelectItem key={branch.id} value={branch.id}>{branch.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-blue-600 mt-1">This ensures the image appears on the correct card on the homepage.</p>
                </motion.div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <Label htmlFor="title" className="text-gray-700 font-medium">Title</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="e.g., Main Visual"
                className="border-gray-300 text-gray-900"
              />
               <div className="space-y-2 mt-4">
                <Label htmlFor="file-upload" className="text-gray-700 font-medium">Image Upload</Label>
                <div className="flex gap-2 items-center">
                    <Input
                    id={`file-upload-${poleName}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })}
                    className="cursor-pointer border-gray-300 text-gray-900"
                    />
                </div>
                <p className="text-xs text-gray-500">Supported formats: JPG, PNG, WEBP. Max size: 5MB</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
            <Textarea
              id="description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="A brief description..."
              className="h-28 border-gray-300 text-gray-900"
            />
          </div>

          <Button type="submit" disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {uploading ? 'Uploading...' : 'Add Content Item'}
          </Button>
        </form>
      </Card>

      {/* Content List */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <Layout className="w-6 h-6 text-gray-600" />
                Existing Content
                <span className="text-base font-normal text-gray-500 ml-2">({items.length} items)</span>
            </h3>
            
            <div className="w-full md:w-auto overflow-x-auto">
                <Tabs value={filter} onValueChange={setFilter} className="w-full">
                    <TabsList className="inline-flex w-auto min-w-full md:min-w-0 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                        <TabsTrigger value="all" className="text-xs md:text-sm px-3 py-1.5">All</TabsTrigger>
                        {availableSections.map(section => (
                          <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-1.5 text-xs md:text-sm px-3 py-1.5">
                             {React.createElement(section.icon, { className: "w-3 h-3" })}
                             {section.label}
                          </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>
        </div>

        {loading ? (
           <div className="flex justify-center p-12 bg-gray-50 rounded-xl"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => {
                const itemSections = parseSections(item.section);
                const isNouveauConcept = itemSections.includes('nouveau_concept') && itemSections.length === 1;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
                  >
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Type className="w-12 h-12 mb-2 opacity-50" />
                            <span className="text-sm font-medium">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                          {isNouveauConcept ? (
                            <span className="text-xs px-2 py-1 rounded-full uppercase font-bold shadow-md bg-purple-600/90 text-white backdrop-blur-sm">Nouveau Concept</span>
                          ) : (
                             itemSections.slice(0, 3).map(sectionId => (
                                <span key={sectionId} className={`text-xs px-2 py-1 rounded-full uppercase font-bold shadow-md flex items-center gap-1 bg-blue-600/90 text-white backdrop-blur-sm`}>
                                    {getSectionIcon(sectionId)}
                                    {sectionId.replace('_', ' ')}
                                </span>
                             ))
                          )}
                      </div>
                      {/* Show associated branch if available */}
                      {item.tags && item.tags.length > 0 && (
                          <div className="absolute bottom-3 left-3">
                              <span className="text-xs px-2 py-1 rounded bg-black/60 text-white backdrop-blur-sm border border-white/20">
                                  {branchIds.find(b => b.id === item.tags[0])?.label || item.tags[0]}
                              </span>
                          </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-lg text-gray-900 mb-2 truncate" title={item.title}>{item.title || 'Untitled'}</h4>
                      <div className="flex justify-between items-center border-t border-gray-100 pt-4 gap-2">
                         <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                         <div className="flex gap-2">
                              <Button variant="outline" size="icon" className="h-8 w-8 text-green-600" onClick={() => setReplacingImageItem(item)}>
                                  <ImagePlus className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600" onClick={() => setEditingItem(item)}>
                                  <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredItems.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-lg font-medium">No content found for this filter.</p>
                </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[550px] bg-white">
            <DialogHeader>
            <DialogTitle>Edit Content Details</DialogTitle>
            <DialogDescription>Update the metadata for this item.</DialogDescription>
            </DialogHeader>
            {editingItem && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
                <div className="space-y-3">
                    <Label>Sections</Label>
                    <div className="grid grid-cols-2 gap-3 border p-3 rounded-lg bg-gray-50">
                        {availableSections.map((section) => (
                        <div key={section.id} className="flex items-center space-x-2">
                            <Checkbox 
                            id={`edit-section-${section.id}`} 
                            checked={parseSections(editingItem.section).includes(section.id)}
                            onCheckedChange={() => toggleSection(section.id, true)}
                            />
                            <Label htmlFor={`edit-section-${section.id}`} className="text-sm cursor-pointer">{section.label}</Label>
                        </div>
                        ))}
                    </div>
                     {/* Edit Tag for Branch Cards */}
                    {supportsTags && parseSections(editingItem.section).includes('branch_card') && (
                        <div className="pt-2">
                            <Label className="text-blue-700 font-semibold mb-1 block">Associated Branch</Label>
                            <Select 
                                value={editingItem.tags?.[0] || ''} 
                                onValueChange={(val) => setEditingItem({...editingItem, tags: [val]})}
                            >
                                <SelectTrigger className="border-blue-200 bg-blue-50">
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branchIds.map(branch => (
                                        <SelectItem key={branch.id} value={branch.id}>{branch.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                        value={editingItem.title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                    <Button type="submit" disabled={uploading}>
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
            )}
        </DialogContent>
      </Dialog>

      {/* Replace Image Dialog */}
      <Dialog open={!!replacingImageItem} onOpenChange={(open) => {
        if (!open) { setReplacingImageItem(null); setReplacingImageFile(null); }
      }}>
        <DialogContent className="sm:max-w-[450px] bg-white">
            <DialogHeader>
                <DialogTitle>Replace Image</DialogTitle>
                <DialogDescription>Upload a new image to replace the existing one.</DialogDescription>
            </DialogHeader>
            {replacingImageItem && (
                <form onSubmit={handleReplaceImageSubmit} className="space-y-6 py-4">
                    <div className="flex justify-center p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-[160px] items-center">
                        {replacingImageFile ? (
                             <img src={URL.createObjectURL(replacingImageFile)} alt="Preview" className="h-40 object-contain" />
                        ) : (
                            replacingImageItem.image_url ? (
                                <img src={replacingImageItem.image_url} alt="Current" className="h-40 object-contain opacity-50" />
                            ) : <ImageIcon className="h-12 w-12 text-gray-300" />
                        )}
                    </div>
                    <Input type="file" accept="image/*" onChange={(e) => setReplacingImageFile(e.target.files[0])} required />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => { setReplacingImageItem(null); setReplacingImageFile(null); }}>Cancel</Button>
                        <Button type="submit" disabled={uploading || !replacingImageFile} className="bg-green-600 hover:bg-green-700 text-white">
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Upload & Replace
                        </Button>
                    </DialogFooter>
                </form>
            )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PoleManager;