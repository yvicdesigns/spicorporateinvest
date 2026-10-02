import React, { useEffect, useState } from 'react';
import { Save, Loader2, FileEdit, Plus, Trash2, LayoutTemplate, PlaySquare, ListChecks, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { BRANCH_EXPERIENCE_CONFIGS } from '@/lib/branchExperienceConfigs';

const branches = [
  ['sci-renaissance', 'SCI Renaissance'], ['sci-espoir', 'Fondation SPI'], ['nouveau-concept', 'Nouveau Concept'],
  ['atelier-5', 'Atelier 5'], ['spi-alim', 'SPI Alim'], ['la-manne', 'La Manne'], ['zen-sens', 'Zen Sens'], ['spi-energy', 'SPI Energy']
];

const emptyProfile = { title: '', subtitle: '', description: '', services: [''], keyPoints: [''], experience: { eyebrow: '', title: '', intro: '', expertiseLabel: '', expertiseTitle: '', expertiseIntro: '' } };

const BranchContentManager = ({ initialBranchId = 'atelier-5', lockBranch = false }) => {
  const [branchId, setBranchId] = useState(initialBranchId);
  const [profile, setProfile] = useState(emptyProfile);
  const [existingContent, setExistingContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const { data } = await supabase.from('footer_configuration').select('content').eq('pole_id', branchId).maybeSingle();
      const content = data?.content || {};
      const saved = content.branch_profile || {};
      const experienceDefaults = BRANCH_EXPERIENCE_CONFIGS[branchId] || {};
      setExistingContent(content);
      setProfile({
        ...emptyProfile,
        ...saved,
        services: saved.services?.length ? saved.services : [''],
        keyPoints: saved.keyPoints?.length ? saved.keyPoints : [''],
        experience: { ...emptyProfile.experience, ...experienceDefaults, ...(saved.experience || {}) }
      });
      setLoading(false);
    };
    loadProfile();
  }, [branchId]);

  const updateList = (field, index, value) => setProfile((current) => ({ ...current, [field]: current[field].map((item, itemIndex) => itemIndex === index ? value : item) }));
  const addListItem = (field) => setProfile((current) => ({ ...current, [field]: [...current[field], ''] }));
  const removeListItem = (field, index) => setProfile((current) => ({ ...current, [field]: current[field].filter((_, itemIndex) => itemIndex !== index) }));

  const saveProfile = async () => {
    setSaving(true);
    const cleanProfile = { ...profile, services: profile.services.filter(Boolean), keyPoints: profile.keyPoints.filter(Boolean) };
    const payload = { pole_id: branchId, content: { ...existingContent, branch_profile: cleanProfile } };
    const { error } = await supabase.from('footer_configuration').upsert(payload, { onConflict: 'pole_id' });
    setSaving(false);
    if (error) return toast({ title: 'Enregistrement impossible', description: error.message, variant: 'destructive' });
    setExistingContent(payload.content);
    toast({ title: 'Contenu enregistré', description: 'La page de la branche a été mise à jour.' });
  };

  if (loading) return <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-700" /></div>;

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-950 to-blue-950 p-6 text-white md:flex-row md:items-center md:p-8">
        <div className="flex items-start gap-4"><span className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15"><FileEdit className="h-6 w-6" /></span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Éditeur visuel</p><h2 className="mt-1 text-2xl font-bold">Contenu de la page publique</h2><p className="mt-2 max-w-2xl text-sm text-blue-100/70">Les blocs sont présentés ci-dessous dans le même ordre que sur la page de la branche.</p></div></div>
        {!lockBranch && <Select value={branchId} onValueChange={setBranchId}><SelectTrigger className="w-full md:w-[260px]"><SelectValue /></SelectTrigger><SelectContent>{branches.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-start gap-4 border-b border-slate-100 bg-slate-50/80 p-5 md:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800"><LayoutTemplate className="h-5 w-5" /></span><div><div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Section 01</span><span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">En haut de page</span></div><h3 className="mt-1 text-lg font-bold text-slate-900">Hero de la branche</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">Logo et portfolio à droite, textes principaux à gauche.</p></div></div>
          <div className="space-y-5 p-5 md:p-6">
          <div><Label>Titre affiché</Label><Input value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} placeholder="Laisser vide pour conserver le titre actuel" className="mt-2" /></div>
          <div><Label>Sous-titre</Label><Input value={profile.subtitle} onChange={(e) => setProfile({ ...profile, subtitle: e.target.value })} className="mt-2" /></div>
          <div><Label>Description</Label><Textarea value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })} className="mt-2 min-h-[170px]" /></div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-start gap-4 border-b border-slate-100 bg-violet-50/60 p-5 md:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-800"><PlaySquare className="h-5 w-5" /></span><div><span className="text-[10px] font-bold uppercase tracking-widest text-violet-700">Section 02</span><h3 className="mt-1 text-lg font-bold text-slate-900">Présentation vidéo</h3><p className="mt-1 text-xs text-slate-500">Textes placés au-dessus de la vidéo de présentation.</p></div></div>
          <div className="space-y-5 p-5 md:p-6">
          {[['eyebrow','Sur-titre'],['title','Titre'],['intro','Introduction'],['expertiseLabel','Label expertise'],['expertiseTitle','Titre expertise'],['expertiseIntro','Texte expertise']].map(([field,label]) => <div key={field}><Label>{label}</Label>{field.toLowerCase().includes('intro') ? <Textarea value={profile.experience[field]} onChange={(e) => setProfile({ ...profile, experience: { ...profile.experience, [field]: e.target.value } })} className="mt-2" /> : <Input value={profile.experience[field]} onChange={(e) => setProfile({ ...profile, experience: { ...profile.experience, [field]: e.target.value } })} className="mt-2" />}</div>)}
          </div>
        </div>
      </div>

      {[['services','Expertises et services',ListChecks,'03'],['keyPoints','Atouts stratégiques',ShieldCheck,'04']].map(([field,title,SectionIcon,number]) => (
        <div key={field} className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7"><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><SectionIcon className="h-5 w-5" /></span><div><span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Section {number}</span><h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3></div></div><Button type="button" variant="outline" size="sm" onClick={() => addListItem(field)} className="rounded-xl"><Plus className="mr-2 h-4 w-4" /> Ajouter un élément</Button></div><div className="grid gap-3 md:grid-cols-2">{profile[field].map((item,index) => <div key={index} className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-400 shadow-sm">{String(index + 1).padStart(2,'0')}</span><Input value={item} onChange={(e) => updateList(field,index,e.target.value)} className="border-0 bg-transparent shadow-none focus-visible:ring-0" /><Button type="button" variant="ghost" size="icon" onClick={() => removeListItem(field,index)} className="shrink-0 text-slate-300 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button></div>)}</div></div>
      ))}

      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur"><div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><Sparkles className="h-4 w-4 text-amber-500" /> Les modifications seront visibles après enregistrement.</div><Button onClick={saveProfile} disabled={saving} className="ml-auto rounded-xl bg-[#0b1739] px-7 text-white hover:bg-blue-950">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Enregistrer les modifications</Button></div>
    </div>
  );
};

export default BranchContentManager;
