import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowRight, Building, Car, Flower, Utensils, Scissors, FolderHeart as HandHeart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeSlider from '@/components/HomeSlider';
import DynamicGallery from '@/components/DynamicGallery';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const HomePage = ({ language }) => {
  const [branchImages, setBranchImages] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const translations = {
    fr: {
      title: 'SPI Corporate Invest - Excellence Multisectorielle',
      description: 'Leader multisectoriel dans l\'immobilier, la mobilité, le bien-être, l\'agro-pastoral et l\'épicerie fine.',
      hero: {
        subtitle: 'Un Groupe, Plusieurs Expertises',
        title: 'Façonner l\'Avenir, Secteur par Secteur',
        description: 'SPI Corporate Invest est un écosystème d\'entreprises leaders, unies par une vision commune de l\'excellence, de l\'innovation and de la croissance durable.',
        cta: 'Découvrir nos pôles',
      },
      branches: {
        title: 'Nos Pôles d\'Excellence',
        subtitle: 'Des expertises complémentaires au service de votre développement.',
        sciRenaissance: { title: 'SCI Renaissance', subtitle: 'Immobilier d\'Exception', description: 'Développement immobilier résidentiel et commercial.' },
        sciEspoir: { title: 'Fondation SPI', subtitle: 'Valorisation Patrimoniale', description: 'Gestion et valorisation de patrimoine immobilier.' },
        mobility: { title: 'Nouveau Concept', subtitle: 'Mobilité Intelligente', description: 'Solutions de mobilité innovantes.' },
        wellness: { title: 'Atelier 5', subtitle: 'Art du Bien-Être', description: 'Bien-être et qualité de vie.' },
        agro: { title: 'La Manne', subtitle: 'Agriculture d\'Avenir', description: 'Production agro-pastorale durable.' },
        food: { title: 'SPI Alim', subtitle: 'Gastronomie & Terroirs', description: 'Épicerie fine et produits d\'exception.' },
        discover: 'Explorer le pôle'
      },
      values: {
        title: 'Nos Valeurs Fondamentales',
        excellence: { title: 'Excellence', description: 'Viser le plus haut niveau de qualité dans toutes nos entreprises.' },
        innovation: { title: 'Innovation', description: 'Pionniers dans nos secteurs pour anticiper les défis de demain.' },
        commitment: { title: 'Engagement', description: 'Agir de manière responsable pour un impact positif et durable.' }
      },
      gallery: {
        title: 'Notre Vision en Images',
        subtitle: 'Un aperçu de nos réalisations et de notre engagement sur le terrain.'
      },
      cta: {
        title: 'Un projet ? Une ambition ?',
        description: 'Découvrez comment la force de notre groupe peut devenir le catalyseur de votre succès. Collaborons ensemble.',
        button: 'Nous contacter'
      }
    },
    en: {
      title: 'SPI Corporate Invest - Multisectoral Excellence',
      description: 'Multisectoral leader in real estate, mobility, wellness, agro-pastoral and fine grocery.',
      hero: {
        subtitle: 'One Group, Multiple Expertise',
        title: 'Shaping the Future, Sector by Sector',
        description: 'SPI Corporate Invest is an ecosystem of leading companies, united by a common vision of excellence, innovation, and sustainable growth.',
        cta: 'Discover our divisions',
      },
      branches: {
        title: 'Our Centers of Excellence',
        subtitle: 'Complementary expertise serving your development.',
        sciRenaissance: { title: 'SCI Renaissance', subtitle: 'Exceptional Real Estate', description: 'Residential and commercial real estate development.' },
        sciEspoir: { title: 'SPI Foundation', subtitle: 'Asset Valorization', description: 'Strategic management of real estate assets.' },
        mobility: { title: 'Nouveau Concept', subtitle: 'Smart Mobility', description: 'Innovative mobility solutions.' },
        wellness: { title: 'Atelier 5', subtitle: 'The Art of Wellness', description: 'Wellness and quality of life.' },
        agro: { title: 'La Manne', subtitle: 'Agriculture of the Future', description: 'Sustainable agro-pastoral production.' },
        food: { title: 'SPI Alim', subtitle: 'Gastronomy & Terroirs', description: 'Fine grocery and exceptional products.' },
        discover: 'Explore the division'
      },
      values: {
        title: 'Our Core Values',
        excellence: { title: 'Excellence', description: 'Aiming for the highest level of quality in all our businesses.' },
        innovation: { title: 'Innovation', description: 'Pioneers in our sectors to anticipate tomorrow\'s challenges.' },
        commitment: { title: 'Commitment', description: 'Acting responsibly for a positive and lasting impact.' }
      },
      gallery: {
        title: 'Our Vision in Pictures',
        subtitle: 'A glimpse of our achievements and our commitment on the ground.'
      },
      cta: {
        title: 'A project? An ambition?',
        description: 'Discover how the strength of our group can become the catalyst for your success. Let\'s collaborate.',
        button: 'Contact us'
      }
    }
  };

  const t = translations[language];

  const defaultImages = {
    'sci-renaissance': 'https://images.unsplash.com/photo-1619425054357-781d9be681a0',
    'sci-espoir': 'https://images.unsplash.com/photo-1671621556393-72aae2f654e5',
    'nouveau-concept': 'https://images.unsplash.com/photo-1698307663492-928dcdd4d960',
    'atelier-5': 'https://images.unsplash.com/photo-1653919551040-ad7759283d50',
    'la-manne': 'https://images.unsplash.com/photo-1643621204445-2681f6815937',
    'spi-alim': 'https://images.unsplash.com/photo-1672702959512-af149104c388'
  };

  useEffect(() => {
    const fetchBranchImages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vision_images')
                .select('*')
                .eq('is_active', true)
                .ilike('section', '%branch_card%');

            if (error) throw error;

            const newImageMap = {};
            if (data && data.length > 0) {
                data.forEach(img => {
                    const branchId = img.tags && img.tags.find(tag => Object.keys(defaultImages).includes(tag));
                    if (branchId) {
                        newImageMap[branchId] = img.image_url;
                    }
                });
            }
            setBranchImages(newImageMap);
        } catch (err) {
            console.error('Error fetching branch card images:', err);
        } finally {
            setLoading(false);
        }
    };

    fetchBranchImages();
  }, []);

  const getImage = (id) => branchImages[id] || defaultImages[id];

  const branchItems = [
    { id: 'sci-renaissance', icon: Building, title: t.branches.sciRenaissance.title, subtitle: t.branches.sciRenaissance.subtitle, description: t.branches.sciRenaissance.description, color: 'text-blue-500' },
    { id: 'sci-espoir', icon: HandHeart, title: t.branches.sciEspoir.title, subtitle: t.branches.sciEspoir.subtitle, description: t.branches.sciEspoir.description, color: 'text-cyan-500' },
    { id: 'nouveau-concept', icon: Car, title: t.branches.mobility.title, subtitle: t.branches.mobility.subtitle, description: t.branches.mobility.description, color: 'text-indigo-500' },
    { id: 'atelier-5', icon: Scissors, title: t.branches.wellness.title, subtitle: t.branches.wellness.subtitle, description: t.branches.wellness.description, color: 'text-purple-500' },
    { id: 'la-manne', icon: Flower, title: t.branches.agro.title, subtitle: t.branches.agro.subtitle, description: t.branches.agro.description, color: 'text-green-500' },
    { id: 'spi-alim', icon: Utensils, title: t.branches.food.title, subtitle: t.branches.food.subtitle, description: t.branches.food.description, color: 'text-amber-500' }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } })
  };
  
  return (
    <>
      <Helmet>
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
      </Helmet>

      <section className="bg-gray-50 overflow-hidden">
        <div className="container-custom section-padding grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="z-20 relative">
            <p className="text-lg font-semibold text-orange-500 mb-4">{t.hero.subtitle}</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">{t.hero.title}</h1>
            <p className="text-gray-600 mb-8 max-w-lg">{t.hero.description}</p>
            <Button onClick={() => document.getElementById('branches').scrollIntoView({ behavior: 'smooth' })} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              {t.hero.cta} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative h-[400px] lg:h-[400px] w-full mt-8 lg:mt-0 lg:order-last shadow-xl rounded-2xl overflow-hidden">
            <HomeSlider />
          </motion.div>
        </div>
      </section>

      <section id="branches" className="section-padding bg-white">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{t.branches.title}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t.branches.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {branchItems.map((branch, index) => (
              <motion.div
                key={branch.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                onClick={() => navigate(`/branches/${branch.id}`)}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col group card-hover cursor-pointer"
              >
                <div className="relative h-48">
                  {loading ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Loader2 className="animate-spin text-gray-300" />
                    </div>
                  ) : (
                    <img alt={branch.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={getImage(branch.id)} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className={`flex items-center justify-center w-12 h-12 bg-white/95 backdrop-blur-sm rounded-xl shadow-md ${branch.color}`}>
                      <branch.icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className={`font-bold ${branch.color} mb-1`}>{branch.subtitle}</span>
                  <h3 className="text-2xl font-bold text-blue-900 mb-3">{branch.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">{branch.description}</p>
                  <button className="mt-auto inline-flex items-center font-semibold text-blue-900 group-hover:text-blue-600 transition-colors">
                    {t.branches.discover}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50"> 
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{t.values.title}</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: t.values.excellence.title, description: t.values.excellence.description },
              { title: t.values.innovation.title, description: t.values.innovation.description },
              { title: t.values.commitment.title, description: t.values.commitment.description }
            ].map((value, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-orange-500">{`0${index + 1}`}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{value.title}</h3>
                  <p className="text-gray-600 mb-6">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{t.gallery.title}</h2>
             <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t.gallery.subtitle}</p>
          </motion.div>
          <DynamicGallery tableName="vision_images" sectionFilter="gallery" />
        </div>
      </section>
      
      <section className="section-padding bg-blue-600">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t.cta.title}</h2>
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">{t.cta.description}</p>
            <Button onClick={() => navigate('/contact')} className="bg-white text-blue-600 hover:bg-gray-200 px-8 py-3 text-lg font-semibold shadow-xl transform hover:scale-105 transition-transform">
              {t.cta.button}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomePage;