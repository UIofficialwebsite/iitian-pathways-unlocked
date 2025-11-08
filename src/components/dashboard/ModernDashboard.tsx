import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Loader2, Menu } from "lucide-react"; // Import Menu icon
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

import FocusAreaModal from "./FocusAreaModal";
import DashboardTopNav from "./DashboardTopNav";
import DashboardSidebar from "./DashboardSidebar"; // --- 1. IMPORT THE SIDEBAR
import { Button } from "@/components/ui/button"; // --- 2. IMPORT BUTTON
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // --- 3. IMPORT SHEET (for mobile menu)

// Import the views
import StudyPortal from "./StudyPortal";
import MyProfile from "./MyProfile";
import MyEnrollments from "./MyEnrollments";

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

  // --- 4. USE THE NEW 2-COLUMN GRID LAYOUT ---
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[288px_1fr]">
      
      {/* --- 5. DESKTOP SIDEBAR (Permanent & Fixed) --- */}
      <div className="hidden border-r bg-white lg:block">
        <div className="flex h-full max-h-screen flex-col">
          <DashboardSidebar
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onViewChange={setActiveView}
          />
        </div>
      </div>

      {/* --- 6. MAIN CONTENT AREA (Header + Content) --- */}
      <div className="flex flex-col">
        
        {/* --- TOP HEADER --- */}
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          
          {/* --- 7. MOBILE SIDEBAR (Sheet) --- */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 lg:hidden" // Show only on mobile
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <DashboardSidebar
                profile={profile}
                onProfileUpdate={handleProfileUpdate}
                onViewChange={setActiveView}
              />
            </SheetContent>
          </Sheet>

          {/* --- 8. TOP NAV (Profile Button, etc.) --- */}
          <div className="w-full flex-1">
            <DashboardTopNav
              onViewChange={setActiveView}
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
            />
          </div>
        </header>

        {/* --- 9. MAIN CONTENT (Conditional Views) --- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50/50">
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

      {/* --- FOCUS MODAL (Unchanged) --- */}
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
