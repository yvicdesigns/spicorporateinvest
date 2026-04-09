import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import { Loader2, Star, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturesSection = ({ tableName = 'rse_content', sectionFilter = 'features' }) => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      setError("Could not load features.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [tableName]);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  if (error) {
      return (
          <div className="flex flex-col items-center justify-center p-8 text-red-500 bg-red-50 rounded-lg">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchFeatures} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Retry
              </Button>
          </div>
      );
  }

  if (features.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div
          key={feature.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
        >
          {feature.image_url && (
            <div className="h-48 overflow-hidden bg-gray-100">
                <img 
                    src={feature.image_url} 
                    alt={feature.title || 'Feature image'} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                    }}
                />
            </div>
          )}
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-gray-800">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                {feature.title || 'Feature'}
            </h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FeaturesSection;