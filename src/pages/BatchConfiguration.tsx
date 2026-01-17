import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';
import { SimpleAddon } from '@/components/courses/detail/BatchConfigurationModal';
import { useAuth } from '@/hooks/useAuth';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Loader2, Check, ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';

const BatchConfiguration = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [addons, setAddons] = useState<SimpleAddon[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // --- 1. Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      try {
        const [courseRes, addonsRes] = await Promise.all([
          supabase.from('courses').select('*').eq('id', courseId).single(),
          supabase.from('course_addons').select('*').eq('course_id', courseId)
        ]);

        if (courseRes.error) throw courseRes.error;
        setCourse(courseRes.data);

        if (addonsRes.data) {
          setAddons(addonsRes.data);
          // Optional: Pre-select all add-ons? Or none? 
          // Let's start with none selected for "Choice Making"
          setSelectedAddonIds([]);
        }
      } catch (error) {
        console.error('Error fetching batch details:', error);
        toast.error('Failed to load batch details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  // --- 2. Calculations ---
  const basePrice = course?.discounted_price ?? course?.price ?? 0;
  
  const selectedAddonsList = useMemo(() => {
    return addons.filter(addon => selectedAddonIds.includes(addon.id));
  }, [addons, selectedAddonIds]);

  const addonsTotal = selectedAddonsList.reduce((sum, addon) => sum + addon.price, 0);
  const finalTotal = basePrice + addonsTotal;

  // --- 3. Handlers ---
  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId) 
        : [...prev, addonId]
    );
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please login to continue");
      return;
    }
    setProcessing(true);
    
    // Simulate processing or redirect to actual Payment Gateway logic
    // In a real scenario, you'd create an order on your backend here
    // For now, we simulate a delay and success
    setTimeout(() => {
        setProcessing(false);
        toast.success("Proceeding to Payment Gateway...");
        // Navigate to payment wrapper or trigger SDK
        // navigate('/payment', { state: { courseId, addonIds: selectedAddonIds, amount: finalTotal } });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!course) return <div>Course not found</div>;

  // Core Subjects List (Parsed from string)
  const coreSubjects = course.subject 
    ? course.subject.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-[#f7f9fc] font-['Inter',sans-serif] text-slate-900">
      <NavBar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
        
        {/* Header */}
        <div className="mb-10">
          <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800 mb-2" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Course
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configure Your Plan</h1>
          <p className="text-slate-500 mt-2">Customize your learning journey by selecting the subjects you need.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* --- LEFT COLUMN: Subject Selection --- */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Core Subjects (Included) */}
            {coreSubjects.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Lock className="w-3 h-3 text-green-600" /> Core Batch (Included)
                </h3>
                <div className="space-y-3">
                  {coreSubjects.map((subject, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm opacity-80 cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center w-5 h-5 bg-green-100 border-green-200 rounded text-green-700 mr-4">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-slate-700">{subject}</span>
                      <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                        INCLUDED
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Optional Add-ons (Choice Making) */}
            {addons.length > 0 && (
              <section>
                 <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 mt-8">
                  Available Add-ons
                </h3>
                <div className="space-y-3">
                  {addons.map((addon) => {
                    const isSelected = selectedAddonIds.includes(addon.id);
                    return (
                      <div 
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`
                          group flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200
                          ${isSelected 
                            ? 'bg-white border-black shadow-md' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}
                        `}
                      >
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleAddon(addon.id)}
                          className="mr-4 data-[state=checked]:bg-black data-[state=checked]:border-black"
                        />
                        <div className="flex-1">
                          <span className={`font-medium transition-colors ${isSelected ? 'text-black' : 'text-slate-600'}`}>
                            {addon.subject_name}
                          </span>
                        </div>
                        {/* Price is HIDDEN here as per request */}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

             {/* Value Props / Trust Signals */}
             <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <ShieldCheck className="w-5 h-5 text-slate-400" />
                    <span>Secure Payment Processing</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Check className="w-5 h-5 text-slate-400" />
                    <span>Instant Access after Payment</span>
                </div>
             </div>

          </div>


          {/* --- RIGHT COLUMN: Bill Summary (Sticky) --- */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32">
              <Card className="border-0 shadow-xl bg-white overflow-hidden rounded-2xl ring-1 ring-slate-200">
                <div className="p-6 md:p-8 space-y-6">
                  
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Bill Summary</h2>
                    <p className="text-sm text-slate-500 mt-1">Review your plan details below.</p>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Bill Table */}
                  <div className="space-y-4">
                    
                    {/* Base Plan Row */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-900">Base Plan</div>
                        <div className="text-xs text-slate-500 mt-0.5">Core Batch Access</div>
                      </div>
                      <div className="font-semibold text-slate-900">
                        {basePrice === 0 ? "FREE" : `₹${basePrice.toLocaleString()}`}
                      </div>
                    </div>

                    {/* Selected Add-ons Rows */}
                    {selectedAddonsList.map((addon) => (
                      <div key={addon.id} className="flex justify-between items-start animate-in fade-in slide-in-from-left-2 duration-300">
                        <div>
                          <div className="font-medium text-slate-700">{addon.subject_name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">Add-on Subject</div>
                        </div>
                        <div className="font-medium text-slate-700">
                          ₹{addon.price.toLocaleString()}
                        </div>
                      </div>
                    ))}

                    {/* Empty State Hint if only Base is Free */}
                    {basePrice === 0 && selectedAddonsList.length === 0 && (
                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        No paid items selected. You can enroll for free.
                      </div>
                    )}

                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Total Row */}
                  <div className="flex justify-between items-end pt-2">
                    <div className="text-sm font-medium text-slate-500">Total Due Today</div>
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">
                      ₹{finalTotal.toLocaleString()}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    size="lg" 
                    className="w-full text-base font-medium h-12 bg-black hover:bg-black/90 text-white shadow-lg shadow-black/10 transition-all hover:scale-[1.01]"
                    onClick={handlePayment}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                      </>
                    ) : (
                      "Continue to Payment"
                    )}
                  </Button>
                  
                  <p className="text-center text-xs text-slate-400">
                    By confirming, you agree to our Terms of Service.
                  </p>
                </div>
                
                {/* Stripe-like colored strip at bottom */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BatchConfiguration;
