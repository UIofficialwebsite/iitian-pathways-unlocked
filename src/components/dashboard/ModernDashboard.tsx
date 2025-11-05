import React, { useState, useEffect } from 'react';
// Card components are no longer needed for the main dashboard view
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Button, Separator, and some icons are no longer needed for the main dashboard view
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { 
  // BookOpen, 
  // Download, 
  // Calendar, 
  // Clock,
  // Newspaper,
  // FileText,
  // ExternalLink,
  Loader2 
} from "lucide-react";
// Link is no longer needed for the main dashboard view
// import { Link } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopNav from "./DashboardTopNav"; 
import MyProfile from "./MyProfile"; 
import MyEnrollments from "./MyEnrollments"; 
import StudyPortal from "./StudyPortal"; // Import StudyPortal

interface UserProfile {
  id: string;
  program_type: string | null;
  branch?: string | null;
  level?: string | null;
  exam_type?: string | null;
  student_status?: string | null;
  subjects?: string[] | null;
  student_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  gender?: string | null; // Added gender
  [key: string]: any; // Allow other properties
}

// Keep 'dashboard' in the type for compatibility with other components
// that might link back to it (e.g., StudyPortal's back button)
type ActiveView = 'dashboard' | 'profile' | 'enrollments' | 'studyPortal';

const ModernDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  // contentLoading is still needed for the initial load check
  const { contentLoading } = useBackend(); 
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // --- CHANGE 1: Set default view to 'studyPortal' ---
  const [activeView, setActiveView] = useState<ActiveView>('studyPortal');

  // getFilteredContent and other variables are no longer needed here
  // as they were only used by renderDashboardView
  // const filteredContent = getFilteredContent(profile);
  // const { notes, pyqs, courses, importantDates, newsUpdates } = filteredContent;

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data as UserProfile);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Callback function to update profile in this component's state
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (loading || contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-royal" />
      </div>
    );
  }

  // --- CHANGE 2: The entire 'renderDashboardView' function is removed ---
  // const renderDashboardView = () => ( ... );

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* --- TOP NAV (FIXED, FULL-WIDTH) --- */}
      <DashboardTopNav 
        profile={profile} 
        onViewChange={setActiveView} 
        onProfileUpdate={handleProfileUpdate} // Pass updater
      />

      {/* --- DESKTOP SIDEBAR (FIXED, BELOW TOPNAV) --- */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:z-30">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200">
          <DashboardSidebar 
            profile={profile} 
            onProfileUpdate={handleProfileUpdate} 
            onViewChange={setActiveView} 
          /> 
        </div>
      </div>

      {/* --- MAIN CONTENT AREA (WITH PADDING) --- */}
      <div className="lg:pl-72 pt-16">
        <main className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* --- CHANGE 3: Update rendering logic --- */}
            {/* Show StudyPortal for both 'dashboard' and 'studyPortal' active views */}
            {(activeView === 'dashboard' || activeView === 'studyPortal') && (
              <StudyPortal profile={profile} onViewChange={setActiveView} />
            )}
            
            {activeView === 'profile' && <MyProfile />}
            {activeView === 'enrollments' && <MyEnrollments />}
            
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default ModernDashboard;
