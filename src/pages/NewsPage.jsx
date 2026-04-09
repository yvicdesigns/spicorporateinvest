import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Loader2, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NewsPage = ({ language }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const translations = {
    fr: {
      title: 'Actualités - Groupe SPI', description: 'Découvrez les dernières actualités et projets du Groupe SPI', hero: { title: 'Actualités & Projets', subtitle: 'Restez informé de nos dernières réalisations' }, readMore: 'Lire la suite', retry: 'Réessayer', empty: 'Aucune actualité disponible pour le moment.'
    },
    en: {
      title: 'News - SPI Group', description: 'Discover the latest news and projects of SPI Group', hero: { title: 'News & Projects', subtitle: 'Stay informed of our latest achievements' }, readMore: 'Read more', retry: 'Retry', empty: 'No news available at the moment.'
    }
  };

  const t = translations[language];

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('news').select('*').eq('is_published', true).order('published_date', { ascending: false });
      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <>
      <Helmet>
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
      </Helmet>

      <section className="hero-gradient py-20">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-4">{t.hero.title}</h1>
            <p className="text-2xl secondary-accent">{t.hero.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-gray-50 min-h-[500px]">
        <div className="container-custom">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Loading articles...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={fetchArticles} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                {t.retry}
              </Button>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-sm p-8">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-xl text-gray-500">{t.empty}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden card-hover flex flex-col h-full cursor-pointer"
                  onClick={() => navigate(`/news/${article.id}`)}
                >
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    {article.image_url ? (
                      <img alt={article.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" src={article.image_url} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <FileText className="h-12 w-12 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(article.published_date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2" title={article.title}>{article.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                      {article.description || article.content?.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...'}
                    </p>
                    <button className="text-blue-900 font-semibold flex items-center hover:gap-2 transition-all mt-auto pt-4 border-t border-gray-100">
                      {t.readMore}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default NewsPage;