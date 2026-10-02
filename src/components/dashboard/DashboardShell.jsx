import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Bell, Building2, ChevronRight, Eye, LayoutDashboard, LogOut, Menu, Search, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CORPORATE_BRAND } from '@/lib/branchBranding';

const branchIds = ['sci-renaissance', 'sci-espoir', 'nouveau-concept', 'atelier-5', 'spi-alim', 'la-manne', 'zen-sens', 'spi-energy'];

const groups = [
  { label: 'Pilotage', ids: ['overview'] },
  { label: 'Site & contenus', ids: ['vision', 'about', 'contact', 'footer'] },
  { label: 'Publications', ids: ['news', 'products'] },
  { label: 'Médias & identité', ids: ['images', 'logo'] },
  { label: 'Communication', ids: ['branch-social-links', 'whatsapp-branches', 'whatsapp-global'] },
  { label: 'Administration', ids: ['team'] }
];

const DashboardShell = ({ poles, selectedPole, onSelect, user, onLogout, onPreview, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const active = selectedPole || { id: 'overview', label: "Vue d'ensemble", description: 'Aperçu de votre présence digitale', icon: LayoutDashboard };
  const branchPoles = poles.filter((pole) => branchIds.includes(pole.id));
  const byId = useMemo(() => Object.fromEntries(poles.map((pole) => [pole.id, pole])), [poles]);
  const results = query.trim() ? poles.filter((pole) => `${pole.label} ${pole.description}`.toLowerCase().includes(query.toLowerCase())).slice(0, 7) : [];

  const choose = (pole) => { onSelect(pole?.id === 'overview' ? null : pole); setMobileOpen(false); setQuery(''); };

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-[#0b1739] text-white">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5"><img src={CORPORATE_BRAND.logo} alt="SPI Corporate" className="h-full w-full object-contain" /></div>
        <div><p className="font-bold leading-tight">SPI Corporate</p><p className="text-xs text-blue-200/70">Administration</p></div>
        <button className="ml-auto p-2 lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/50">{group.label}</p>
            <div className="space-y-1">{group.ids.map((id) => {
              const pole = id === 'overview' ? { id, label: "Vue d'ensemble", icon: LayoutDashboard } : byId[id];
              if (!pole) return null;
              const Icon = pole.icon;
              return <button key={id} onClick={() => choose(pole)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active.id === id ? 'bg-white text-[#0b1739] shadow-lg' : 'text-blue-50/75 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" /><span className="truncate font-medium">{pole.label}</span>{active.id === id && <ChevronRight className="ml-auto h-4 w-4" />}</button>;
            })}</div>
          </div>
        ))}
        <div className="mb-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200/50">Branches</p>
          <div className="space-y-1">{branchPoles.map((pole) => { const Icon = pole.icon; return <button key={pole.id} onClick={() => choose(pole)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active.id === pole.id ? 'bg-white text-[#0b1739] shadow-lg' : 'text-blue-50/75 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" /><span className="truncate font-medium">{pole.label}</span></button>; })}</div>
        </div>
      </nav>
      <div className="border-t border-white/10 p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 font-bold">{(user?.email || 'A')[0].toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Administrateur</p><p className="truncate text-xs text-blue-200/60">{user?.email}</p></div><button onClick={onLogout} className="rounded-lg p-2 text-blue-100/70 hover:bg-white/10 hover:text-white" title="Déconnexion"><LogOut className="h-4 w-4" /></button></div></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block"><Sidebar /></aside>
      {mobileOpen && <><button aria-label="Fermer le menu" className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={() => setMobileOpen(false)} /><aside className="fixed inset-y-0 left-0 z-50 w-[86vw] max-w-72 lg:hidden"><Sidebar /></aside></>}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">
          <button className="mr-3 rounded-xl border border-slate-200 p-2.5 lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Administration / {active.id === 'overview' ? 'Accueil' : 'Gestion'}</p><h1 className="truncate text-xl font-bold text-slate-900 md:text-2xl">{active.label}</h1></div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden w-64 xl:block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un module…" className="h-10 rounded-xl bg-slate-50 pl-10" />{results.length > 0 && <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border bg-white p-2 shadow-xl">{results.map((pole) => <button key={pole.id} onClick={() => choose(pole)} className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-slate-50"><pole.icon className="h-4 w-4 text-blue-700" /><span className="text-sm font-medium">{pole.label}</span></button>)}</div>}</div>
            <Button variant="outline" size="sm" onClick={onPreview} className="hidden gap-2 md:flex"><Eye className="h-4 w-4" /> Voir le site</Button>
            <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" /></button>
          </div>
        </header>
        <main className="p-4 md:p-8">{selectedPole ? <section className="dashboard-modern mx-auto max-w-[1500px]"><div className="mb-6"><p className="max-w-3xl text-sm text-slate-500">{selectedPole.description}</p></div><div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_18px_55px_-38px_rgba(15,23,42,0.45)] md:p-7">{children}</div></section> : <Overview poles={poles} branchPoles={branchPoles} onSelect={choose} onPreview={onPreview} user={user} />}</main>
      </div>
    </div>
  );
};

const Overview = ({ poles, branchPoles, onSelect, onPreview, user }) => {
  const cards = [{ label: 'Branches actives', value: branchPoles.length, hint: 'Espaces administrables', icon: Building2 }, { label: 'Modules de gestion', value: poles.length, hint: 'Tous centralisés', icon: LayoutDashboard }, { label: 'Accès sécurisé', value: 'Actif', hint: 'Session administrateur', icon: ShieldCheck }];
  return <div className="mx-auto max-w-[1500px] space-y-7">
    <section className="overflow-hidden rounded-3xl bg-[#0b1739] px-6 py-8 text-white shadow-xl md:px-10 md:py-11"><div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end"><div><span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Centre de pilotage SPI</span><h2 className="mt-3 text-3xl font-bold md:text-4xl">Bonjour, {user?.user_metadata?.first_name || 'Administrateur'}</h2><p className="mt-3 max-w-2xl text-blue-100/70">Mettez à jour le site, chaque branche, les publications et les demandes clients depuis un espace unique.</p></div><Button onClick={onPreview} className="w-fit bg-white text-[#0b1739] hover:bg-blue-50">Ouvrir le site <ArrowUpRight className="ml-2 h-4 w-4" /></Button></div></section>
    <div className="grid gap-4 md:grid-cols-3">{cards.map(({ label, value, hint, icon: Icon }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{value}</p><p className="mt-1 text-xs text-slate-400">{hint}</p></div><span className="rounded-xl bg-blue-50 p-3 text-blue-800"><Icon className="h-5 w-5" /></span></div></article>)}</div>
    <section><div className="mb-4 flex items-end justify-between"><div><h3 className="text-xl font-bold">Gérer une branche</h3><p className="mt-1 text-sm text-slate-500">Contenu, médias et informations publiques de chaque entité.</p></div></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{branchPoles.map((pole) => <button key={pole.id} onClick={() => onSelect(pole)} className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"><div className="flex items-center justify-between"><span className="rounded-xl bg-slate-100 p-3 text-blue-900"><pole.icon className="h-5 w-5" /></span><ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-blue-700" /></div><h4 className="mt-5 font-bold">{pole.label}</h4><p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{pole.description}</p></button>)}</div></section>
  </div>;
};

export default DashboardShell;
