import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { 
  User, 
  BookOpen, 
  Download, 
  Calendar, 
  Bell,
  Settings,
  Clock,
  Newspaper,
  FileText,
  ExternalLink
} from "lucide-react";
import ProfileEditModal from "./ProfileEditModal";
import { Link } from "react-router-dom";

interface UserProfile {
  program_type: string;
  branch?: string;
  level?: string;
  exam_type?: string;
  student_status?: string;
  subjects?: string[];
  student_name?: string;
}

const ModernDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getFilteredContent, contentLoading } = useBackend();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get filtered content based on profile
  const filteredContent = getFilteredContent(profile);
  const { notes, pyqs, courses, importantDates, newsUpdates } = filteredContent;

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
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

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const getWelcomeMessage = () => {
    const name = profile?.student_name ? `, ${profile.student_name}` : '';
    
    if (profile?.program_type === 'IITM_BS') {
      const branchName = profile.branch === 'data-science' ? 'Data Science' : 'Electronic Systems';
      return `Welcome to your IITM BS ${branchName} dashboard${name}`;
    } else if (profile?.program_type === 'COMPETITIVE_EXAM') {
      return `Welcome to your ${profile.exam_type} preparation dashboard${name}`;
    }
    return `Welcome to your personalized dashboard${name}`;
  };

  const getSubtitle = () => {
    if (profile?.program_type === 'IITM_BS') {
      return `${profile.level} level • Personalized content for your academic journey`;
    } else if (profile?.program_type === 'COMPETITIVE_EXAM') {
      return `${profile.student_status} • Tailored resources for exam success`;
    }
    return 'Your personalized learning hub';
  };

  if (loading || contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {getWelcomeMessage()}
            </h1>
            <p className="text-gray-600 mt-2">{getSubtitle()}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(true)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

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
          {/* Profile Overview and SSP Portal */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">Profile Overview</CardTitle>
                      <CardDescription className="text-gray-600">Your academic journey</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile ? (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Program Type</label>
                        <div className="mt-1">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                            {profile.program_type === 'IITM_BS' ? 'IITM BS Degree' : 'Competitive Exam'}
                          </Badge>
                        </div>
                      </div>
                      
                      {profile.program_type === 'IITM_BS' && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Branch</label>
                            <p className="mt-1 text-gray-900">
                              {profile.branch === 'data-science' ? 'Data Science and Applications' : 
                               profile.branch === 'electronic-systems' ? 'Electronic Systems' : 
                               profile.branch || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Level</label>
                            <p className="mt-1 text-gray-900 capitalize">{profile.level || 'Not specified'}</p>
                          </div>
                        </>
                      )}
                      
                      {profile.program_type === 'COMPETITIVE_EXAM' && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Exam Type</label>
                            <p className="mt-1 text-gray-900">{profile.exam_type || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Student Status</label>
                            <p className="mt-1 text-gray-900">{profile.student_status || 'Not specified'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Complete your profile to get personalized content</p>
                    <Button 
                      onClick={() => setIsEditModalOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Complete Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

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
                <p className="text-gray-600">Access the Student Support Portal for assistance and resources.</p>
                <a href="https://ssp.iitm.ac.in/" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
                    Go to SSP Portal
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
          {/* Recent Notes */}
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

          {/* Recent PYQs */}
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

          {/* Latest News */}
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

        {/* Important Dates */}
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
      </div>

      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default ModernDashboard;
