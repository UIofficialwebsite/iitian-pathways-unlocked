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
    
    // Logic to remember return URL
    let returnTo = window.location.pathname + window.location.search;
    if (['/auth', '/student-login', '/admin-login'].includes(window.location.pathname)) {
        returnTo = location.state?.from?.pathname 
          ? location.state.from.pathname + (location.state.from.search || '')
          : '/';
    }
    localStorage.setItem('auth_return_url', returnTo);

    try {
      if (!credentialResponse.credential) throw new Error("No Google credential received");

      // Sign in to Supabase using the Google ID token
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
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
            toast({ title: "Login Failed", variant: "destructive" });
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
