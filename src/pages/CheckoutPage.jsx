import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { SHOP_BRANCHES } from '@/lib/shopConstants';
import { useNavigate, useParams } from 'react-router-dom';
import { useBranchWhatsApp } from '@/hooks/useBranchWhatsApp';

const CheckoutPage = ({ language }) => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [waNumber, setWaNumber] = useState('242000000000');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { getBranchWhatsApp } = useBranchWhatsApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const { toast } = useToast();

  const t = {
    back: language === 'fr' ? 'Retour à la boutique' : 'Back to Shop',
    checkout: language === 'fr' ? 'Finaliser la commande' : 'Checkout',
    summary: language === 'fr' ? 'Résumé de la commande' : 'Order Summary',
    formTitle: language === 'fr' ? 'Vos Coordonnées' : 'Your Details',
    submit: (type) => {
        if (language === 'en') return `Confirm via WhatsApp`;
        return `Confirmer par WhatsApp`;
    },
    success: language === 'fr' ? 'Redirection vers WhatsApp...' : 'Redirecting to WhatsApp...',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...',
    error: language === 'fr' ? 'Produit non trouvé' : 'Product not found'
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        
        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (productError) throw productError;
        setProduct(productData);

        if (productData) {
          // Fetch branch-specific WhatsApp config
          const config = await getBranchWhatsApp(productData.branch_id);
          if (config && config.is_enabled && config.whatsapp_number) {
            setWaNumber(config.whatsapp_number);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
            title: "Error",
            description: "Could not load required data.",
            variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [productId, toast, getBranchWhatsApp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
        toast({
            title: "Validation Error",
            description: "Name and Phone are required.",
            variant: "destructive"
        });
        return;
    }

    setSubmitting(true);

    try {
        // 1. Save order to DB
        const { error: orderError } = await supabase
            .from('orders')
            .insert([{
                product_id: product.id,
                product_name: product.name,
                branch_id: product.branch_id,
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: formData.phone,
                total_price: product.price,
                status: 'pending'
            }]);

        if (orderError) {
             console.error("Order save error", orderError);
        }

        // 2. Prepare WhatsApp message using the fetched waNumber
        const branchConfig = SHOP_BRANCHES.find(b => b.id === product.branch_id) || {};
        const formattedPrice = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(product.price);

        const actionText = language === 'fr' 
            ? `Je souhaite ${product.product_type.toLowerCase()}`
            : `I want to ${product.product_type.toLowerCase()}`;
            
        const message = `Bonjour, %0A%0A${actionText}: *${product.name}*%0APrix: ${formattedPrice}%0ABranche: ${branchConfig.name || 'Général'}%0A%0A*Mes coordonnées:*%0ANom: ${formData.name}%0AEmail: ${formData.email || 'N/A'}%0ATél: ${formData.phone}%0A%0A${formData.notes ? `Note: ${formData.notes}` : ''}`;
        
        toast({
            title: "Success",
            description: t.success,
        });

        // 3. Redirect
        setTimeout(() => {
            window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
            navigate('/boutique');
        }, 1500);

    } catch (error) {
        console.error(error);
        toast({
            title: "Error",
            description: "Something went wrong.",
            variant: "destructive"
        });
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;
  }

  if (!product) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-xl text-gray-600 mb-4">{t.error}</p>
            <Button onClick={() => navigate('/boutique')} variant="outline"><ArrowLeft className="mr-2 h-4 w-4"/> {t.back}</Button>
        </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t.checkout} - {product.name}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            <Button 
                variant="ghost" 
                onClick={() => navigate('/boutique')} 
                className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> {t.back}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="h-fit">
                    <div className="h-48 overflow-hidden rounded-t-xl bg-gray-100 relative">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 font-medium">No Image</div>
                        )}
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(product.price)}
                        </div>
                    </div>
                    <CardHeader>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription>{SHOP_BRANCHES.find(b => b.id === product.branch_id)?.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 text-sm">{product.description}</p>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                            <span>Type: <strong className="text-gray-900">{product.product_type}</strong></span>
                            <span>Category: <strong className="text-gray-900">{product.category}</strong></span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-t-4 border-t-green-500">
                    <CardHeader>
                        <CardTitle className="text-2xl">{t.formTitle}</CardTitle>
                        <CardDescription>Enter your details to finalize your request via WhatsApp.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="name" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="John Doe"
                                    required 
                                    className="text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input 
                                    id="email" 
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    placeholder="john@example.com" 
                                    className="text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                                <Input 
                                    id="phone" 
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    placeholder="+242 XXXXXXXX" 
                                    required 
                                    className="text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                <Textarea 
                                    id="notes" 
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Any specific requirements..." 
                                    className="text-gray-900"
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                type="submit" 
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
                                disabled={submitting}
                            >
                                {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                {t.submit(product.product_type)}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;