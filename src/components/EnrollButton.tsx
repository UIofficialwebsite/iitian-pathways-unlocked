import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useLoginModal } from "@/context/LoginModalContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- TYPES ---
interface CountryCode {
  id: number;
  name: string;
  dial_code: string;
  code: string;
  phone_length?: number; // Optional, assuming the table has this
}

// Injecting the user's specific CSS styles
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
  
  /* Mobile Drawer Specific Override */
  .mobile-drawer-wrapper {
    font-family: 'Inter', sans-serif !important;
    background: #ffffff;
    width: 100%;
    padding: 24px;
    position: relative;
  }

  /* THREE DOTS HORIZONTAL LOADING ANIMATION */
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

  /* Modal Content */
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

  /* Form Styling */
  .form-group {
    margin-bottom: 20px;
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

  .form-row {
    display: flex;
    gap: 12px;
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

  .form-input::placeholder {
    color: #aaaaaa;
  }

  /* Error Message Styling */
  .error-message {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #ef4444; /* Red-500 */
    font-size: 13px;
    font-weight: 500;
    margin-top: 8px;
    background-color: #fef2f2;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #fee2e2;
  }

  /* Modal Footer Buttons */
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
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

  .btn-primary {
    background: #000000;
    color: #ffffff;
    width: 100%;
  }

  .btn-primary:hover {
    background: #222222;
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

// --- UPDATED VERIFICATION COMPONENT ---
interface VerificationContentProps {
  isDrawer?: boolean;
  manualPhone: string;
  setManualPhone: (val: string) => void;
  selectedCountry: CountryCode | null;
  setSelectedCountry: (val: CountryCode) => void;
  inlineError: string | null;
  setInlineError: (val: string | null) => void;
  handlePhoneSubmit: () => void;
  isProcessing: boolean;
  onClose: () => void;
}

const VerificationContent: React.FC<VerificationContentProps> = ({
  isDrawer = false,
  manualPhone,
  setManualPhone,
  selectedCountry,
  setSelectedCountry,
  inlineError,
  setInlineError,
  handlePhoneSubmit,
  isProcessing,
  onClose
}) => {
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);

  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const { data, error } = await supabase
          .from('country_codes' as any) // Casting as any since table might not be in types yet
          .select('*')
          .order('name');
        
        if (data && !error) {
          setCountryCodes(data);
          // Default to India if available, else first option
          const india = data.find((c: CountryCode) => c.code === 'IN' || c.dial_code === '+91');
          if (india && !selectedCountry) setSelectedCountry(india);
          else if (data.length > 0 && !selectedCountry) setSelectedCountry(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch country codes", err);
      } finally {
        setLoadingCodes(false);
      }
    };
    fetchCountryCodes();
  }, [setSelectedCountry, selectedCountry]);

  return (
    <div className={isDrawer ? "mobile-drawer-wrapper" : "custom-modal-wrapper"}>
      {!isDrawer && (
        <button className="close-icon" onClick={onClose}>&times;</button>
      )}

      <div className="loading-container">
        <div className="dot"></div><div className="dot"></div><div className="dot"></div>
      </div>

      <h2 className="modal-title">Contact Details Required</h2>
      <p className="modal-description">
        Please select your country code and provide your phone number to generate your payment receipt.
      </p>

      <div className="form-group">
        <label className="form-label">Phone Number</label>
        
        <div className="form-row">
          {/* Country Code Dropdown */}
          <div className="w-[140px] shrink-0">
             <Select 
                disabled={loadingCodes} 
                value={selectedCountry?.dial_code} 
                onValueChange={(val) => {
                  const country = countryCodes.find(c => c.dial_code === val);
                  if (country) setSelectedCountry(country);
                }}
             >
              <SelectTrigger className="h-[50px] border-black rounded-none bg-white focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="+91">
                   {selectedCountry ? `${selectedCountry.dial_code} ${selectedCountry.code}` : "+91 IN"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {countryCodes.map((country) => (
                  <SelectItem key={country.id} value={country.dial_code}>
                    <span className="flex items-center gap-2">
                       <span className="font-medium">{country.dial_code}</span>
                       <span className="text-muted-foreground text-xs">{country.code}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number Input */}
          <input 
            type="tel" 
            className="form-input" 
            placeholder={selectedCountry?.phone_length ? `${"0".repeat(selectedCountry.phone_length)}` : "9876543210"}
            value={manualPhone}
            onChange={(e) => {
              // Only allow numbers
              const val = e.target.value.replace(/\D/g, '');
              setManualPhone(val);
              if (inlineError) setInlineError(null); 
            }}
          />
        </div>
        
        {inlineError && (
          <div className="error-message">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{inlineError}</span>
          </div>
        )}
      </div>

      <div className="modal-actions">
        <button className="btn btn-primary" onClick={handlePhoneSubmit} disabled={isProcessing || loadingCodes}>
          {isProcessing ? "Verifying..." : "Verify & Continue"}
        </button>
      </div>
    </div>
  );
};

interface EnrollButtonProps {
  courseId?: string;
  enrollmentLink?: string;
  coursePrice?: number;
  className?: string;
  children?: React.ReactNode;
  selectedSubjects?: string[];
  disabled?: boolean;
}

const EnrollButton: React.FC<EnrollButtonProps> = ({ 
  courseId, 
  enrollmentLink, 
  coursePrice = 0,
  className = "", 
  children = "Enroll Now",
  selectedSubjects = [],
  disabled = false
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  
  // State for the form
  const [manualPhone, setManualPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { openLogin } = useLoginModal();
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleEnrollClick = async () => {
    setInlineError(null);
    if (isAuthenticated === false) {
      openLogin();
      return;
    }

    if (enrollmentLink) {
      window.open(enrollmentLink, '_blank');
      return;
    }

    try {
      setIsProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        openLogin();
        return;
      }

      // Fetch profile to see if we already have a phone number
      // We check for both phone AND dial_code to ensure complete data
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, dial_code' as any) // Cast as any to avoid type errors if dial_code missing in generated types
        .eq('id', user.id)
        .single();

      // Check if we have a valid phone set up (Local number + Country Code)
      if (profile?.phone && profile?.dial_code) {
        // Construct full number for payment gateway
        const fullPhone = `${profile.dial_code}${profile.phone}`;
        processPayment(fullPhone);
      } 
      // Fallback for legacy data: if only phone exists and it looks like a full number
      else if (profile?.phone && profile.phone.length >= 10) {
        // We assume it's a valid number, but maybe prompt user to be safe? 
        // For now, let's try to proceed if it looks international, otherwise show dialog
        if (profile.phone.startsWith('+')) {
            processPayment(profile.phone);
        } else {
            // If it's just 10 digits without code, we force update
            setIsProcessing(false);
            setManualPhone(profile.phone); // Pre-fill
            setShowPhoneDialog(true);
        }
      } else {
        setIsProcessing(false);
        setShowPhoneDialog(true);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      setIsProcessing(false);
      setShowPhoneDialog(true);
    }
  };

  const handlePhoneSubmit = async () => {
    setInlineError(null);

    if (!selectedCountry) {
      setInlineError("Please select a country code.");
      return;
    }

    // Validation
    const cleanPhone = manualPhone.replace(/\D/g, '');
    const requiredLength = selectedCountry.phone_length || 10; // Default to 10 if not specified
    
    if (cleanPhone.length !== requiredLength) {
      setInlineError(`Phone number must be exactly ${requiredLength} digits for ${selectedCountry.code}.`);
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Update profile with separate fields
        // Note: Casting to 'any' allows us to write to dial_code even if types.ts isn't updated yet
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            phone: cleanPhone,
            dial_code: selectedCountry.dial_code 
          } as any) 
          .eq('id', user.id);

        if (updateError) {
          console.error("Failed to update profile phone:", updateError);
          throw new Error("Failed to save contact details.");
        }
      }
      
      // Construct full international number for the payment processor
      const fullPhoneNumber = `${selectedCountry.dial_code}${cleanPhone}`;
      await processPayment(fullPhoneNumber);
      
      setShowPhoneDialog(false); 
    } catch (error: any) {
      setIsProcessing(false);
      setInlineError(error.message || "Something went wrong. Please try again.");
    }
  };

  const processPayment = async (fullPhoneNumber: string) => {
    setIsProcessing(true);
    setInlineError(null);

    try {
      if (!courseId) throw new Error("Course information is missing");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      console.log("Initiating Payment with phone:", fullPhoneNumber);

      const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
        body: {
          courseId,
          amount: coursePrice,
          userId: user.id,
          customerEmail: user.email, 
          customerPhone: fullPhoneNumber, // Sending the complete number
          selectedSubjects: selectedSubjects 
        },
      });

      if (error) {
        console.error("Supabase Invoke Error:", error);
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

      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => {
        const cashfreeMode = data.environment || 'sandbox'; 
        const cashfree = (window as any).Cashfree({ mode: cashfreeMode });
        
        cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          returnUrl: data.verifyUrl, 
        });
      };
      document.body.appendChild(script);

    } catch (error: any) {
      console.error("Enrollment error:", error);
      if (showPhoneDialog) {
        setInlineError(error.message);
      } else {
        toast({
          title: "Enrollment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
      setIsProcessing(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      <Button 
        onClick={handleEnrollClick}
        className={className}
        disabled={isProcessing || disabled}
      >
        {isProcessing && !showPhoneDialog ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          children
        )}
      </Button>

      {isMobile ? (
        <Drawer open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
          <DrawerContent>
            <VerificationContent 
              isDrawer={true} 
              manualPhone={manualPhone}
              setManualPhone={setManualPhone}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              inlineError={inlineError}
              setInlineError={setInlineError}
              handlePhoneSubmit={handlePhoneSubmit}
              isProcessing={isProcessing}
              onClose={() => setShowPhoneDialog(false)}
            />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
          <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-none w-auto [&>button]:hidden">
            <VerificationContent 
              isDrawer={false} 
              manualPhone={manualPhone}
              setManualPhone={setManualPhone}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              inlineError={inlineError}
              setInlineError={setInlineError}
              handlePhoneSubmit={handlePhoneSubmit}
              isProcessing={isProcessing}
              onClose={() => setShowPhoneDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EnrollButton;
