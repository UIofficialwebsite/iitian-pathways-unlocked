// src/components/dashboard/MyEnrollments.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutGrid, ArrowRight } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types'; // Import types

type Course = Tables<'courses'>;
type Enrollment = Tables<'enrollments'>;
type EnrolledCourse = Course & { enrollment_status: string };

const MyEnrollments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;
      try {
        // 1. Fetch user's enrollments
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id);
        
        if (enrollError) throw enrollError;
        if (!enrollments || enrollments.length === 0) {
          setCourses([]);
          return;
        }

        // 2. Get the list of course IDs
        const courseIds = enrollments.map((e: Enrollment) => e.course_id);

        // 3. Fetch the details for those courses
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);

        if (courseError) throw courseError;

        // 4. Map enrollments to course data
        const enrolledCourses = courseData.map((course: Course) => {
          const enrollment = enrollments.find((e: Enrollment) => e.course_id === course.id);
          return {
            ...course,
            enrollment_status: enrollment?.status || 'enrolled',
          };
        });

        setCourses(enrolledCourses);
        
      } catch (error: any) {
        toast({ title: "Error", description: "Could not fetch enrollments.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-royal" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <LayoutGrid className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Enrollments</h1>
          <p className="text-gray-600">Access your current and past courses.</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            You are not enrolled in any courses yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden">
              <img 
                src={course.image_url || '/lovable-uploads/logo_ui_new.png'} 
                alt={course.title}
                className="h-48 w-full object-cover" 
              />
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <a href={course.enroll_now_link || "#"} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full">
                    Go to Course <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;
