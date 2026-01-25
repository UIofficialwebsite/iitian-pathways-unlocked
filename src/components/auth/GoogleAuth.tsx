import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Button } from '@/components/ui/button';

interface GoogleAuthProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: () => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ isLoading, setIsLoading, onSuccess }) => {
  const { toast } = useToast();
  const [showFallback, setShowFallback] = React.useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    
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

  const handleGoogleError = () => {
    console.log('Google Login Failed - showing fallback');
    setShowFallback(true);
    setIsLoading(false);
  };

  // Fallback: Use Supabase OAuth redirect flow
  const handleFallbackGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google OAuth Error:", error);
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Show fallback button after a timeout if GoogleLogin doesn't render
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 3000); // Show fallback after 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      {/* Google OAuth Button */}
      <div className="w-full max-w-[350px]">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          width="350"
          text="continue_with"
          shape="pill"
        />
      </div>
      
      {/* Fallback Button - shows if GoogleLogin doesn't render */}
      {showFallback && (
        <Button
          type="button"
          variant="outline"
          onClick={handleFallbackGoogleLogin}
          disabled={isLoading}
          className="w-full max-w-[350px] h-11 rounded-full border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-gray-700 font-medium">
            {isLoading ? "Signing in..." : "Continue with Google"}
          </span>
        </Button>
      )}
    </div>
  );
};

export default GoogleAuth;
