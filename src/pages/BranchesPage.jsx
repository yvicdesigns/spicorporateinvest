import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowRight, Building, Car, Flower, Utensils, Scissors, FolderHeart as HandHeart, Leaf, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

const BranchesPage = ({ language }) => {
  const [branchImages, setBranchImages] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const translations = {
    fr: {
      title: 'Nos Pôles d\'Excellence - Groupe SPI',
      description: 'Explorez l\'excellence du Groupe SPI à travers ses pôles stratégiques : Immobilier, Mobilité, Bien-être, Agro-alimentaire et Gastronomie.',
      hero: { title: 'Nos Pôles d\'Excellence', subtitle: 'Un écosystème de savoir-faire au service de l\'avenir' },
      discover: 'Explorer le pôle',
      branches: {
        renaissance: { title: 'SCI Renaissance', subtitle: 'Immobilier d\'Exception', description: 'Créateur de lieux de vie et d\'espaces d\'affaires qui définissent les standards de demain.' },
        espoir: { title: 'Fondation SPI', subtitle: 'Valorisation Patrimoniale', description: 'Expert en investissement et gestion d\'actifs immobiliers.' },
        mobility: { title: 'Nouveau Concept', subtitle: 'Mobilité Intelligente', description: 'Pionnier des solutions de transport durables et connectées.' },
        wellness: { title: 'Atelier 5', subtitle: 'Art du Bien-Être', description: 'Une signature unique dans l\'univers du bien-être.' },
        agro: { title: 'La Manne', subtitle: 'Agriculture d\'Avenir', description: 'Engagés pour une agriculture responsable et durable.' },
        food: { title: 'SPI Alim', subtitle: 'Gastronomie & Terroirs', description: 'Une sélection d\'exception pour les connaisseurs.' },
        zen: { title: 'Zen-Sens', subtitle: 'Harmonie & Bien-Être', description: 'Un espace de sérénité dédié à l\'éveil des sens et à l\'équilibre intérieur.' }
      }
    },
    en: {
      title: 'Our Centers of Excellence - SPI Group',
      description: 'Explore SPI Group\'s excellence through its strategic divisions: Real Estate, Mobility, Wellness, Agri-food, and Gastronomy.',
      hero: { title: 'Our Centers of Excellence', subtitle: 'An ecosystem of expertise for the future' },
      discover: 'Explore the division',
      branches: {
        renaissance: { title: 'SCI Renaissance', subtitle: 'Exceptional Real Estate', description: 'Creator of living and business spaces that define tomorrow\'s standards.' },
        espoir: { title: 'SPI Foundation', subtitle: 'Asset Valorization', description: 'Expert in real estate investment and asset management.' },
        mobility: { title: 'Nouveau Concept', subtitle: 'Smart Mobility', description: 'Pioneer of sustainable and connected transport solutions.' },
        wellness: { title: 'Atelier 5', subtitle: 'The Art of Wellness', description: 'A unique signature in the world of well-being.' },
        agro: { title: 'La Manne', subtitle: 'Agriculture of the Future', description: 'Committed to responsible and sustainable agriculture.' },
        food: { title: 'SPI Alim', subtitle: 'Gastronomy & Terroirs', description: 'An exceptional selection for connoisseurs.' },
        zen: { title: 'Zen-Sens', subtitle: 'Harmony & Well-Being', description: 'A serene space dedicated to the awakening of the senses and inner balance.' }
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
    'spi-alim': 'https://images.unsplash.com/photo-1672702959512-af149104c388',
    'zen-sens': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'
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

  const branches = [
    { id: 'sci-renaissance', icon: Building, title: t.branches.renaissance.title, subtitle: t.branches.renaissance.subtitle, description: t.branches.renaissance.description, color: 'text-blue-500' },
    { id: 'sci-espoir', icon: HandHeart, title: t.branches.espoir.title, subtitle: t.branches.espoir.subtitle, description: t.branches.espoir.description, color: 'text-cyan-500' },
    { id: 'nouveau-concept', icon: Car, title: t.branches.mobility.title, subtitle: t.branches.mobility.subtitle, description: t.branches.mobility.description, color: 'text-indigo-500' },
    { id: 'atelier-5', icon: Scissors, title: t.branches.wellness.title, subtitle: t.branches.wellness.subtitle, description: t.branches.wellness.description, color: 'text-purple-500' },
    { id: 'la-manne', icon: Flower, title: t.branches.agro.title, subtitle: t.branches.agro.subtitle, description: t.branches.agro.description, color: 'text-green-500' },
    { id: 'spi-alim', icon: Utensils, title: t.branches.food.title, subtitle: t.branches.food.subtitle, description: t.branches.food.description, color: 'text-amber-500' },
    { id: 'zen-sens', icon: Leaf, title: t.branches.zen.title, subtitle: t.branches.zen.subtitle, description: t.branches.zen.description, color: 'text-teal-500' }
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

      <section className="hero-gradient py-20">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-4">{t.hero.title}</h1>
            <p className="text-2xl secondary-accent">{t.hero.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {branches.map((branch, index) => (
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
                    {t.discover}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BranchesPage;