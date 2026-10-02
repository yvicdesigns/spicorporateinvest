import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Activity, Building, Car, Eye, FileEdit, Flower, Home, Image as ImageIcon, Info, LayoutTemplate, Leaf, Lock, LogIn, Mail, MessageCircle, Newspaper, PhoneCall, QrCode, Scissors, ShoppingBasket, ShoppingCart, Users, Zap } from 'lucide-react';
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
import BranchSocialLinksManager from '@/components/dashboard/BranchSocialLinksManager';
import BranchContentManager from '@/components/dashboard/BranchContentManager';
import DashboardShell from '@/components/dashboard/DashboardShell';
import BranchWorkspace from '@/components/dashboard/BranchWorkspace';
import HomePageManager from '@/components/dashboard/HomePageManager';
import TeamManager from '@/components/dashboard/TeamManager';
import { canAccessModule } from '@/lib/dashboardPermissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const branch = (id, label, table, bucket, icon, description) => ({ id, label, table, bucket, icon, description, type: 'branch-workspace' });

const DashboardPage = () => {
  const { user, signIn, signOut, loading } = useAuth();
  const [selectedPole, setSelectedPole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const poles = [
    { id: 'branch-content', label: 'Contenus des branches', icon: FileEdit, description: 'Modifier les textes, expertises, atouts et présentations vidéo.', type: 'branch-content' },
    { id: 'branch-social-links', label: 'Réseaux sociaux & QR', icon: QrCode, description: 'Gérer les réseaux sociaux et liens publics de chaque branche.', type: 'branch-social-links' },
    { id: 'logo', label: 'Identité & logo', icon: Activity, description: "Gérer l'identité visuelle principale du site.", type: 'logo-manager' },
    { id: 'whatsapp-branches', label: 'WhatsApp des branches', icon: PhoneCall, description: 'Définir le numéro WhatsApp propre à chaque branche.', type: 'branch-whatsapp' },
    { id: 'whatsapp-global', label: 'WhatsApp général', icon: MessageCircle, description: 'Configurer le numéro de secours et les réglages généraux.', type: 'whatsapp-config' },
    { id: 'about', label: 'Page À propos', icon: Info, description: "Gérer l'histoire, la mission et les textes institutionnels.", type: 'about-manager' },
    { id: 'contact', label: 'Page Contact', icon: Mail, description: 'Gérer les coordonnées et le formulaire de contact.', type: 'contact-manager' },
    { id: 'products', label: 'Produits boutique', icon: ShoppingCart, description: 'Gérer les produits, prix et catégories.', type: 'products-manager' },
    { id: 'news', label: 'Actualités & articles', icon: Newspaper, description: 'Créer et publier les actualités visibles sur le site.', type: 'news-manager' },
    { id: 'images', label: 'Médiathèque', bucket: 'pole-images', icon: ImageIcon, description: 'Centraliser les principaux visuels et sliders.', type: 'manager' },
    { id: 'vision', label: "Page d'accueil", table: 'vision_images', bucket: 'vision-assets', icon: Eye, description: "Modifier les contenus visuels de l'accueil.", type: 'list' },
    branch('sci-renaissance', 'SCI Renaissance', 'sci_renaissance_content', 'sci-renaissance-images', Building, 'Immobilier, projets et développements commerciaux.'),
    branch('sci-espoir', 'Fondation SPI', 'fondation_spi_content', 'fondation-spi-images', Home, 'Actions sociales, fondation et initiatives solidaires.'),
    branch('nouveau-concept', 'Nouveau Concept', 'nouveau_concept_content', 'nouveau-concept-images', Car, 'Mobilité, transport et solutions automobiles.'),
    branch('atelier-5', 'Atelier 5', 'atelier5_content', 'atelier5-images', Scissors, 'Beauté, bien-être, coiffure, soins et boutique.'),
    branch('spi-alim', 'SPI Alim', 'spi_alim_content', 'spi-alim-images', ShoppingBasket, 'Distribution alimentaire et produits La Manne.'),
    branch('la-manne', 'La Manne', 'la_manne_content', 'la-manne-images', Flower, 'Marque de produits intégrée à SPI Alim.'),
    branch('zen-sens', 'Zen Sens', 'zen_sens_content', 'zen-sens-images', Leaf, 'Parfums, fragrances et créations olfactives.'),
    branch('spi-energy', 'SPI Energy', 'spi_energy_content', 'spi-energy-images', Zap, 'Produits pétroliers, distribution et logistique.'),
    { id: 'footer', label: 'Pied de page', table: 'footer_configuration', icon: LayoutTemplate, description: 'Gérer les informations générales et les pieds de page.', type: 'singleton' }
    ,{ id: 'team', label: 'Équipe & accès', icon: Users, description: 'Ajouter des collaborateurs et limiter leurs droits.', type: 'team-manager' }
  ];
  const accessiblePoles = poles.filter((pole) => canAccessModule(user, pole.id));

  const handleLogin = async (event) => {
    event.preventDefault(); setAuthLoading(true);
    const { error } = await signIn(email, password);
    setAuthLoading(false);
    if (!error) toast({ title: 'Connexion réussie', description: "Bienvenue dans l'administration SPI." });
  };
  const handleLogout = async () => { await signOut(); setSelectedPole(null); toast({ title: 'Déconnexion effectuée' }); };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-b-blue-800" /></div>;

  if (!user) return <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4"><Helmet><title>Connexion — Administration SPI</title></Helmet><Card className="w-full max-w-md rounded-2xl border-slate-200 shadow-xl"><CardHeader className="space-y-2 pb-6"><div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b1739] text-white"><Lock className="h-6 w-6" /></div><CardTitle className="text-center text-3xl">Administration SPI</CardTitle><CardDescription className="text-center">Connectez-vous pour gérer le site et ses branches.</CardDescription></CardHeader><form onSubmit={handleLogin}><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="email">Adresse e-mail</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div className="space-y-2"><Label htmlFor="password">Mot de passe</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div></CardContent><CardFooter className="flex flex-col gap-3"><Button type="submit" disabled={authLoading} className="h-11 w-full bg-[#0b1739] text-white hover:bg-blue-950">{authLoading ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-b-white" /> : <LogIn className="mr-2 h-4 w-4" />} Se connecter</Button><Button type="button" variant="ghost" onClick={() => navigate('/')} className="w-full">Retourner au site</Button></CardFooter></form></Card></div>;

  const hasDashboardAccess = user.app_metadata?.admin === true || user.app_metadata?.dashboard_user === true;
  if (!hasDashboardAccess) return <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4"><Card className="w-full max-w-md rounded-2xl border-slate-200 shadow-xl"><CardHeader><CardTitle className="text-center">Accès non autorisé</CardTitle><CardDescription className="text-center">Ce compte ne possède pas d’accès au tableau de bord.</CardDescription></CardHeader><CardFooter className="flex flex-col gap-3"><Button onClick={handleLogout} className="w-full bg-[#0b1739]">Se déconnecter</Button><Button variant="ghost" onClick={() => navigate('/')} className="w-full">Retourner au site</Button></CardFooter></Card></div>;

  const renderContent = () => {
    if (selectedPole.type === 'branch-workspace') return <BranchWorkspace pole={selectedPole} />;
    if (selectedPole.id === 'vision') return <HomePageManager />;
    if (selectedPole.type === 'team-manager') return <TeamManager />;
    if (selectedPole.type === 'branch-social-links') return <BranchSocialLinksManager />;
    if (selectedPole.type === 'branch-content') return <BranchContentManager />;
    if (selectedPole.type === 'logo-manager') return <LogoManager />;
    if (selectedPole.type === 'branch-whatsapp') return <BranchWhatsAppManager />;
    if (selectedPole.type === 'whatsapp-config') return <WhatsAppConfig />;
    if (selectedPole.type === 'about-manager') return <AboutManager />;
    if (selectedPole.type === 'contact-manager') return <ContactManager />;
    if (selectedPole.type === 'products-manager') return <ProductsManager />;
    if (selectedPole.type === 'news-manager') return <NewsManager />;
    if (selectedPole.type === 'manager' && selectedPole.id === 'images') return <ImageManager />;
    if (selectedPole.type === 'singleton') return <FooterManager poles={poles} />;
    return <PoleManager poleName={selectedPole.label} tableName={selectedPole.table} bucketName={selectedPole.bucket} />;
  };

  return <><Helmet><title>{selectedPole?.label || "Vue d'ensemble"} — Administration SPI</title></Helmet><DashboardShell poles={accessiblePoles} selectedPole={selectedPole} onSelect={setSelectedPole} user={user} onLogout={handleLogout} onPreview={() => navigate('/')}>{selectedPole && renderContent()}</DashboardShell></>;
};

export default DashboardPage;
