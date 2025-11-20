import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react"; 
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

import FocusAreaModal from "./FocusAreaModal";
import DashboardTopNav from "./DashboardTopNav";
import DashboardSidebar, { ActiveView } from "./DashboardSidebar"; 

// Import the views
import StudyPortal from "./StudyPortal";
import MyProfile from "./MyProfile";
import MyEnrollments from "./MyEnrollments";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const ModernDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  
  const [activeView, setActiveView] = useState<ActiveView>("studyPortal");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }

    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          setProfile(data);
          if (!data.program_type) {
            setIsFocusModalOpen(true);
          }
        } else {
          setIsFocusModalOpen(true);
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Could not fetch your profile. " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, navigate, location, toast]);

  const handleFocusSave = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    setIsFocusModalOpen(false);
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile as Profile);
  };

  const isLoading = authLoading || loadingProfile;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-royal" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50/50">
      
      {/* --- TOP NAVIGATION --- */}
      {/* Removed duplicate Header/Sheet wrapper. DashboardTopNav handles sticky positioning and mobile menu */}
      <DashboardTopNav
        onViewChange={setActiveView}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
        activeView={activeView}
      />

      {/* --- MAIN AREA --- */}
      <div className="flex-1 grid lg:grid-cols-[288px_1fr]">
        
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="hidden lg:block border-r bg-white">
          <DashboardSidebar
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onViewChange={setActiveView}
            activeView={activeView}
          />
        </aside>

        {/* --- SCROLLABLE CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            {activeView === 'studyPortal' && (
              <StudyPortal profile={profile} onViewChange={setActiveView} />
            )}
            {activeView === 'profile' && (
              <MyProfile />
            )}
            {activeView === 'enrollments' && (
              <MyEnrollments />
            )}
          </div>
        </main>
      </div>

      <FocusAreaModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        profile={profile}
        onProfileUpdate={handleFocusSave}
      />
    </div>
  );
};

export default ModernDashboard;
