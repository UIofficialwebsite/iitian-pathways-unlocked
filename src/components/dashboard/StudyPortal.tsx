import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Book, Users, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '../../hooks/useAuth'; // Corrected path
import { supabase } from '../../integrations/supabase/client'; // Corrected path
import { useToast } from '../ui/use-toast'; // Corrected path
import { Tables } from '../../integrations/supabase/types'; // Corrected path
import { RecommendedBatchCard } from './RecommendedBatchCard'; // This file is now created

// --- Types ---
type UserProfile = Tables<'profiles'>;
type Course = Tables<'courses'>;

interface StudyPortalProps {
  profile: UserProfile | null;
  // This prop will allow the "Back" button to work with ModernDashboard
  onViewChange: (view: 'dashboard' | 'profile' | 'enrollments' | 'studyPortal') => void;
}

// --- Main Study Portal Component ---
const StudyPortal: React.FC<StudyPortalProps> = ({ profile, onViewChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // For this prompt, we are only building the "not enrolled" view.
  // The 'hasEnrollments' check is prepared for your next request.
  const [hasEnrollments, setHasEnrollments] = useState(false); 
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortalData = async () => {
      if (!user || !profile) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // 1. Check for enrollments (to decide which view to show)
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (enrollError) throw enrollError;
        setHasEnrollments((enrollments?.count || 0) > 0);

        // 2. Fetch Recommended Courses based on profile
        let query = supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false }) // Most recent
          .limit(3); // Max 3 batches

        // Apply simple filter based on profile
        if (profile.program_type === 'IITM_BS') {
          query = query.eq('exam_category', 'IITM BS');
          if (profile.branch) query = query.eq('branch', profile.branch);
          if (profile.level) query = query.eq('level', profile.level);
        } else if (profile.program_type === 'COMPETITIVE_EXAM') {
          query = query.eq('exam_category', 'COMPETITIVE_EXAM');
          if (profile.exam_type) query = query.eq('exam_type', profile.exam_type);
        }

        const { data: courses, error: courseError } = await query;
        if (courseError) throw courseError;
        setRecommendedCourses(courses || []);

      } catch (error: any) {
        toast({
          title: "Error",
          description: "Could not load your study portal. " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, [user, profile, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-royal" />
      </div>
    );
  }

  // --- This is the "NOT ENROLLED" View ---
  const NotEnrolledView = () => (
    <div className="space-y-10">
      
      {/* Section 1: Top Recommended Batches */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900">Top Recommended Batches</h2>
        <p className="text-gray-600 mt-1">Let's start with these popular courses</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {recommendedCourses.length > 0 ? (
            recommendedCourses.map((course) => (
              <RecommendedBatchCard key={course.id} course={course} />
            ))
          ) : (
            <p className="text-gray-500 col-span-3">No specific recommendations found. Check out all our courses!</p>
          )}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline" asChild className="px-8">
            <Link to="/courses">View All Batches</Link>
          </Button>
        </div>
      </section>

      {/* Section 2: Explore */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900">Explore</h2>
        <p className="text-gray-600 mt-1">Get Additional guidance with these exclusive features</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Block 1: Digital Library */}
          <Card className="bg-gray-50/50 hover:bg-gray-100 transition-colors border-gray-200">
            <CardContent className="p-6">
              <Book className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Digital Library</h3>
              <p className="text-gray-600 text-sm mt-1">Access all your free content here</p>
            </CardContent>
          </Card>
          
          {/* Block 2: Mentorship */}
          <Card className="bg-gray-50/50 hover:bg-gray-100 transition-colors border-gray-200">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Mentorship</h3>
              <p className="text-gray-600 text-sm mt-1">Get free Guidance about your career growth, upskilling and internships</p>
            </CardContent>
          </Card>
          
          {/* Block 3: Ask Doubts */}
          <Card className="bg-gray-50/50 hover:bg-gray-100 transition-colors border-gray-200">
            <CardContent className="p-6">
              <MessageSquare className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Ask Doubts</h3>
              <p className="text-gray-600 text-sm mt-1">Ask doubts in the class and get instantly answered</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );

  // --- This is the "ENROLLED" View (for your next prompt) ---
  const EnrolledView = () => (
    <div>
      <h2 className="text-2xl">Welcome Back! (Enrolled View)</h2>
      {/* We will build this view next */}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Nav */}
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onViewChange('dashboard')} // Goes back to the main dashboard
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 text-center flex-1">Study Portal</h1>
        <div className="w-10"></div> {/* Spacer to keep title centered */}
      </div>

      {/* Conditional Rendering */}
      {hasEnrollments ? <EnrolledView /> : <NotEnrolledView />}
    </div>
  );
};

export default StudyPortal;
