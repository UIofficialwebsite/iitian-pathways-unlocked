{
type: uploaded file
fileName: uiofficialwebsite/iitian-pathways-unlocked/iitian-pathways-unlocked-bf18dfe665ff9f6a72e00589442090bef6b23448/src/components/auth/GoogleAuth.tsx
fullContent:
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface GoogleAuthProps {
  isSignUp?: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: () => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ isLoading, setIsLoading, onSuccess }) => {
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    // Store the current path to redirect back after login
    const currentPath = window.location.pathname + window.location.search;
    sessionStorage.setItem('loginRedirectUrl', currentPath);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirect to the callback route with the 'next' param
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`,
        },
      });
      if (error) throw error;
      // If onSuccess is provided, call it (for non-redirect flows)
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <button 
      type="button" 
      className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-[#e2e8f0] rounded-xl cursor-pointer hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
      onClick={handleGoogleAuth}
      disabled={isLoading}
    >
      <svg className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      <span className="text-[16px] font-semibold text-[#3c4043] font-['Inter',sans-serif]">
        Continue with Google
      </span>
    </button>
  );
};

export default GoogleAuth;

}

{
type: uploaded file
fileName: uiofficialwebsite/iitian-pathways-unlocked/iitian-pathways-unlocked-bf18dfe665ff9f6a72e00589442090bef6b23448/src/pages/GoogleCallback.tsx
fullContent:

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const GoogleCallback = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data?.session?.user) {
          const user = data.session.user;
          
          // Check if profile is complete
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('profile_completed')
              .eq('id', user.id)
              .single();
            
            toast({
              title: "Login successful!",
              description: "Welcome!",
            });
            
            if (!profile || !profile.profile_completed) {
              navigate("/auth");
            } else {
              // Retrieve the redirect URL from query params or session storage
              const params = new URLSearchParams(window.location.search);
              const nextParam = params.get('next');
              const storageRedirect = sessionStorage.getItem('loginRedirectUrl');
              
              // Clear storage
              sessionStorage.removeItem('loginRedirectUrl');

              if (nextParam) {
                 navigate(decodeURIComponent(nextParam));
              } else if (storageRedirect) {
                 navigate(storageRedirect);
              } else {
                 navigate("/");
              }
            }
          } catch (error) {
            console.error("Error checking profile:", error);
            navigate("/auth");
          }
        } else {
          // If no session immediately, wait a bit or handle implicit flow processing by Supabase
          // Sometimes getSession() is too fast if the URL hash hasn't been processed.
          // However, standard flow usually has session ready or Supabase client handles it.
          // If this fails often, we might need supabase.auth.onAuthStateChange here.
        }
      } catch (error: any) {
        toast({
          title: "Authentication failed",
          description: error.message || "An error occurred during authentication",
          variant: "destructive",
        });
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };

    handleGoogleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we complete your sign-in</p>
      </div>
    </div>
  );
};

export default GoogleCallback;

}

{
type: uploaded file
fileName: uiofficialwebsite/iitian-pathways-unlocked/iitian-pathways-unlocked-bf18dfe665ff9f6a72e00589442090bef6b23448/src/components/auth/EmailAuth.tsx
fullContent:
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface EmailAuthProps {
  isSignUp: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const EmailAuth: React.FC<EmailAuthProps> = ({ isSignUp, isLoading, setIsLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Prepare redirect URL with next parameter
    const currentPath = window.location.pathname + window.location.search;
    const emailRedirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`;

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: emailRedirectUrl,
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full bg-royal hover:bg-royal-dark"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign in / Register"}
      </Button>
    </form>
  );
};

export default EmailAuth;

}
