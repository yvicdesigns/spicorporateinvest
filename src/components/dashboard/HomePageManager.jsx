import React, { useEffect, useState } from 'react';
import { Eye, Image, LayoutTemplate, Loader2, Save } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import PoleManager from '@/components/dashboard/PoleManager';

const defaults = {
  fr: { hero: {}, branches: {}, values: {}, gallery: {}, cta: {} },
  en: { hero: {}, branches: {}, values: {}, gallery: {}, cta: {} }
};
const sectionFields = {
  hero: [['subtitle', 'Sur-titre'], ['title', 'Titre principal'], ['description', 'Texte de présentation'], ['cta', 'Texte du bouton']],
  branches: [['title', 'Titre de la section'], ['subtitle', 'Texte introductif']], values: [['title', 'Titre de la section']],
  gallery: [['title', 'Titre de la galerie'], ['subtitle', 'Texte introductif']], cta: [['title', 'Titre de conclusion'], ['description', 'Texte de conclusion'], ['button', 'Texte du bouton']]
};
const sectionLabels = { hero: "Bannière d’accueil (Hero)", branches: 'Présentation des branches', values: 'Valeurs du groupe', gallery: 'Galerie de la holding', cta: 'Bloc de contact final' };

const HomePageManager = () => {
  const [content, setContent] = useState(defaults); const [existing, setExisting] = useState({}); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const { toast } = useToast();
  useEffect(() => { (async () => { const { data } = await supabase.from('footer_configuration').select('content').eq('pole_id', 'homepage').maybeSingle(); const stored = data?.content || {}; setExisting(stored); setContent({ fr: { ...defaults.fr, ...(stored.homepage_content?.fr || {}) }, en: { ...defaults.en, ...(stored.homepage_content?.en || {}) } }); setLoading(false); })(); }, []);
  const update = (lang, section, field, value) => setContent((current) => ({ ...current, [lang]: { ...current[lang], [section]: { ...current[lang][section], [field]: value } } }));
  const save = async () => { setSaving(true); const payload = { pole_id: 'homepage', content: { ...existing, homepage_content: content } }; const { error } = await supabase.from('footer_configuration').upsert(payload, { onConflict: 'pole_id' }); setSaving(false); if (error) return toast({ title: 'Enregistrement impossible', description: error.message, variant: 'destructive' }); setExisting(payload.content); toast({ title: "Page d’accueil mise à jour", description: 'Les textes sont maintenant visibles sur la page publique.' }); };
  if (loading) return <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-800" /></div>;
  return <Tabs defaultValue="content"><div className="mb-7 flex flex-col justify-between gap-4 rounded-2xl bg-blue-50 p-5 md:flex-row md:items-center"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-800"><LayoutTemplate className="h-4 w-4" /> Page publique / Accueil</div><h2 className="mt-2 text-2xl font-bold">Modifier la page d’accueil</h2><p className="mt-1 text-sm text-slate-600">Chaque bloc ci-dessous porte le même nom que la section visible sur le site.</p></div><Button onClick={() => window.open('/', '_blank', 'noopener,noreferrer')} variant="outline"><Eye className="mr-2 h-4 w-4" /> Prévisualiser la page</Button></div><TabsList className="mb-7 grid h-auto w-full grid-cols-2 rounded-xl bg-slate-100 p-1"><TabsTrigger value="content" className="py-3">Textes de la page</TabsTrigger><TabsTrigger value="media" className="py-3">Images & slider</TabsTrigger></TabsList>
  <TabsContent value="content"><Tabs defaultValue="fr"><div className="mb-6 flex items-center justify-between"><TabsList><TabsTrigger value="fr">Français</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList><Button onClick={save} disabled={saving} className="bg-[#0b1739] text-white">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Enregistrer</Button></div>{['fr','en'].map((lang) => <TabsContent key={lang} value={lang} className="space-y-5">{Object.entries(sectionFields).map(([section, fields], index) => <section key={section} className="rounded-2xl border border-slate-200 p-5 md:p-7"><div className="mb-5 flex items-center gap-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b1739] text-sm font-bold text-white">{index + 1}</span><div><h3 className="font-bold">{sectionLabels[section]}</h3><p className="text-xs text-slate-500">Section {index + 1} sur la page publique</p></div></div><div className="grid gap-5 md:grid-cols-2">{fields.map(([field,label]) => <div key={field} className={field === 'description' ? 'md:col-span-2' : ''}><Label>{label}</Label>{field === 'description' ? <Textarea className="mt-2 min-h-[100px]" value={content[lang][section]?.[field] || ''} onChange={(e) => update(lang,section,field,e.target.value)} placeholder="Vide = texte actuel conservé" /> : <Input className="mt-2" value={content[lang][section]?.[field] || ''} onChange={(e) => update(lang,section,field,e.target.value)} placeholder="Vide = texte actuel conservé" />}</div>)}</div></section>)}</TabsContent>)}</Tabs></TabsContent>
  <TabsContent value="media"><div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><Image className="mr-2 inline h-4 w-4" /><strong>Slider</strong> alimente l’image du Hero. <strong>Branch Card</strong> alimente les cartes de branches. <strong>Gallery</strong> alimente « Notre vision en images ».</div><PoleManager poleName="Page d’accueil" tableName="vision_images" bucketName="vision-assets" /></TabsContent></Tabs>;
};
export default HomePageManager;
