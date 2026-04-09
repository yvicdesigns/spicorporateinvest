import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import PoleManager from '@/components/dashboard/PoleManager';
import FooterManager from '@/components/dashboard/FooterManager';
import ImageManager from '@/components/dashboard/ImageManager';
import NewsManager from '@/components/dashboard/NewsManager';
import ProductsManager from '@/components/dashboard/ProductsManager';
import AboutManager from '@/components/dashboard/AboutManager';
import LogoManager from '@/components/dashboard/LogoManager';
import ContactManager from '@/components/dashboard/ContactManager';
import BranchWhatsAppManager from '@/components/dashboard/BranchWhatsAppManager';
import WhatsAppConfig from '@/components/dashboard/WhatsAppConfig';
import { LayoutDashboard, Building, Flower, Car, Scissors, ShoppingBasket, Home, Eye, ArrowLeft, ArrowRight, Settings, LayoutTemplate, Lock, LogIn, LogOut, Image as ImageIcon, ShieldCheck, Newspaper, ShoppingCart, Info, Activity, Mail, MessageCircle, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const DashboardPage = () => {
  const { user, signIn, signOut, loading } = useAuth();
  const [selectedPole, setSelectedPole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await signIn(email, password);
    setAuthLoading(false);
    
    if (error) {
      // Error is already toasted in AuthContext
    } else {
      toast({
        title: "Welcome back",
        description: "You have successfully logged in to the dashboard.",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    setSelectedPole(null);
    toast({
      title: "Logged out",
      description: "You have been securely logged out.",
    });
  };

  const isAdmin = user?.user_metadata?.admin === true || user?.user_metadata?.admin === 'true';

  const poles = [
    { 
      id: 'logo',
      label: 'Logo Management',
      icon: Activity,
      color: 'bg-gradient-to-br from-indigo-500 to-violet-500',
      shadow: 'shadow-indigo-200',
      description: 'Update and manage the website logo',
      type: 'logo-manager'
    },
    { 
      id: 'whatsapp-branches',
      label: 'Branch WhatsApp Settings',
      icon: PhoneCall,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      shadow: 'shadow-green-200',
      description: 'Manage individual WhatsApp numbers per branch',
      type: 'branch-whatsapp'
    },
    { 
      id: 'whatsapp-global',
      label: 'WhatsApp Config (Legacy)',
      icon: MessageCircle,
      color: 'bg-gradient-to-br from-teal-500 to-green-600',
      shadow: 'shadow-teal-200',
      description: 'Configure specific WhatsApp fallback per branch',
      type: 'whatsapp-config'
    },
    { 
      id: 'about',
      label: 'À Propos',
      icon: Info,
      color: 'bg-gradient-to-br from-cyan-500 to-blue-500',
      shadow: 'shadow-cyan-200',
      description: 'Manage company history, mission, and about page content',
      type: 'about-manager'
    },
    { 
      id: 'contact',
      label: 'Contact Page',
      icon: Mail,
      color: 'bg-gradient-to-br from-amber-500 to-orange-600',
      shadow: 'shadow-amber-200',
      description: 'Manage contact details and form configuration',
      type: 'contact-manager'
    },
    { 
      id: 'products',
      label: 'Shop Products',
      icon: ShoppingCart,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      shadow: 'shadow-green-200',
      description: 'Manage products, prices and categories for the shop',
      type: 'products-manager'
    },
    { 
      id: 'news',
      label: 'News & Articles',
      icon: Newspaper,
      color: 'bg-gradient-to-br from-red-500 to-rose-600',
      shadow: 'shadow-red-200',
      description: 'Manage news articles and press releases',
      type: 'news-manager'
    },
    { 
      id: 'images',
      label: 'Image Library',
      bucket: 'pole-images',
      icon: ImageIcon,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
      shadow: 'shadow-indigo-200',
      description: 'Manage main visuals for all branches and slider',
      type: 'manager'
    },
    { 
      id: 'vision', 
      label: 'Homepage Content', 
      table: 'vision_images', 
      bucket: 'vision-assets', 
      icon: Eye,
      color: 'bg-gradient-to-br from-slate-700 to-slate-900',
      shadow: 'shadow-slate-300',
      description: 'Manage main visual content for the homepage',
      type: 'list'
    },
    { 
      id: 'sci-renaissance', 
      label: 'SCI Renaissance', 
      table: 'sci_renaissance_content',
      bucket: 'sci-renaissance-images',
      icon: Building,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      shadow: 'shadow-blue-200',
      description: 'Real estate projects and commercial developments',
      type: 'list'
    },
    { 
      id: 'sci-espoir', 
      label: 'Fondation SPI', 
      table: 'fondation_spi_content',
      bucket: 'fondation-spi-images',
      icon: Home,
      color: 'bg-gradient-to-br from-cyan-500 to-teal-600',
      shadow: 'shadow-cyan-200',
      description: 'Wealth management and foundation initiatives',
      type: 'list'
    },
    { 
      id: 'nouveau-concept', 
      label: 'Nouveau Concept', 
      table: 'nouveau_concept_content', 
      bucket: 'nouveau-concept-images',
      icon: Car,
      color: 'bg-gradient-to-br from-violet-500 to-purple-600',
      shadow: 'shadow-violet-200',
      description: 'Innovative mobility solutions and transport',
      type: 'list'
    },
    { 
      id: 'la-manne', 
      label: 'La Manne', 
      table: 'la_manne_content',
      bucket: 'la-manne-images',
      icon: Flower,
      color: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      shadow: 'shadow-emerald-200',
      description: 'Sustainable agriculture and fresh products',
      type: 'list'
    },
    { 
      id: 'atelier-5', 
      label: 'Atelier 5 (Beauty)', 
      table: 'atelier5_content',
      bucket: 'atelier5-images',
      icon: Scissors,
      color: 'bg-gradient-to-br from-pink-500 to-rose-600',
      shadow: 'shadow-pink-200',
      description: 'Wellness, beauty and care spaces',
      type: 'list'
    },
    { 
      id: 'spi-alim', 
      label: 'SPI Alim', 
      table: 'spi_alim_content',
      bucket: 'spi-alim-images',
      icon: ShoppingBasket,
      color: 'bg-gradient-to-br from-orange-400 to-amber-500',
      shadow: 'shadow-orange-200',
      description: 'Fine grocery and food distribution',
      type: 'list'
    },
    { 
      id: 'footer', 
      label: 'Footer & Contact', 
      table: 'footer_configuration', 
      bucket: null, 
      icon: LayoutTemplate,
      color: 'bg-gradient-to-br from-gray-600 to-gray-700',
      shadow: 'shadow-gray-300',
      description: 'Manage site-wide and branch-specific footer content',
      type: 'singleton'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Helmet>
          <title>Login - Groupe SPI Dashboard</title>
        </Helmet>
        <Card className="w-full max-w-md shadow-xl rounded-xl border border-gray-100">
          <CardHeader className="space-y-2 pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-4 rounded-full shadow-lg">
                <Lock className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl text-center font-bold text-gray-900">Admin Login</CardTitle>
            <CardDescription className="text-center text-gray-600 text-base">
              Access the content management system
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@groupespi.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus-visible:ring-blue-500 text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus-visible:ring-blue-500 text-gray-900"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg shadow-md hover:shadow-lg transition-all" disabled={authLoading}>
                {authLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <LogIn className="mr-2 h-5 w-5" />
                )}
                Sign In
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="w-full text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Website
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    if (selectedPole.type === 'logo-manager') {
      return <LogoManager />;
    }
    if (selectedPole.type === 'branch-whatsapp') {
      return <BranchWhatsAppManager />;
    }
    if (selectedPole.type === 'whatsapp-config') {
      return <WhatsAppConfig />;
    }
    if (selectedPole.type === 'about-manager') {
      return <AboutManager />;
    }
    if (selectedPole.type === 'contact-manager') {
      return <ContactManager />;
    }
    if (selectedPole.type === 'products-manager') {
      return <ProductsManager />;
    }
    if (selectedPole.type === 'news-manager') {
      return <NewsManager />;
    }
    if (selectedPole.type === 'manager' && selectedPole.id === 'images') {
      return <ImageManager />;
    }
    if (selectedPole.type === 'singleton' && selectedPole.id === 'footer') {
      return <FooterManager poles={poles} />;
    }
    return (
      <PoleManager 
          poleName={selectedPole.label} 
          tableName={selectedPole.table} 
          bucketName={selectedPole.bucket} 
      />
    );
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Groupe SPI</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="container-custom py-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-lg shadow-blue-200">
                        <LayoutDashboard className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SPI Admin Dashboard</h1>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-600 font-medium">Content Management System</p>
                          {isAdmin && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                              Admin Active
                            </span>
                          )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => navigate('/')} className="hidden sm:flex gap-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 shadow-sm">
                      <ArrowLeft className="w-4 h-4" /> Back to Site
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" onClick={handleLogout} title="Logout">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
            </div>
          </div>
        </header>

        <main className="flex-grow container-custom py-8 relative">
          <AnimatePresence mode="wait">
            {!selectedPole ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back, {user?.user_metadata?.first_name || 'Admin'}!</h2>
                  <p className="text-lg text-gray-600">Select a module below to manage its content.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {poles.map((pole, index) => (
                    <motion.div
                      key={pole.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.07, type: "spring", stiffness: 200, damping: 20 }}
                      whileHover={{ scale: 1.03, y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPole(pole)}
                      className={`group cursor-pointer rounded-2xl p-6 ${pole.color} text-white shadow-xl ${pole.shadow} relative overflow-hidden h-64 flex flex-col justify-between transition-all duration-300`}
                    >
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500"></div>
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black opacity-5 rounded-full blur-xl"></div>

                      <div className="relative z-10">
                        <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/30 transition-colors shadow-inner">
                          <pole.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 leading-tight drop-shadow-md">{pole.label}</h3>
                        <p className="text-white/80 text-sm leading-snug line-clamp-3 drop-shadow-sm">
                          {pole.description}
                        </p>
                      </div>

                      <div className="relative z-10 flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                        Manage Content <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="max-w-7xl mx-auto"
              >
                <div className="flex items-center mb-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedPole(null)} 
                    className="mr-4 pl-3 pr-4 py-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 shadow-sm rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Modules
                  </Button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${selectedPole.color} text-white shadow-md`}>
                            <selectedPole.icon className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedPole.label}</h2>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-1 h-1 w-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 opacity-80"></div>
                    <div className="p-6 md:p-8">
                        {renderContent()}
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;