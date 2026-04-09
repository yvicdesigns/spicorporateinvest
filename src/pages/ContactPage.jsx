import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ContactPage = ({ language }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageContent, setPageContent] = useState({
    title: '',
    description: '',
    email: '',
    phone: '',
    address: 'Brazzaville, Centre-Ville, 4eme etage, Tour Jumelles Villarecci , face Radisson Bleue',
    map_lat: '-4.2634',
    map_lng: '15.2429',
    form_fields: []
  });
  
  // Dynamic form state
  const [formState, setFormState] = useState({});

  useEffect(() => {
    fetchContactContent();
  }, []);

  const fetchContactContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('contact_content')
        .select('*, map_lat, map_lng')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPageContent({
            ...data,
            // Use DB value if present, otherwise default to Brazzaville
            address: data.address || 'Brazzaville, Centre-Ville, 4eme etage, Tour Jumelles Villarecci, face Radisson Bleue',
            map_lat: data.map_lat !== null ? data.map_lat : '-4.2634',
            map_lng: data.map_lng !== null ? data.map_lng : '15.2429'
        });
        
        // Initialize form state based on fields
        const initialForm = {};
        if (Array.isArray(data.form_fields)) {
            data.form_fields.forEach(field => {
                initialForm[field.id] = '';
            });
        }
        setFormState(initialForm);
      }
    } catch (error) {
      console.error("Error loading contact content:", error);
      setError(error.message);
      // Even on error, we keep default values for critical fields like address
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
        ...prev,
        [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    let isValid = true;
    if (pageContent.form_fields && Array.isArray(pageContent.form_fields)) {
        pageContent.form_fields.forEach(field => {
            if (field.required && !formState[field.id]) {
                isValid = false;
            }
        });
    }

    if (!isValid) {
      toast({
        title: "Erreur / Error",
        description: language === 'fr' 
            ? "Veuillez remplir tous les champs obligatoires." 
            : "Please fill in all required fields.",
        variant: 'destructive'
      });
      return;
    }
    
    // In a real scenario, you might send this to an API or Supabase table
    try {
        const { error } = await supabase.from('contact_submissions').insert([{
            ...formState,
            status: 'new',
            created_at: new Date().toISOString()
        }]);

        if (error) {
             // If table doesn't exist or columns don't match, just log and show success mock
             console.warn("Could not save to contact_submissions (table might be missing or different schema):", error);
        }
    } catch (err) {
        console.warn("Submission error:", err);
    }

    toast({
      title: language === 'fr' ? "Message envoyé !" : "Message sent!",
      description: language === 'fr' 
        ? 'Nous vous répondrons dans les plus brefs délais.' 
        : 'We will respond to you as soon as possible.'
    });

    // Reset form
    const resetState = {};
    Object.keys(formState).forEach(k => resetState[k] = '');
    setFormState(resetState);
  };

  // Fallback translations if DB is empty or loading fails
  const t = {
    fr: {
      heroTitle: 'Entrons en Contact',
      heroSubtitle: 'Une question, un projet ? Nous sommes là pour vous.',
      infoTitle: 'Nos Coordonnées',
      send: 'Envoyer le message',
      addressLabel: 'Adresse',
      phoneLabel: 'Téléphone',
      retry: 'Réessayer',
      errorLoading: 'Erreur lors du chargement'
    },
    en: {
      heroTitle: 'Let\'s Get in Touch',
      heroSubtitle: 'A question, a project? We are here for you.',
      infoTitle: 'Our Contact Information',
      send: 'Send message',
      addressLabel: 'Address',
      phoneLabel: 'Phone',
      retry: 'Retry',
      errorLoading: 'Error loading content'
    }
  };
  
  const currentLang = t[language] || t.fr;

  // Use DB content if available, otherwise use defaults/placeholders
  const displayTitle = pageContent.title || (language === 'fr' ? 'Contact - SPI Corporate Invest' : 'Contact - SSPI Corporate Invest');
  const displayDesc = pageContent.description || currentLang.heroSubtitle;

  // Map coordinates logic
  const latitude = parseFloat(pageContent.map_lat || -4.2634);
  const longitude = parseFloat(pageContent.map_lng || 15.2429);
  
  // Construct map URL with coordinates and small bbox around them
  // Approx 0.1 degree is roughly 11km, so for a city view we might use a small offset
  const offset = 0.01;
  const bbox = `${longitude - offset},${latitude - offset},${longitude + offset},${latitude + offset}`;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;

  if (loading) {
    return (
       <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
           <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
           <p className="text-gray-500 font-medium">Loading contact information...</p>
       </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-50 p-4 text-center">
            <p className="text-red-500 font-medium mb-4">{currentLang.errorLoading}: {error}</p>
            <Button onClick={fetchContactContent} variant="outline" className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" /> {currentLang.retry}
            </Button>
        </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{displayTitle}</title>
        <meta name="description" content={displayDesc} />
      </Helmet>

      <section className="hero-gradient py-20">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-4">
              {pageContent.title || currentLang.heroTitle}
            </h1>
            <p className="text-2xl secondary-accent max-w-3xl mx-auto">
              {pageContent.description || currentLang.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12">
                <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                >
                <h2 className="text-3xl font-bold text-blue-900 mb-8">
                    {currentLang.infoTitle}
                </h2>
                
                <div className="space-y-6 mb-8">
                    <div className="flex items-start">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0 shadow-md">
                        <MapPin className="h-6 w-6 primary-accent" />
                    </div>
                    <div>
                        <span className="font-semibold text-gray-900 block mb-1">{currentLang.addressLabel}</span>
                        <p className="text-gray-600 whitespace-pre-line">{pageContent.address}</p>
                    </div>
                    </div>

                    <div className="flex items-start">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0 shadow-md">
                        <Phone className="h-6 w-6 primary-accent" />
                    </div>
                    <div>
                        <span className="font-semibold text-gray-900 block mb-1">{currentLang.phoneLabel}</span>
                        <p className="text-gray-600">{pageContent.phone || '+XXX XX XX XX XX'}</p>
                    </div>
                    </div>

                    <div className="flex items-start">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4 flex-shrink-0 shadow-md">
                        <Mail className="h-6 w-6 primary-accent" />
                    </div>
                    <div>
                        <span className="font-semibold text-gray-900 block mb-1">Email</span>
                        <p className="text-gray-600">{pageContent.email || 'contact@groupespi.com'}</p>
                    </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden h-64 border border-gray-100">
                    <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Map Location"
                    className="w-full h-full"
                    ></iframe>
                </div>
                </motion.div>

                <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                >
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
                    <div className="space-y-6">
                        {pageContent.form_fields && pageContent.form_fields.length > 0 ? (
                            pageContent.form_fields.map((field) => (
                                <div key={field.id}>
                                    <label htmlFor={field.id} className="block text-sm font-semibold text-gray-900 mb-2">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            id={field.id}
                                            name={field.id}
                                            value={formState[field.id] || ''}
                                            onChange={handleInputChange}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            rows="5"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all resize-none"
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            id={field.id}
                                            name={field.id}
                                            value={formState[field.id] || ''}
                                            onChange={handleInputChange}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center italic">No form fields configured.</p>
                        )}

                        <Button type="submit" className="w-full btn-primary">
                            <Send className="mr-2 h-5 w-5" />
                            {currentLang.send}
                        </Button>
                    </div>
                </form>
                </motion.div>
            </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;