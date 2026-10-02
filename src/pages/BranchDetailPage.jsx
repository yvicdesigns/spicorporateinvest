import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building2, Car, Sparkles, Wheat, ShoppingBag, CheckCircle, ArrowLeftCircle, ArrowRightCircle, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, MessageCircle, ImageOff, Heart, Leaf, Zap, Play, Star, ShieldCheck, Gem, ArrowUpRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicGallery from '@/components/DynamicGallery';
import { supabase } from '@/lib/customSupabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { getBranchBrand } from '@/lib/branchBranding';
import WhatsAppBooking from '@/components/branches/WhatsAppBooking';
import { getBranchRequestConfig } from '@/lib/branchRequestConfigs';
import { useBranchWhatsApp } from '@/hooks/useBranchWhatsApp';
import { getBranchExperienceConfig } from '@/lib/branchExperienceConfigs';

const getCorrectUrl = (url) => {
  if (!url) return url;
  return url;
};

const getVideoEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes('youtube.com/watch')) {
    const videoId = new URL(url).searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
  if (url.includes('vimeo.com/')) return `https://player.vimeo.com/video/${url.split('vimeo.com/')[1].split('?')[0]}`;
  return null;
};

const BRANCH_TABLE_MAP = {
  'sci-renaissance': { table: 'sci_renaissance_content', section: 'sci_renaissance', icon: Building2 },
  'sci-espoir': { table: 'fondation_spi_content', section: 'fondation_spi', icon: Building2 },
  'fondation-spi': { table: 'fondation_spi_content', section: 'fondation_spi', icon: Building2 },
  'nouveau-concept': { table: 'nouveau_concept_content', section: 'nouveau_concept', icon: Car },
  'la-manne': { table: 'la_manne_content', section: 'la_manne', icon: Wheat },
  'atelier-5': { table: 'atelier5_content', section: 'atelier5', icon: Sparkles },
  'spi-alim': { table: 'spi_alim_content', section: 'spi_alim', icon: ShoppingBag },
  'rse': { table: 'rse_content', section: 'rse', icon: Heart },
  'zen-sens': { table: 'zen_sens_content', section: 'zen_sens', icon: Leaf },
  'spi-energy': { table: 'spi_energy_content', section: 'spi_energy', icon: Zap }
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
        title: 'Atelier 5', subtitle: 'Beauté experte, élégance singulière', description: 'Au cœur de Brazzaville, Atelier 5 imagine une expérience beauté où le geste professionnel rencontre l\'écoute, le conseil et le sens du détail. Chaque visite est pensée comme une parenthèse personnelle : un diagnostic attentif, des prestations adaptées et une mise en beauté fidèle à votre style.', services: ['Coiffure, coupe et mise en beauté sur mesure', 'Soins capillaires ciblés selon les besoins du cheveu', 'Conseil en image et accompagnement personnalisé', 'Préparation beauté pour mariages et événements'], keyPoints: ['Diagnostic avant chaque prestation', 'Équipe attentive et gestes maîtrisés', 'Cadre élégant au cœur de Brazzaville', 'Expérience personnalisée de bout en bout'], galleryImages: [], contactInfo: { address: 'Av. Amilcar Cabral, 1er étage, Tours Jumelles, face Radisson Blu Hotel, Centre-ville', phone: '+242 06 989 8993', whatsapp: '+242 06 989 8993', email: 'atelier5officiel@gmail.com', social: { facebook: 'https://www.facebook.com/atelier5officiel', instagram: 'https://www.instagram.com/atelier5officiel/', tiktok: 'https://www.tiktok.com/@atelier5officiel', linkedin: '#' } }
      },
      'la-manne': {
        title: 'La Manne', subtitle: 'Cultiver l\'Excellence, de la Terre à la Table', description: 'La Manne incarne notre vision d\'une agriculture d\'avenir : respectueuse des écosystèmes, garante du bien-être animal et créatrice de saveurs authentiques. Nous maîtrisons toute la chaîne de valeur pour offrir des produits d\'une qualité irréprochable, qui racontent l\'histoire de nos terroirs et de notre passion.', services: ['Agriculture biologique et régénératrice', 'Élevage éthique et extensif en plein air', 'Ateliers de transformation artisanale (fromagerie, conserverie)', 'Développement de circuits de distribution courts et vertueux'], keyPoints: ['Engagement pour la Biodiversité', 'Traçabilité et Transparence Absolues', 'Savoir-faire Artisanal et Innovant', 'Goût Originel Préservé'], galleryImages: [], contactInfo: { address: '202 Route des Terroirs, Bordeaux', phone: '+33 7 89 01 23 45', email: 'contact@la-manne.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'spi-alim': {
        title: 'SPI Alim', subtitle: 'De la Production à Votre Table', description: 'SPI Alim réunit la production, la sélection et la distribution de produits alimentaires de qualité. À travers La Manne, sa marque de production agricole, SPI Alim maîtrise l\'origine de ses produits et rapproche les récoltes, les savoir-faire locaux et les consommateurs.', services: ['Distribution des produits agricoles La Manne', 'Sélection et commercialisation de produits alimentaires', 'Constitution de paniers et commandes personnalisées', 'Solutions d\'approvisionnement pour les professionnels'], keyPoints: ['La Manne, marque de production intégrée', 'Traçabilité des produits', 'Valorisation des productions locales', 'Service aux particuliers et professionnels'], galleryImages: [], contactInfo: { address: 'Brazzaville, République du Congo', phone: '+242 00 000 0000', email: 'contact@spi-alim.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'zen-sens': {
        title: 'Zen Sens', subtitle: 'L\'Émotion au Cœur de Chaque Fragrance', description: 'Zen Sens est une maison dédiée aux parfums et aux émotions qu\'ils révèlent. Notre sélection réunit des fragrances élégantes, des sillages de caractère et des créations olfactives pensées pour accompagner chaque personnalité et chaque moment.', services: ['Sélection de parfums pour femme et pour homme', 'Conseil olfactif personnalisé', 'Fragrances d\'intérieur et senteurs', 'Coffrets parfumés et idées cadeaux'], keyPoints: ['Sélection de Fragrances de Caractère', 'Conseil Personnalisé', 'Univers Olfactif Singulier', 'Expérience Sensorielle'], galleryImages: [{ src: 'https://images.unsplash.com/photo-1541643600914-78b084683601', alt: 'Parfums et fragrances Zen Sens' }], contactInfo: { address: 'Brazzaville, République du Congo', phone: '', email: 'contact@zen-sens.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'spi-energy': {
        title: 'SPI Energy', subtitle: 'Expertise Pétrolière & Excellence Opérationnelle', description: 'SPI Energy intervient dans le secteur pétrolier avec une ambition claire : proposer aux entreprises et aux territoires des solutions fiables, sécurisées et adaptées à leurs besoins. Notre approche associe maîtrise opérationnelle, qualité de service et connaissance de la chaîne de valeur pétrolière.', services: ['Distribution de produits pétroliers', 'Fourniture de carburants et lubrifiants', 'Logistique, stockage et approvisionnement', 'Solutions pétrolières pour les professionnels'], keyPoints: ['Maîtrise de la Chaîne Logistique', 'Sécurité et Conformité', 'Fiabilité des Approvisionnements', 'Service Professionnel'], galleryImages: [{ src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', alt: 'Activités industrielles SPI Energy' }], contactInfo: { address: 'Brazzaville, République du Congo', phone: '', email: 'contact@spienergy.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
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
        title: 'Atelier 5', subtitle: 'Expert beauty, singular elegance', description: 'In the heart of Brazzaville, Atelier 5 creates a beauty experience where professional technique meets attentive listening, thoughtful advice and a keen eye for detail. Every visit is designed as a personal interlude, combining careful diagnosis, tailored services and styling true to who you are.', services: ['Bespoke hairstyling, cutting and beauty services', 'Targeted hair care adapted to every need', 'Personal image advice and tailored guidance', 'Beauty preparation for weddings and events'], keyPoints: ['Diagnosis before every service', 'Attentive team and mastered techniques', 'Elegant setting in central Brazzaville', 'A personalized end-to-end experience'], galleryImages: [], contactInfo: { address: 'Av. Amilcar Cabral, 1st floor, Twin Towers, opposite Radisson Blu Hotel, City Centre', phone: '+242 06 989 8993', whatsapp: '+242 06 989 8993', email: 'atelier5officiel@gmail.com', social: { facebook: 'https://www.facebook.com/atelier5officiel', instagram: 'https://www.instagram.com/atelier5officiel/', tiktok: 'https://www.tiktok.com/@atelier5officiel', linkedin: '#' } }
      },
      'la-manne': {
        title: 'La Manne', subtitle: 'Cultivating Excellence, from Earth to Table', description: 'La Manne embodies our vision of future-proof agriculture: respectful of ecosystems, guaranteeing animal welfare, and creating authentic flavors. We master the entire value chain to offer products of impeccable quality, telling the story of our terroirs and our passion.', services: ['Organic and regenerative agriculture', 'Ethical and extensive free-range farming', 'Artisanal processing workshops (cheese-making, canning)', 'Development of short and virtuous distribution channels'], keyPoints: ['Commitment to Biodiversity', 'Absolute Traceability and Transparency', 'Artisanal and Innovative Know-How', 'Preserved Original Taste'], galleryImages: [], contactInfo: { address: '202 Terroirs Road, Bordeaux', phone: '+33 7 89 01 23 45', email: 'contact@la-manne.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'spi-alim': {
        title: 'SPI Alim', subtitle: 'From Production to Your Table', description: 'SPI Alim brings together the production, selection and distribution of quality food products. Through La Manne, its agricultural production brand, SPI Alim controls product origin while connecting harvests, local expertise and consumers.', services: ['Distribution of La Manne agricultural products', 'Selection and sale of food products', 'Custom baskets and orders', 'Supply solutions for professionals'], keyPoints: ['La Manne, an Integrated Production Brand', 'Product Traceability', 'Promotion of Local Production', 'Service for Individuals and Professionals'], galleryImages: [], contactInfo: { address: 'Brazzaville, Republic of the Congo', phone: '+242 00 000 0000', email: 'contact@spi-alim.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'zen-sens': {
        title: 'Zen Sens', subtitle: 'Emotion at the Heart of Every Fragrance', description: 'Zen Sens is a house dedicated to perfumes and the emotions they reveal. Our selection brings together elegant fragrances, distinctive trails and olfactory creations designed for every personality and moment.', services: ['Women’s and men’s perfume selection', 'Personal fragrance consultation', 'Home fragrances and scents', 'Perfume gift sets'], keyPoints: ['Distinctive Fragrance Selection', 'Personal Guidance', 'Singular Olfactory World', 'Sensory Experience'], galleryImages: [{ src: 'https://images.unsplash.com/photo-1541643600914-78b084683601', alt: 'Zen Sens perfumes and fragrances' }], contactInfo: { address: 'Brazzaville, Republic of the Congo', phone: '', email: 'contact@zen-sens.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
      },
      'spi-energy': {
        title: 'SPI Energy', subtitle: 'Petroleum Expertise & Operational Excellence', description: 'SPI Energy operates in the petroleum sector with a clear ambition: to provide businesses and territories with reliable, secure solutions tailored to their needs. Our approach combines operational control, quality of service and knowledge of the petroleum value chain.', services: ['Distribution of petroleum products', 'Supply of fuels and lubricants', 'Logistics, storage and supply', 'Petroleum solutions for professionals'], keyPoints: ['Logistics Chain Expertise', 'Safety and Compliance', 'Reliable Supply', 'Professional Service'], galleryImages: [{ src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837', alt: 'SPI Energy industrial operations' }], contactInfo: { address: 'Brazzaville, Republic of the Congo', phone: '', email: 'contact@spienergy.com', social: { facebook: '#', instagram: '#', linkedin: '#' } }
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
  const [presentationVideo, setPresentationVideo] = useState(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [branchWhatsAppNumber, setBranchWhatsAppNumber] = useState('');
  const [managedProfile, setManagedProfile] = useState(null);
  const { getBranchWhatsApp } = useBranchWhatsApp();

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
    let active = true;
    const loadBranchWhatsApp = async () => {
      const config = await getBranchWhatsApp(branch);
      if (active) setBranchWhatsAppNumber(config?.is_enabled ? config.whatsapp_number : '');
    };
    loadBranchWhatsApp();
    return () => { active = false; };
  }, [branch, getBranchWhatsApp]);

  useEffect(() => {
    let active = true;
    const loadManagedProfile = async () => {
      const { data } = await supabase.from('footer_configuration').select('content').eq('pole_id', branch).maybeSingle();
      if (active) setManagedProfile(data?.content?.branch_profile || null);
    };
    loadManagedProfile();
    return () => { active = false; };
  }, [branch]);

  useEffect(() => {
    setHeroError(false);
  }, [currentIndex, branch]);

  useEffect(() => {
    setVideoStarted(false);
    setPresentationVideo(null);
    const videoBranchConfig = BRANCH_TABLE_MAP[branch];
    if (!videoBranchConfig) {
      setPresentationVideo(null);
      return;
    }

    const fetchPresentationVideo = async () => {
      const { data } = await supabase
        .from(videoBranchConfig.table)
        .select('*')
        .eq('is_active', true)
        .ilike('section', '%video%')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setPresentationVideo(data);
    };

    fetchPresentationVideo();
  }, [branch]);
  
  if (!branch || !t.branches[branch]) return null;

  const baseBranchData = t.branches[branch];
  const managedOverrides = managedProfile ? Object.fromEntries(Object.entries(managedProfile).filter(([key, value]) => key !== 'experience' && (Array.isArray(value) ? value.length > 0 : Boolean(value)))) : {};
  const branchData = { ...baseBranchData, ...managedOverrides, contactInfo: baseBranchData.contactInfo, galleryImages: baseBranchData.galleryImages };
  const brand = getBranchBrand(branch);
  const isSpiAlim = branch === 'spi-alim';
  const requestConfig = getBranchRequestConfig(branch);
  const experienceConfig = { ...getBranchExperienceConfig(branch), ...(managedProfile?.experience || {}) };
  const videoUrl = presentationVideo?.video_url || presentationVideo?.content || presentationVideo?.image_url;
  const videoThumbnail = presentationVideo?.thumbnail_url || (presentationVideo?.content ? presentationVideo?.image_url : null);
  const videoEmbedUrl = getVideoEmbedUrl(videoUrl);
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
  const galleryConfig = ['spi-energy', 'zen-sens'].includes(branch) ? {
     tableName: 'vision_images',
     sectionFilter: 'gallery',
     tagFilter: branch,
     orderBy: 'created_at'
  } : branchConfig ? {
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
      <div className="bg-white overflow-hidden" style={{ '--branch-primary': brand.primary, '--branch-secondary': brand.secondary, '--branch-soft': brand.soft }}>
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
                {brand.logo ? <img src={brand.logo} alt={`Logo ${branchData.title}`} className="h-28 md:h-36 w-auto max-w-full object-contain object-left mb-6" /> : <Icon className="h-16 w-16 mb-6" style={{ color: brand.primary }} />}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: brand.primary }}>{branchData.title}</h1>
                <p className="text-xl md:text-2xl mb-6 md:mb-8" style={{ color: brand.secondary }}>{branchData.subtitle}</p>
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

      {isSpiAlim && (
        <section className="section-padding" style={{ backgroundColor: brand.soft }}>
          <div className="container-custom">
            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-xl">
              <div className="grid items-center lg:grid-cols-[0.85fr_1.15fr]">
                <div className="flex min-h-[320px] items-center justify-center p-8 md:p-12" style={{ background: 'linear-gradient(145deg, #edf8f1, #ffffff)' }}>
                  <img src={getBranchBrand('la-manne').logo} alt="Logo La Manne" className="h-52 w-full object-contain md:h-64" />
                </div>
                <div className="p-7 md:p-12 lg:p-16">
                  <span className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: brand.secondary }}>{language === 'fr' ? 'Une marque de SPI Alim' : 'A SPI Alim brand'}</span>
                  <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-5xl">La Manne</h2>
                  <p className="mt-5 text-base leading-relaxed text-gray-600 md:text-lg">
                    {language === 'fr'
                      ? 'La Manne est la marque de production agricole de SPI Alim. Elle cultive, sélectionne et valorise des produits issus de nos terroirs, ensuite distribués et commercialisés par SPI Alim.'
                      : 'La Manne is SPI Alim’s agricultural production brand. It grows, selects and enhances local products that are then distributed and marketed by SPI Alim.'}
                  </p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {[(language === 'fr' ? 'Production agricole' : 'Agricultural production'), (language === 'fr' ? 'Produits locaux' : 'Local products'), (language === 'fr' ? 'Traçabilité' : 'Traceability'), (language === 'fr' ? 'Distribution SPI Alim' : 'SPI Alim distribution')].map((item) => (
                      <div key={item} className="flex items-center rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700"><CheckCircle className="mr-3 h-4 w-4 text-green-700" />{item}</div>
                    ))}
                  </div>
                  <Button onClick={() => navigate('/branches/la-manne')} className="mt-8 text-white" style={{ backgroundColor: getBranchBrand('la-manne').primary }}>
                    {language === 'fr' ? 'Découvrir La Manne' : 'Discover La Manne'} <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {experienceConfig && (
        <>
          <section className="border-y border-gray-100 bg-white">
            <div className="container-custom grid grid-cols-2 divide-x divide-y divide-gray-100 md:grid-cols-4 md:divide-y-0">
              {experienceConfig.stats.map((item, index) => {
                const StatIcon = [Gem, Sparkles, Star, MapPin][index];
                return (
                <div key={item.label} className="px-4 py-8 text-center md:py-10">
                  <StatIcon className="mx-auto mb-3 h-5 w-5" style={{ color: brand.secondary }} />
                  <strong className="block text-lg font-bold md:text-xl" style={{ color: brand.primary }}>{item.value}</strong>
                  <span className="mt-1 block text-xs text-gray-500 md:text-sm">{item.label}</span>
                </div>
              )})}
            </div>
          </section>

          <section className="section-padding" style={{ backgroundColor: brand.soft }}>
            <div className="container-custom">
              <div className="mb-10 max-w-3xl">
                <span className="mb-4 inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] shadow-sm" style={{ color: brand.primary }}>
                  <Play className="mr-2 h-3.5 w-3.5" /> {experienceConfig.eyebrow}
                </span>
                <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
                  {experienceConfig.title}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-gray-600 md:text-lg">
                  {experienceConfig.intro}
                </p>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-[2rem] bg-gray-950 shadow-2xl ring-1 ring-black/10">
                {videoUrl ? (
                  videoEmbedUrl ? (
                    videoThumbnail && !videoStarted ? (
                      <button type="button" onClick={() => setVideoStarted(true)} className="group absolute inset-0 h-full w-full" aria-label={`Lire la vidéo ${branchData.title}`}>
                        <img src={videoThumbnail} alt={presentationVideo?.title || `Miniature vidéo ${branchData.title}`} className="h-full w-full object-cover" />
                        <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/35" />
                        <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-950 shadow-2xl transition group-hover:scale-110"><Play className="ml-1 h-8 w-8 fill-current" /></span>
                      </button>
                    ) : <iframe src={videoEmbedUrl} title={presentationVideo?.title || `Présentation ${branchData.title}`} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                  ) : (
                    <video src={videoUrl} controls playsInline poster={videoThumbnail} className="h-full w-full object-cover">
                      {language === 'fr' ? 'Votre navigateur ne prend pas en charge la vidéo.' : 'Your browser does not support video.'}
                    </video>
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top_left,_#7a1b71,_#24102d_55%,_#0d0711)] p-8 text-center">
                    <div>
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md">
                        <Play className="ml-1 h-8 w-8 fill-current" />
                      </div>
                      <p className="text-xl font-semibold text-white md:text-2xl">Le film {branchData.title} arrive bientôt</p>
                      <p className="mx-auto mt-3 max-w-xl text-sm text-white/65 md:text-base">{language === 'fr' ? 'Cette section est prête à accueillir la vidéo de présentation au format paysage.' : 'This section is ready for the landscape presentation film.'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
           {experienceConfig && (
             <div className="mb-12 max-w-3xl">
               <span className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: brand.secondary }}>{experienceConfig.expertiseLabel}</span>
               <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-5xl">{experienceConfig.expertiseTitle}</h2>
               <p className="mt-5 text-lg leading-relaxed text-gray-600">{experienceConfig.expertiseIntro}</p>
             </div>
           )}
           <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-start">
                <div className="min-w-0 order-2 lg:order-1">
                    {!experienceConfig && <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8">{t.services}</h2>}
                    <div className={experienceConfig ? '-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-5 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0' : 'space-y-4'}>
                    {branchData.services.map((service, index) => (
                        <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className={experienceConfig ? 'group min-w-[82%] snap-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg sm:min-w-0' : 'flex items-start'}>
                            <div className={experienceConfig ? 'mb-5 flex h-11 w-11 items-center justify-center rounded-xl' : ''} style={experienceConfig ? { backgroundColor: brand.soft, color: brand.primary } : undefined}>
                              <CheckCircle className={experienceConfig ? 'h-5 w-5' : 'h-6 w-6 mr-3 mt-1 text-blue-500 flex-shrink-0'} />
                            </div>
                            <p className={experienceConfig ? 'font-semibold leading-relaxed text-gray-800' : 'text-base md:text-lg text-gray-700'}>{service}</p>
                        </motion.div>
                    ))}
                    </div>
                    {experienceConfig && (
                      <div className="mt-1 flex items-center justify-center gap-2 text-xs font-medium text-gray-500 sm:hidden">
                        <span className="h-1.5 w-8 rounded-full" style={{ backgroundColor: brand.secondary }}></span>
                        <span>{language === 'fr' ? 'Faites glisser pour découvrir les prestations' : 'Swipe to explore services'}</span>
                      </div>
                    )}
                </div>
                <div className="min-w-0 bg-white p-6 md:p-8 rounded-2xl shadow-lg border order-1 lg:order-2" style={experienceConfig ? { borderTop: `4px solid ${brand.secondary}` } : undefined}>
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-2xl md:text-3xl font-bold" style={{ color: experienceConfig ? brand.primary : undefined }}>{t.keyPoints}</h3>
                      {experienceConfig && <ShieldCheck className="h-8 w-8" style={{ color: brand.secondary }} />}
                    </div>
                    <ul className="space-y-3">
                        {branchData.keyPoints.map((point, index) => (
                             <motion.li key={index} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="flex items-center text-base md:text-lg font-medium text-gray-800">
                                <div className="w-3 h-3 rounded-full mr-4 flex-shrink-0" style={{ backgroundColor: brand.secondary }}></div>
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
            {experienceConfig ? (
              <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="max-w-2xl">
                  <span className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: brand.secondary }}>{language === 'fr' ? 'En images' : 'In pictures'}</span>
                  <h2 className="mt-3 text-3xl font-bold text-gray-900 md:text-5xl">{language === 'fr' ? `Le portfolio ${branchData.title}` : `${branchData.title} portfolio`}</h2>
                  <p className="mt-4 text-gray-600">{language === 'fr' ? 'Une sélection de réalisations, de produits et de moments qui racontent notre activité et notre exigence.' : 'A selection of work, products and moments that express our activity and standards.'}</p>
                </div>
                {branchData.contactInfo.social.instagram && branchData.contactInfo.social.instagram !== '#' && (
                  <a href={branchData.contactInfo.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center font-semibold" style={{ color: brand.primary }}>
                    Instagram <ArrowUpRight className="ml-2 h-4 w-4" />
                  </a>
                )}
              </div>
            ) : <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-12 text-center">{t.gallery}</h2>}
            <DynamicGallery 
                tableName={galleryConfig.tableName} 
                sectionFilter="gallery" 
                tagFilter={galleryConfig.tagFilter} 
                orderBy={galleryConfig.orderBy}
                variant={experienceConfig ? 'editorial' : 'grid'}
            />
        </div>
      </section>

      {requestConfig && (
        <WhatsAppBooking
          branchId={branch}
          brand={brand}
          whatsappNumber={branchWhatsAppNumber || branchData.contactInfo.whatsapp || branchData.contactInfo.phone}
          open={bookingOpen}
          onOpenChange={setBookingOpen}
        />
      )}

      <section className="section-padding" style={{ background: requestConfig ? `linear-gradient(135deg, ${brand.primary}, ${brand.secondary})` : 'var(--primary-color)' }}>
        <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">{requestConfig ? requestConfig.title : t.contact}</h2>
            <p className="text-xl text-white/75 mb-8 max-w-2xl mx-auto">
              {requestConfig
                ? `Faites vos choix en quelques étapes, puis poursuivez directement avec l’équipe ${requestConfig.branchName} sur WhatsApp.`
                : (language === 'fr' ? 'Contactez-nous directement via les coordonnées ci-dessous ou visitez la page contact du groupe.' : 'Contact us directly using the details below or visit the group\'s contact page.')}
            </p>
            <Button
              onClick={() => requestConfig ? setBookingOpen(true) : navigate('/contact')}
              className="bg-white hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg shadow-xl transform hover:scale-105 transition-transform"
              style={{ color: brand.primary }}
            >
              {requestConfig ? <><CalendarDays className="mr-2 h-5 w-5" />{requestConfig.actionLabel}</> : (language === 'fr' ? 'Page Contact du Groupe' : 'Group Contact Page')}
            </Button>
        </div>
      </section>

      <BranchFooter branchId={branch} branchData={branchData} language={language} />
    </>
  );
};

export default BranchDetailPage;
