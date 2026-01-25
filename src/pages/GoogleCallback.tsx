import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GoogleCallback = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data?.session?.user) {
          const user = data.session.user;
          
          // Check if profile is complete (Optional check from your original code)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('profile_completed')
            .eq('id', user.id)
            .single();
          
          toast({
            title: "Login successful!",
            description: "Welcome back!",
          });
          
          if (!profile || !profile.profile_completed) {
            // New users go to auth setup
            navigate("/auth");
          } else {
            // --- RETURN URL LOGIC ---
            // Retrieve the path we saved before login started
            const returnUrl = localStorage.getItem('auth_return_url');
            
            if (returnUrl) {
              // Clear it so it doesn't persist forever
              localStorage.removeItem('auth_return_url');
              // Navigate back to where they were (e.g., /courses/123)
              navigate(returnUrl);
            } else {
              // Default fallback
              navigate("/");
            }
          }
        } else {
          // If no session, wait briefly then redirect (helps with race conditions)
           setTimeout(() => {
              navigate("/auth");
           }, 2000);
        }
      } catch (error: any) {
        console.error("Auth Callback Error:", error);
        toast({
          title: "Authentication failed",
          description: "Could not complete sign-in process.",
          variant: "destructive",
        });
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    handleGoogleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col items-center max-w-sm w-full bg-white p-8 rounded-lg shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Finalizing Sign-in...</h2>
        <p className="text-sm text-gray-500 text-center">
          We are redirecting you back to your previous page.
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
