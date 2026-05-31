import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Car, Sparkles, Wheat, ShoppingBag, Heart, Facebook, Instagram, Linkedin, Youtube, Globe, ExternalLink, Phone } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useWebsiteLogo } from '@/hooks/useWebsiteLogo';

// TikTok icon (not in lucide)
const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z" />
  </svg>
);

const BRANCHES = [
  {
    id: 'sci-renaissance',
    name: 'SCI Renaissance',
    subtitle: "Immobilier d'Exception",
    icon: Building2,
    gradient: 'from-blue-600 to-blue-800',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-300',
  },
  {
    id: 'sci-espoir',
    name: 'Fondation SPI',
    subtitle: 'Valorisation Patrimoniale',
    icon: Heart,
    gradient: 'from-cyan-600 to-cyan-800',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-300',
  },
  {
    id: 'nouveau-concept',
    name: 'Nouveau Concept',
    subtitle: 'Mobilité Intelligente',
    icon: Car,
    gradient: 'from-indigo-600 to-indigo-800',
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-300',
  },
  {
    id: 'atelier-5',
    name: 'Atelier 5',
    subtitle: 'Art du Bien-Être',
    icon: Sparkles,
    gradient: 'from-purple-600 to-purple-800',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-300',
  },
  {
    id: 'la-manne',
    name: 'La Manne',
    subtitle: "Agriculture d'Avenir",
    icon: Wheat,
    gradient: 'from-green-600 to-green-800',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-300',
  },
  {
    id: 'spi-alim',
    name: 'SPI Alim',
    subtitle: 'Gastronomie & Terroirs',
    icon: ShoppingBag,
    gradient: 'from-amber-600 to-amber-800',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-300',
  },
];

const SocialIcon = ({ platform, url }) => {
  if (!url || url === '#') return null;

  const icons = {
    facebook: { Icon: Facebook, hover: 'hover:text-blue-400' },
    instagram: { Icon: Instagram, hover: 'hover:text-pink-400' },
    linkedin: { Icon: Linkedin, hover: 'hover:text-blue-300' },
    youtube: { Icon: Youtube, hover: 'hover:text-red-400' },
    tiktok: { Icon: TikTokIcon, hover: 'hover:text-white' },
    phone: { Icon: Phone, hover: 'hover:text-green-400', isPhone: true },
  };

  const config = icons[platform];
  if (!config) return null;
  const { Icon, hover, isPhone } = config;

  return (
    <a
      href={isPhone ? `tel:${url}` : url}
      target={isPhone ? '_self' : '_blank'}
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`text-white/60 ${hover} transition-colors duration-200`}
      aria-label={platform}
    >
      <Icon size={18} />
    </a>
  );
};

const BranchCard = ({ branch, socials, index, onClick }) => {
  const Icon = branch.icon;
  const hasSocials = socials && Object.values(socials).some(v => v && v !== '#');

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full bg-gradient-to-r ${branch.gradient} rounded-2xl p-4 text-left shadow-lg border border-white/10 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${branch.iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${branch.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base leading-tight">{branch.name}</p>
          <p className="text-white/70 text-sm mt-0.5 truncate">{branch.subtitle}</p>
          {hasSocials && (
            <div className="flex items-center gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
              {Object.entries(socials).map(([platform, url]) => (
                <SocialIcon key={platform} platform={platform} url={url} />
              ))}
            </div>
          )}
        </div>
        <ExternalLink className="w-4 h-4 text-white/40 flex-shrink-0" />
      </div>
    </motion.button>
  );
};

const BranchLinksPage = () => {
  const { logoUrl } = useWebsiteLogo();
  const [branchSocials, setBranchSocials] = useState({});

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const { data, error } = await supabase
          .from('footer_configuration')
          .select('pole_id, facebook_url, instagram_url, linkedin_url, youtube_url, tiktok_url, phone');

        if (error) throw error;

        const map = {};
        if (data) {
          data.forEach(row => {
            map[row.pole_id] = {
              facebook: row.facebook_url,
              instagram: row.instagram_url,
              linkedin: row.linkedin_url,
              youtube: row.youtube_url,
              tiktok: row.tiktok_url,
              phone: row.phone,
            };
          });
        }
        setBranchSocials(map);
      } catch (err) {
        console.error('Failed to fetch socials', err);
      }
    };

    fetchSocials();
  }, []);

  const handleBranchClick = (branchId) => {
    window.open(`https://www.spicorpinvest.com/branches/${branchId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1c3f] via-[#1e3a8a] to-[#0f1c3f] flex flex-col items-center px-4 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-8"
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="SPI Corporate Invest"
            className="h-16 w-auto object-contain mb-4"
          />
        ) : (
          <div className="mb-4">
            <span className="text-3xl font-bold text-white">SPI</span>
            <span className="text-3xl font-bold text-[#d4af37] ml-2">Corporate Invest</span>
          </div>
        )}
        <p className="text-[#d4af37] text-sm font-medium tracking-widest uppercase">
          Développer · Innover · Construire
        </p>
      </motion.div>

      {/* Branch cards */}
      <div className="w-full max-w-md space-y-3 mb-8">
        {BRANCHES.map((branch, index) => (
          <BranchCard
            key={branch.id}
            branch={branch}
            socials={branchSocials[branch.id]}
            index={index}
            onClick={() => handleBranchClick(branch.id)}
          />
        ))}
      </div>

      {/* Website button */}
      <motion.a
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        href="https://www.spicorpinvest.com"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-md flex items-center justify-center gap-3 bg-[#d4af37] hover:bg-[#c49e2f] text-[#0f1c3f] font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Globe className="w-5 h-5" />
        Visiter notre site web
      </motion.a>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 text-white/30 text-xs text-center"
      >
        © {new Date().getFullYear()} SPI Corporate Invest — Tous droits réservés
      </motion.p>
    </div>
  );
};

export default BranchLinksPage;
