import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLoginModal } from "@/context/LoginModalContext";

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

  .form-input::placeholder {
    color: #aaaaaa;
  }

  /* Modal Footer Buttons */
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

  .btn-secondary:hover {
    background: #f5f5f5;
  }

  .btn-primary {
    background: #000000;
    color: #ffffff;
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
  const [manualPhone, setManualPhone] = useState("");
  const { toast } = useToast();
  const { openLogin } = useLoginModal();

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
    if (isAuthenticated === false) {
      // Open the global login modal instead of redirecting
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();

      // FIX: Validate the phone number from the profile. 
      // If it's too short (e.g. "123"), ask for it again.
      if (profile?.phone && profile.phone.length >= 10) {
        processPayment(profile.phone);
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
    if (manualPhone.length < 10) {
      toast({ 
        title: "Invalid Phone", 
        description: "Please enter a valid 10-digit number", 
        variant: "destructive" 
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ phone: manualPhone })
          .eq('id', user.id);

        if (updateError) {
          console.error("Failed to update profile phone:", updateError);
        }
      }
      
      setShowPhoneDialog(false);
      await processPayment(manualPhone);
    } catch (error) {
      setIsProcessing(false);
      console.error(error);
    }
  };

  const processPayment = async (phoneNumber: string) => {
    setIsProcessing(true);
    try {
      if (!courseId) throw new Error("Course information is missing");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      console.log("Initiating Payment...");

      const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
        body: {
          courseId,
          amount: coursePrice,
          userId: user.id,
          customerEmail: user.email, 
          customerPhone: phoneNumber,
          selectedSubjects: selectedSubjects 
        },
      });

      // BETTER ERROR HANDLING
      if (error) {
        console.error("Supabase Invoke Error:", error);
        
        let errorMessage = "Payment initialization failed";
        try {
           // Try to read the JSON body if available
           const body = JSON.parse(error.message);
           errorMessage = body.error || errorMessage;
           if (body.details) console.error("Backend Details:", body.details);
        } catch (e) {
           // Fallback to raw message
           if (error.message) errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      // Handle "Soft Errors" where status was 200 but body contains error
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
      toast({
        title: "Enrollment Failed",
        description: error.message,
        variant: "destructive",
      });
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
              <button className="btn btn-primary" onClick={handlePhoneSubmit} disabled={isProcessing}>
                {isProcessing ? "Saving..." : "Continue to Enroll"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnrollButton;
