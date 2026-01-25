import React, { useEffect, useState } from 'react';
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
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  const CLIENT_ID = "30618354424-bvvml6gfui5fmtnn6fdh6nbf51fb3tcr.apps.googleusercontent.com";

  // 1. Initialize the Google Token Client
  useEffect(() => {
    const initClient = () => {
      if (window.google) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              await fetchUserProfile(tokenResponse.access_token);
            }
          },
        });
        setTokenClient(client);
        setIsScriptLoaded(true);
      }
    };

    // Check if script is already loaded
    if (window.google) {
      initClient();
    } else {
      // Add a listener or interval to wait for the script from index.html
      const interval = setInterval(() => {
        if (window.google) {
          initClient();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  // 2. Fetch User Profile using the Access Token
  const fetchUserProfile = async (accessToken: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch user profile');
      
      const userData = await response.json();
      
      // 3. Save to Local Storage & Dispatch Event
      localStorage.setItem('google_user', JSON.stringify(userData));
      // We store the access token as the "id_token" for simplicity in useAuth
      localStorage.setItem('google_id_token', accessToken); 
      
      window.dispatchEvent(new Event('google-auth-change'));

      toast({
        title: "Welcome back!",
        description: `Signed in as ${userData.name}`,
      });

      onSuccess();
    } catch (error) {
      console.error("Profile Fetch Error:", error);
      toast({
        title: "Login Failed",
        description: "Could not retrieve user information.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // 4. Handle Button Click
  const handleGoogleClick = () => {
    if (!tokenClient) {
      toast({ title: "Please wait", description: "Google services are still loading..." });
      return;
    }
    // Programmatically open the popup
    tokenClient.requestAccessToken();
  };

  return (
    <div className="w-full flex justify-center">
        <Button 
            variant="outline" 
            type="button"
            onClick={handleGoogleClick}
            className={cn(
              "w-full max-w-[380px] h-[50px] bg-white text-black border-gray-300 font-medium text-base",
              "flex items-center justify-center gap-3 transition-all duration-200",
              "hover:bg-gray-50 hover:scale-[1.01]", 
              "rounded-xl shadow-sm"
            )}
            disabled={isLoading || !isScriptLoaded}
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
                <span className="text-gray-700">{isScriptLoaded ? "Continue with Google" : "Loading..."}</span>
              </>
            )}
        </Button>
    </div>
  );
};

export default GoogleAuth;
