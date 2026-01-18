import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';
import { SimpleAddon } from '@/components/courses/detail/BatchConfigurationModal';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
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
    
    // Simulate processing
    setTimeout(() => {
        setProcessing(false);
        toast.success("Proceeding to Payment Gateway...");
        // navigate('/payment', { state: { courseId, addonIds: selectedAddonIds, amount: finalTotal } });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f9fc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!course) return <div>Course not found</div>;

  // Core Subjects List (Parsed from string)
  const coreSubjects = course.subject 
    ? course.subject.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Date Formatting Helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] font-['Inter',sans-serif] text-[#1a1f36] relative overflow-hidden flex flex-col items-center py-12">
      
      {/* Background Slope Effect */}
      <div 
        className="fixed bottom-[-20%] right-[-10%] w-[120%] h-[60%] -z-0 pointer-events-none opacity-70 blur-[40px]"
        style={{
            background: 'linear-gradient(110deg, rgba(246, 249, 252, 0) 0%, #ffcf4d 30%, #ff61d2 60%, #70e2ff 100%)',
            transform: 'rotate(-8deg)',
            transformOrigin: 'bottom right'
        }}
      />

      <div className="relative z-10 w-full max-w-[1000px] px-5">
        
        {/* Top Header Row */}
        <div className="mb-10 flex items-center gap-6">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-[#4f566b] hover:text-[#1a1f36] text-sm font-medium transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
            
            {/* Divider */}
            <div className="h-8 w-px bg-slate-300"></div>

            {/* Branding - Bigger Logo & Text */}
            <div className="flex items-center gap-4">
                <img 
                  src="https://i.ibb.co/kgdrjTby/UI-Logo.png" 
                  alt="UI Logo" 
                  className="w-14 h-14 object-contain drop-shadow-sm" 
                />
                <span className="font-['Inter',sans-serif] font-bold text-[#1a1f36] text-2xl tracking-tight">
                    Unknown IITians
                </span>
            </div>
        </div>

        {/* Main Grid */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-[60px]">
          
          {/* --- LEFT COLUMN: Configuration (Top Aligned) --- */}
          <div className="flex-[1.2] w-full">
            
            <div className="mb-8">
                <h1 className="text-[28px] font-bold tracking-tight text-[#1a1f36]">Configure Your Plan</h1>
                
                {/* Batch Name (Semi-bold Label, Normal Value) */}
                <h2 className="text-xl text-[#1a1f36] mt-4 mb-2">
                    <span className="font-semibold">Batch Name:</span> <span className="font-normal">{course.title}</span>
                </h2>
                
                <p className="text-[#4f566b] font-medium text-sm mb-4">
                    {course.start_date && <span>Starts on {formatDate(course.start_date)}</span>}
                    {course.start_date && course.end_date && <span className="mx-2">•</span>}
                    {course.end_date && <span>Ends on {formatDate(course.end_date)}</span>}
                </p>

                <p className="text-[#4f566b] text-sm mt-4">Review included subjects and select additional add-ons below.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              
              {/* Core Subjects (Included/Locked) */}
              {coreSubjects.map((subject, idx) => (
                <div 
                  key={`core-${idx}`}
                  className="flex items-center justify-between bg-white border border-[#e3e8ee] p-[18px] px-6 rounded-lg opacity-70 cursor-not-allowed select-none"
                >
                  <div className="flex items-center flex-grow">
                    <div className="w-5 h-5 bg-[#e3e8ee] border border-[#e3e8ee] rounded-[4px] mr-4 flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#4f566b]" strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-[15px] text-[#1a1f36]">{subject}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-[13px] text-[#22c55e] bg-green-50 px-2 py-1 rounded">INCLUDED</span>
                </div>
              ))}

              {/* Optional Add-ons */}
              {addons.map((addon) => {
                const isSelected = selectedAddonIds.includes(addon.id);
                return (
                  <label 
                    key={addon.id}
                    className="group flex items-center justify-between bg-white border border-[#e3e8ee] p-[18px] px-6 rounded-lg cursor-pointer transition-colors duration-150 hover:border-black"
                  >
                    <div className="flex items-center flex-grow">
                      {/* Custom Checkbox */}
                      <div 
                        className={`w-5 h-5 border rounded-[4px] mr-4 flex items-center justify-center transition-colors duration-200 
                            ${isSelected ? 'bg-[#1a1f36] border-[#1a1f36]' : 'bg-white border-[#e3e8ee] group-hover:border-[#b0b6c0]'}
                        `}
                      >
                         <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={isSelected} 
                            onChange={() => toggleAddon(addon.id)}
                         />
                         {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                      </div>
                      <span className="font-medium text-[15px] text-[#1a1f36]">{addon.subject_name}</span>
                    </div>
                    <span className="font-semibold text-[15px] text-[#1a1f36]">₹{addon.price}</span>
                  </label>
                );
              })}
              
              {addons.length === 0 && coreSubjects.length === 0 && (
                <div className="p-4 text-center text-[#4f566b] bg-white border border-[#e3e8ee] rounded-lg">
                    No configurable options available for this course.
                </div>
              )}

            </div>
          </div>

          {/* --- RIGHT COLUMN: Summary (Middle Aligned via Flex) --- */}
          <div className="md:flex-[0.8] w-full flex flex-col justify-center">
            <div className="bg-white border border-[#e3e8ee] p-8 rounded-lg w-full shadow-sm">
              <h2 className="text-[20px] font-bold text-[#1a1f36] mb-6">Order Summary</h2>

              {/* Base Plan Line */}
              <div className="flex justify-between mb-3 text-sm">
                <div className="flex flex-col">
                    <span className="text-[#1a1f36] font-medium">Base Plan</span>
                    <span className="text-xs text-[#4f566b]">{course.title}</span>
                </div>
                {basePrice === 0 ? (
                    <span className="text-[#22c55e] font-bold">FREE</span>
                ) : (
                    <span className="text-[#1a1f36] font-medium">₹{basePrice}</span>
                )}
              </div>

              {/* Selected Addons Lines */}
              {selectedAddonsList.map(addon => (
                <div key={`summary-${addon.id}`} className="flex justify-between mb-3 text-sm animate-in fade-in slide-in-from-left-2">
                    <span className="text-[#4f566b]">{addon.subject_name}</span>
                    <span className="text-[#4f566b]">₹{addon.price}</span>
                </div>
              ))}

              {/* Divider */}
              <div className="h-px bg-[#e3e8ee] my-5"></div>

              {/* Total Row */}
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-[16px] font-semibold text-[#1a1f36]">Total Due Today</span>
                <span className="text-[24px] font-bold text-[#1a1f36]">₹{finalTotal}</span>
              </div>

              {/* Payment Button */}
              <button 
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-[#1a1f36] text-white border-0 py-3.5 px-4 rounded-md text-[15px] font-semibold cursor-pointer transition-colors hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-lg shadow-indigo-500/20"
              >
                {processing ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                   "Continue to Payment"
                )}
              </button>

              <p className="mt-6 text-[12px] text-[#4f566b] leading-relaxed text-center">
                By continuing, you agree to our <br className="hidden md:block"/>
                <a href="#" className="text-[#635bff] no-underline font-medium hover:underline">Terms of Service</a> & Privacy Policy.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BatchConfiguration;
