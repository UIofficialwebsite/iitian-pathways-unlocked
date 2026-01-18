import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';
import { SimpleAddon } from '@/components/courses/detail/BatchConfigurationModal';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowLeft, Check, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Custom Styles for the Phone Number Modal (Same as EnrollButton)
const customStyles = `
  /* Modal Container Overrides */
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
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Phone Dialog State
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
                .neq('status', 'FAILED')
            : Promise.resolve({ data: null, error: null })
        ]);

        if (courseRes.error) throw courseRes.error;
        setCourse(courseRes.data);

        const fetchedAddons = addonsRes.data || [];
        setAddons(fetchedAddons);
        setSelectedAddonIds([]); 

        // Enrollment Check
        if (enrollmentsRes.data && enrollmentsRes.data.length > 0) {
            const enrollments = enrollmentsRes.data;
            const isMainOwned = enrollments.some(e => !e.subject_name);
            const ownedSubjectNames = enrollments.filter(e => e.subject_name).map(e => e.subject_name);
            const areAllAddonsOwned = fetchedAddons.every(addon => ownedSubjectNames.includes(addon.subject_name));

            if (isMainOwned && (fetchedAddons.length === 0 || areAllAddonsOwned)) {
                toast.info("You are already fully enrolled in this batch.");
                navigate(`/courses/${courseId}`); 
                return;
            }
        }

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

  // --- Payment Logic Starts Here ---

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    setProcessing(true);

    try {
      // 1. Check for Phone Number in Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();

      if (profile?.phone && profile.phone.length >= 10) {
        // Proceed if phone exists
        await processPayment(profile.phone);
      } else {
        // Show dialog if missing
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
      // Update profile with new phone
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ phone: manualPhone })
        .eq('id', user.id);

      if (updateError) {
        console.error("Failed to update profile phone:", updateError);
      }
      
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

      console.log("Initiating Cashfree Payment...");

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
        body: {
          courseId,
          amount: finalTotal, // Use the calculated total
          userId: user.id,
          customerEmail: user.email, 
          customerPhone: phoneNumber,
          selectedSubjects: selectedAddonIds // Pass selected addon IDs
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

      if (data?.error) {
         throw new Error(data.error);
      }

      if (!data || !data.payment_session_id) {
        throw new Error("Invalid response from payment server");
      }

      // Load Cashfree SDK and Checkout
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => {
        const cashfreeMode = data.environment || 'sandbox'; 
        const cashfree = (window as any).Cashfree({ mode: cashfreeMode });
        
        cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          returnUrl: data.verifyUrl, 
        });
        setProcessing(false); // Stop loading once redirected or modal opens
      };
      document.body.appendChild(script);

    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast.error(error.message || "Enrollment Failed");
      setProcessing(false);
    }
  };

  // --- End Payment Logic ---

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
      
      {/* Inject Custom Styles for Modal */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Background Slope Effect */}
      <div 
        className="fixed bottom-[-20%] right-[-10%] w-[120%] h-[60%] -z-0 pointer-events-none opacity-70 blur-[40px]"
        style={{
            background: 'linear-gradient(110deg, rgba(246, 249, 252, 0) 0%, #ffcf4d 30%, #ff61d2 60%, #70e2ff 100%)',
            transform: 'rotate(-8deg)',
            transformOrigin: 'bottom right'
        }}
      />

      {/* Top Header Section */}
      <div className="w-full bg-white/50 backdrop-blur-md border-b border-gray-100 z-50 sticky top-0">
          <div className="max-w-[1000px] mx-auto px-5 py-4 flex items-center justify-between">
            <div 
                className="cursor-pointer group flex items-center gap-4"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="w-5 h-5 text-[#1a1f36] transition-transform duration-300 ease-in-out group-hover:-translate-x-1" />
                <div className="grid place-items-start">
                    <div className="col-start-1 row-start-1 flex items-center gap-3 transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:-translate-y-2 group-hover:pointer-events-none">
                        <img src="https://i.ibb.co/kgdrjTby/UI-Logo.png" alt="UI Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
                        <span className="font-['Inter',sans-serif] font-bold text-[#1a1f36] text-xl tracking-tight hidden sm:block">Unknown IITians</span>
                    </div>
                    <div className="col-start-1 row-start-1 flex items-center h-full transition-all duration-300 ease-in-out opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                        <span className="font-['Inter',sans-serif] font-bold text-[#1a1f36] text-lg tracking-tight pl-1">Back</span>
                    </div>
                </div>
            </div>
            
            <div className="text-sm font-semibold text-gray-400">BATCH CONFIGURATION</div>
          </div>
      </div>

      <div className="relative z-10 w-full max-w-[1000px] px-5 mt-8 pb-20">
        
        {/* Toggle Details Button */}
        <div className="flex justify-center mb-6">
            <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-full transition-all duration-200 active:scale-95 shadow-sm"
            >
                <span>{showDetails ? "Hide Batch Details" : "View Batch Details"}</span>
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
        </div>

        {/* Slidable Batch Details */}
        <div 
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showDetails ? "max-h-[500px] opacity-100 mb-10" : "max-h-0 opacity-0 mb-0"
            }`}
        >
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 text-center shadow-sm max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-4">
                    <Info className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[#1a1f36] mb-2">{course.title}</h2>
                <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-[#4f566b] font-medium">
                    {course.start_date && (
                        <span className="px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                            Starts: {formatDate(course.start_date)}
                        </span>
                    )}
                    {course.end_date && (
                        <span className="px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                            Ends: {formatDate(course.end_date)}
                        </span>
                    )}
                </div>
                {course.description && (
                    <p className="mt-4 text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
                        {course.description.length > 150 
                            ? `${course.description.substring(0, 150)}...` 
                            : course.description}
                    </p>
                )}
            </div>
        </div>

        {/* Main Grid */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-[60px]">
          
          {/* --- LEFT COLUMN: Configuration --- */}
          <div className="flex-[1.2] w-full">
            <div className="mb-6">
                <h1 className="text-[24px] font-bold tracking-tight text-[#1a1f36]">Select Your Subjects</h1>
                <p className="text-[#4f566b] text-sm mt-1">Customize your learning path by choosing the subjects you need.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              {coreSubjects.map((subject, idx) => (
                <div key={`core-${idx}`} className="flex items-center justify-between bg-white border border-[#e3e8ee] p-[18px] px-6 rounded-lg opacity-80 cursor-not-allowed select-none">
                  <div className="flex items-center flex-grow">
                    <div className="w-5 h-5 bg-[#e3e8ee] border border-[#e3e8ee] rounded-[4px] mr-4 flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#4f566b]" strokeWidth={3} />
                    </div>
                    <span className="font-medium text-[15px] text-[#1a1f36]">{subject}</span>
                  </div>
                  <span className="font-semibold text-[11px] text-[#22c55e] bg-green-50 px-2 py-1 rounded tracking-wide">INCLUDED</span>
                </div>
              ))}

              {addons.map((addon) => {
                const isSelected = selectedAddonIds.includes(addon.id);
                return (
                  <label key={addon.id} className="group flex items-center justify-between bg-white border border-[#e3e8ee] p-[18px] px-6 rounded-lg cursor-pointer transition-all duration-150 hover:border-black hover:shadow-sm">
                    <div className="flex items-center flex-grow">
                      <div className={`w-5 h-5 border rounded-[4px] mr-4 flex items-center justify-center transition-colors duration-200 ${isSelected ? 'bg-[#1a1f36] border-[#1a1f36]' : 'bg-white border-[#e3e8ee] group-hover:border-[#b0b6c0]'}`}>
                         <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleAddon(addon.id)} />
                         {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                      </div>
                      <span className="font-medium text-[15px] text-[#1a1f36]">{addon.subject_name}</span>
                    </div>
                    <span className="font-semibold text-[15px] text-[#1a1f36]">₹{addon.price}</span>
                  </label>
                );
              })}
              
              {addons.length === 0 && coreSubjects.length === 0 && (
                <div className="p-4 text-center text-[#4f566b] bg-white border border-[#e3e8ee] rounded-lg">No configurable options available.</div>
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: Summary --- */}
          <div className="md:flex-[0.8] w-full flex flex-col justify-start pt-2">
            <div className="bg-white border border-[#e3e8ee] p-8 rounded-lg w-full shadow-sm sticky top-24">
              <h2 className="text-[18px] font-bold text-[#1a1f36] mb-6 tracking-tight">Enrollment Summary</h2>

              <div className="flex justify-between mb-3 text-sm">
                <div className="flex flex-col">
                    <span className="text-[#1a1f36] font-medium">Base Plan</span>
                    <span className="text-xs text-[#4f566b] truncate max-w-[150px]">{course.title}</span>
                </div>
                {basePrice === 0 ? <span className="text-[#22c55e] font-bold">FREE</span> : <span className="text-[#1a1f36] font-medium">₹{basePrice}</span>}
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
                disabled={processing}
                className="w-full bg-[#1a1f36] text-white border-0 py-3.5 px-4 rounded-md text-[15px] font-semibold cursor-pointer transition-colors hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-md"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to Payment"}
              </button>

              <p className="mt-6 text-[12px] text-[#4f566b] leading-relaxed text-center">
                By continuing, you agree to our <br className="hidden md:block"/>
                <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-[#635bff] no-underline font-medium hover:underline">Terms of Service</a> 
                {' '}&{' '} 
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#635bff] no-underline font-medium hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Number Required Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-none w-auto [&>button]:hidden">
          <div className="custom-modal-wrapper">
            <button className="close-icon" onClick={() => setShowPhoneDialog(false)}>&times;</button>

            <div className="loading-container">
              <div className="dot"></div><div className="dot"></div><div className="dot"></div>
            </div>

            <h2 className="modal-title">Contact Details Required</h2>
            <p className="modal-description">
              Please provide your phone number to generate your payment receipt and finalize your enrollment process.
            </p>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="e.g., 9876543210"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowPhoneDialog(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handlePhoneSubmit} disabled={processing}>
                {processing ? "Saving..." : "Continue to Enroll"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default BatchConfiguration;
