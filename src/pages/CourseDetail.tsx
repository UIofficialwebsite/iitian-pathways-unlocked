import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';
import { cn } from "@/lib/utils";

import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, Star, Users, Calendar, Globe } from 'lucide-react';

import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import EnrollmentCard from '@/components/courses/detail/EnrollmentCard';
import CourseTabs from '@/components/courses/detail/CourseTabs';

interface CourseDetailProps {
  customCourseId?: string; 
  isDashboardView?: boolean;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ customCourseId, isDashboardView }) => {
  const { courseId: urlCourseId } = useParams<{ courseId: string }>();
  const courseId = customCourseId || urlCourseId;
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        setError('Course ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .maybeSingle();

        if (courseError) throw new Error(courseError.message);
        
        if (!data) {
          setError(`Course with ID ${courseId} not found.`);
        } else {
          setCourse(data as any);
        }
      } catch (err: any) {
        console.error('Error fetching course data:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  if (loading) {
    return (
      <div className={cn("min-h-screen bg-background", !isDashboardView && "pt-20")}>
        {!isDashboardView && <NavBar />}
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-[500px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={cn("min-h-screen bg-background flex items-center justify-center", !isDashboardView && "pt-20")}>
        {!isDashboardView && <NavBar />}
        <div className="container mx-auto px-4 text-center">
          <Alert variant="destructive" className="max-w-lg mx-auto mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Load Course</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {!isDashboardView && (
            <Button onClick={() => navigate('/courses')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-slate-50", !isDashboardView && "min-h-screen pt-20")}>
      {!isDashboardView && <NavBar />}
      
      <main className="w-full">
        {/* Premium Header Section */}
        <div className="bg-[#1c1d1f] text-white py-12 border-b border-slate-700">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                {!isDashboardView && (
                  <Button 
                    onClick={() => navigate('/courses')} 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
                  </Button>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {course.exam_category && (
                    <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-none rounded-none px-3 py-1 font-bold">
                      {course.exam_category}
                    </Badge>
                  )}
                  {course.bestseller && (
                    <Badge className="bg-amber-400 text-black border-none rounded-none px-3 py-1 font-bold">
                      Bestseller
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{course.title}</h1>
                
                <p className="text-xl text-slate-200 leading-relaxed max-w-3xl">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-lg">{course.rating || 4.5}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={cn("h-4 w-4 fill-amber-400 text-amber-400", s > (course.rating || 4) && "text-slate-500 fill-slate-500")} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span>{course.students_enrolled?.toLocaleString() || '1,200+'} students enrolled</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>{course.language || 'English'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content & Sidebar */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Course Tabs Content */}
            <div className="lg:col-span-2">
              <CourseTabs course={course} />
            </div>

            {/* Right Column: Sticky Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 z-30 lg:-mt-[350px]">
                <EnrollmentCard course={course} />
              </div>
            </div>

          </div>
        </div>
      </main>

      {!isDashboardView && <Footer />}
    </div>
  );
};

export default CourseDetail;
