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
import { BouncingDots } from "@/components/ui/bouncing-dots";

// Import the views
import StudyPortal from "./StudyPortal";
import MyProfile from "./MyProfile";
import MyEnrollments from "./MyEnrollments";
import LibrarySection from "./LibrarySection"; 
import RegularBatchesTab from "./RegularBatchesTab"; // 1. Imported the new component

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ContentItem {
  id: string | number;
  title: string;
  category: string;
  url?: string | null;
}

const DashboardLoader = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] w-full font-sans animate-in fade-in zoom-in-95 duration-300">
    <BouncingDots className="bg-royal w-3 h-3" />
    <h3 className="mt-6 text-xl font-bold text-gray-900 text-center tracking-tight px-4">
      Hang tight, we are preparing the best contents for you
    </h3>
    <p className="mt-2 text-base text-gray-500 font-medium text-center">
      Just wait and love the moment
    </p>
  </div>
);

const ModernDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  
  const [activeView, setActiveView] = useState<ActiveView>("studyPortal");
  const [isViewLoading, setIsViewLoading] = useState(false);
  
  const [activeLibraryTab, setActiveLibraryTab] = useState<string>('PYQs (Previous Year Questions)');
  const [activeVideo, setActiveVideo] = useState<ContentItem | null>(null);
  
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

  const handleViewChange = (view: ActiveView) => {
    if (view === activeView) return; 
    
    if (view === 'coming_soon') {
      setActiveView(view);
      return;
    }

    setIsViewLoading(true);
    setActiveView(view);

    setTimeout(() => {
      setIsViewLoading(false);
    }, 800);
  };

  const isLoading = authLoading || loadingProfile;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-royal" />
      </div>
    );
  }

  const ContentWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {children}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50/50">
      <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <DashboardTopNav
          onViewChange={handleViewChange} 
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
          activeView={activeView}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:block w-[288px] border-r bg-white overflow-y-auto">
          <div className="min-h-full">
            <DashboardSidebar
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
              onViewChange={handleViewChange} 
              activeView={activeView}
            />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50/50">
            {activeView === 'coming_soon' ? (
              <ContentWrapper>
                <DashboardLoader />
              </ContentWrapper>
            ) : 
            isViewLoading ? (
               <ContentWrapper>
                 <DashboardLoader />
               </ContentWrapper>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
                {activeView === 'studyPortal' && (
                  <ContentWrapper>
                    <StudyPortal profile={profile} onViewChange={handleViewChange} />
                  </ContentWrapper>
                )}
                
                {activeView === 'profile' && (
                  <ContentWrapper>
                    <MyProfile />
                  </ContentWrapper>
                )}

                {activeView === 'enrollments' && (
                  <ContentWrapper>
                    <MyEnrollments />
                  </ContentWrapper>
                )}

                {/* 2. Added rendering for Regular Batches */}
                {activeView === 'regularBatches' && (
                   <ContentWrapper>
                     <RegularBatchesTab focusArea={profile?.program_type || 'General'} />
                   </ContentWrapper>
                )}

                {activeView === 'library' && (
                   <LibrarySection 
                    profile={profile} 
                    activeTab={activeLibraryTab} 
                    onTabChange={setActiveLibraryTab}
                    persistedVideo={activeVideo}
                    onVideoChange={setActiveVideo}
                   /> 
                )}
              </div>
            )}
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
