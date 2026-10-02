import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar, Newspaper } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';

const LatestNewsPopup = () => {
  const [article, setArticle] = useState(null);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/news/')) return;
    let active = true;
    const loadLatestArticle = async () => {
      const { data } = await supabase.from('news').select('id,title,description,image_url,published_date').eq('is_published', true).order('published_date', { ascending: false }).limit(1).maybeSingle();
      if (!active || !data) return;
      const dismissedKey = `spi-news-popup-${data.id}`;
      if (window.localStorage.getItem(dismissedKey)) return;
      setArticle(data);
      window.setTimeout(() => active && setOpen(true), 900);
    };
    loadLatestArticle();
    return () => { active = false; };
  }, [location.pathname]);

  const closePopup = () => {
    if (article) window.localStorage.setItem(`spi-news-popup-${article.id}`, 'dismissed');
    setOpen(false);
  };

  const readArticle = () => {
    const id = article?.id;
    closePopup();
    if (id) navigate(`/news/${id}`);
  };

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && closePopup()}>
      <DialogContent className="w-[92vw] max-w-xl overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-2xl sm:rounded-3xl">
        <DialogTitle className="sr-only">Nouvelle actualité : {article.title}</DialogTitle>
        {article.image_url && <div className="relative h-52 overflow-hidden sm:h-64"><img src={article.image_url} alt={article.title} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" /><span className="absolute bottom-4 left-5 inline-flex items-center rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-blue-900 backdrop-blur"><Newspaper className="mr-1.5 h-3.5 w-3.5" /> Nouvelle actualité</span></div>}
        <div className="p-6 sm:p-8">
          {!article.image_url && <span className="mb-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900"><Newspaper className="mr-1.5 h-3.5 w-3.5" /> Nouvelle actualité</span>}
          <div className="mb-3 flex items-center text-xs text-gray-500"><Calendar className="mr-1.5 h-3.5 w-3.5" />{new Date(article.published_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">{article.title}</h2>
          {article.description && <p className="mt-4 line-clamp-3 leading-relaxed text-gray-600">{article.description}</p>}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={closePopup}>Plus tard</Button>
            <Button onClick={readArticle} className="bg-blue-900 text-white hover:bg-blue-800">Lire l’article <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LatestNewsPopup;
