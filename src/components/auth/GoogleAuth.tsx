import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            ux_mode?: string;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              type?: string;
              width?: number;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleAuthProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: () => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ isLoading, setIsLoading, onSuccess }) => {
  const { toast } = useToast();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  
  const CLIENT_ID = "593547840701-ateg91f10lon8m26g9mbj34lnfi5ne2s.apps.googleusercontent.com";

  const handleCredentialResponse = async (response: { credential: string }) => {
    setIsLoading(true);
    try {
      console.log("Google ID Token received, exchanging with Supabase...");
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) throw error;

      console.log("Supabase Login Successful:", data);
      
      if (data.session) {
        toast({
          title: "Welcome back!",
          description: `Signed in as ${data.user?.user_metadata?.full_name || 'User'}`,
        });
        onSuccess?.();
      }

    } catch (error: unknown) {
      console.error("Auth Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not verify Google credentials.";
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let initInterval: ReturnType<typeof setInterval> | null = null;

    const loadAndInitialize = () => {
      // Check if script already exists
      const existingScript = document.getElementById('google-gsi-script');
      
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.id = "google-gsi-script";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (isMounted) setIsGoogleLoaded(true);
        };
        script.onerror = () => {
          console.error("Failed to load Google Sign-In script");
        };
        document.head.appendChild(script);
      } else {
        // Script already loaded
        if (window.google?.accounts) {
          setIsGoogleLoaded(true);
        }
      }

      // Poll for Google object and initialize
      initInterval = setInterval(() => {
        if (window.google?.accounts?.id && googleBtnRef.current && isMounted) {
          setIsGoogleLoaded(true);
          
          try {
            window.google.accounts.id.initialize({
              client_id: CLIENT_ID,
              callback: handleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
              ux_mode: 'popup',
            });

            // Render the invisible Google button
            window.google.accounts.id.renderButton(
              googleBtnRef.current,
              { 
                theme: "outline", 
                size: "large", 
                type: "standard",
                width: googleBtnRef.current.clientWidth
              } 
            );
            
            console.log("✅ Google Sign-In button initialized successfully");
          } catch (err) {
            console.error("Google GSI Initialization Error:", err);
          }
          
          if (initInterval) clearInterval(initInterval);
        }
      }, 300);
    };

    loadAndInitialize();

    return () => {
      isMounted = false;
      if (initInterval) clearInterval(initInterval);
    };
  }, [CLIENT_ID]);

  return (
    <div className="w-full relative group flex justify-center">
      {/* Custom Design Button (Visible Layer) */}
      <Button 
        variant="outline" 
        type="button"
        className={cn(
          "w-full max-w-[380px] h-[50px] bg-white text-black border-gray-300 font-medium text-base relative z-10",
          "flex items-center justify-center gap-3 transition-all duration-200",
          "group-hover:bg-gray-50 group-hover:scale-[1.01]", 
          "rounded-xl shadow-sm pointer-events-none"
        )}
        disabled={isLoading}
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

      {/* Invisible Google Button Overlay (Click Target) */}
      <div 
        ref={googleBtnRef} 
        className={cn(
          "absolute inset-0 z-20 cursor-pointer overflow-hidden",
          "h-[50px] w-full max-w-[380px] mx-auto rounded-xl",
          isGoogleLoaded ? "opacity-[0.01]" : "opacity-0"
        )}
        style={{ height: '50px' }}
      />
      
      {/* Loading state indicator when Google SDK hasn't loaded */}
      {!isGoogleLoaded && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
            Loading Google...
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuth;
