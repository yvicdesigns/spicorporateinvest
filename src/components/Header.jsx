import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebsiteLogo } from '@/hooks/useWebsiteLogo';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Header = ({ language, setLanguage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { logoUrl, logoSettings } = useWebsiteLogo();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    width = 150,
    height = 'auto',
    opacity = 100,
    alignment = 'left',
    paddingX = 0
  } = logoSettings || {};

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const translations = {
    fr: {
      home: 'Accueil',
      about: 'À Propos',
      branches: 'Nos Activités',
      shop: 'Boutique',
      news: 'Actualités',
      rse: 'Engagement RSE',
      contact: 'Contact'
    },
    en: {
      home: 'Home',
      about: 'About',
      branches: 'Our Activities',
      shop: 'Shop',
      news: 'News',
      rse: 'CSR Commitment',
      contact: 'Contact'
    }
  };
  const t = translations[language];
  
  const allMenuItems = [
    { id: 'home', label: t.home, path: '/' }, 
    { id: 'about', label: t.about, path: '/about' }, 
    { id: 'branches', label: t.branches, path: '/branches' }, 
    { id: 'shop', label: t.shop, icon: ShoppingBag, path: '/boutique' }, 
    { id: 'news', label: t.news, path: '/news' }, 
    { id: 'rse', label: t.rse, path: '/rse' }, 
    { id: 'contact', label: t.contact, path: '/contact' }
  ];

  // Only show shop link if user is authenticated
  const menuItems = allMenuItems.filter(item => item.id !== 'shop' || user);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-md`}>
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20 relative z-[60]">
          
          <div onClick={() => navigate('/')} className={`flex items-center cursor-pointer flex-shrink-0`} style={{ paddingLeft: `${paddingX}px`, paddingRight: `${paddingX}px` }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="SPI Corporate Logo" 
                  className="object-contain transition-all duration-300"
                  style={{
                    width: `${width}px`,
                    height: height === 'auto' ? 'auto' : `${height}px`,
                    opacity: opacity / 100,
                    maxWidth: '100%' 
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if(e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="flex items-center">
                  <span className={`text-2xl sm:text-3xl font-bold primary-accent`}>SPI Corporate</span>
                  <span className={`text-2xl sm:text-3xl font-bold ml-2 secondary-accent`}>Invest</span>
                </div>
              )}
              <div className="hidden items-center fallback-logo-text">
                   <span className={`text-2xl sm:text-3xl font-bold primary-accent`}>SPI Corporate</span>
                   <span className={`text-2xl sm:text-3xl font-bold ml-2 secondary-accent`}>Invest</span>
              </div>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <button key={item.id} onClick={() => navigate(item.path)} className={`flex items-center text-sm font-medium transition-colors duration-300 relative group ${isActive ? 'text-blue-900 font-semibold' : 'text-gray-600 hover:text-blue-900'}`}>
                  {item.icon && <item.icon className="w-4 h-4 mr-1.5" />}
                  <span>{item.label}</span>
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${isActive ? 'scale-x-100' : ''} primary-accent-bg`}></span>
                </button>
              );
            })}
            <Button variant="ghost" size="icon" onClick={toggleLanguage} className={`ml-4 text-gray-600 hover:text-blue-900`} aria-label="Changer de langue">
              <Globe className="h-5 w-5" />
              <span className="ml-1 text-xs font-semibold">{language.toUpperCase()}</span>
            </Button>
          </div>

          <button className={`lg:hidden z-[60] text-gray-800 relative`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Ouvrir le menu">
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        {mobileMenuOpen && (
          <motion.div 
            key="mobile-menu"
            initial={{ opacity: 0, x: '100%' }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: '100%' }} 
            transition={{ type: 'spring', stiffness: 400, damping: 40 }} 
            className="fixed inset-y-0 right-0 w-[75vw] sm:w-[280px] bg-white z-50 lg:hidden flex flex-col shadow-2xl h-[100dvh]"
          >
            {/* The header area of the menu to keep spacing clear for the close button */}
            <div className="h-20 flex-shrink-0" />
            
            <div className="flex flex-col flex-grow overflow-y-auto px-4 pb-6">
              {menuItems.map((item, idx) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: 0.05 * idx }}>
                    <button
                      onClick={() => { navigate(item.path); setMobileMenuOpen(false); }} 
                      className={`flex items-center w-full text-left py-3.5 px-3 text-base font-medium border-b border-gray-50 last:border-b-0 transition-colors duration-200 rounded-lg ${isActive ? 'text-blue-900 font-semibold bg-blue-50/50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
                    >
                      {item.icon && <item.icon className="w-4 h-4 mr-3 opacity-80" />}
                      {item.label}
                    </button>
                  </motion.div>
                );
              })}
            </div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} className="mt-auto p-4 border-t border-gray-100 bg-gray-50">
              <button onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }} className="flex items-center justify-center w-full py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200">
                <Globe className="h-4 w-4 mr-2" />
                {language === 'fr' ? 'English' : 'Français'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;