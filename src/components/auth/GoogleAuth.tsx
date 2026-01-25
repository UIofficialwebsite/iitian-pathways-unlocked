import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from "lucide-react";

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
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const userData = JSON.parse(jsonPayload);

      // 1. Save Data
      localStorage.setItem('google_user', JSON.stringify(userData));
      localStorage.setItem('google_id_token', response.credential);

      // 2. DISPATCH EVENT (Crucial Step)
      // This tells useAuth to re-read localStorage immediately
      window.dispatchEvent(new Event('google-auth-change'));

      toast({
        title: "Welcome back!",
        description: `Signed in as ${userData.name}`,
      });

      // 3. Trigger Navigation
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
    // (Keep your existing script loading logic here...)
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

    const interval = setInterval(() => {
      if (window.google && googleBtnRef.current) {
        setIsGoogleLoaded(true);
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
        });
        window.google.accounts.id.renderButton(
          googleBtnRef.current,
          { theme: "outline", size: "large", type: "standard" } 
        );
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full relative group flex justify-center">
        {/* Custom Button UI */}
        <Button
            type="button"
            variant="outline"
            disabled={isLoading || !isGoogleLoaded}
            className="w-full max-w-[380px] h-[50px] gap-3 relative z-10"
        >
             {/* ... SVG Icon ... */}
            <span>{isGoogleLoaded ? "Continue with Google" : "Loading..."}</span>
        </Button>

        {/* Invisible Click Target */}
        <div ref={googleBtnRef} className="absolute inset-0 z-20 opacity-0 cursor-pointer w-full max-w-[380px] mx-auto h-[50px]" />
    </div>
  );
};

export default GoogleAuth;
