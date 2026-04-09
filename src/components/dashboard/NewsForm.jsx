import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useImageManager } from '@/hooks/useImageManager';
import { Loader2, Upload, Image as ImageIcon, X, CalendarDays, BookOpen, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const NewsForm = ({ newsItem, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const { uploadBucketImage } = useImageManager();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    published_date: new Date().toISOString().split('T')[0],
    is_published: true,
    image_url: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (newsItem) {
      setFormData({
        title: newsItem.title || '',
        description: newsItem.description || '',
        content: newsItem.content || '',
        published_date: newsItem.published_date ? new Date(newsItem.published_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        is_published: newsItem.is_published !== undefined ? newsItem.is_published : true,
        image_url: newsItem.image_url || ''
      });
      if (newsItem.image_url) {
        setImagePreview(newsItem.image_url);
      }
    } else {
      // Reset form for new item
      setFormData({
        title: '',
        description: '',
        content: '',
        published_date: new Date().toISOString().split('T')[0],
        is_published: true,
        image_url: ''
      });
      setImageFile(null);
      setImagePreview('');
    }
  }, [newsItem]);

  const handleImageChange = (e) => {
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
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Title and content are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      let imageUrl = formData.image_url;

      if (imageFile) {
        const uploadedUrl = await uploadBucketImage(imageFile, 'news-images', 'articles');
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        published_date: formData.published_date,
        is_published: formData.is_published,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      };

      let error;
      
      if (newsItem?.id) {
        // Update existing
        const { error: updateError } = await supabase
          .from('news')
          .update(payload)
          .eq('id', newsItem.id);
        error = updateError;
      } else {
        // Create new
        const { error: insertError } = await supabase
          .from('news')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: newsItem ? "Article updated successfully." : "Article created successfully."
      });

      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Error saving news:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save article.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit} 
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Main Info */}
        <div className="space-y-5 p-6 bg-white rounded-xl shadow-md border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" /> Article Details
          </h3>
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700 font-medium">Article Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter article title"
              required
              className="border-gray-300 focus-visible:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="published_date" className="text-gray-700 font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-gray-500" /> Publication Date
            </Label>
            <Input
              id="published_date"
              type="date"
              value={formData.published_date}
              onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
              className="border-gray-300 focus-visible:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="is_published" 
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
            />
            <Label htmlFor="is_published" className="cursor-pointer text-gray-700 font-medium">Published (Visible on website)</Label>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className="space-y-2 p-6 bg-white rounded-xl shadow-md border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-purple-600" /> Featured Image
          </h3>
          <Label className="text-gray-700 font-medium">Upload Image</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px] bg-gray-50 relative group">
            {imagePreview ? (
              <>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg shadow-sm" 
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full shadow-md bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  <Input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                  <Button type="button" variant="outline" size="sm" className="bg-white text-blue-600 border-blue-300 hover:bg-blue-50">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6 bg-white rounded-xl shadow-md border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600" /> Content
        </h3>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-700 font-medium">Short Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief summary shown in lists..."
            className="h-24 border-gray-300 focus-visible:ring-blue-500 text-gray-900"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-gray-700 font-medium">Full Content <span className="text-red-500">*</span></Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write the full article content here..."
            className="h-64 font-sans border-gray-300 focus-visible:ring-blue-500 text-gray-900"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 bg-white p-6 rounded-xl shadow-md">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading} 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {newsItem ? 'Update Article' : 'Create Article'}
        </Button>
      </div>
    </motion.form>
  );
};

export default NewsForm;