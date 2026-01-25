import React, { useEffect, useState } from 'react';
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
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  // YOUR CLIENT ID
  const CLIENT_ID = "29616950088-p64jd8affh5s0q1c3eq48fgfn9mu28e2.apps.googleusercontent.com";

  useEffect(() => {
    const initClient = () => {
      if (window.google) {
        // We use the Token Client to get an Access Token (needed for user info)
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

    if (window.google) {
      initClient();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initClient();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchUserProfile = async (accessToken: string) => {
    setIsLoading(true);
    try {
      // Direct Fetch to Google API
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch user profile');
      
      const userData = await response.json();
      
      console.log("Fetched User Data:", userData); // Check console to see the data!

      // Save complete profile to storage
      localStorage.setItem('google_user', JSON.stringify(userData));
      localStorage.setItem('google_id_token', accessToken); 
      
      // Notify the app
      window.dispatchEvent(new Event('google-auth-change'));

      toast({
        title: "Login Successful",
        description: `Welcome, ${userData.name || 'User'}!`,
      });

      onSuccess();
    } catch (error) {
      console.error("Profile Fetch Error:", error);
      toast({
        title: "Login Failed",
        description: "Could not retrieve user details.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (!tokenClient) return;
    tokenClient.requestAccessToken();
  };

  return (
    <div className="w-full flex justify-center">
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleClick}
        disabled={isLoading || !isScriptLoaded}
        className="w-full max-w-[380px] h-[50px] gap-3 rounded-md shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        <span className="text-gray-700 font-medium">
          {isScriptLoaded ? "Continue with Google" : "Loading..."}
        </span>
      </Button>
    </div>
  );
};

export default GoogleAuth;
