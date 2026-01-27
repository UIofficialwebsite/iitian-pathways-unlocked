import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Loader2, ArrowLeft } from "lucide-react"; 
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

import DashboardTopNav from "./DashboardTopNav";
import DashboardSidebar, { ActiveView } from "./DashboardSidebar"; 
import { BouncingDots } from "@/components/ui/bouncing-dots";

// Import the views
import StudyPortal from "./StudyPortal";
import MyProfile from "./MyProfile";
import MyEnrollments from "./MyEnrollments";
import LibrarySection from "./LibrarySection"; 
import RegularBatchesTab from "./RegularBatchesTab";
import FastTrackBatchesTab from "./FastTrackBatchesTab"; 
import HelpCentre from "./HelpCentre";
import CourseDetail from "@/pages/CourseDetail"; 
import EnrollmentReceiptView from "./EnrollmentReceiptView";

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
  
  const { tab } = useParams<{ tab?: string }>();
  
  const [activeView, setActiveView] = useState<ActiveView>((tab as ActiveView) || "studyPortal");
  const [isViewLoading, setIsViewLoading] = useState(false);
  
  // --- Detail View State ---
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string | null>(null);
  
  const [activeLibraryTab, setActiveLibraryTab] = useState<string>('PYQs (Previous Year Questions)');
  const [activeVideo, setActiveVideo] = useState<ContentItem | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleTitleLoad = useCallback((title: string) => {
    setSelectedCourseTitle(title);
  }, []);

  const handleCloseDetail = () => {
    setSelectedCourseId(null);
    setSelectedCourseTitle(null);
  };

  useEffect(() => {
    const targetView = (tab as ActiveView) || "studyPortal";
    if (targetView !== activeView) {
      setIsViewLoading(true);
      setActiveView(targetView);
      handleCloseDetail();
      
      const timer = setTimeout(() => {
        setIsViewLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [tab]); 

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
          // NEW REDIRECT LOGIC
          if (!data.program_type) {
             navigate('/focus-area');
          }
        } else {
          // If no profile exists, also send to focus area to init profile
          navigate('/focus-area');
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({ title: "Error", description: "Could not fetch profile.", variant: "destructive" });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, navigate, location, toast]);

  const handleProfileUpdate = (updatedProfile: any) => setProfile(updatedProfile as Profile);

  const handleViewChange = (view: ActiveView) => {
    if (view === activeView) {
      handleCloseDetail();
      return;
    }
    navigate(`/dashboard/${view}`);
  };

  const handleCourseClick = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const isLoading = authLoading || loadingProfile;

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-royal" />
      </div>
    );
  }

  // Wrapper for standard pages that need padding/centering
  const ContentWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {children}
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50/50 overflow-hidden font-sans">
      {/* GLOBAL TOP NAV */}
      <div className="z-30 w-full bg-white border-b border-gray-200 shadow-sm shrink-0">
        <DashboardTopNav
          onViewChange={handleViewChange} 
          profile={profile}
          onProfileUpdate={handleProfileUpdate}
          activeView={activeView}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside className="hidden lg:block w-[288px] border-r bg-white shrink-0">
          <div className="h-full">
            <DashboardSidebar
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
              onViewChange={handleViewChange} 
              activeView={activeView}
            />
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 relative custom-scrollbar scroll-smooth">
            {isViewLoading ? (
               <div className="h-full flex items-center justify-center"><DashboardLoader /></div>
            ) : (
              <div className="h-full flex flex-col">
                
                {/* --- COURSE DETAIL VIEW (Full Screen Mode) --- */}
                {selectedCourseId ? (
                  <div className="flex flex-col h-full bg-white animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Sticky Detail Header */}
                    <div className="sticky top-0 z-[10] h-[64px] bg-white border-b px-6 flex items-center gap-4 shrink-0 shadow-sm">
                      <button 
                        onClick={handleCloseDetail}
                        className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Back to List
                      </button>
                      <div className="h-6 w-px bg-gray-300 mx-2" />
                      <h2 className="text-lg font-semibold text-slate-800 truncate">
                        {selectedCourseTitle || 'Course Details'}
                      </h2>
                    </div>
                    
                    {/* Detail Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <CourseDetail 
                        customCourseId={selectedCourseId} 
                        isDashboardView={true}
                        onTitleLoad={handleTitleLoad}
                      />
                    </div>
                  </div>
                ) : (
                  /* --- STANDARD DASHBOARD VIEWS --- */
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full flex flex-col">
                    
                    {activeView === 'studyPortal' && (
                      <ContentWrapper>
                        <StudyPortal profile={profile} onViewChange={handleViewChange} />
                      </ContentWrapper>
                    )}
                    
                    {activeView === 'profile' && (
                      <ContentWrapper><MyProfile /></ContentWrapper>
                    )}

                    {/* @ts-ignore */}
                    {activeView === 'receipt' && (
                      <ContentWrapper>
                        <EnrollmentReceiptView />
                      </ContentWrapper>
                    )}

                    {activeView === 'contact' && (
                      <div className="h-full flex flex-col">
                        <HelpCentre />
                      </div>
                    )}

                    {activeView === 'enrollments' && (
                      <ContentWrapper>
                        <MyEnrollments onSelectCourse={handleCourseClick} />
                      </ContentWrapper>
                    )}

                    {/* Regular Batches - FULL WIDTH (No Wrapper) */}
                    {activeView === 'regularBatches' && (
                      <div className="flex-1 h-full overflow-hidden">
                        <RegularBatchesTab 
                          focusArea={profile?.program_type || 'General'} 
                          onSelectCourse={handleCourseClick} 
                        />
                      </div>
                    )}

                    {/* FastTrack Batches - FULL WIDTH (No Wrapper) */}
                    {activeView === 'fastTrackBatches' && (
                      <div className="flex-1 h-full overflow-hidden">
                        <FastTrackBatchesTab 
                          focusArea={profile?.program_type || 'General'} 
                          onSelectCourse={handleCourseClick}
                        />
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
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default ModernDashboard;
