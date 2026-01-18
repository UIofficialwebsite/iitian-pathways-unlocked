import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';
import { SimpleAddon } from '@/components/courses/detail/BatchConfigurationModal';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowLeft, Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Custom Styles for the Phone Number Modal
const customStyles = `
  .custom-modal-wrapper {
    font-family: 'Inter', sans-serif !important;
    background: #ffffff;
    width: 100%;
    max-width: 440px;
    border: 1px solid #000000;
    padding: 32px;
    position: relative;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    margin: 0 auto;
  }
  .loading-container {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 24px;
  }
  .dot {
    width: 6px;
    height: 6px;
    background-color: #000000;
    border-radius: 50%;
    animation: dot-pulse 1.4s infinite ease-in-out both;
  }
  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }
  @keyframes dot-pulse {
    0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
    40% { transform: scale(1); opacity: 1; }
  }
  .modal-title {
    font-size: 22px;
    font-weight: 700;
    color: #000000;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
    text-align: left;
  }
  .modal-description {
    font-size: 14px;
    color: #555555;
    line-height: 1.6;
    margin-bottom: 28px;
    text-align: left;
  }
  .form-group {
    margin-bottom: 28px;
    text-align: left;
  }
  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #000000;
    margin-bottom: 8px;
  }
  .form-input {
    width: 100%;
    padding: 14px;
    font-size: 15px;
    border: 1px solid #000000;
    outline: none;
    color: #000000;
    background: white;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  .btn {
    padding: 12px 24px;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    border: 1px solid #000000;
    transition: all 0.2s;
    border-radius: 0;
  }
  .btn-secondary {
    background: #ffffff;
    color: #000000;
  }
  .btn-primary {
    background: #000000;
    color: #ffffff;
  }
  .close-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 20px;
    color: #999;
    cursor: pointer;
    line-height: 1;
    background: none;
    border: none;
    padding: 0;
  }
`;

const BatchConfiguration = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [addons, setAddons] = useState<SimpleAddon[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  
  // Ownership States
  const [isMainCourseOwned, setIsMainCourseOwned] = useState(false);
  const [ownedAddonIds, setOwnedAddonIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [manualPhone, setManualPhone] = useState("");

  // --- 1. Fetch Data & Check Enrollment ---
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      try {
        const [courseRes, addonsRes, enrollmentsRes] = await Promise.all([
          supabase.from('courses').select('*').eq('id', courseId).single(),
          supabase.from('course_addons').select('*').eq('course_id', courseId),
          user 
            ? supabase
                .from('enrollments')
                .select('subject_name, status')
                .eq('user_id', user.id)
                .eq('course_id', courseId)
                // Filter for successful payments only
                .in('status', ['active', 'paid', 'success'])
            : Promise.resolve({ data: null, error: null })
        ]);

        if (courseRes.error) throw courseRes.error;
        setCourse(courseRes.data);

        const fetchedAddons = addonsRes.data || [];
        setAddons(fetchedAddons);
        
        // --- UPDATED ENROLLMENT LOGIC ---
        if (enrollmentsRes.data && enrollmentsRes.data.length > 0) {
            const enrollments = enrollmentsRes.data;
            
            // 1. Check Main Course (records with null subject_name)
            const mainOwned = enrollments.some(e => !e.subject_name);
            setIsMainCourseOwned(mainOwned);

            // 2. Check Add-ons (Robust Match: ID or Name)
            const ownedIdentifiers = new Set(
                enrollments
                    .filter(e => e.subject_name)
                    .map(e => e.subject_name)
            );
            
            // Filter addons where EITHER their ID OR their Name exists in the user's enrollments
            const ownedIds = fetchedAddons
                .filter(addon => 
                    ownedIdentifiers.has(addon.id) || 
                    ownedIdentifiers.has(addon.subject_name)
                )
                .map(addon => addon.id);
            
            setOwnedAddonIds(ownedIds);

            // 3. Redirect only if EVERYTHING available is owned
            const areAllAddonsOwned = fetchedAddons.every(addon => ownedIds.includes(addon.id));
            
            if (mainOwned && (fetchedAddons.length === 0 || areAllAddonsOwned)) {
                toast.info("You are already fully enrolled in this batch.");
                navigate(`/courses/${courseId}`); 
                return;
            }
        }
        
        setSelectedAddonIds([]); 

      } catch (error) {
        console.error('Error fetching batch details:', error);
        toast.error('Failed to load batch details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, user, navigate]);

  // --- 2. Calculations ---
  const basePrice = course?.discounted_price ?? course?.price ?? 0;
  const effectiveBasePrice = isMainCourseOwned ? 0 : basePrice;
  
  const selectedAddonsList = useMemo(() => {
    return addons.filter(addon => 
        selectedAddonIds.includes(addon.id) && !ownedAddonIds.includes(addon.id)
    );
  }, [addons, selectedAddonIds, ownedAddonIds]);

  const addonsTotal = selectedAddonsList.reduce((sum, addon) => sum + addon.price, 0);
  const finalTotal = effectiveBasePrice + addonsTotal;

  // --- 3. Handlers ---
  const toggleAddon = (addonId: string) => {
    if (ownedAddonIds.includes(addonId)) return;

    setSelectedAddonIds(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId) 
        : [...prev, addonId]
    );
  };

  // --- Payment Logic ---
  const handlePayment = async () => {
    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    if (finalTotal === 0) {
        toast.error("Please select at least one new item to purchase.");
        return;
    }

    setProcessing(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();

      if (profile?.phone && profile.phone.length >= 10) {
        await processPayment(profile.phone);
      } else {
        setProcessing(false);
        setShowPhoneDialog(true);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      setProcessing(false);
      setShowPhoneDialog(true);
    }
  };

  const handlePhoneSubmit = async () => {
    if (manualPhone.length < 10) {
      toast.error("Please enter a valid 10-digit number");
      return;
    }

    setProcessing(true);
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ phone: manualPhone })
        .eq('id', user.id);

      if (updateError) console.error("Failed to update profile phone:", updateError);
      
      setShowPhoneDialog(false);
      await processPayment(manualPhone);
    } catch (error) {
      setProcessing(false);
      console.error(error);
      toast.error("Something went wrong saving your contact info.");
    }
  };

  const processPayment = async (phoneNumber: string) => {
    try {
      if (!courseId) throw new Error("Course information is missing");

      const newAddonIds = selectedAddonIds.filter(id => !ownedAddonIds.includes(id));

      const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
        body: {
          courseId,
          amount: finalTotal, 
          userId: user.id,
          customerEmail: user.email, 
          customerPhone: phoneNumber,
          selectedSubjects: newAddonIds 
        },
      });

      if (error) {
        let errorMessage = "Payment initialization failed";
        try {
           const body = JSON.parse(error.message);
           errorMessage = body.error || errorMessage;
        } catch (e) {
           if (error.message) errorMessage = error.message;
        }
        throw new Error(errorMessage);
      }

      if (data?.error) throw new Error(data.error);
      if (!data || !data.payment_session_id) throw new Error("Invalid response from payment server");

      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => {
        const cashfreeMode = data.environment || 'sandbox'; 
        const cashfree = (window as any).Cashfree({ mode: cashfreeMode });
        
        cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          returnUrl: data.verifyUrl, 
        });
        setProcessing(false); 
      };
      document.body.appendChild(script);

    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast.error(error.message || "Enrollment Failed");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f9fc] flex items-center justify-center font-['Inter',sans-serif]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!course) return <div>Course not found</div>;

  const coreSubjects = course.subject 
    ? course.subject.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] font-['Inter',sans-serif] text-[#1a1f36] relative overflow-hidden flex flex-col items-center">
      
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      <div 
        className="fixed bottom-[-20%] right-[-10%] w-[120%] h-[60%] -z-0 pointer-events-none opacity-70 blur-[40px]"
        style={{
            background: 'linear-gradient(110deg, rgba(246, 249, 252, 0) 0%, #ffcf4d 30%, #ff61d2 60%, #70e2ff 100%)',
            transform: 'rotate(-8deg)',
            transformOrigin: 'bottom right'
        }}
      />

      {/* --- MOBILE HEADER --- */}
      <div className="w-full bg-white/50 backdrop-blur-md border-b border-gray-100 z-50 sticky top-0 md:hidden">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="cursor-pointer group flex items-center gap-4" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5 text-[#1a1f36]" />
                <span className="font-bold text-[#1a1f36]">Back</span>
            </div>
          </div>
      </div>

      <div className="relative z-10 w-full max-w-[1000px] px-5 mt-4 md:mt-12 pb-20">
        <div className="hidden md:flex mb-10 w-fit cursor-pointer group items-center gap-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-[#1a1f36]" />
            <span className="font-bold text-[#1a1f36] text-lg">Back</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-[60px]">
          <div className="flex-[1.2] w-full">
            <div className="mb-8">
                <h1 className="text-[28px] font-bold tracking-tight text-[#1a1f36]">Select Your Subjects</h1>
                <h2 className="text-xl text-[#1a1f36] mt-4 mb-2">
                    <span className="font-semibold">Batch Name:</span> <span className="font-normal">{course.title}</span>
                </h2>
                <p className="text-[#4f566b] font-medium text-sm mb-4">
                    {course.start_date && <span>Starts on {formatDate(course.start_date)}</span>}
                    {course.start_date && course.end_date && <span className="mx-2">•</span>}
                    {course.end_date && <span>Ends on {formatDate(course.end_date)}</span>}
                </p>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Core Subjects */}
              {coreSubjects.map((subject, idx) => (
                <div key={`core-${idx}`} className="flex items-center justify-between bg-white border border-[#e3e8ee] p-[18px] px-6 rounded-lg opacity-80 cursor-not-allowed select-none">
                  <div className="flex items-center flex-grow">
                    <div className="w-5 h-5 bg-[#e3e8ee] border border-[#e3e8ee] rounded-[4px] mr-4 flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#4f566b]" strokeWidth={3} />
                    </div>
                    <span className="font-medium text-[15px] text-[#1a1f36]">{subject}</span>
                  </div>
                  <span className="font-semibold text-[11px] text-[#22c55e] bg-green-50 px-2 py-1 rounded tracking-wide">
                    {isMainCourseOwned ? "ENROLLED" : "INCLUDED"}
                  </span>
                </div>
              ))}

              {/* Add-ons */}
              {addons.map((addon) => {
                const isOwned = ownedAddonIds.includes(addon.id);
                const isSelected = selectedAddonIds.includes(addon.id) || isOwned;
                
                return (
                  <label 
                    key={addon.id} 
                    className={`group flex items-center justify-between border p-[18px] px-6 rounded-lg transition-all duration-150 
                        ${isOwned 
                            ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
                            : 'bg-white border-[#e3e8ee] cursor-pointer hover:border-black hover:shadow-sm'
                        }`}
                  >
                    <div className="flex items-center flex-grow">
                      <div className={`w-5 h-5 border rounded-[4px] mr-4 flex items-center justify-center transition-colors duration-200 
                        ${isSelected 
                            ? 'bg-[#1a1f36] border-[#1a1f36]' 
                            : 'bg-white border-[#e3e8ee] group-hover:border-[#b0b6c0]'
                        }`}>
                         <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={isSelected} 
                            disabled={isOwned}
                            onChange={() => toggleAddon(addon.id)} 
                         />
                         {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                      </div>
                      <span className={`font-medium text-[15px] ${isOwned ? 'text-gray-500' : 'text-[#1a1f36]'}`}>
                        {addon.subject_name}
                      </span>
                    </div>
                    
                    {isOwned ? (
                        <span className="text-xs font-bold text-[#22c55e] bg-green-50 px-2 py-1 rounded">
                            ENROLLED
                        </span>
                    ) : (
                        <span className="font-semibold text-[15px] text-[#1a1f36]">₹{addon.price}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="md:flex-[0.8] w-full flex flex-col justify-start pt-2">
            <div className="bg-white border border-[#e3e8ee] p-8 rounded-lg w-full shadow-sm md:sticky md:top-24">
              <h2 className="text-[18px] font-bold text-[#1a1f36] mb-6 tracking-tight">Enrollment Summary</h2>

              <div className="flex justify-between mb-3 text-sm">
                <div className="flex flex-col">
                    <span className="text-[#1a1f36] font-medium">Base Plan</span>
                    <span className="text-xs text-[#4f566b] truncate max-w-[150px]">{course.title}</span>
                </div>
                {isMainCourseOwned ? (
                     <span className="text-[#22c55e] font-bold text-xs bg-green-50 px-2 py-0.5 rounded h-fit">ENROLLED</span>
                ) : (
                    basePrice === 0 ? <span className="text-[#22c55e] font-bold">FREE</span> : <span className="text-[#1a1f36] font-medium">₹{basePrice}</span>
                )}
              </div>

              {selectedAddonsList.map(addon => (
                <div key={`summary-${addon.id}`} className="flex justify-between mb-3 text-sm animate-in fade-in slide-in-from-left-2">
                    <span className="text-[#4f566b]">{addon.subject_name}</span>
                    <span className="text-[#4f566b]">₹{addon.price}</span>
                </div>
              ))}

              <div className="h-px bg-[#e3e8ee] my-5"></div>

              <div className="flex justify-between items-baseline mb-6">
                <span className="text-[15px] font-semibold text-[#1a1f36]">Total Due Today</span>
                <span className="text-[24px] font-bold text-[#1a1f36]">₹{finalTotal}</span>
              </div>

              <button 
                onClick={handlePayment}
                disabled={processing || finalTotal === 0}
                className="w-full bg-[#1a1f36] text-white border-0 py-3.5 px-4 rounded-md text-[15px] font-semibold cursor-pointer transition-colors hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-md"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-none w-auto [&>button]:hidden">
          <div className="custom-modal-wrapper">
            <button className="close-icon" onClick={() => setShowPhoneDialog(false)}>&times;</button>
            <div className="loading-container"><div className="dot"></div><div className="dot"></div><div className="dot"></div></div>
            <h2 className="modal-title">Contact Details Required</h2>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" placeholder="e.g., 9876543210" value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowPhoneDialog(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePhoneSubmit} disabled={processing}>Continue to Enroll</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchConfiguration;
