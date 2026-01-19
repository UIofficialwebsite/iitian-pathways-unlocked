import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import ProfileSetup from "@/components/profile/ProfileSetup";
import LoginCard from "@/components/auth/LoginCard"; // Import the new component
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  // Check if user is logged in
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
            navigate(from, { replace: true });
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
  }, [user, authLoading, navigate, from]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif]">Loading...</div>;

  if (showProfileSetup) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center bg-white p-4 pt-24 font-['Inter',sans-serif]">
          <ProfileSetup onComplete={() => navigate(from, { replace: true })} />
        </div>
      </>
    );
  }

  // RENDER THE LOGIN CARD COMPONENT
  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4 pt-24 font-['Inter',sans-serif]">
        <LoginCard />
      </div>
    </>
  );
};

export default Auth;
