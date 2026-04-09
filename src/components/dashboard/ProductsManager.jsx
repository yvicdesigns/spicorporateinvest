import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useImageManager } from '@/hooks/useImageManager';
import { SHOP_BRANCHES, PRODUCT_TYPES } from '@/lib/shopConstants';
import { Plus, Trash2, Edit, Loader2, Image as ImageIcon, Search, ShoppingCart, Tag, Euro, X, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from 'framer-motion';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { toast } = useToast();
  const { uploadBucketImage } = useImageManager();
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    branch_id: '',
    description: '',
    price: '',
    category: '',
    product_type: 'Commander',
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        branch_id: editingProduct.branch_id || '',
        description: editingProduct.description || '',
        price: editingProduct.price || '',
        category: editingProduct.category || '',
        product_type: editingProduct.product_type || 'Commander',
        image_url: editingProduct.image_url || ''
      });
      setImagePreview(editingProduct.image_url || '');
      setImageFile(null); // Clear file input
    } else {
      setFormData({
        name: '',
        branch_id: '',
        description: '',
        price: '',
        category: '',
        product_type: 'Commander',
        image_url: ''
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [editingProduct]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to fetch products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const initiateDelete = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast({ title: "Success", description: "Product deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.branch_id || !formData.name || !formData.price || isNaN(parseFloat(formData.price))) {
      toast({ title: "Validation Error", description: "Branch, Name, and a valid Price are required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        const url = await uploadBucketImage(imageFile, 'pole-images', 'products');
        if (url) imageUrl = url;
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
        toast({ title: "Success", description: "Product updated" });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...payload, is_active: true, created_at: new Date().toISOString() }]);
        if (error) throw error;
        toast({ title: "Success", description: "Product created" });
      }

      setIsFormOpen(false);
      fetchProducts();
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview('');
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Operation failed: " + error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.branch_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Shop Products Management</h3>
          <p className="text-gray-600 mt-1">Add, edit, or remove products from your online shop.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => { setEditingProduct(null); setIsFormOpen(true); }} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
         <Search className="h-5 w-5 text-gray-500 ml-1" />
         <Input 
            placeholder="Search products by name, branch, or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 text-gray-900"
         />
      </div>

      {loading ? (
        <div className="flex justify-center p-12 bg-gray-50 rounded-xl shadow-lg border border-gray-100">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="ml-3 text-lg text-gray-600">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map(product => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                layout
                className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 flex flex-col group hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <ShoppingCart className="h-16 w-16 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm">
                    {SHOP_BRANCHES.find(b => b.id === product.branch_id)?.name || 'N/A'}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h4 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2" title={product.name}>{product.name}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">{product.description || 'No description provided.'}</p>
                  <div className="flex justify-between items-center text-sm font-medium text-gray-700 mb-4">
                    <span className="flex items-center gap-1 text-gray-500"><Tag className="h-4 w-4 text-gray-400" /> {product.category || 'General'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-sm ${
                        product.product_type === 'Louer' ? 'bg-indigo-100 text-indigo-700' :
                        product.product_type === 'Réserver' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {product.product_type}
                    </span>
                  </div>
                  <div className="pt-4 mt-auto border-t border-gray-100 flex justify-between items-center">
                    <p className="font-bold text-2xl text-blue-600">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(product.price)}</p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { setEditingProduct(product); setIsFormOpen(true); }} 
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 shadow-sm"
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => initiateDelete(product)} 
                        className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-xl shadow-lg border border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription className="text-gray-600">Fill in the details below to manage your product listing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 p-1"> {/* Increased spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-blue-600" /> Product Information</h4>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">Product Name <span className="text-red-500">*</span></Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="border-gray-300 focus-visible:ring-blue-500 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch_id" className="text-gray-700 font-medium">Branch <span className="text-red-500">*</span></Label>
                  <Select value={formData.branch_id} onValueChange={(val) => setFormData({...formData, branch_id: val})}>
                    <SelectTrigger className="w-full border-gray-300 focus-visible:ring-blue-500 text-gray-900">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md shadow-lg border border-gray-100">
                      {SHOP_BRANCHES.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-700 font-medium">Price (XAF) <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required className="pl-8 border-gray-300 focus-visible:ring-blue-500 text-gray-900" />
                    <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_type" className="text-gray-700 font-medium">Product Type</Label>
                  <Select value={formData.product_type} onValueChange={(val) => setFormData({...formData, product_type: val})}>
                    <SelectTrigger className="w-full border-gray-300 focus-visible:ring-blue-500 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-md shadow-lg border border-gray-100">
                      {PRODUCT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-gray-700 font-medium">Category</Label>
                  <Input id="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g., Electronics, Services" className="border-gray-300 focus-visible:ring-blue-500 text-gray-900" />
                </div>
              </div>
              <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-purple-600" /> Product Visuals</h4>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Product Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[180px] bg-white relative group">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover rounded-md shadow-sm" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-2">No image selected</p>
                        <div className="relative">
                          <Input type="file" onChange={handleImageFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <Button type="button" variant="outline" size="sm" className="bg-white text-blue-600 border-blue-300 hover:bg-blue-50">
                            <Upload className="h-4 w-4 mr-2" /> Upload Image
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Detailed description of the product or service..." className="h-32 border-gray-300 focus-visible:ring-blue-500 text-gray-900" />
                </div>
              </div>
            </div>
            
            <DialogFooter className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSubmitting} className="border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Product
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-xl shadow-lg border border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete the product "<strong className="text-red-600">{productToDelete?.name}</strong>"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white shadow-sm">Delete Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProductsManager;