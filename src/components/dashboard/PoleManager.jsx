import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Trash2, Upload, Plus, FileImage as ImageIcon, Layout, Type, Edit, Save, ImagePlus, MonitorPlay, Star, Info, PanelTop, Grid, RefreshCw, LayoutTemplate, PlaySquare, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";

const PoleManager = ({ poleName, tableName, bucketName = 'pole-images' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState('gallery');
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
    images: [],
    videoUrl: '',
    thumbnail: null,
    targetBranch: '' // For Branch Cards
  });

  const sectionCatalog = {
    gallery: { id: 'gallery', label: 'Portfolio', description: 'Visible dans la galerie principale de la page.', icon: ImageIcon },
    slider: { id: 'slider', label: 'Hero — diaporama', description: 'Visible dans le grand visuel placé en haut de la page.', icon: MonitorPlay },
    video: { id: 'video', label: 'Vidéo de présentation', description: 'Visible dans la section vidéo de la branche.', icon: PlaySquare },
    branch_card: { id: 'branch_card', label: 'Carte d’une branche', description: 'Visible sur la carte de la branche dans la page d’accueil.', icon: LayoutTemplate },
    hero: { id: 'hero', label: 'Bannière intérieure', description: 'Visuel de couverture d’une section.', icon: PanelTop },
    features: { id: 'features', label: 'Mise en avant', description: 'Visible dans les contenus mis en avant.', icon: Star },
    about: { id: 'about', label: 'Section À propos', description: 'Visible dans la présentation de l’activité.', icon: Info },
    branch_details: { id: 'branch_details', label: 'Détails de la branche', description: 'Visible dans les informations complémentaires.', icon: Grid }
  };
  const isHomepageManager = tableName === 'vision_images';
  const isBranchManager = tableName?.endsWith('_content') && tableName !== 'rse_content';
  const availableSections = (isHomepageManager ? ['slider', 'branch_card', 'gallery'] : isBranchManager ? ['slider', 'gallery', 'video'] : ['gallery', 'slider', 'hero', 'features', 'about', 'branch_details']).map((id) => sectionCatalog[id]);

  // Branch IDs for tagging
  const branchIds = [
    { id: 'sci-renaissance', label: 'SCI Renaissance' },
    { id: 'sci-espoir', label: 'Fondation SPI' },
    { id: 'nouveau-concept', label: 'Nouveau Concept' },
    { id: 'atelier-5', label: 'Atelier 5' },
    { id: 'la-manne', label: 'La Manne' },
    { id: 'spi-alim', label: 'SPI Alim' },
    { id: 'zen-sens', label: 'Zen Sens' },
    { id: 'spi-energy', label: 'SPI Energy' }
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
    const isVideoDestination = newItem.sections.includes('video');
    const isPortfolioDestination = newItem.sections.includes('gallery');
    if (isVideoDestination ? (!newItem.image && !newItem.videoUrl.trim()) : isPortfolioDestination ? newItem.images.length === 0 : (!newItem.image && !newItem.title)) {
        toast({ title: "Information manquante", description: isVideoDestination ? "Ajoutez une vidéo ou collez son lien." : "Ajoutez au moins un titre ou une image.", variant: "destructive" });
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
      let videoSource = null;
      const folderPrefix = newItem.sections[0] || 'uploads';

      if (isVideoDestination && newItem.image) {
        videoSource = await handleImageUpload(newItem.image, 'video');
      } else if (isVideoDestination) {
        videoSource = newItem.videoUrl.trim();
      } else if (!isPortfolioDestination && newItem.image) {
        imageUrl = await handleImageUpload(newItem.image, folderPrefix);
      }
      if (isVideoDestination && newItem.thumbnail) imageUrl = await handleImageUpload(newItem.thumbnail, 'video-thumbnails');

      const finalSection = tableName === 'nouveau_concept_content' ? "nouveau_concept" : JSON.stringify(newItem.sections);
      
      // Prepare payload
      const payload = {
        section: finalSection, 
        title: newItem.title,
        description: newItem.description,
        image_url: imageUrl,
        content: videoSource,
        category: isVideoDestination ? 'video' : 'image',
        is_active: true,
      };

      // Add tag if Branch Card and table supports it (vision_images does)
      if (newItem.sections.includes('branch_card') && newItem.targetBranch) {
          payload.tags = [newItem.targetBranch];
      }

      let rowsToInsert = [payload];
      if (isPortfolioDestination) {
        rowsToInsert = [];
        for (const file of newItem.images) {
          const uploadedUrl = await handleImageUpload(file, 'gallery');
          const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          rowsToInsert.push({ ...payload, image_url: uploadedUrl, title: newItem.images.length === 1 && newItem.title.trim() ? newItem.title.trim() : cleanFileName });
        }
      }

      const { error } = await supabase.from(tableName).insert(rowsToInsert);

      if (error) throw error;

      toast({ title: isPortfolioDestination && rowsToInsert.length > 1 ? `${rowsToInsert.length} photos ajoutées` : "Média ajouté", description: isPortfolioDestination ? "Le portfolio a été mis à jour." : "Le contenu a été ajouté avec succès." });
      setNewItem({ sections: [filter], title: '', description: '', image: null, images: [], videoUrl: '', thumbnail: null, targetBranch: '' });
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

  const destinationCounts = Object.fromEntries(availableSections.map((section) => [section.id, items.filter((item) => parseSections(item.section).includes(section.id)).length]));
  const activeDestination = availableSections.find((section) => section.id === filter) || availableSections[0];
  const chooseWorkspace = (sectionId) => {
    setFilter(sectionId);
    setNewItem((current) => ({ ...current, sections: [sectionId], targetBranch: sectionId === 'branch_card' ? current.targetBranch : '' }));
  };

  // Helper to determine if we should show tags input
  const supportsTags = tableName === 'vision_images' || tableName === 'website_images';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
      
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 md:p-6">
        <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Organisation des médias</p><h3 className="mt-1 text-xl font-bold text-slate-900">Quelle zone voulez-vous gérer ?</h3><p className="mt-1 text-sm text-slate-500">Chaque espace correspond à un endroit précis de la page publique. Choisissez une zone avant d’ajouter ou de modifier ses médias.</p></div>
        <div className={`grid gap-3 ${availableSections.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
          {availableSections.map((section) => {
            const selected = filter === section.id;
            return <button key={section.id} type="button" onClick={() => chooseWorkspace(section.id)} className={`relative rounded-2xl border p-5 text-left transition ${selected ? 'border-blue-800 bg-[#0b1739] text-white shadow-lg' : 'border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm'}`}><div className="flex items-start justify-between gap-3"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${selected ? 'bg-white/10 text-white' : 'bg-blue-50 text-blue-800'}`}>{React.createElement(section.icon,{className:'h-5 w-5'})}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${selected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}>{destinationCounts[section.id] || 0} média{destinationCounts[section.id] > 1 ? 's' : ''}</span></div><strong className="mt-4 block">Gérer : {section.label}</strong><span className={`mt-2 block text-xs leading-relaxed ${selected ? 'text-blue-100/70' : 'text-slate-500'}`}>{section.description}</span>{selected && <span className="mt-4 flex items-center text-xs font-semibold text-blue-200"><Check className="mr-1.5 h-3.5 w-3.5" /> Espace actuellement ouvert</span>}</button>;
          })}
        </div>
      </section>

      {/* Add Content Form */}
      <Card className="p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <Plus className="w-6 h-6 text-blue-600" />
                Ajouter dans « {activeDestination?.label} »
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
                {isSyncing ? 'Synchronisation…' : 'Récupérer les médias existants'}
            </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800 text-white">{activeDestination && React.createElement(activeDestination.icon,{className:'h-5 w-5'})}</span><div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Destination sélectionnée</p><strong className="text-sm text-blue-950">{activeDestination?.label}</strong></div></div><p className="mt-3 text-xs leading-relaxed text-blue-800">{activeDestination?.description} Pour changer de destination, utilisez les espaces situés au-dessus.</p></div>
              
              {/* Conditional Tag Input for Branch Cards */}
              {supportsTags && newItem.sections.includes('branch_card') && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2"
                >
                    <Label className="text-blue-700 font-semibold mb-1 block">Quelle branche cette carte représente-t-elle ?</Label>
                    <Select 
                        value={newItem.targetBranch} 
                        onValueChange={(val) => setNewItem({...newItem, targetBranch: val})}
                    >
                        <SelectTrigger className="border-blue-200 bg-blue-50">
                            <SelectValue placeholder="Choisir la branche" />
                        </SelectTrigger>
                        <SelectContent>
                            {branchIds.map(branch => (
                                <SelectItem key={branch.id} value={branch.id}>{branch.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-blue-600 mt-1">L’image sera utilisée uniquement sur la carte de cette branche.</p>
                </motion.div>
              )}
            </div>

              <div className="space-y-2 pt-1">
              <Label htmlFor="title" className="text-gray-700 font-medium">Titre du média</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Ex. Projet immobilier Pointe-Noire"
                className="border-gray-300 text-gray-900"
              />
               <div className="space-y-2 mt-4">
                <Label htmlFor="file-upload" className="text-gray-700 font-medium">{newItem.sections.includes('video') ? 'Téléverser une vidéo' : newItem.sections.includes('gallery') ? 'Photos du portfolio' : 'Fichier à ajouter'}</Label>
                <div className="flex gap-2 items-center">
                    <Input
                    id={`file-upload-${poleName}`}
                    type="file"
                    accept={newItem.sections.includes('video') ? 'video/*' : 'image/*'}
                    multiple={newItem.sections.includes('gallery')}
                    onChange={(e) => newItem.sections.includes('gallery') ? setNewItem({ ...newItem, images: Array.from(e.target.files || []) }) : setNewItem({ ...newItem, image: e.target.files[0] })}
                    className="cursor-pointer border-gray-300 text-gray-900"
                    />
                </div>
                <p className="text-xs text-gray-500">{newItem.sections.includes('video') ? 'Vidéo MP4 ou WebM au format paysage.' : newItem.sections.includes('gallery') ? 'Sélectionnez une ou plusieurs photos JPG, PNG ou WEBP.' : 'Image JPG, PNG ou WEBP de bonne qualité.'}</p>
                {newItem.sections.includes('gallery') && newItem.images.length > 0 && <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">{newItem.images.length} photo{newItem.images.length > 1 ? 's' : ''} sélectionnée{newItem.images.length > 1 ? 's' : ''}</div>}
              </div>
              {newItem.sections.includes('video') && <div className="mt-5 space-y-5 rounded-2xl border border-violet-200 bg-violet-50/60 p-4"><div><Label htmlFor="video-link" className="font-semibold text-violet-950">Ou coller un lien vidéo</Label><Input id="video-link" type="url" className="mt-2 bg-white" value={newItem.videoUrl} onChange={(e) => setNewItem({ ...newItem, videoUrl: e.target.value })} placeholder="YouTube, Vimeo ou lien direct MP4" /><p className="mt-1.5 text-xs text-violet-700">Si un fichier et un lien sont renseignés, le fichier téléversé sera utilisé.</p></div><div><Label htmlFor="thumbnail-upload" className="font-semibold text-violet-950">Miniature de la vidéo</Label><Input id="thumbnail-upload" type="file" accept="image/*" className="mt-2 bg-white" onChange={(e) => setNewItem({ ...newItem, thumbnail: e.target.files[0] })} /><p className="mt-1.5 text-xs text-violet-700">Image paysage recommandée, affichée avant le lancement de la vidéo.</p></div></div>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 font-medium">Description facultative</Label>
            <Textarea
              id="description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Décrivez brièvement ce média…"
              className="h-28 border-gray-300 text-gray-900"
            />
          </div>

          <Button type="submit" disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {uploading ? 'Envoi en cours…' : 'Ajouter ce média'}
          </Button>
        </form>
      </Card>

      {/* Content List */}
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Zone ouverte : {activeDestination?.label}</p><h3 className="mt-1 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <Layout className="w-6 h-6 text-gray-600" />
                {activeDestination?.label}
                <span className="ml-2 text-base font-normal text-gray-500">({filteredItems.length})</span>
            </h3><p className="mt-2 text-sm text-slate-500">Vous voyez uniquement les médias utilisés dans cette zone de la page.</p></div>
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
                             <><span className="flex items-center gap-1 rounded-full bg-blue-700/90 px-2.5 py-1 text-xs font-bold text-white shadow-md backdrop-blur-sm">{getSectionIcon(filter)}{sectionCatalog[filter]?.label || filter}</span>{itemSections.filter((sectionId) => sectionId !== filter).length > 0 && <span className="max-w-[180px] rounded-lg bg-black/65 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">Aussi utilisé dans : {itemSections.filter((sectionId) => sectionId !== filter).map((sectionId) => sectionCatalog[sectionId]?.label || sectionId).join(', ')}</span>}</>
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
                      <h4 className="font-bold text-lg text-gray-900 mb-2 truncate" title={item.title}>{item.title || 'Média sans titre'}</h4>
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
                    <p className="text-lg font-medium">Aucun média dans cette destination.</p>
                </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-[550px] bg-white">
            <DialogHeader>
            <DialogTitle>Modifier le média</DialogTitle>
            <DialogDescription>Un même média peut être utilisé dans plusieurs zones. Cochez ou décochez chaque destination selon vos besoins.</DialogDescription>
            </DialogHeader>
            {editingItem && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
                <div className="space-y-3">
                    <div><Label>Destinations sur le site</Label><p className="mt-1 text-xs text-slate-500">Vous pouvez sélectionner plusieurs destinations en même temps.</p></div>
                    <div className="grid gap-2 rounded-xl bg-slate-50 p-3">
                        {availableSections.map((section) => (
                        <button key={section.id} type="button" onClick={() => toggleSection(section.id, true)} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${parseSections(editingItem.section).includes(section.id) ? 'border-blue-700 bg-blue-50 text-blue-900 ring-1 ring-blue-700/10' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'}`}>{React.createElement(section.icon,{className:'h-4 w-4'})}<span><span className="block text-sm font-semibold">{section.label}</span><span className="mt-0.5 block text-[11px] font-normal text-slate-500">{section.description}</span></span>{parseSections(editingItem.section).includes(section.id) ? <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-800 text-white"><Check className="h-3.5 w-3.5" /></span> : <span className="ml-auto h-6 w-6 shrink-0 rounded-full border-2 border-slate-200" />}</button>
                        ))}
                    </div>
                     {/* Edit Tag for Branch Cards */}
                    {supportsTags && parseSections(editingItem.section).includes('branch_card') && (
                        <div className="pt-2">
                            <Label className="text-blue-700 font-semibold mb-1 block">Branche associée</Label>
                            <Select 
                                value={editingItem.tags?.[0] || ''} 
                                onValueChange={(val) => setEditingItem({...editingItem, tags: [val]})}
                            >
                                <SelectTrigger className="border-blue-200 bg-blue-50">
                                    <SelectValue placeholder="Choisir la branche" />
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
                    <Label>Titre du média</Label>
                    <Input
                        value={editingItem.title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>Annuler</Button>
                    <Button type="submit" disabled={uploading}>
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Enregistrer
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
                <DialogTitle>Remplacer le fichier</DialogTitle>
                <DialogDescription>Le nouveau fichier remplacera celui actuellement visible sur le site.</DialogDescription>
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
                        <Button type="button" variant="outline" onClick={() => { setReplacingImageItem(null); setReplacingImageFile(null); }}>Annuler</Button>
                        <Button type="submit" disabled={uploading || !replacingImageFile} className="bg-green-600 hover:bg-green-700 text-white">
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Remplacer le fichier
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
