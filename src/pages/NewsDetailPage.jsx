import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Loader2, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';

const NewsDetailPage = ({ language }) => {
  const { id: articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const t = {
    back: language === 'fr' ? 'Retour aux actualités' : 'Back to News',
    related: language === 'fr' ? 'Articles récents' : 'Recent Articles',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...',
    error: language === 'fr' ? 'Impossible de charger l\'article' : 'Could not load article',
    notFound: language === 'fr' ? 'Article non trouvé' : 'Article not found',
    retry: language === 'fr' ? 'Réessayer' : 'Retry'
  };

  const fetchArticleData = async () => {
    if (!articleId) return;

    try {
      setLoading(true);
      setError(null);
      const { data: mainArticle, error: mainError } = await supabase.from('news').select('*').eq('id', articleId).single();
      if (mainError) throw mainError;
      setArticle(mainArticle);

      const { data: related, error: relatedError } = await supabase.from('news').select('id, title, published_date, image_url').eq('is_published', true).neq('id', articleId).order('published_date', { ascending: false }).limit(3);
      if (!relatedError) setRelatedArticles(related || []);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticleData();
    window.scrollTo(0, 0);
  }, [articleId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>;

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.error}</h2>
        <p className="text-gray-600 mb-6">{error || t.notFound}</p>
        <div className="flex gap-4">
            <Button onClick={() => navigate('/news')} variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> {t.back}</Button>
            <Button onClick={fetchArticleData} variant="default"><RefreshCw className="mr-2 h-4 w-4" /> {t.retry}</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} - Groupe SPI</title>
        <meta name="description" content={article.description || article.title} />
      </Helmet>

      <div className="bg-white min-h-screen pb-20">
        {article.image_url && (
          <div className="w-full h-[400px] md:h-[500px] relative">
            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        )}

        <div className="container-custom relative -mt-32 z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <Button variant="ghost" onClick={() => navigate('/news')} className="mb-8 pl-0 hover:pl-2 transition-all text-gray-500 hover:text-blue-600 hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" /> {t.back}
            </Button>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-6">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                {new Date(article.published_date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                {Math.ceil(article.content.split(' ').length / 200)} min read
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">{article.title}</h1>

            <div className="prose prose-lg max-w-none text-gray-700">
              {article.content.split('\n').map((paragraph, idx) => <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>)}
            </div>
          </motion.div>

          {relatedArticles.length > 0 && (
            <div className="mt-20">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 border-l-4 border-blue-500 pl-4">{t.related}</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedArticles.map((related) => (
                  <div key={related.id} onClick={() => navigate(`/news/${related.id}`)} className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all group">
                    <div className="h-40 overflow-hidden bg-gray-100">
                      {related.image_url && <img src={related.image_url} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-gray-400 mb-2">{new Date(related.published_date).toLocaleDateString()}</p>
                      <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">{related.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NewsDetailPage;