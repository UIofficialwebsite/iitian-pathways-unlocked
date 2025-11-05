import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

// --- THIS IS THE IMPORT FIX ---
// The import for FocusAreaModal now correctly uses curly braces {}
import { FocusAreaModal } from "./FocusAreaModal";
import DashboardTopNav from "./DashboardTopNav";

// Import the views
import StudyPortal from "./StudyPortal";
import MyProfile from "./MyProfile";
import MyEnrollments from "./MyEnrollments";

// Remove the <Tabs> imports - they were the cause of the white screen
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type DashboardView = "dashboard" | "profile" | "enrollments" | "studyPortal";

const ModernDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>("studyPortal");
  
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
          // Check if profile is incomplete (no program_type)
          if (!data.program_type) {
            setIsFocusModalOpen(true);
          }
        } else {
          // No profile exists, force user to create one
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

  const isLoading = authLoading || loadingProfile;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-royal" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      <DashboardTopNav
        activeView={activeView}
        onViewChange={setActiveView}
        profile={profile}
      />

      {/* --- THIS IS THE "WHITE SCREEN" FIX ---
        The <Tabs> and <TabsContent> wrappers were removed.
        We now use simple conditional rendering based on the 'activeView' state.
      */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          {activeView === 'studyPortal' && (
            <StudyPortal profile={profile} onViewChange={setActiveView} />
          )}
          {activeView === 'profile' && (
            <MyProfile profile={profile} setProfile={setProfile} />
          )}
          {activeView === 'enrollments' && (
            <MyEnrollments />
          )}
        </div>
      </main>

      <FocusAreaModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)} // Allow closing if they want to browse anyway
        onSave={handleFocusSave}
        currentProfile={profile}
        userId={user?.id}
      />
    </div>
  );
};

export default ModernDashboard;
