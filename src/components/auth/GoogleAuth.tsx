import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface GoogleAuthProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: (userData: any) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ isLoading, setIsLoading, onSuccess }) => {
  const { toast } = useToast();
  const CLIENT_ID = "29616950088-p64jd8affh5s0q1c3eq48fgfn9mu28e2.apps.googleusercontent.com";

  const handleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    try {
      // Decode the JWT (ID Token) to get user info locally
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const userData = JSON.parse(jsonPayload);

      // Store the session locally (LocalStorage)
      localStorage.setItem('google_user', JSON.stringify(userData));
      localStorage.setItem('google_id_token', response.credential);

      toast({
        title: "Login Successful",
        description: `Welcome, ${userData.name}!`,
      });

      if (onSuccess) onSuccess(userData);
    } catch (error) {
      console.error("GIS Error:", error);
      toast({
        title: "Auth Error",
        description: "Failed to process Google login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initGis = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
        });

        // Optional: Render the standard Google button into a div
        window.google.accounts.id.renderButton(
          document.getElementById("googleBtn"),
          { theme: "outline", size: "large", width: 380 }
        );
      }
    };

    // Load GIS script if not present
    if (!document.getElementById('google-gis-script')) {
      const script = document.createElement('script');
      script.src = "https://accounts.google.com/gsi/client";
      script.id = "google-gis-script";
      script.async = true;
      script.defer = true;
      script.onload = initGis;
      document.head.appendChild(script);
    } else {
      initGis();
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      {/* This div will be replaced by the official Google button */}
      <div id="googleBtn" className="w-full max-w-[380px] flex justify-center"></div>
      
      {/* Fallback button if you want to trigger it manually */}
      {!isLoading && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.google?.accounts.id.prompt()}
          className="text-xs text-gray-500"
        >
          Can't see the button? Click here
        </Button>
      )}
    </div>
  );
};

export default GoogleAuth;
