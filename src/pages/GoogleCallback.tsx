import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
          
          // Check if profile is complete
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('profile_completed')
            .eq('id', user.id)
            .single();
          
          toast({
            title: "Login successful!",
            description: "Welcome back!",
          });
          
          // If profile is NOT complete, they must finish setup
          if (!profile || !profile.profile_completed) {
            navigate("/auth");
          } else {
            // RETRIEVE THE SAVED PATH
            const returnUrl = localStorage.getItem('auth_return_url');
            if (returnUrl) {
              localStorage.removeItem('auth_return_url');
              navigate(returnUrl);
            } else {
              // Fallback to home if no path was saved
              navigate("/");
            }
          }
        } else {
          throw new Error("No session found");
        }
      } catch (error: any) {
        console.error("Auth Callback Error:", error);
        toast({
          title: "Authentication failed",
          description: error.message || "An error occurred during authentication",
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
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-2xl font-semibold mb-2">Finishing sign-in...</h2>
        <p className="text-gray-600">Please wait a moment while we redirect you.</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
