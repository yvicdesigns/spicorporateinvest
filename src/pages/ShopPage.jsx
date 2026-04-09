import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/shop/ProductCard';
import ProductDetailView from '@/components/shop/ProductDetailView';
import { SHOP_BRANCHES } from '@/lib/shopConstants';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { getCanonicalUrl } from '@/components/SocialMetaTagsHelper';

const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const ShopPage = ({ language }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  
  const navigate = useNavigate();
  const { id: pathProductId } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const activeProductId = pathProductId || searchParams.get('product');

  const t = {
    title: language === 'fr' ? 'La Boutique SPI' : 'SPI Shop',
    subtitle: language === 'fr' ? 'Découvrez nos produits et services exclusifs' : 'Discover our exclusive products and services',
    search: language === 'fr' ? 'Rechercher un produit...' : 'Search for a product...',
    allBranches: language === 'fr' ? 'Toutes les branches' : 'All Branches',
    allCategories: language === 'fr' ? 'Toutes les catégories' : 'All Categories',
    noProducts: language === 'fr' ? 'Aucun produit trouvé' : 'No products found',
    filter: language === 'fr' ? 'Filtrer' : 'Filter',
    error: language === 'fr' ? 'Erreur de chargement' : 'Loading Error',
    retry: language === 'fr' ? 'Réessayer' : 'Retry'
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
      const uniqueCats = [...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCats);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (activeProductId) {
      if (!isValidUUID(activeProductId)) {
        toast({
          title: "Format invalide",
          description: "Le lien du produit est invalide.",
          variant: "destructive"
        });
        navigate('/boutique', { replace: true });
        return;
      }

      const checkAndOpenModal = async () => {
        setIsModalLoading(true);
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', activeProductId)
            .eq('is_active', true)
            .single();

          if (error || !data) {
            toast({
              title: "Produit introuvable",
              description: "Ce produit n'existe pas ou n'est plus disponible.",
              variant: "destructive"
            });
            navigate('/boutique', { replace: true });
          } else {
            setSelectedProductModal(data);
          }
        } catch (err) {
          console.error("Error fetching specific product:", err);
          toast({
            title: "Erreur",
            description: "Impossible de charger le produit.",
            variant: "destructive"
          });
          navigate('/boutique', { replace: true });
        } finally {
          setIsModalLoading(false);
        }
      };
      checkAndOpenModal();
    } else {
      setSelectedProductModal(null);
    }
  }, [activeProductId, navigate, toast]);

  const filteredProducts = products.filter(product => {
    const matchesBranch = selectedBranch === 'all' || product.branch_id === selectedBranch;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBranch && matchesCategory && matchesSearch;
  });

  const handleProductAction = (product) => {
    navigate(`/checkout/${product.id}`);
  };

  const handleProductNavigate = (productId) => {
    navigate(`/boutique/${productId}`);
  };

  const handleCloseModal = () => {
    setSelectedProductModal(null);
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/boutique', { replace: true });
    }
  };

  const pageUrl = getCanonicalUrl('/boutique');

  return (
    <>
      <Helmet>
        <title>{t.title} - Groupe SPI</title>
        <meta name="description" content="Browse our exclusive collection of products and services from SPI Group." />
        <link rel="canonical" href={pageUrl} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="container-custom py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center">
                <ShoppingBag className="mr-3 h-10 w-10 text-blue-600" />
                {t.title}
              </h1>
              <p className="text-xl text-gray-600">{t.subtitle}</p>
            </motion.div>
          </div>
        </div>

        <div className="container-custom py-8 sticky top-20 z-30 bg-gray-50/95 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder={t.search} className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder={t.allBranches} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allBranches}</SelectItem>
                {SHOP_BRANCHES.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder={t.allCategories} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCategories}</SelectItem>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-sm p-8 border border-red-100">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t.error}</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={fetchProducts} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50"><RefreshCw className="h-4 w-4 mr-2" /> {t.retry}</Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{t.noProducts}</h3>
              <p className="text-gray-500">Essayez de modifier vos filtres de recherche.</p>
              <Button variant="link" onClick={() => { setSelectedBranch('all'); setSelectedCategory('all'); setSearchQuery(''); }}>Réinitialiser les filtres</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAction={handleProductAction} 
                  onNavigate={handleProductNavigate} 
                  language={language} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {isModalLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      )}

      <ProductDetailView 
        isOpen={!!selectedProductModal} 
        onClose={handleCloseModal} 
        product={selectedProductModal}
        language={language}
      />
    </>
  );
};

export default ShopPage;