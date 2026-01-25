import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface GoogleAuthProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: () => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ isLoading, setIsLoading, onSuccess }) => {
  const { toast } = useToast();

  const handleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) throw error;

      if (data.user) {
        toast({ title: "Login successful!", description: "Welcome back!" });
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize Google Identity Services
    const initializeGis = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "29616950088-p64jd8affh5s0q1c3eq48fgfn9mu28e2.apps.googleusercontent.com",
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Optional: Show One Tap prompt automatically
        window.google.accounts.id.prompt();
      }
    };

    // Load script if not already present
    if (!document.getElementById('google-client-script')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-client-script';
      script.async = true;
      script.defer = true;
      script.onload = initializeGis;
      document.head.appendChild(script);
    } else {
      initializeGis();
    }
  }, []);

  const handleGoogleClick = () => {
    // Explicitly trigger the Google Login popup
    window.google?.accounts.id.prompt();
  };

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleClick}
        disabled={isLoading}
        className="w-full max-w-[380px] h-[50px] gap-3"
      >
        {/* SVG Icon remains same */}
        <span className="text-gray-700 font-medium">
          {isLoading ? "Signing in..." : "Continue with Google"}
        </span>
      </Button>
    </div>
  );
};

export default GoogleAuth;
