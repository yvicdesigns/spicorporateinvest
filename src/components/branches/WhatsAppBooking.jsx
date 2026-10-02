import React, { useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, MessageCircle, Phone, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getBranchRequestConfig } from '@/lib/branchRequestConfigs';

const WhatsAppBooking = ({ branchId, brand, whatsappNumber = '242061736596', open, onOpenChange }) => {
  const config = getBranchRequestConfig(branchId);
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [service, setService] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', date: '', time: '', notes: '' });
  const [validationMessage, setValidationMessage] = useState('');

  const selectedCategory = useMemo(
    () => config?.categories.find((category) => category.id === categoryId),
    [categoryId, config]
  );

  const steps = [config?.choiceStep || 'Demande', 'Coordonnées', 'Confirmation'];

  const minimumDate = new Date().toISOString().split('T')[0];

  const resetBooking = () => {
    setStep(1);
    setCategoryId('');
    setService('');
    setFormData({ name: '', phone: '', date: '', time: '', notes: '' });
    setValidationMessage('');
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) resetBooking();
    onOpenChange(nextOpen);
  };

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setValidationMessage('');
  };

  const chooseCategory = (id) => {
    setCategoryId(id);
    setService('');
    setValidationMessage('');
  };

  const continueToDetails = () => {
    if (!categoryId || !service) {
      setValidationMessage('Choisissez une catégorie et une prestation pour continuer.');
      return;
    }
    setStep(2);
  };

  const continueToSummary = () => {
    const scheduleIsMissing = config.schedule === 'datetime'
      ? !formData.date || !formData.time
      : config.schedule === 'date' ? !formData.date : false;
    if (!formData.name.trim() || !formData.phone.trim() || scheduleIsMissing) {
      setValidationMessage(config.schedule === 'datetime' ? 'Renseignez votre nom, votre téléphone, la date et l’heure souhaitées.' : 'Renseignez votre nom, votre téléphone et la date souhaitée.');
      return;
    }
    setValidationMessage('');
    setStep(3);
  };

  const openWhatsApp = () => {
    const readableDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${formData.date}T12:00:00`));
    const message = [
      `Bonjour ${config.branchName},`,
      '',
      `Je souhaite effectuer une demande de ${config.requestType.toLowerCase()} :`,
      `• Catégorie : ${selectedCategory.label}`,
      `• Prestation : ${service}`,
      formData.date ? `• Date souhaitée : ${readableDate}` : null,
      formData.time ? `• Heure souhaitée : ${formData.time}` : null,
      '',
      `• Nom : ${formData.name.trim()}`,
      `• Téléphone : ${formData.phone.trim()}`,
      formData.notes.trim() ? `• Précisions : ${formData.notes.trim()}` : null,
      '',
      'Pouvez-vous me confirmer la disponibilité ? Merci.'
    ].filter(Boolean).join('\n');

    const number = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    handleOpenChange(false);
  };

  if (!config) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] w-[95vw] max-w-5xl overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-2xl sm:rounded-[2rem]">
        <DialogTitle className="sr-only">{config.title}</DialogTitle>
        <div className="p-4 sm:p-7 md:p-9">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ backgroundColor: brand.soft, color: brand.primary }}>
              <CalendarDays className="mr-2 h-4 w-4" /> {config.requestType} personnalisée
            </span>
            <h2 className="mt-5 text-3xl font-bold text-gray-900 md:text-5xl">{config.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 md:text-lg">
              Faites vos choix et indiquez vos préférences. {config.branchName} confirmera ensuite votre demande avec vous sur WhatsApp.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-2">
            {steps.map((label, index) => {
              const stepNumber = index + 1;
              const active = stepNumber <= step;
              return (
                <div key={label} className="text-center">
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full transition-all" style={{ width: active ? '100%' : '0%', backgroundColor: brand.secondary }} />
                  </div>
                  <span className={`text-[11px] font-semibold sm:text-sm ${active ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
                </div>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-gray-50 shadow-lg md:rounded-[2rem]">
            {step === 1 && (
              <div className="p-5 md:p-10">
                <h3 className="text-2xl font-bold text-gray-900">{config.question}</h3>
                <p className="mt-2 text-sm text-gray-500">Commencez par choisir un univers, puis la prestation souhaitée.</p>
                <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-5">
                  {config.categories.map((category) => {
                    const selected = category.id === categoryId;
                    return (
                      <button key={category.id} type="button" onClick={() => chooseCategory(category.id)} className="relative rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: selected ? brand.secondary : '#e5e7eb', boxShadow: selected ? `0 0 0 2px ${brand.secondary}25` : undefined }}>
                        {selected && <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ backgroundColor: brand.secondary }}><Check className="h-3 w-3" /></span>}
                        <Sparkles className="mb-4 h-6 w-6" style={{ color: selected ? brand.secondary : brand.primary }} />
                        <strong className="block pr-4 text-sm text-gray-900">{category.label}</strong>
                        <span className="mt-2 hidden text-xs leading-relaxed text-gray-500 md:block">{category.description}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedCategory && (
                  <div className="mt-8">
                    <Label className="mb-3 block font-semibold">Choisissez la prestation</Label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedCategory.services.map((item) => (
                        <button key={item} type="button" onClick={() => { setService(item); setValidationMessage(''); }} className="flex items-center justify-between rounded-xl border bg-white px-4 py-4 text-left text-sm font-medium transition-colors" style={{ borderColor: service === item ? brand.secondary : '#e5e7eb', color: service === item ? brand.primary : '#374151' }}>
                          {item}
                          <span className="flex h-5 w-5 items-center justify-center rounded-full border" style={{ borderColor: service === item ? brand.secondary : '#d1d5db', backgroundColor: service === item ? brand.secondary : 'white' }}>
                            {service === item && <Check className="h-3 w-3 text-white" />}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {validationMessage && <p className="mt-5 text-sm font-medium text-red-600">{validationMessage}</p>}
                <div className="mt-8 flex justify-end">
                  <Button type="button" onClick={continueToDetails} className="text-white" style={{ backgroundColor: brand.primary }}>Continuer <ChevronRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-5 md:p-10">
                <h3 className="text-2xl font-bold text-gray-900">Vos informations</h3>
                <p className="mt-2 text-sm text-gray-500">Les préférences indiquées restent soumises à la confirmation de {config.branchName}.</p>
                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <div><Label htmlFor="booking-name">Nom complet</Label><div className="relative mt-2"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input id="booking-name" value={formData.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Votre nom" className="pl-10" /></div></div>
                  <div><Label htmlFor="booking-phone">Téléphone</Label><div className="relative mt-2"><Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input id="booking-phone" type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={15} value={formData.phone} onChange={(event) => updateField('phone', event.target.value.replace(/\D/g, '').slice(0, 15))} placeholder="Votre numéro WhatsApp" className="pl-10" /></div><p className="mt-1.5 text-xs text-gray-400">Chiffres uniquement, sans espaces.</p></div>
                  {config.schedule !== 'none' && <div><Label htmlFor="booking-date">{config.dateLabel}</Label><div className="relative mt-2"><CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input id="booking-date" type="date" min={minimumDate} value={formData.date} onChange={(event) => updateField('date', event.target.value)} className="pl-10" /></div></div>}
                  {config.schedule === 'datetime' && <div><Label htmlFor="booking-time">Heure souhaitée</Label><div className="relative mt-2"><Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input id="booking-time" type="time" value={formData.time} onChange={(event) => updateField('time', event.target.value)} className="pl-10" /></div></div>}
                  <div className="md:col-span-2"><Label htmlFor="booking-notes">Précisions facultatives</Label><Textarea id="booking-notes" value={formData.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Préférences, besoins particuliers, nombre de personnes…" className="mt-2 min-h-[110px]" /></div>
                </div>
                {validationMessage && <p className="mt-5 text-sm font-medium text-red-600">{validationMessage}</p>}
                <div className="mt-8 flex items-center justify-between gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}><ChevronLeft className="mr-2 h-4 w-4" /> Retour</Button>
                  <Button type="button" onClick={continueToSummary} className="text-white" style={{ backgroundColor: brand.primary }}>Voir le récapitulatif <ChevronRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="p-5 md:p-10">
                <div className="mx-auto max-w-2xl">
                  <div className="mb-7 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700"><Check className="h-7 w-7" /></span><h3 className="mt-4 text-2xl font-bold text-gray-900">Votre demande est prête</h3><p className="mt-2 text-sm text-gray-500">Vérifiez les informations avant de continuer sur WhatsApp.</p></div>
                  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
                    <dl className="grid gap-4 text-sm sm:grid-cols-2">
                      <div><dt className="text-gray-500">Univers</dt><dd className="mt-1 font-semibold text-gray-900">{selectedCategory?.label}</dd></div>
                      <div><dt className="text-gray-500">Prestation</dt><dd className="mt-1 font-semibold text-gray-900">{service}</dd></div>
                      {formData.date && <div><dt className="text-gray-500">Date{formData.time ? ' et heure' : ''}</dt><dd className="mt-1 font-semibold text-gray-900">{new Intl.DateTimeFormat('fr-FR').format(new Date(`${formData.date}T12:00:00`))}{formData.time ? ` à ${formData.time}` : ''}</dd></div>}
                      <div><dt className="text-gray-500">Client</dt><dd className="mt-1 font-semibold text-gray-900">{formData.name}</dd></div>
                    </dl>
                    {formData.notes && <div className="mt-4 border-t border-gray-100 pt-4 text-sm"><span className="text-gray-500">Précisions</span><p className="mt-1 text-gray-800">{formData.notes}</p></div>}
                  </div>
                  <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}><ChevronLeft className="mr-2 h-4 w-4" /> Modifier</Button>
                    <Button type="button" onClick={openWhatsApp} className="bg-green-600 text-white hover:bg-green-700"><MessageCircle className="mr-2 h-5 w-5" /> Continuer sur WhatsApp</Button>
                  </div>
                  <p className="mt-5 text-center text-xs leading-relaxed text-gray-500">Le message sera uniquement préparé. Vous devrez appuyer vous-même sur « Envoyer » dans WhatsApp.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppBooking;
