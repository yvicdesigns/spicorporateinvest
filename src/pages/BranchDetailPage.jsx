import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building2, Car, Sparkles, Wheat, ShoppingBag, CheckCircle, ArrowLeftCircle, ArrowRightCircle, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, MessageCircle, ImageOff, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicGallery from '@/components/DynamicGallery';
import { supabase } from '@/lib/customSupabaseClient';
import { useParams, useNavigate } from 'react-router-dom';

const getCorrectUrl = (url) => {
  if (!url) return url;
  return url;
};

const BRANCH_TABLE_MAP = {
  'sci-renaissance': { table: 'sci_renaissance_content', section: 'sci_renaissance', icon: Building2 },
  'sci-espoir': { table: 'fondation_spi_content', section: 'fondation_spi', icon: Building2 },
  'fondation-spi': { table: 'fondation_spi_content', section: 'fondation_spi', icon: Building2 },
  'nouveau-concept': { table: 'nouveau_concept_content', section: 'nouveau_concept', icon: Car },
  'la-manne': { table: 'la_manne_content', section: 'la_manne', icon: Wheat },
  'atelier-5': { table: 'atelier5_content', section: 'atelier5', icon: Sparkles },
  'spi-alim': { table: 'spi_alim_content', section: 'spi_alim', icon: ShoppingBag },
  'rse': { table: 'rse_content', section: 'rse', icon: Heart }
};

const translations = {
  fr: {
    back: 'Retour aux pôles d\'excellence',
    gallery: 'Notre Portfolio',
    services: 'Notre Expertise',
    contact: 'Initier un projet ensemble',
    keyPoints: 'Nos Atouts Stratégiques',
    footer: { quickLinks: 'Liens Rapides', followUs: 'Suivez-nous', rights: 'Tous droits réservés' },
    branches: {
      'sci-renaissance': {
        title: 'SCI Renaissance', subtitle: 'L\'Immobilier comme Signature', description: 'Chez SCI Renaissance, nous ne construisons pas seulement des bâtiments, nous érigeons des icônes. Chaque projet est une signature architecturale, conçue pour marquer son temps et valoriser son environnement. Nous allions esthétique audacieuse, innovation durable et fonctionnalité pour créer des lieux de vie et de travail où l\'excellence est la norme.', services: ['Promotion de projets résidentiels de prestige', 'Développement d\'immobilier d\'entreprise (bureaux, commerces)', 'Réhabilitation et valorisation de sites d\'exception', 'Conception de projets architecturaux sur-mesure'], keyPoints: ['Architecture d\'Avant-Garde', 'Emplacements Premium', 'Conception Éco-responsable', 'Potentiel de Valorisation Élevé'], galleryImages: [], contactInfo: { address: '123 Avenue des Bâtisseurs, Paris', phone: '+33 1 23 45 67 89', email: 'contact@sci-renaissance.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'sci-espoir': {
        title: 'Fondation SPI', subtitle: 'L\'Art de Valoriser le Patrimoine', description: 'Fondation SPI est l\'architecte de votre patrimoine immobilier. Notre mission est de transformer chaque actif en une source de valeur pérenne. Grâce à une analyse fine du marché et une gestion stratégique, nous sécurisons vos investissements et optimisons leur rendement pour bâtir un avenir financier solide et serein.', services: ['Ingénierie patrimoniale et conseil en investissement', 'Gestion d\'actifs et optimisation de portefeuille', 'Acquisition stratégique d\'actifs à fort potentiel', 'Valorisation et arbitrage de biens immobiliers'], keyPoints: ['Expertise Financière et Immobilière', 'Stratégies d\'Investissement sur-mesure', 'Gestion Proactive et Transparente', 'Création de Valeur à Long Terme'], galleryImages: [], contactInfo: { address: '456 Rue de la Gestion, Lyon', phone: '+33 4 56 78 90 12', email: 'contact@fondation-spi.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'nouveau-concept': {
        title: 'Nouveau Concept', subtitle: 'Façonner la Mobilité de Demain', description: 'Nouveau Concept est à l\'avant-garde de la révolution de la mobilité. Nous développons des écosystèmes de transport intelligents, durables et centrés sur l\'humain. Notre ambition : créer des déplacements plus fluides, plus verts et plus connectés, pour des villes où il fait bon vivre et se déplacer.', services: ['Déploiement de flottes de véhicules partagés (électriques et autonomes)', 'Plateformes de Mobilité en tant que Service (MaaS)', 'Optimisation logistique du dernier kilomètre', 'Conseil en planification de la mobilité urbaine'], keyPoints: ['Innovation Technologique Continue', 'Solutions Éco-responsables', 'Expérience Utilisateur Intuitive', 'Flexibilité et Intermodalité'], galleryImages: [], contactInfo: { address: '789 Boulevard de l\'Innovation, Marseille', phone: '+33 5 67 89 01 23', email: 'contact@nouveau-concept.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'atelier-5': {
        title: 'Atelier 5', subtitle: 'La Haute Couture du Bien-Être', description: 'Atelier 5 est plus qu\'un lieu, c\'est une philosophie. Nous créons des sanctuaires dédiés à la régénération du corps et de l\'esprit. Dans nos espaces exclusifs, chaque soin est un rituel sur-mesure, une expérience sensorielle unique orchestrée par des experts pour atteindre une harmonie profonde et durable.', services: ['Création de protocoles de soins et rituels signatures', 'Programmes de coaching holistique (corps, nutrition, esprit)', 'Conception et gestion d\'espaces bien-être de luxe', 'Organisation de retraites immersives exclusives'], keyPoints: ['Approche ultra-personnalisée', 'Environnements d\'Exception', 'Savoir-faire de nos Experts', 'Synergie de Produits d\'Excellence'], galleryImages: [], contactInfo: { address: 'Av. Amilcar Cabral, 1er étage, Tours Jumelles, face Radisson Blu Hotel, Centre-ville', phone: '+242 06 989 8993', whatsapp: '+242 06 989 8993', email: 'atelier5officiel@gmail.com', social: { facebook: 'https://www.facebook.com/atelier5officiel', instagram: 'https://www.instagram.com/atelier5officiel/', tiktok: 'https://www.tiktok.com/@atelier5officiel', linkedin: '#' } }
      },
      'la-manne': {
        title: 'La Manne', subtitle: 'Cultiver l\'Excellence, de la Terre à la Table', description: 'La Manne incarne notre vision d\'une agriculture d\'avenir : respectueuse des écosystèmes, garante du bien-être animal et créatrice de saveurs authentiques. Nous maîtrisons toute la chaîne de valeur pour offrir des produits d\'une qualité irréprochable, qui racontent l\'histoire de nos terroirs et de notre passion.', services: ['Agriculture biologique et régénératrice', 'Élevage éthique et extensif en plein air', 'Ateliers de transformation artisanale (fromagerie, conserverie)', 'Développement de circuits de distribution courts et vertueux'], keyPoints: ['Engagement pour la Biodiversité', 'Traçabilité et Transparence Absolues', 'Savoir-faire Artisanal et Innovant', 'Goût Originel Préservé'], galleryImages: [], contactInfo: { address: '202 Route des Terroirs, Bordeaux', phone: '+33 7 89 01 23 45', email: 'contact@la-manne.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'spi-alim': {
        title: 'SPI Alim', subtitle: 'Le Rendez-vous des Épicuriens', description: 'SPI Alim est un manifeste pour le goût. Nos épiceries fines sont des théâtres de la gastronomie, où chaque produit est sélectionné pour son excellence, son histoire et son caractère unique. Nous parcourons le monde et les terroirs pour dénicher des trésors qui transformeront chaque repas en un moment d\'exception.', services: ['Sourcing et sélection de produits gastronomiques rares', 'Curation de caves à vins et spiritueux d\'exception', 'Création d\'expériences de dégustation exclusives', 'Conseil et accompagnement pour les professionnels de la restauration'], keyPoints: ['Sélection Rigoureuse et Exigeante', 'Célébration des Artisans et Producteurs', 'Origines et Terroirs d\'Exception', 'Expérience Client Privilégiée'], galleryImages: [], contactInfo: { address: '303 Place du Marché, Strasbourg', phone: '+33 8 90 12 34 56', email: 'contact@spi-alim.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      }
    }
  },
  en: {
    back: 'Back to centers of excellence', gallery: 'Our Portfolio', services: 'Our Expertise', contact: 'Start a project with us', keyPoints: 'Our Strategic Assets', footer: { quickLinks: 'Quick Links', followUs: 'Follow Us', rights: 'All rights reserved' },
    branches: {
      'sci-renaissance': {
        title: 'SCI Renaissance', subtitle: 'Real Estate as a Signature', description: 'At SCI Renaissance, we don\'t just build buildings; we erect icons. Each project is an architectural signature, designed to define its time and enhance its environment. We combine bold aesthetics, sustainable innovation, and functionality to create living and working spaces where excellence is the standard.', services: ['Promotion of prestigious residential projects', 'Development of corporate real estate (offices, retail)', 'Rehabilitation and enhancement of exceptional sites', 'Custom architectural project design'], keyPoints: ['Avant-Garde Architecture', 'Premium Locations', 'Eco-responsible Design', 'High Appreciation Potential'], galleryImages: [], contactInfo: { address: '123 Builders Avenue, Paris', phone: '+33 1 23 45 67 89', email: 'contact@sci-renaissance.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'sci-espoir': {
        title: 'SPI Foundation', subtitle: 'The Art of Asset Enhancement', description: 'SPI Foundation is the architect of your real estate portfolio. Our mission is to transform each asset into a source of sustainable value. Through keen market analysis and strategic management, we secure your investments and optimize their returns to build a solid and serene financial future.', services: ['Wealth engineering and investment consulting', 'Asset management and portfolio optimization', 'Strategic acquisition of high-potential assets', 'Real estate valuation and arbitration'], keyPoints: ['Financial and Real Estate Expertise', 'Tailored Investment Strategies', 'Proactive and Transparent Management', 'Long-Term Value Creation'], galleryImages: [], contactInfo: { address: '456 Management Street, Lyon', phone: '+33 4 56 78 90 12', email: 'contact@spi-foundation.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'nouveau-concept': {
        title: 'Nouveau Concept', subtitle: 'Shaping the Mobility of Tomorrow', description: 'Nouveau Concept is at the forefront of the mobility revolution. We develop smart, sustainable, and human-centric transport ecosystems. Our ambition: to create smoother, greener, and more connected journeys for cities that are great to live and move in.', services: ['Deployment of shared vehicle fleets (electric and autonomous)', 'Mobility as a Service (MaaS) platforms', 'Last-mile logistics optimization', 'Urban mobility planning consulting'], keyPoints: ['Continuous Technological Innovation', 'Eco-responsible Solutions', 'Intuitive User Experience', 'Flexibility and Intermodality'], galleryImages: [], contactInfo: { address: '789 Innovation Boulevard, Marseille', phone: '+33 5 67 89 01 23', email: 'contact@nouveau-concept.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'atelier-5': {
        title: 'Atelier 5', subtitle: 'The Haute Couture of Wellness', description: 'Atelier 5 is more than a place; it\'s a philosophy. We create sanctuaries dedicated to the regeneration of body and mind. In our exclusive spaces, each treatment is a bespoke ritual, a unique sensory experience orchestrated by experts to achieve deep and lasting harmony.', services: ['Creation of signature care protocols and rituals', 'Holistic coaching programs (body, nutrition, mind)', 'Design and management of luxury wellness spaces', 'Organization of exclusive immersive retreats'], keyPoints: ['Ultra-personalized Approach', 'Exceptional Environments', 'Expert Know-How', 'Synergy of Excellence Products'], galleryImages: [], contactInfo: { address: 'Av. Amilcar Cabral, 1er étage, Tours Jumelles, face Radisson Blu Hotel, Centre-ville', phone: '+242 06 989 8993', whatsapp: '+242 06 989 8993', email: 'atelier5officiel@gmail.com', social: { facebook: 'https://www.facebook.com/atelier5officiel', instagram: 'https://www.instagram.com/atelier5officiel/', tiktok: 'https://www.tiktok.com/@atelier5officiel', linkedin: '#' } }
      },
      'la-manne': {
        title: 'La Manne', subtitle: 'Cultivating Excellence, from Earth to Table', description: 'La Manne embodies our vision of future-proof agriculture: respectful of ecosystems, guaranteeing animal welfare, and creating authentic flavors. We master the entire value chain to offer products of impeccable quality, telling the story of our terroirs and our passion.', services: ['Organic and regenerative agriculture', 'Ethical and extensive free-range farming', 'Artisanal processing workshops (cheese-making, canning)', 'Development of short and virtuous distribution channels'], keyPoints: ['Commitment to Biodiversity', 'Absolute Traceability and Transparency', 'Artisanal and Innovative Know-How', 'Preserved Original Taste'], galleryImages: [], contactInfo: { address: '202 Terroirs Road, Bordeaux', phone: '+33 7 89 01 23 45', email: 'contact@la-manne.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'spi-alim': {
        title: 'SPI Alim', subtitle: 'The Epicurean\'s Rendezvous', description: 'SPI Alim is a manifesto for taste. Our fine food stores are theaters of gastronomy, where each product is selected for its excellence, history, and unique character. We travel the world and its terroirs to unearth treasures that will turn every meal into an exceptional moment.', services: ['Sourcing and selection of rare gastronomic products', 'Curation of exceptional wine and spirits cellars', 'Creation of exclusive tasting experiences', 'Consulting and support for restaurant professionals'], keyPoints: ['Rigorous and Demanding Selection', 'Celebration of Artisans and Producers', 'Exceptional Origins and Terroirs', 'Privileged Customer Experience'], galleryImages: [], contactInfo: { address: '303 Market Square, Strasbourg', phone: '+33 8 90 12 34 56', email: 'contact@spi-alim.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      }
    }
  }
};

const BranchFooter = ({ branchId, branchData, language }) => {
    const navigate = useNavigate();
    const t = translations[language].footer;
    const [footerConfig, setFooterConfig] = useState(null);

    useEffect(() => {
        const loadFooter = async () => {
             try {
                const { data, error } = await supabase
                    .from('footer_configuration')
                    .select('*')
                    .eq('pole_id', branchId)
                    .maybeSingle();
                
                if (data && !error) setFooterConfig(data);
            } catch (err) {
                console.error("Failed to load footer for branch", err);
            }
        };
        loadFooter();
    }, [branchId]);

    const contactInfo = footerConfig ? {
        address: language === 'fr' ? footerConfig.location_fr : footerConfig.location_en,
        phone: footerConfig.phone,
        email: footerConfig.email,
        social: {
            facebook: footerConfig.facebook_url,
            instagram: footerConfig.instagram_url,
            linkedin: footerConfig.linkedin_url
        }
    } : branchData.contactInfo;

    const description = footerConfig ? (language === 'fr' ? footerConfig.description_fr : footerConfig.description_en) : branchData.subtitle;

    return (
        <footer className="bg-gray-100 text-gray-800 border-t border-gray-200">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center mb-4 cursor-pointer" onClick={() => navigate('/')}>
                            <span className="text-2xl font-bold primary-accent">{branchData.title.split(' ')[0].toUpperCase()}</span>
                            <span className="text-2xl font-bold secondary-accent ml-2">{branchData.title.split(' ').slice(1).join(' ')}</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {description}
                        </p>
                    </div>

                    <div>
                        <span className="text-lg font-semibold mb-4 block primary-accent">{t.quickLinks}</span>
                        <ul className="space-y-2">
                             <li>
                                <button onClick={() => navigate('/')} className="text-gray-600 hover:primary-accent transition-colors">
                                  {language === 'fr' ? 'Accueil Groupe' : 'Group Home'}
                                </button>
                              </li>
                              <li>
                                <button onClick={() => navigate('/branches')} className="text-gray-600 hover:primary-accent transition-colors">
                                  {language === 'fr' ? 'Tous les pôles' : 'All Divisions'}
                                </button>
                              </li>
                        </ul>
                    </div>

                    <div>
                        <span className="text-lg font-semibold mb-4 block primary-accent">{language === 'fr' ? 'Contact' : 'Contact'}</span>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 mr-2 mt-1 flex-shrink-0 primary-accent" />
                                <span className="text-gray-600 text-sm">{contactInfo.address}</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 mr-2 flex-shrink-0 primary-accent" />
                                <span className="text-gray-600 text-sm">{contactInfo.phone}</span>
                            </li>
                            {contactInfo.whatsapp && (
                                <li className="flex items-center">
                                    <MessageCircle className="h-5 w-5 mr-2 flex-shrink-0 primary-accent" />
                                    <span className="text-gray-600 text-sm">WhatsApp: {contactInfo.whatsapp}</span>
                                </li>
                            )}
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 mr-2 flex-shrink-0 primary-accent" />
                                <span className="text-gray-600 text-sm">{contactInfo.email}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <span className="text-lg font-semibold mb-4 block primary-accent">{t.followUs}</span>
                        <div className="flex space-x-4">
                            {contactInfo.social.facebook && contactInfo.social.facebook !== '#' && (
                                <a href={contactInfo.social.facebook} target="_blank" rel="noopener noreferrer" className="bg-gray-200 text-gray-600 p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                                    <Facebook className="h-5 w-5" />
                                </a>
                            )}
                            {contactInfo.social.instagram && contactInfo.social.instagram !== '#' && (
                                <a href={contactInfo.social.instagram} target="_blank" rel="noopener noreferrer" className="bg-gray-200 text-gray-600 p-3 rounded-full hover:bg-pink-600 hover:text-white transition-colors">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                            {contactInfo.social.linkedin && contactInfo.social.linkedin !== '#' && (
                                <a href={contactInfo.social.linkedin} target="_blank" rel="noopener noreferrer" className="bg-gray-200 text-gray-600 p-3 rounded-full hover:bg-blue-700 hover:text-white transition-colors">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-8 pt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} {branchData.title.split(' ')[0]} {branchData.title.split(' ').slice(1).join(' ')}. {t.rights}.
                    </p>
                </div>
            </div>
        </footer>
    );
};


const BranchDetailPage = ({ language }) => {
  const { id: branch } = useParams();
  const navigate = useNavigate();
  const t = translations[language];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dbSliderImages, setDbSliderImages] = useState([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [heroError, setHeroError] = useState(false);

  useEffect(() => {
    if (!branch || !t.branches[branch]) {
      navigate('/branches');
    }
  }, [branch, t.branches, navigate]);

  useEffect(() => {
    const fetchSliderImages = async () => {
        setHeroLoading(true);
        try {
            const branchConfig = BRANCH_TABLE_MAP[branch];
            if (!branchConfig) {
                setDbSliderImages([]);
                setHeroLoading(false);
                return;
            }

            const { table: tableName } = branchConfig;
            let query = supabase
                .from(tableName)
                .select('*')
                .eq('is_active', true)
                .ilike('section', `%slider%`)
                .order('created_at', { ascending: false });

            const { data, error } = await query;
            if (error) throw error;

            if (data && data.length > 0) {
                const formattedImages = data.map(img => ({
                    src: getCorrectUrl(img.image_url),
                    alt: img.title || img.alt_text || 'Slider Image',
                    title: img.title,
                    description: img.description
                }));
                setDbSliderImages(formattedImages);
                setCurrentIndex(0);
            } else {
                setDbSliderImages([]); 
            }
        } catch (err) {
            setDbSliderImages([]);
        } finally {
            setHeroLoading(false);
        }
    };
    fetchSliderImages();
  }, [branch]);

  useEffect(() => {
    setHeroError(false);
  }, [currentIndex, branch]);
  
  if (!branch || !t.branches[branch]) return null;

  const branchData = t.branches[branch];
  const validDbImages = dbSliderImages.filter(img => img.src);
  const displayImages = validDbImages.length > 0 ? validDbImages : branchData.galleryImages;

  const nextSlide = () => {
    if (displayImages.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
  };

  const prevSlide = () => {
    if (displayImages.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + displayImages.length) % displayImages.length);
  };

  const Icon = BRANCH_TABLE_MAP[branch]?.icon || Building2;
  const branchConfig = BRANCH_TABLE_MAP[branch];
  const galleryConfig = branchConfig ? {
     tableName: branchConfig.table,
     sectionFilter: null,
     tagFilter: null,
     orderBy: 'created_at'
  } : {
      tableName: 'website_images',
      sectionFilter: 'gallery',
      tagFilter: branch,
      orderBy: 'display_order'
  };

  return (
    <>
      <Helmet>
          <title>{branchData.title} - Groupe SPI</title>
          <meta name="description" content={branchData.description} />
      </Helmet>
      <div className="bg-white overflow-hidden">
        <motion.div initial={{ opacity: 0}} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="container-custom relative z-10">
          <Button
              onClick={() => navigate('/branches')}
              variant="ghost"
              className="text-gray-600 hover:text-blue-900 mt-8 mb-4 flex items-center group"
          >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              {t.back}
          </Button>
        </motion.div>
        
        <section className="section-padding pt-8 md:pt-12 text-gray-800">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <Icon className="h-16 w-16 mb-6 text-blue-900" />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-4">{branchData.title}</h1>
                <p className="text-xl md:text-2xl secondary-accent mb-6 md:mb-8">{branchData.subtitle}</p>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">{branchData.description}</p>
              </motion.div>
              <motion.div className="mt-8 md:mt-0" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
                <div className="relative aspect-video rounded-2xl shadow-2xl w-full h-auto object-cover overflow-hidden bg-gray-100">
                  <AnimatePresence initial={false} mode="wait">
                    {!heroError && displayImages.length > 0 ? (
                        <motion.img
                          key={`${branch}-${currentIndex}`}
                          src={displayImages[currentIndex]?.src}
                          alt={displayImages[currentIndex]?.alt}
                          initial={{ opacity: 0, x: 100 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.5 }}
                          className="absolute w-full h-full object-cover"
                          onError={() => setHeroError(true)}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                            <div className="text-center">
                                <ImageOff className="h-16 w-16 mx-auto mb-2" />
                                <p>Image unavailable</p>
                            </div>
                        </div>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  {displayImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
                        <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm text-gray-800 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                            <ArrowLeftCircle size={24} />
                        </button>
                        <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-sm text-gray-800 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                            <ArrowRightCircle size={24} />
                        </button>
                    </div>
                  )}
                   {displayImages.length > 0 && (
                      <div className="absolute bottom-4 left-4 z-20 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs">
                          {currentIndex + 1} / {displayImages.length}
                      </div>
                   )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
           <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
                <div className="order-2 lg:order-1">
                    <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8">{t.services}</h2>
                    <div className="space-y-4">
                    {branchData.services.map((service, index) => (
                        <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="flex items-start">
                            <CheckCircle className="h-6 w-6 mr-3 mt-1 text-blue-500 flex-shrink-0" />
                            <p className="text-base md:text-lg text-gray-700">{service}</p>
                        </motion.div>
                    ))}
                    </div>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border order-1 lg:order-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6">{t.keyPoints}</h3>
                    <ul className="space-y-3">
                        {branchData.keyPoints.map((point, index) => (
                             <motion.li key={index} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="flex items-center text-base md:text-lg font-medium text-gray-800">
                                <div className="w-3 h-3 rounded-full secondary-accent-bg mr-4 flex-shrink-0"></div>
                                {point}
                            </motion.li>
                        ))}
                    </ul>
                </div>
           </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-12 text-center">{t.gallery}</h2>
            <DynamicGallery 
                tableName={galleryConfig.tableName} 
                sectionFilter="gallery" 
                tagFilter={galleryConfig.tagFilter} 
                orderBy={galleryConfig.orderBy}
            />
        </div>
      </section>

      <section className="section-padding primary-accent-bg">
        <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">{t.contact}</h2>
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
              {language === 'fr' ? 'Contactez-nous directement via les coordonnées ci-dessous ou visitez la page contact du groupe.' : 'Contact us directly using the details below or visit the group\'s contact page.'}
            </p>
            <Button
              onClick={() => navigate('/contact')}
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg shadow-xl transform hover:scale-105 transition-transform"
            >
              {language === 'fr' ? 'Page Contact du Groupe' : 'Group Contact Page'}
            </Button>
        </div>
      </section>

      <BranchFooter branchId={branch} branchData={branchData} language={language} />
    </>
  );
};

export default BranchDetailPage;