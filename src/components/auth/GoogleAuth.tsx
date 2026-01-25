import React from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface GoogleAuthProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: () => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ isLoading, setIsLoading, onSuccess }) => {
  const { toast } = useToast();
  const location = useLocation();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    // ... (rest of your logic)
    
    try {
      if (!credentialResponse.credential) throw new Error("No Google credential received");

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });

      if (error) throw error;
      onSuccess?.();
      
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-2">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
            console.log('Login Failed');
            setIsLoading(false);
        }}
        theme="outline"
        size="large"
        width="350"
        text="continue_with"
        shape="pill"
      />
    </div>
  );
};

export default GoogleAuth;
