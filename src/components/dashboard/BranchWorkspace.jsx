import React, { useState } from 'react';
import { ExternalLink, FileText, Image, MessageCircle, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BranchContentManager from '@/components/dashboard/BranchContentManager';
import PoleManager from '@/components/dashboard/PoleManager';
import BranchWhatsAppManager from '@/components/dashboard/BranchWhatsAppManager';
import BranchSocialLinksManager from '@/components/dashboard/BranchSocialLinksManager';
import { Button } from '@/components/ui/button';
import { getBranchBrand } from '@/lib/branchBranding';

const tabs = [
  { id: 'content', label: 'Contenu & vidéo', icon: FileText },
  { id: 'media', label: 'Portfolio & médias', icon: Image },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'social', label: 'Réseaux sociaux', icon: Share2 }
];

const BranchWorkspace = ({ pole }) => {
  const [tab, setTab] = useState('content');
  const navigate = useNavigate();
  const brand = getBranchBrand(pole.id);
  return <div className="space-y-6">
    <div className="relative overflow-hidden rounded-3xl p-6 text-white md:p-8" style={{ background: `linear-gradient(125deg, ${brand.primary}, ${brand.secondary})` }}>
      <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-5">{brand.logo && <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-lg"><img src={brand.logo} alt={`Logo ${pole.label}`} className="h-full w-full object-contain" /></span>}<div><p className="text-xs font-bold uppercase tracking-[0.2em] text-white/65">Espace de la branche</p><h2 className="mt-1 text-3xl font-bold">{pole.label}</h2><p className="mt-2 max-w-xl text-sm text-white/75">Modifiez la page publique section par section, sans toucher au code.</p></div></div>
        <Button onClick={() => navigate(`/branches/${pole.id}`)} className="w-fit border border-white/30 bg-white/15 text-white backdrop-blur hover:bg-white hover:text-slate-900">Voir la page publique <ExternalLink className="ml-2 h-4 w-4" /></Button>
      </div>
    </div>
    <div className="flex gap-2 overflow-x-auto rounded-2xl bg-slate-100 p-1.5">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition md:flex-1 md:justify-center ${tab === id ? 'bg-white text-[#0b1739] shadow-sm ring-1 ring-slate-200/60' : 'text-slate-500 hover:text-slate-900'}`}><Icon className="h-4 w-4" />{label}</button>)}</div>
    <div className="rounded-2xl bg-slate-50/60 p-1 md:p-3">{tab === 'content' && <BranchContentManager initialBranchId={pole.id} lockBranch />}{tab === 'media' && <PoleManager poleName={pole.label} tableName={pole.table} bucketName={pole.bucket} />}{tab === 'whatsapp' && <BranchWhatsAppManager initialBranchId={pole.id} />}{tab === 'social' && <BranchSocialLinksManager initialBranchId={pole.id} />}</div>
  </div>;
};

export default BranchWorkspace;
