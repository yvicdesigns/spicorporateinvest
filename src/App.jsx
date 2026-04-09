import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import BranchesPage from '@/pages/BranchesPage';
import BranchDetailPage from '@/pages/BranchDetailPage';
import NewsPage from '@/pages/NewsPage';
import NewsDetailPage from '@/pages/NewsDetailPage';
import RSEPage from '@/pages/RSEPage';
import ContactPage from '@/pages/ContactPage';
import DashboardPage from '@/pages/DashboardPage';
import ShopPage from '@/pages/ShopPage';
import CheckoutPage from '@/pages/CheckoutPage';
import ProductPreviewPage from '@/pages/ProductPreviewPage';
import ProductRedirectPage from '@/pages/ProductRedirectPage.jsx';
import LogoQueryTool from '@/pages/LogoQueryTool.jsx';
import ProductShareRedirectHandler from '@/pages/ProductShareRedirectHandler.jsx';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { Wifi, WifiOff } from 'lucide-react';
import { detectCrawler } from '@/utils/detectCrawler';

function App() {
  const [language, setLanguage] = useState('fr');
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for product query param on root to serve preview page or redirect
    const params = new URLSearchParams(location.search);
    const productId = params.get('product');
    
    if (location.pathname === '/' && productId) {
      const isCrawler = detectCrawler(navigator.userAgent);
      if (isCrawler) {
        navigate(`/preview?product=${productId}`, { replace: true });
      } else {
        // Direct to ProductRedirectPage if product id is in root query params
        navigate(`/product-redirect?product=${productId}`, { replace: true });
      }
    } else if (!productId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    const handleOnline = () => {
      toast({
        title: "Connexion rétablie",
        description: "Vous êtes de nouveau en ligne.",
        action: <Wifi className="h-5 w-5 text-green-500" />,
        duration: 3000,
      });
    };

    const handleOffline = () => {
      toast({
        title: "Pas de connexion internet",
        description: "Vérifiez votre réseau. L'application passe en mode hors ligne.",
        variant: "destructive",
        action: <WifiOff className="h-5 w-5" />,
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const isDashboard = location.pathname.startsWith('/dashboard');
  const isBranchDetail = location.pathname.startsWith('/branches/');
  const isPreview = location.pathname.startsWith('/preview');
  const isLogoQuery = location.pathname.startsWith('/logo-query');
  const isShareRedirect = location.pathname.startsWith('/share/');
  
  const showMainFooter = !isBranchDetail && !isDashboard && !isPreview && !isLogoQuery && !isShareRedirect;
  const showHeader = !isDashboard && !isPreview && !isLogoQuery && !isShareRedirect;

  return (
    <HelmetProvider>
      <Helmet>
        <title>Groupe SPI - Excellence Multisectorielle</title>
        <meta name="description" content="Groupe SPI - Leader multisectoriel dans l'immobilier, la mobilité, le bien-être, l'agro-pastoral et l'épicerie fine. Découvrez nos activités et notre engagement." />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-white">
        {showHeader && <Header language={language} setLanguage={setLanguage} />}
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage language={language} />} />
            <Route path="/about" element={<AboutPage language={language} />} />
            <Route path="/branches" element={<BranchesPage language={language} />} />
            <Route path="/branches/:id" element={<BranchDetailPage language={language} />} />
            <Route path="/news" element={<NewsPage language={language} />} />
            <Route path="/news/:id" element={<NewsDetailPage language={language} />} />
            <Route path="/rse" element={<RSEPage language={language} />} />
            <Route path="/contact" element={<ContactPage language={language} />} />
            
            {/* Redirect old /shop route to /boutique */}
            <Route path="/shop" element={<Navigate to="/boutique" replace />} />
            <Route path="/shop/:id" element={<Navigate to={`/boutique/${location.pathname.split('/')[2]}`} replace />} />
            
            {/* New Boutique routes */}
            <Route path="/boutique" element={<ShopPage language={language} />} />
            <Route path="/boutique/:id" element={<ShopPage language={language} />} />
            
            <Route path="/checkout/:id" element={<CheckoutPage language={language} />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/preview" element={<ProductPreviewPage />} />
            <Route path="/logo-query" element={<LogoQueryTool />} />
            <Route path="/product-redirect" element={<ProductRedirectPage />} />
            
            {/* Share link redirection */}
            <Route path="/share/:productId" element={<ProductShareRedirectHandler />} />
            
            <Route path="*" element={<HomePage language={language} />} />
          </Routes>
        </main>
        
        {showMainFooter && <Footer language={language} />}
        <Toaster />
      </div>
    </HelmetProvider>
  );
}

export default App;