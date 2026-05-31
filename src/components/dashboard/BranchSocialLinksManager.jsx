import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Building2, Car, Sparkles, Wheat, ShoppingBag, Heart,
  Facebook, Instagram, Linkedin, Youtube, Phone,
  MessageCircle, Save, Loader2, Link, QrCode, ExternalLink
} from 'lucide-react';

const TikTokIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z" />
  </svg>
);

const BRANCHES = [
  { id: 'sci-renaissance', name: 'SCI Renaissance',  subtitle: "Immobilier d'Exception",  icon: Building2, color: 'from-blue-500 to-blue-700',    border: 'border-t-blue-500'   },
  { id: 'sci-espoir',      name: 'Fondation SPI',    subtitle: 'Valorisation Patrimoniale', icon: Heart,      color: 'from-cyan-500 to-cyan-700',    border: 'border-t-cyan-500'   },
  { id: 'nouveau-concept', name: 'Nouveau Concept',  subtitle: 'Mobilité Intelligente',     icon: Car,        color: 'from-indigo-500 to-indigo-700', border: 'border-t-indigo-500' },
  { id: 'atelier-5',       name: 'Atelier 5',        subtitle: 'Art du Bien-Être',          icon: Sparkles,   color: 'from-purple-500 to-purple-700', border: 'border-t-purple-500' },
  { id: 'la-manne',        name: 'La Manne',         subtitle: "Agriculture d'Avenir",      icon: Wheat,      color: 'from-green-500 to-green-700',   border: 'border-t-green-500'  },
  { id: 'spi-alim',        name: 'SPI Alim',         subtitle: 'Gastronomie & Terroirs',    icon: ShoppingBag,color: 'from-amber-500 to-amber-700',   border: 'border-t-amber-500'  },
];

const SOCIAL_FIELDS = [
  { key: 'facebook_url',  label: 'Facebook URL',   Icon: Facebook,    iconClass: 'text-blue-600',  placeholder: 'https://facebook.com/votrepage',      isWhatsApp: false },
  { key: 'instagram_url', label: 'Instagram URL',  Icon: Instagram,   iconClass: 'text-pink-500',  placeholder: 'https://instagram.com/votreprofil',    isWhatsApp: false },
  { key: 'tiktok_url',    label: 'TikTok URL',     Icon: TikTokIcon,  iconClass: 'text-gray-800',  placeholder: 'https://tiktok.com/@votreprofil',      isWhatsApp: false },
  { key: 'linkedin_url',  label: 'LinkedIn URL',   Icon: Linkedin,    iconClass: 'text-blue-700',  placeholder: 'https://linkedin.com/company/...',     isWhatsApp: false },
  { key: 'youtube_url',   label: 'YouTube URL',    Icon: Youtube,     iconClass: 'text-red-600',   placeholder: 'https://youtube.com/@votrechaine',     isWhatsApp: false },
  { key: 'whatsapp',      label: 'WhatsApp',       Icon: MessageCircle, iconClass: 'text-green-500', placeholder: '242XXXXXXXXX',                      isWhatsApp: true  },
  { key: 'phone',         label: 'Téléphone',      Icon: Phone,       iconClass: 'text-gray-600',  placeholder: '+242 XX XXX XXXX',                     isWhatsApp: false },
];

const defaultForm = () => ({
  facebook_url: '', instagram_url: '', tiktok_url: '',
  linkedin_url: '', youtube_url: '', whatsapp: '', phone: ''
});

const BranchSocialLinksManager = () => {
  const { toast } = useToast();
  const [forms, setForms] = useState(() => {
    const init = {};
    BRANCHES.forEach(b => { init[b.id] = defaultForm(); });
    return init;
  });
  const [dbIds, setDbIds] = useState({});     // pole_id → footer_configuration row id
  const [waDbIds, setWaDbIds] = useState({});  // pole_id → branch_whatsapp_config row id
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [{ data: footerRows }, { data: waRows }] = await Promise.all([
        supabase.from('footer_configuration').select('id, pole_id, content'),
        supabase.from('branch_whatsapp_config').select('id, pole_id, whatsapp_number, is_enabled'),
      ]);

      const newForms = {};
      const newDbIds = {};
      const newWaIds = {};

      BRANCHES.forEach(b => {
        newForms[b.id] = defaultForm();

        const footerRow = footerRows?.find(r => r.pole_id === b.id);
        if (footerRow) {
          newDbIds[b.id] = footerRow.id;
          const c = footerRow.content || {};
          newForms[b.id] = {
            ...newForms[b.id],
            facebook_url: c.facebook_url || '',
            instagram_url: c.instagram_url || '',
            tiktok_url: c.tiktok_url || '',
            linkedin_url: c.linkedin_url || '',
            youtube_url: c.youtube_url || '',
            phone: c.phone || '',
          };
        }

        const waRow = waRows?.find(r => r.pole_id === b.id);
        if (waRow) {
          newWaIds[b.id] = waRow.id;
          if (waRow.is_enabled && waRow.whatsapp_number) {
            newForms[b.id].whatsapp = waRow.whatsapp_number;
          }
        }
      });

      setForms(newForms);
      setDbIds(newDbIds);
      setWaDbIds(newWaIds);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erreur', description: 'Impossible de charger les données.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (branchId, field, value) => {
    setForms(prev => ({ ...prev, [branchId]: { ...prev[branchId], [field]: value } }));
  };

  const handleSave = async (branchId) => {
    setSaving(branchId);
    const form = forms[branchId];
    try {
      // 1 – Save social URLs to footer_configuration.content JSONB
      //     We merge with existing content to preserve other fields (email, address, etc.)
      const { data: existingRow } = await supabase
        .from('footer_configuration')
        .select('content')
        .eq('pole_id', branchId)
        .maybeSingle();

      const existingContent = existingRow?.content || {};
      const updatedContent = {
        ...existingContent,
        facebook_url: form.facebook_url,
        instagram_url: form.instagram_url,
        tiktok_url: form.tiktok_url,
        linkedin_url: form.linkedin_url,
        youtube_url: form.youtube_url,
        phone: form.phone,
      };

      const upsertPayload = { pole_id: branchId, content: updatedContent };
      if (dbIds[branchId]) upsertPayload.id = dbIds[branchId];

      const { data: savedRow, error: footerErr } = await supabase
        .from('footer_configuration')
        .upsert(upsertPayload, { onConflict: 'pole_id' })
        .select('id')
        .single();

      if (footerErr) throw footerErr;
      setDbIds(prev => ({ ...prev, [branchId]: savedRow.id }));

      // 2 – Save WhatsApp to branch_whatsapp_config
      const waPayload = {
        pole_id: branchId,
        whatsapp_number: form.whatsapp,
        is_enabled: !!form.whatsapp,
      };
      if (waDbIds[branchId]) waPayload.id = waDbIds[branchId];

      const { data: savedWa, error: waErr } = await supabase
        .from('branch_whatsapp_config')
        .upsert(waPayload, { onConflict: 'pole_id' })
        .select('id')
        .single();

      if (waErr) throw waErr;
      setWaDbIds(prev => ({ ...prev, [branchId]: savedWa.id }));

      toast({ title: '✓ Sauvegardé', description: `Réseaux sociaux de ${BRANCHES.find(b => b.id === branchId)?.name} mis à jour.` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erreur', description: 'La sauvegarde a échoué.', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="mt-3 text-gray-500">Chargement des réseaux sociaux…</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">

      {/* Header banner */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-700 p-3 rounded-xl text-white shadow-md">
            <Link className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Réseaux Sociaux des Branches</h2>
            <p className="text-gray-500 text-sm">Ces liens apparaissent dans la modale QR Code quand on clique sur une branche.</p>
          </div>
        </div>
        <a
          href="/qr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-blue-900 text-white font-semibold px-4 py-2.5 rounded-lg transition-all text-sm shadow-md"
        >
          <QrCode className="w-4 h-4" />
          Voir le QR Code
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      </div>

      {/* Branch cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {BRANCHES.map(branch => {
          const Icon = branch.icon;
          const isSaving = saving === branch.id;
          const form = forms[branch.id];

          return (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white rounded-2xl shadow-md border border-gray-100 border-t-4 ${branch.border} overflow-hidden`}
            >
              {/* Card header */}
              <div className={`bg-gradient-to-r ${branch.color} px-5 py-4 flex items-center gap-3`}>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold leading-tight">{branch.name}</p>
                  <p className="text-white/70 text-xs">{branch.subtitle}</p>
                </div>
              </div>

              {/* Fields */}
              <div className="p-5 space-y-3">
                {SOCIAL_FIELDS.map(({ key, label, Icon: FieldIcon, iconClass, placeholder }) => (
                  <div key={key} className="space-y-1">
                    <Label className={`flex items-center gap-1.5 text-xs font-semibold text-gray-600`}>
                      <FieldIcon className={`w-3.5 h-3.5 ${iconClass}`} />
                      {label}
                    </Label>
                    <Input
                      value={form[key] || ''}
                      onChange={(e) => handleChange(branch.id, key, e.target.value)}
                      placeholder={placeholder}
                      className="text-sm border-gray-200 focus-visible:ring-blue-500 h-9"
                    />
                  </div>
                ))}

                <Button
                  onClick={() => handleSave(branch.id)}
                  disabled={!!saving}
                  className="w-full mt-2 bg-gray-900 hover:bg-black text-white font-semibold shadow-sm"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sauvegarde…</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Sauvegarder</>
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BranchSocialLinksManager;
