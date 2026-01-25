import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GoogleAuthProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: () => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ isLoading, setIsLoading, onSuccess }) => {
  const { toast } = useToast();
  // Your Client ID
  const CLIENT_ID = "29616950088-p64jd8affh5s0q1c3eq48fgfn9mu28e2.apps.googleusercontent.com";

  const handleCredentialResponse = (response: any) => {
    setIsLoading(true);
    try {
      // 1. Decode JWT locally
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const userData = JSON.parse(jsonPayload);

      // 2. Save to Local Storage
      localStorage.setItem('google_user', JSON.stringify(userData));
      localStorage.setItem('google_id_token', response.credential);

      toast({
        title: "Login Successful",
        description: `Welcome, ${userData.name}!`,
      });

      // 3. Navigate/Reload
      if (onSuccess) {
         onSuccess();
      } else {
         // Force reload to ensure useAuth picks up the new storage
         window.location.href = '/dashboard'; 
      }

    } catch (error) {
      console.error("GIS Login Error:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initGis = () => {
      if (window.google) {
        // Initialize with your Client ID
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: true, // Attempt to auto-select if one account exists
          cancel_on_tap_outside: false, // Keep the prompt open
        });
        
        // Render the Button
        const btnContainer = document.getElementById("googleBtnWrapper");
        if (btnContainer) {
            window.google.accounts.id.renderButton(
              btnContainer,
              { theme: "outline", size: "large", width: "100%" } // Responsive width
            );
        }

        // --- THE "ASK THEM" LOGIC ---
        // If we are mounting this component, it means the user is likely not logged in.
        // We trigger the One Tap prompt to "ask" them to sign in.
        window.google.accounts.id.prompt((notification: any) => {
           if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
               console.log("One Tap skipped or not displayed");
           }
        });
      }
    };

    // Load Script if missing
    if (!window.google) {
        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGis;
        document.head.appendChild(script);
    } else {
        initGis();
    }
  }, []);

  return (
    <div className="w-full flex justify-center py-2">
      <div id="googleBtnWrapper" className="w-full max-w-[380px] min-h-[40px]"></div>
    </div>
  );
};

export default GoogleAuth;
