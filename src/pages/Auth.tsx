import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { X } from "lucide-react";
import NavBar from "@/components/NavBar";
import GoogleAuth from "@/components/auth/GoogleAuth";
import EmailAuth from "@/components/auth/EmailAuth";
import ProfileSetup from "@/components/profile/ProfileSetup";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('profile_completed')
            .eq('id', user.id)
            .single();

          if (profile?.profile_completed) {
            navigate('/');
          } else {
            setShowProfileSetup(true);
          }
        } catch (error) {
          console.error('Error checking profile:', error);
          setShowProfileSetup(true);
        }
      }
    };

    if (!authLoading) {
      checkProfileStatus();
    }
  }, [user, authLoading, navigate]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif]">Loading...</div>;

  if (showProfileSetup) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center bg-white p-4 pt-24 font-['Inter',sans-serif]">
          <ProfileSetup onComplete={() => navigate('/')} />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      {/* Background container */}
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4 pt-24 font-['Inter',sans-serif]">
        
        {/* THE MODAL CARD */}
        {/* Restored max-w-[420px] to ensure it doesn't look like generic modals, while keeping w-full for small screens */}
        <div className="bg-white w-full max-w-[420px] rounded-[28px] relative px-6 py-10 text-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] transition-all duration-300">
          
          {/* Illustration Area - Responsive dimensions */}
          <div className="mb-8 flex justify-center">
            <div className="w-36 h-36 bg-[#fef3c7] flex items-center justify-center [clip-path:polygon(100%_50%,95.11%_65.45%,80.9%_76.94%,65.45%_85.39%,50%_100%,34.55%_85.39%,19.1%_76.94%,4.89%_65.45%,0%_50%,4.89%_34.55%,19.1%_23.06%,34.55%_14.61%,50%_0%,65.45%_14.61%,80.9%_23.06%,95.11%_34.55%)] transform transition-transform duration-300 hover:scale-105">
              <div className="w-12 h-20 bg-white border-2 border-[#1a1a1a] rounded-lg relative flex items-center justify-center">
                <div className="absolute top-1.5 w-4 h-1 bg-[#1a1a1a] rounded-sm" />
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[9px] text-white font-bold">PW</div>
              </div>
            </div>
          </div>

          <h2 className="text-xl md:text-[21px] font-bold text-[#1a1a1a] text-left mb-6 leading-tight">
            Sign in to your account <br /> using Google
          </h2>

          <div className="space-y-4">
            <GoogleAuth isLoading={isLoading} setIsLoading={setIsLoading} />
            
            {/* OPTIONAL: Show Email Auth on request */}
            {!showEmailAuth ? (
              <button 
                onClick={() => setShowEmailAuth(true)}
                className="text-sm font-semibold text-[#1d4ed8] hover:underline transition-colors"
              >
                Continue with email instead?
              </button>
            ) : (
              <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <EmailAuth isSignUp={false} isLoading={isLoading} setIsLoading={setIsLoading} />
                <button 
                  onClick={() => setShowEmailAuth(false)}
                  className="mt-4 text-sm text-gray-500 hover:underline transition-colors"
                >
                  Back to Google login
                </button>
              </div>
            )}
          </div>

          {/* FOOTER TERMS */}
          <div className="mt-14 text-[13px] text-[#717171] leading-relaxed">
            By continuing you agree to our <br />
            <Link to="/terms" className="text-[#0284c7] font-semibold hover:underline">Terms of use</Link> & <Link to="/privacy" className="text-[#0284c7] font-semibold hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
