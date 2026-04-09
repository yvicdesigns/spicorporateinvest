import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, AlertCircle } from 'lucide-react';

const AboutPage = ({ language }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // Fetch the single About page content row
        const { data, error } = await supabase
          .from('about_content')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setContent(data);
        } else {
            // Fallback for null data if database is empty
            setContent({
                title: 'À Propos',
                description: 'Information is currently being updated.',
                sections: []
            });
        }
      } catch (err) {
        console.error("Error fetching about content:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 animate-pulse">Chargement de l'histoire...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Une erreur est survenue</h2>
        <p className="text-gray-600">Impossible de charger le contenu pour le moment.</p>
      </div>
    );
  }

  // Use array from DB or empty array default
  const sections = Array.isArray(content?.sections) ? content.sections : [];

  return (
    <>
      <Helmet>
        <title>{content?.title || "À Propos"} - Groupe SPI</title>
        <meta name="description" content={content?.description?.substring(0, 160) || "Découvrez le Groupe SPI."} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        {/* Abstract shapes/background pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        
        <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              {content?.title}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-light">
              {content?.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Content Sections */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom space-y-24">
          {sections.length === 0 ? (
             <div className="text-center text-gray-500 py-10">
                <p>Contenu en cours de rédaction.</p>
             </div>
          ) : (
              sections.map((section, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className={`flex flex-col lg:flex-row gap-12 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}
                  >
                    {/* Text Side */}
                    <div className="flex-1 space-y-6">
                      <div className={`w-12 h-1 bg-blue-600 rounded-full ${!isEven ? 'ml-auto lg:ml-0' : ''}`}></div>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        {section.title}
                      </h2>
                      <div className="prose prose-lg text-gray-600 leading-relaxed">
                        {section.content?.split('\n').map((paragraph, i) => (
                           <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    </div>

                    {/* Image Side */}
                    <div className="flex-1 w-full">
                      {section.image_url ? (
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                           <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                           <img 
                              src={section.image_url} 
                              alt={section.title} 
                              className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                           />
                        </div>
                      ) : (
                        <div className="w-full h-[300px] bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                           <span className="italic">Image non disponible</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
          )}
        </div>
      </section>
    </>
  );
};

export default AboutPage;