
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

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

  const handleEnroll = async () => {
    if (isAuthenticated === false) {
      localStorage.setItem('authRedirectUrl', window.location.pathname);
      window.location.href = '/auth';
      return;
    }

    if (isProcessing) return;

    // If external enrollment link exists, use it
    if (enrollmentLink) {
      window.open(enrollmentLink, '_blank');
      return;
    }

    // Otherwise, use Cashfree payment integration
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
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create Cashfree order
      const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
        body: {
          courseId,
          amount: coursePrice,
          userId: user.id,
        },
      });

      if (error) throw error;

      // Load Cashfree SDK and initiate payment
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => {
        const cashfree = (window as any).Cashfree({
          mode: 'sandbox', // Change to 'production' for live
        });

        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          returnUrl: `${window.location.origin}/dashboard`,
        });
      };
      document.body.appendChild(script);

    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast({
        title: "Enrollment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handleEnroll}
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
  );
};

export default EnrollButton;
