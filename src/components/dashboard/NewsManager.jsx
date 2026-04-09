import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Calendar, FileText, Loader2, RefreshCw, Eye, EyeOff, Newspaper as NewspaperIcon } from 'lucide-react';
import NewsForm from './NewsForm';
import { motion, AnimatePresence } from 'framer-motion';

const NewsManager = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { toast } = useToast();

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_date', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to load news articles.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Deleted", description: "Article deleted successfully." });
      setNews(news.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "Error",
        description: "Failed to delete article.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    fetchNews();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">News Articles Management</h3>
          <p className="text-gray-600 mt-1">Manage your news, press releases, and blog posts.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchNews} 
            disabled={loading}
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 shadow-sm"
          >
             <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
             Refresh List
          </Button>
          <Button 
            onClick={handleCreate} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Article
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 bg-gray-50 rounded-xl shadow-lg border border-gray-100">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="ml-3 text-lg text-gray-600">Loading articles...</p>
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center shadow-lg">
          <FileText className="h-16 w-16 text-gray-400 mb-6" />
          <h4 className="text-2xl font-bold text-gray-900 mb-2">No articles yet</h4>
          <p className="text-lg text-gray-600 mb-6">Create your first news article to get started.</p>
          <Button onClick={handleCreate} variant="outline" className="bg-white text-blue-600 border-blue-300 hover:bg-blue-50 shadow-md">
            <Plus className="h-4 w-4 mr-2" /> Create New Article
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {news.map((item) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                layout
                className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col group hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <NewspaperIcon className="h-16 w-16 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm ${item.is_published ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="text-sm text-gray-500 mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {item.published_date ? new Date(item.published_date).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}) : 'No date'}
                  </div>
                  <h4 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2" title={item.title}>{item.title}</h4>
                  <p className="text-base text-gray-700 line-clamp-3 mb-5 flex-grow">{item.description || item.content?.substring(0, 150)}...</p>
                  
                  <div className="pt-5 mt-auto border-t border-gray-100 flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(item)} 
                      className="text-blue-600 border-blue-300 hover:bg-blue-50 shadow-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(item.id)} 
                      className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-xl shadow-lg border border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">{editingItem ? 'Edit Article' : 'Create New Article'}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingItem ? 'Update the content of your article below.' : 'Fill out the details to create a new news article for your website.'}
            </DialogDescription>
          </DialogHeader>
          <NewsForm 
            newsItem={editingItem} 
            onSuccess={handleFormSuccess} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default NewsManager;