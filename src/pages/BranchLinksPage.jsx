import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Car, Sparkles, Wheat, ShoppingBag, Heart, Leaf,
  Facebook, Instagram, Linkedin, Youtube, Globe, X,
  Phone, MessageCircle, ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useWebsiteLogo } from '@/hooks/useWebsiteLogo';

const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z" />
  </svg>
);

const BRANCHES = [
  { id: 'sci-renaissance', name: 'SCI Renaissance', subtitle: "Immobilier d'Exception", icon: Building2, gradient: 'from-blue-600 to-blue-800', accent: '#3b82f6' },
  { id: 'sci-espoir',      name: 'Fondation SPI',   subtitle: 'Valorisation Patrimoniale', icon: Heart,      gradient: 'from-cyan-600 to-cyan-800',    accent: '#06b6d4' },
  { id: 'nouveau-concept', name: 'Nouveau Concept', subtitle: 'Mobilité Intelligente',     icon: Car,        gradient: 'from-indigo-600 to-indigo-800', accent: '#6366f1' },
  { id: 'atelier-5',       name: 'Atelier 5',       subtitle: 'Art du Bien-Être',          icon: Sparkles,   gradient: 'from-purple-600 to-purple-800', accent: '#a855f7' },
  { id: 'la-manne',        name: 'La Manne',        subtitle: "Agriculture d'Avenir",      icon: Wheat,      gradient: 'from-green-600 to-green-800',   accent: '#22c55e' },
  { id: 'spi-alim',        name: 'SPI Alim',        subtitle: 'Gastronomie & Terroirs',    icon: ShoppingBag, gradient: 'from-amber-600 to-amber-800',  accent: '#f59e0b' },
  { id: 'zen-sens',        name: 'Zen-Sens',        subtitle: 'Harmonie & Bien-Être',      icon: Leaf,        gradient: 'from-teal-600 to-teal-800',   accent: '#14b8a6' },
];

const SOCIAL_CONFIGS = [
  { key: 'facebook_url',  label: 'Facebook',  Icon: Facebook,       bg: 'bg-blue-600',   hover: 'hover:bg-blue-700'   },
  { key: 'instagram_url', label: 'Instagram', Icon: Instagram,      bg: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400', hover: '' },
  { key: 'tiktok_url',    label: 'TikTok',    Icon: TikTokIcon,     bg: 'bg-gray-900',   hover: 'hover:bg-black'      },
  { key: 'linkedin_url',  label: 'LinkedIn',  Icon: Linkedin,       bg: 'bg-blue-700',   hover: 'hover:bg-blue-800'   },
  { key: 'youtube_url',   label: 'YouTube',   Icon: Youtube,        bg: 'bg-red-600',    hover: 'hover:bg-red-700'    },
  { key: 'whatsapp',      label: 'WhatsApp',  Icon: MessageCircle,  bg: 'bg-green-500',  hover: 'hover:bg-green-600', isPhone: true },
  { key: 'phone',         label: 'Téléphone', Icon: Phone,          bg: 'bg-gray-600',   hover: 'hover:bg-gray-700',  isPhone: true },
];

// ── Modal ──────────────────────────────────────────────────────────────────────
const BranchModal = ({ branch, socials, onClose }) => {
  const Icon = branch.icon;

  const activeSocials = SOCIAL_CONFIGS.filter(cfg => {
    const val = socials[cfg.key];
    return val && val.trim() !== '';
  });

  const handleSocialClick = (cfg) => {
    const val = socials[cfg.key];
    if (!val) return;
    let href = val;
    if (cfg.key === 'whatsapp') href = `https://wa.me/${val.replace(/[^0-9]/g, '')}`;
    else if (cfg.key === 'phone') href = `tel:${val}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0"
    >
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0f1c3f] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${branch.gradient} p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">{branch.name}</p>
              <p className="text-white/70 text-sm">{branch.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="p-5 space-y-3">
          {activeSocials.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">
              Aucun réseau social configuré
            </p>
          ) : (
            activeSocials.map((cfg) => (
              <button
                key={cfg.key}
                onClick={() => handleSocialClick(cfg)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md ${cfg.bg} ${cfg.hover}`}
              >
                <cfg.Icon size={20} />
                <span>{cfg.label}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-60" />
              </button>
            ))
          )}

          {/* Branch website button */}
          <a
            href={`https://www.spicorpinvest.com/branches/${branch.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] mt-1"
          >
            <Globe className="w-5 h-5 text-[#d4af37]" />
            <span>Page de la branche</span>
            <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-60" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Branch card ────────────────────────────────────────────────────────────────
const BranchCard = ({ branch, socialCount, index, onClick }) => {
  const Icon = branch.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full bg-gradient-to-r ${branch.gradient} rounded-2xl p-4 text-left shadow-lg border border-white/10`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base leading-tight">{branch.name}</p>
          <p className="text-white/70 text-sm mt-0.5">{branch.subtitle}</p>
          {socialCount > 0 && (
            <p className="text-white/50 text-xs mt-1">{socialCount} réseau{socialCount > 1 ? 'x' : ''} social{socialCount > 1 ? 'ux' : ''}</p>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
          <ExternalLink className="w-3.5 h-3.5 text-white/70" />
        </div>
      </div>
    </motion.button>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const BranchLinksPage = () => {
  const { logoUrl } = useWebsiteLogo();
  const [allSocials, setAllSocials] = useState({});
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        // Fetch social links from footer_configuration (stored in content JSONB)
        const [{ data: footerData }, { data: waData }] = await Promise.all([
          supabase.from('footer_configuration').select('pole_id, content'),
          supabase.from('branch_whatsapp_config').select('pole_id, whatsapp_number, is_enabled'),
        ]);

        const map = {};
        if (footerData) {
          footerData.forEach(row => {
            map[row.pole_id] = { ...(row.content || {}) };
          });
        }
        if (waData) {
          waData.forEach(row => {
            if (row.is_enabled && row.whatsapp_number) {
              if (!map[row.pole_id]) map[row.pole_id] = {};
              map[row.pole_id].whatsapp = row.whatsapp_number;
            }
          });
        }
        setAllSocials(map);
      } catch (err) {
        console.error('Failed to fetch socials', err);
      }
    };
    fetchSocials();
  }, []);

  const countSocials = (branchId) => {
    const s = allSocials[branchId] || {};
    return SOCIAL_CONFIGS.filter(cfg => s[cfg.key] && s[cfg.key].trim() !== '').length;
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0f1c3f] via-[#1e3a8a] to-[#0f1c3f] flex flex-col items-center px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-8"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="SPI Corporate Invest" className="h-16 w-auto object-contain mb-4" />
          ) : (
            <div className="mb-4 text-center">
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
              socialCount={countSocials(branch.id)}
              index={index}
              onClick={() => setSelectedBranch(branch)}
            />
          ))}
        </div>

        {/* Website button */}
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          href="https://www.spicorpinvest.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-md flex items-center justify-center gap-3 bg-[#d4af37] hover:bg-[#c49e2f] text-[#0f1c3f] font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Globe className="w-5 h-5" />
          Visiter notre site web
        </motion.a>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 text-white/30 text-xs text-center"
        >
          © {new Date().getFullYear()} SPI Corporate Invest — Tous droits réservés
        </motion.p>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedBranch && (
          <BranchModal
            branch={selectedBranch}
            socials={allSocials[selectedBranch.id] || {}}
            onClose={() => setSelectedBranch(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default BranchLinksPage;
