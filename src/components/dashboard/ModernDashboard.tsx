import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Loader2, ArrowLeft } from "lucide-react"; 
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

import FocusAreaModal from "./FocusAreaModal";
import DashboardTopNav from "./DashboardTopNav";
import DashboardSidebar, { ActiveView } from "./DashboardSidebar"; 
import { BouncingDots } from "@/components/ui/bouncing-dots";

import StudyPortal from "./StudyPortal";
import MyProfile from "./MyProfile";
import MyEnrollments from "./MyEnrollments";
import LibrarySection from "./LibrarySection"; 
import RegularBatchesTab from "./RegularBatchesTab";
import CourseDetail from "@/pages/CourseDetail";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ContentItem {
  id: string | number;
  title: string;
  category: string;
  url?: string | null;
}

const DashboardLoader = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] w-full animate-in fade-in duration-300">
    <BouncingDots className="bg-royal w-3 h-3" />
    <h3 className="mt-6 text-xl font-bold text-gray-900 tracking-tight">Preparing your dashboard...</h3>
  </div>
);

const ModernDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Intelligence: Control layout space
  
  const [activeView, setActiveView] = useState<ActiveView>("studyPortal");
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
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

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setProfile(data);
          if (!data.program_type) setIsFocusModalOpen(true);
        } else {
          setIsFocusModalOpen(true);
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, navigate, location]);

  const handleFocusSave = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    setIsFocusModalOpen(false);
  };

  const handleProfileUpdate = (updatedProfile: any) => setProfile(updatedProfile as Profile);

  const handleViewChange = (view: ActiveView) => {
    if (view === activeView) {
      setSelectedCourseId(null);
      return; 
    }
    setIsViewLoading(true);
    setSelectedCourseId(null);
    setActiveView(view);
    setTimeout(() => setIsViewLoading(false), 500);
  };

  const isLoading = authLoading || loadingProfile;

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
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
    <div className="flex flex-col h-screen w-full bg-gray-50/50 overflow-hidden font-sans">
      <div className="z-[100] w-full bg-white border-b border-gray-200 shrink-0">
        <DashboardTopNav
          onViewChange={handleViewChange} 
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
          activeView={activeView}
          isSidebarCollapsed={isSidebarCollapsed}
          setSidebarCollapsed={setIsSidebarCollapsed} // Passed for manual intelligence
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Dynamic Sidebar Width based on collapse state */}
        <aside className={`hidden lg:block border-r bg-white shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-[288px]'}`}>
          <div className="h-full">
            <DashboardSidebar
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
              onViewChange={handleViewChange} 
              activeView={activeView}
              isCollapsed={isSidebarCollapsed}
            />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50/50 relative custom-scrollbar scroll-smooth">
            {isViewLoading ? (
               <ContentWrapper><DashboardLoader /></ContentWrapper>
            ) : (
              <div className="animate-in fade-in duration-500 h-full flex flex-col">
                {activeView === 'studyPortal' && (
                  <ContentWrapper>
                    <StudyPortal profile={profile} onViewChange={handleViewChange} />
                  </ContentWrapper>
                )}
                
                {activeView === 'profile' && <ContentWrapper><MyProfile /></ContentWrapper>}

                {activeView === 'enrollments' && (
                  <div className="flex-1 relative h-full">
                    {!selectedCourseId ? (
                      <ContentWrapper>
                        <MyEnrollments onSelectCourse={setSelectedCourseId} />
                      </ContentWrapper>
                    ) : (
                      <div className="absolute inset-0 z-[80] bg-white animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="sticky top-0 z-[100] h-[73px] bg-white border-b px-6 flex items-center shadow-sm shrink-0">
                          <button onClick={() => setSelectedCourseId(null)} className="flex items-center gap-2 text-gray-700 hover:text-orange-600 font-bold transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            Back to My Enrollments
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          <CourseDetail customCourseId={selectedCourseId} isDashboardView={true} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeView === 'regularBatches' && (
                  <div className="flex-1 relative h-full">
                    <RegularBatchesTab 
                      focusArea={profile?.program_type || 'General'} 
                      onSelectCourse={setSelectedCourseId}
                    />

                    {selectedCourseId && (
                      <div className="absolute inset-0 z-[80] bg-white animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="sticky top-0 z-[100] h-[73px] bg-white border-b px-6 flex items-center shadow-sm shrink-0">
                          <button onClick={() => setSelectedCourseId(null)} className="flex items-center gap-2 text-gray-700 hover:text-orange-600 font-bold transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            Back to All Batches
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          <CourseDetail customCourseId={selectedCourseId} isDashboardView={true} />
                        </div>
                      </div>
                    )}
                  </div>
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
