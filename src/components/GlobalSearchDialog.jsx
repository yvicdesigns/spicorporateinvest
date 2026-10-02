import React, { useEffect, useMemo, useState } from 'react';
import { Search, Building2, Newspaper, ShoppingBag, FileText, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/customSupabaseClient';
import { useShopVisibility } from '@/hooks/useShopVisibility';

const staticResults = [
  { id: 'home', type: 'Page', title: 'Accueil', description: 'SPI Corporate Invest', path: '/', icon: FileText },
  { id: 'about', type: 'Page', title: 'À propos', description: 'La holding, sa vision et ses engagements', path: '/about', icon: FileText },
  { id: 'contact', type: 'Page', title: 'Contact', description: 'Contacter SPI Corporate Invest', path: '/contact', icon: FileText },
  { id: 'sci-renaissance', type: 'Branche', title: 'SCI Renaissance', description: 'Immobilier et projets', path: '/branches/sci-renaissance', icon: Building2 },
  { id: 'fondation-spi', type: 'Branche', title: 'Fondation SPI', description: 'Initiatives et accompagnement', path: '/branches/sci-espoir', icon: Building2 },
  { id: 'nouveau-concept', type: 'Branche', title: 'Nouveau Concept', description: 'Mobilité et transport', path: '/branches/nouveau-concept', icon: Building2 },
  { id: 'atelier-5', type: 'Branche', title: 'Atelier 5', description: 'Coiffure, beauté, massage, hammam et sauna', path: '/branches/atelier-5', icon: Building2 },
  { id: 'spi-alim', type: 'Branche', title: 'SPI Alim', description: 'Alimentation et produits La Manne', path: '/branches/spi-alim', icon: Building2 },
  { id: 'la-manne', type: 'Marque', title: 'La Manne', description: 'Production agricole de SPI Alim', path: '/branches/la-manne', icon: Building2 },
  { id: 'zen-sens', type: 'Branche', title: 'Zen Sens', description: 'Parfums et fragrances', path: '/branches/zen-sens', icon: Building2 },
  { id: 'spi-energy', type: 'Branche', title: 'SPI Energy', description: 'Pétrole, carburants et logistique', path: '/branches/spi-energy', icon: Building2 }
];

const normalize = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const GlobalSearchDialog = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('');
  const [dynamicResults, setDynamicResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { shopVisible } = useShopVisibility();

  useEffect(() => {
    if (!open) return;
    let active = true;
    const loadSearchContent = async () => {
      setLoading(true);
      const [newsResponse, productsResponse] = await Promise.all([
        supabase.from('news').select('id,title,description').eq('is_published', true).limit(30),
        shopVisible ? supabase.from('products').select('id,name,description,category').eq('is_active', true).limit(40) : Promise.resolve({ data: [] })
      ]);
      if (!active) return;
      const articles = (newsResponse.data || []).map((item) => ({ id: `news-${item.id}`, type: 'Actualité', title: item.title, description: item.description || 'Article et actualité SPI', path: `/news/${item.id}`, icon: Newspaper }));
      const products = (productsResponse.data || []).map((item) => ({ id: `product-${item.id}`, type: 'Produit', title: item.name, description: item.description || item.category || 'Produit SPI', path: `/boutique/${item.id}`, icon: ShoppingBag }));
      setDynamicResults([...articles, ...products]);
      setLoading(false);
    };
    loadSearchContent();
    return () => { active = false; };
  }, [open, shopVisible]);

  const results = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return staticResults.slice(0, 8);
    return [...staticResults, ...dynamicResults].filter((item) => normalize(`${item.title} ${item.description} ${item.type}`).includes(term)).slice(0, 18);
  }, [query, dynamicResults]);

  const openResult = (path) => {
    onOpenChange(false);
    setQuery('');
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[8vh] max-h-[84vh] w-[94vw] max-w-2xl translate-y-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-2xl sm:rounded-3xl">
        <DialogTitle className="sr-only">Rechercher sur le site</DialogTitle>
        <div className="border-b border-gray-100 p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une branche, un article, un produit…" className="h-14 rounded-xl border-gray-200 bg-gray-50 pl-12 pr-4 text-base" />
          </div>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-3 sm:p-5">
          {loading && query && <div className="flex items-center justify-center py-10 text-gray-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Recherche…</div>}
          {!loading && results.length === 0 && <div className="py-12 text-center"><Search className="mx-auto mb-3 h-10 w-10 text-gray-300" /><p className="font-semibold text-gray-700">Aucun résultat</p><p className="mt-1 text-sm text-gray-500">Essayez avec un autre mot-clé.</p></div>}
          <div className="space-y-2">
            {results.map((result) => (
              <button key={result.id} type="button" onClick={() => openResult(result.path)} className="group flex w-full items-center gap-4 rounded-xl p-3 text-left transition hover:bg-gray-50 sm:p-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blue-50 text-blue-800"><result.icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-gray-900">{result.title}</span><span className="mt-0.5 block truncate text-sm text-gray-500">{result.type} · {result.description}</span></span>
                <ArrowRight className="h-4 w-4 flex-none text-gray-300 transition group-hover:translate-x-1 group-hover:text-blue-700" />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearchDialog;
