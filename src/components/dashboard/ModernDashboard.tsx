import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { 
  BookOpen, 
  Download, 
  Calendar, 
  Clock,
  Newspaper,
  FileText,
  ExternalLink,
  Loader2 
} from "lucide-react";
import { Link } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopNav from "./DashboardTopNav"; 
import MyProfile from "./MyProfile"; 
import MyEnrollments from "./MyEnrollments"; 

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
  [key: string]: any; // Allow other properties
}

type ActiveView = 'dashboard' | 'profile' | 'enrollments';

const ModernDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getFilteredContent, contentLoading } = useBackend();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const filteredContent = getFilteredContent(profile);
  const { notes, pyqs, courses, importantDates, newsUpdates } = filteredContent;

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

  const renderDashboardView = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Notes Available</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{notes.length}</div>
            <p className="text-xs text-gray-500">Personalized for you</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">PYQs Available</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pyqs.length}</div>
            <p className="text-xs text-gray-500">Recent papers</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Courses</CardTitle>
            <Download className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
            <p className="text-xs text-gray-500">Available courses</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Updates</CardTitle>
            <Newspaper className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{newsUpdates.length}</div>
            <p className="text-xs text-gray-500">Latest news</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-1 gap-8 items-start">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                      <ExternalLink className="h-6 w-6 text-white" />
                  </div>
                  <div>
                      <CardTitle className="text-gray-900">SSP Portal</CardTitle>
                      <CardDescription className="text-gray-600">Student Support</CardDescription>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">Access the Dashboard and find your premium course access.</p>
              <a href="https://ssp.unknowniitians.live/" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
                  Go to SSP Portal
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Recent Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notes.slice(0, 2).map((note) => (
                <div key={note.id} className="flex items-center gap-3">
                  <div className="p-1 bg-blue-100 rounded">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 truncate">{note.title}</p>
                    <p className="text-xs text-gray-500">Note</p>
                  </div>
                </div>
              ))}
              {pyqs.slice(0, 2).map((pyq) => (
                <div key={pyq.id} className="flex items-center gap-3">
                  <div className="p-1 bg-green-100 rounded">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 truncate">{pyq.title}</p>
                    <p className="text-xs text-gray-500">PYQ</p>
                  </div>
                </div>
              ))}
              {newsUpdates.slice(0, 1).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="p-1 bg-purple-100 rounded">
                    <Newspaper className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">News</p>
                  </div>
                </div>
              ))}
              <Separator className="bg-gray-200" />
              <Link to="/exam-preparation">
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View All Resources
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        <Card className="hover:shadow-md transition-all duration-300 border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-gray-600 mr-2" />
                <CardTitle className="text-lg text-gray-900">Recent Notes</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {notes.length > 0 ? (
              <div className="space-y-3">
                {notes.slice(0, 3).map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-sm truncate text-gray-900">{note.title}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                <Link to="/exam-preparation">
                  <Button variant="outline" size="sm" className="w-full mt-3 hover:bg-gray-50">
                    View All Notes
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No notes available yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-600 mr-2" />
                <CardTitle className="text-lg text-gray-900">Recent PYQs</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pyqs.length > 0 ? (
              <div className="space-y-3">
                {pyqs.slice(0, 3).map((pyq) => (
                  <div key={pyq.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-sm truncate text-gray-900">{pyq.title}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(pyq.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                <Link to="/exam-preparation">
                  <Button variant="outline" size="sm" className="w-full mt-3 hover:bg-gray-50">
                    View All PYQs
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No PYQs available yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Newspaper className="h-5 w-5 text-gray-600 mr-2" />
                <CardTitle className="text-lg text-gray-900">Latest News</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {newsUpdates.length > 0 ? (
              <div className="space-y-3">
                {newsUpdates.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-sm truncate text-gray-900">{item.title}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-3 hover:bg-gray-50">
                  View All News
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No news updates yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {importantDates.length > 0 && (
        <Card className="mt-8 hover:shadow-md transition-all duration-300 border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-600 mr-2" />
                <CardTitle className="text-lg text-gray-900">Important Dates</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {importantDates.slice(0, 6).map((date) => (
                <div key={date.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <p className="font-medium text-sm truncate text-gray-900">{date.title}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(date.date_value || date.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );

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
          <DashboardSidebar profile={profile} onProfileUpdate={handleProfileUpdate} /> 
        </div>
      </div>

      {/* --- MAIN CONTENT AREA (WITH PADDING) --- */}
      <div className="lg:pl-72 pt-16">
        <main className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {activeView === 'dashboard' && renderDashboardView()}
            {activeView === 'profile' && <MyProfile />}
            {activeView === 'enrollments' && <MyEnrollments />}
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default ModernDashboard;
