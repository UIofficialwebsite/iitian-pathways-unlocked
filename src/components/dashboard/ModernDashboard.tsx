import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Loader2, Menu } from "lucide-react"; // Import Menu icon
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

import FocusAreaModal from "./FocusAreaModal";
import DashboardTopNav from "./DashboardTopNav";
import DashboardSidebar from "./DashboardSidebar"; // 1. IMPORT THE SIDEBAR
import { Button } from "@/components/ui/button"; // 2. IMPORT BUTTON
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // 3. IMPORT SHEET (for mobile menu)

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

  // --- 4. NEW LAYOUT: Full-width header, then Sidebar+Content ---
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50/50">
      
      {/* --- 5. FULL-WIDTH HEADER --- */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:h-16 sm:px-6">
        
        {/* --- 6. MOBILE MENU (SHEET) --- */}
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
            {/* The sidebar component is rendered inside the mobile sheet */}
            <DashboardSidebar
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
              onViewChange={setActiveView}
            />
          </SheetContent>
        </Sheet>

        {/* --- 7. TOP NAV (Profile, etc.) --- */}
        <div className="flex-1">
          {/* This component just holds the profile dropdown */}
          <DashboardTopNav
            onViewChange={setActiveView}
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>
      </header>

      {/* --- 8. MAIN AREA (Sidebar + Content) --- */}
      <div className="flex-1 grid lg:grid-cols-[288px_1fr]">
        
        {/* --- 9. DESKTOP SIDEBAR --- */}
        <aside className="hidden lg:block border-r bg-white">
          {/* The sidebar is rendered directly here for desktop */}
          <DashboardSidebar
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onViewChange={setActiveView}
          />
        </aside>

        {/* --- 10. SCROLLABLE CONTENT --- */}
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

      {/* --- 11. MODAL (Unchanged) --- */}
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
