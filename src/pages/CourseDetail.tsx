import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';
import CourseHeader from '@/components/courses/detail/CourseHeader';
import CourseTabs from '@/components/courses/detail/CourseTabs';
import FaqSection from '@/components/courses/detail/FaqSection';
import MoreDetailsSection from '@/components/courses/detail/MoreDetailsSection';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setError('Course ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Course not found');
        } else {
          setCourse(data as unknown as Course);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-12">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <Skeleton className="h-[400px] rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <Alert variant="destructive" className="max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {error || 'Course not found'}
              </AlertDescription>
            </Alert>
            <div className="text-center mt-6">
              <Button onClick={() => navigate('/courses')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-6">
          <Button 
            onClick={() => navigate('/courses')} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
        <CourseHeader course={course} />
        <CourseTabs course={course} />
        <MoreDetailsSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
};

export default CourseDetail;
