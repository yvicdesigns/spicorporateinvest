import React, { useEffect, useState } from 'react';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Lock, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { SHOP_BRANCHES } from '@/lib/shopConstants';
import { useNavigate } from 'react-router-dom';

// Custom TikTok Icon
const TikTokIcon = ({
  className
}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>;
const Footer = ({
  language
}) => {
  const navigate = useNavigate();
  const [footerData, setFooterData] = useState({
    description_fr: 'Excellence multisectorielle au service de votre développement. Immobilier, mobilité, bien-être, agro-pastoral et épicerie fine.',
    description_en: 'Multisectoral excellence serving your development. Real estate, mobility, wellness, agro-pastoral and fine grocery.',
    email: 'contact@groupespi.com',
    phone: '+242 00 000 0000',
    location_fr: 'Siège Social, Ville, Pays',
    location_en: 'Headquarters, City, Country',
    facebook_url: 'https://facebook.com',
    instagram_url: 'https://instagram.com',
    linkedin_url: 'https://linkedin.com',
    tiktok_url: ''
  });
  useEffect(() => {
    fetchFooterConfig();
  }, []);
  const fetchFooterConfig = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('footer_configuration').select('content').eq('pole_id', 'global').maybeSingle();
      if (data?.content && !error) {
        setFooterData(prev => ({
          ...prev,
          ...data.content
        }));
      }
    } catch (err) {
      console.error('Error loading footer config:', err);
    }
  };
  const translations = {
    fr: {
      about: 'À Propos',
      quickLinks: 'Liens Rapides',
      contact: 'Contact',
      followUs: 'Suivez-nous',
      rights: 'Tous droits réservés',
      home: 'Accueil',
      branches: 'Nos Activités',
      shop: 'Boutique',
      news: 'Actualités',
      rse: 'Engagement RSE',
      whatsapp: 'WhatsApp Branches'
    },
    en: {
      about: 'About',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      followUs: 'Follow Us',
      rights: 'All rights reserved',
      home: 'Home',
      branches: 'Our Activities',
      shop: 'Shop',
      news: 'News',
      rse: 'CSR Commitment',
      whatsapp: 'Branch WhatsApp'
    }
  };
  const t = translations[language];
  return <footer className="bg-gray-100 text-gray-800 border-t border-gray-200">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4 cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-2xl font-bold primary-accent">SPI Corporate</span>
              <span className="text-2xl font-bold secondary-accent ml-2">SPI</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {language === 'fr' ? footerData.description_fr : footerData.description_en}
            </p>
          </div>

          <div>
            <span className="text-lg font-semibold mb-4 block primary-accent">{t.quickLinks}</span>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/')} className="text-gray-600 hover:primary-accent transition-colors">Invest</button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="text-gray-600 hover:primary-accent transition-colors">
                  {t.about}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/boutique')} className="text-gray-600 hover:primary-accent transition-colors">
                  {t.shop}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/branches')} className="text-gray-600 hover:primary-accent transition-colors">
                  {t.branches}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/news')} className="text-gray-600 hover:primary-accent transition-colors">
                  {t.news}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-lg font-semibold mb-4 block primary-accent">{t.contact}</span>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-1 flex-shrink-0 primary-accent" />
                <span className="text-gray-600 text-sm">
                  {language === 'fr' ? footerData.location_fr : footerData.location_en}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0 primary-accent" />
                <span className="text-gray-600 text-sm">{footerData.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0 primary-accent" />
                <span className="text-gray-600 text-sm">{footerData.email}</span>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-lg font-semibold mb-4 block primary-accent">{t.followUs}</span>
            <div className="mb-6">
              <span className="text-gray-600 text-sm block mb-2">Groupe SPI</span>
              <div className="flex space-x-4 mb-6">
                {footerData.facebook_url && <a href={footerData.facebook_url} target="_blank" rel="noopener noreferrer" className="bg-gray-200 text-gray-600 p-3 rounded-full hover:bg-blue-600 hover:text-white transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>}
                {footerData.instagram_url && <a href={footerData.instagram_url} target="_blank" rel="noopener noreferrer" className="bg-gray-200 text-gray-600 p-3 rounded-full hover:bg-pink-600 hover:text-white transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>}
                {footerData.linkedin_url && <a href={footerData.linkedin_url} target="_blank" rel="noopener noreferrer" className="bg-gray-200 text-gray-600 p-3 rounded-full hover:bg-blue-700 hover:text-white transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>}
                {footerData.tiktok_url && <a href={footerData.tiktok_url} target="_blank" rel="noopener noreferrer" className="bg-gray-200 text-gray-600 p-3 rounded-full hover:bg-black hover:text-white transition-colors">
                    <TikTokIcon className="h-5 w-5" />
                  </a>}
              </div>
              
              <span className="text-lg font-semibold mb-2 block primary-accent text-sm">{t.whatsapp}</span>
              <div className="flex flex-wrap gap-2">
                {SHOP_BRANCHES.map(branch => <a key={branch.id} href={`https://wa.me/${branch.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-600 hover:text-white transition-colors text-xs flex items-center" title={branch.name}>
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {branch.name.split(' ')[0]}
                    </a>)}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 pb-8">
          <div className="container-custom flex flex-col md:flex-row justify-between items-center">
             <p className="text-gray-500 text-sm text-center md:text-left">
                © {new Date().getFullYear()} SPI Corporate Invest. {t.rights}.
             </p>
             <button onClick={() => navigate('/dashboard')} className="mt-4 md:mt-0 flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <Lock className="w-3 h-3 mr-1" /> Admin Access
             </button>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;