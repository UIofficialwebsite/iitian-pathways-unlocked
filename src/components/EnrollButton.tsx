import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EnrollButtonProps {
  courseId?: string;
  enrollmentLink?: string;
  coursePrice?: number;
  className?: string;
  children?: React.ReactNode;
}

const EnrollButton: React.FC<EnrollButtonProps> = ({ 
  courseId, 
  enrollmentLink, 
  coursePrice = 0,
  className = "", 
  children = "Enroll Now" 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [manualPhone, setManualPhone] = useState("");
  const { toast } = useToast();

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
    // 1. Check Auth
    if (isAuthenticated === false) {
      localStorage.setItem('authRedirectUrl', window.location.pathname);
      window.location.href = '/auth';
      return;
    }

    if (enrollmentLink) {
      window.open(enrollmentLink, '_blank');
      return;
    }

    if (!courseId) {
      toast({
        title: "Error",
        description: "Course information is missing",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // 2. Check if we have a phone number in 'profiles' table or 'auth'
      // We check the profiles table specifically as requested
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single();

      const existingPhone = profile?.phone || user.phone;

      if (existingPhone) {
        // If number exists, proceed directly
        await processPayment(existingPhone, user.id, user.email);
      } else {
        // If not, show dialog to ask for it
        setIsProcessing(false); // Pause processing to show dialog
        setShowPhoneDialog(true);
      }
    } catch (error: any) {
      console.error("Pre-check error:", error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Could not verify user details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const processPayment = async (phoneNumber: string, userId: string, userEmail?: string) => {
    // Ensure processing state is true (in case called from dialog)
    setIsProcessing(true);
    
    try {
        console.log("Processing payment with phone:", phoneNumber);

        // 3. Invoke Edge Function
        const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
            body: {
            courseId,
            amount: coursePrice,
            userId: userId,
            customerEmail: userEmail, 
            customerPhone: phoneNumber, 
            },
        });

        if (error) {
            let errorMessage = "Payment initialization failed";
            try {
                const body = JSON.parse(error.message);
                errorMessage = body.error || errorMessage;
            } catch (e) { /* ignore parse error */ }
            throw new Error(errorMessage);
        }

        if (!data || !data.payment_session_id) {
            throw new Error("Invalid response from payment server");
        }

        // 4. Initialize Cashfree SDK
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => {
            const cashfreeMode = data.environment || 'sandbox'; 
            const cashfree = (window as any).Cashfree({ mode: cashfreeMode });
            cashfree.checkout({
            paymentSessionId: data.payment_session_id, 
            returnUrl: `${window.location.origin}/dashboard`,
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

  const handleManualPhoneSubmit = async () => {
    if (manualPhone.length < 10) {
        toast({ title: "Invalid Phone", description: "Please enter a valid 10-digit number", variant: "destructive" });
        return;
    }

    setIsProcessing(true);
    setShowPhoneDialog(false);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User session expired");

        // CRITICAL: Save the number to the profile table as requested
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ phone: manualPhone })
            .eq('id', user.id);

        if (updateError) {
            console.error("Error saving phone to profile:", updateError);
            // We continue anyway so the user can still buy the course, 
            // but you could verify this if strictness is required.
        }

        // Proceed with payment using the manual number
        await processPayment(manualPhone, user.id, user.email);

    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Failed to update profile",
            variant: "destructive"
        });
        setIsProcessing(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleEnrollClick}
        className={className}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          children
        )}
      </Button>

      {/* Dialog to ask for Phone Number if missing */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact Details Required</DialogTitle>
            <DialogDescription>
              We need your phone number to generate the payment receipt and secure your enrollment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="phone" className="">Phone Number</Label>
              <Input
                id="phone"
                placeholder="e.g., 9876543210"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                type="tel"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhoneDialog(false)}>Cancel</Button>
            <Button onClick={handleManualPhoneSubmit}>
              Continue to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnrollButton;
