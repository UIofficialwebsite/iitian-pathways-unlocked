import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoogleAuthProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess: () => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ isLoading, setIsLoading, onSuccess }) => {
  const { toast } = useToast();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const CLIENT_ID = "29616950088-p64jd8affh5s0q1c3eq48fgfn9mu28e2.apps.googleusercontent.com";

  const handleCredentialResponse = (response: any) => {
    setIsLoading(true);
    try {
      // 1. Decode ID Token locally
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const userData = JSON.parse(jsonPayload);

      // 2. Save Data & Dispatch Event (This notifies useAuth immediately)
      localStorage.setItem('google_user', JSON.stringify(userData));
      localStorage.setItem('google_id_token', response.credential);
      window.dispatchEvent(new Event('google-auth-change'));

      toast({
        title: "Welcome back!",
        description: `Signed in as ${userData.name}`,
      });

      onSuccess();
    } catch (error) {
      console.error("Auth Error:", error);
      toast({
        title: "Authentication Failed",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Load the Google Script if missing
    const loadScript = () => {
      if (document.getElementById('google-client-script')) return;
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-client-script";
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGoogleLoaded(true);
      document.head.appendChild(script);
    };

    loadScript();

    // 2. Initialize the Button when script is ready
    const interval = setInterval(() => {
      // Check if window.google exists AND our ref is attached to the DOM
      if (window.google && googleBtnRef.current) {
        setIsGoogleLoaded(true);
        
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render invisible button over our custom UI
        window.google.accounts.id.renderButton(
          googleBtnRef.current,
          { theme: "outline", size: "large", type: "standard", width: "400" } 
        );
        
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full relative group flex justify-center">
        {/* CUSTOM DESIGN BUTTON (Visible) */}
        <Button 
            variant="outline" 
            type="button"
            className={cn(
              "w-full max-w-[380px] h-[50px] bg-white text-black border-gray-300 font-medium text-base relative z-10",
              "flex items-center justify-center gap-3 transition-all duration-200",
              "group-hover:bg-gray-50 group-hover:scale-[1.01]", 
              "rounded-xl shadow-sm"
            )}
            disabled={isLoading || !isGoogleLoaded}
        >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-gray-700">Continue with Google</span>
              </>
            )}
        </Button>

        {/* INVISIBLE OVERLAY (Click Target) */}
        {/* This div sits exactly on top of the button above. When user clicks, they click this. */}
        <div 
            ref={googleBtnRef} 
            className="absolute inset-0 z-20 opacity-0 cursor-pointer overflow-hidden h-[50px] w-full max-w-[380px] mx-auto rounded-xl"
        ></div>
    </div>
  );
};

export default GoogleAuth;
