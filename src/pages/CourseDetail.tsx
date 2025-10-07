import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertCircle, Star, Users, Calendar } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import StickyTabNav from '@/components/courses/detail/StickyTabNav';
import EnrollmentCard from '@/components/courses/detail/EnrollmentCard';
import FeaturesSection from '@/components/courses/detail/FeaturesSection';
import AboutSection from '@/components/courses/detail/AboutSection';
import ScheduleSection from '@/components/courses/detail/ScheduleSection';
import SSPPortalSection from '@/components/courses/detail/SSPPortalSection';
import FAQSection from '@/components/courses/detail/FAQSection';

interface BatchScheduleItem {
  id: string;
  course_id: string;
  batch_name: string;
  subject_name: string;
  file_link: string;
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [scheduleData, setScheduleData] = useState<BatchScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        setError('Course ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch course and schedule data in parallel
        const [courseResult, scheduleResult] = await Promise.all([
          supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .maybeSingle(),
          supabase
            .from('batch_schedule' as any)
            .select('*')
            .eq('course_id', courseId)
        ]);

        if (courseResult.error) throw courseResult.error;

        if (!courseResult.data) {
          setError('Course not found');
        } else {
          setCourse(courseResult.data as unknown as Course);
          // Safely handle schedule data
          if (scheduleResult.data && Array.isArray(scheduleResult.data)) {
            setScheduleData(scheduleResult.data as unknown as BatchScheduleItem[]);
          }
        }
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBA';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

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

  const tabs = [
    { id: 'features', label: 'Features' },
    { id: 'about', label: 'About' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'ssp', label: 'SSP Portal' },
    { id: 'faqs', label: 'FAQs' }
  ];

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-20 bg-background">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-4">
          <Button 
            onClick={() => navigate('/courses')} 
            variant="ghost" 
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>

        {/* Header Section */}
        <div className="shiny-blue-bg border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.exam_category && (
                  <Badge variant="secondary">{course.exam_category}</Badge>
                )}
                {course.level && (
                  <Badge variant="outline">{course.level}</Badge>
                )}
                {course.bestseller && (
                  <Badge className="bg-amber-500">⭐ Best Seller</Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4 text-white">{course.title}</h1>
              <p className="text-lg text-white/90 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-white">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="font-semibold">{course.rating || 4.0}</span>
                  <span className="text-white/80">rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-white/80" />
                  <span className="font-semibold">{course.students_enrolled || 0}</span>
                  <span className="text-white/80">students enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-white/80" />
                  <span className="text-white/80">Starts: {formatDate(course.start_date)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Tab Navigation */}
        <StickyTabNav tabs={tabs} />

        {/* Two Column Layout */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content (Left) */}
            <div className="lg:col-span-2 space-y-12">
              <FeaturesSection course={course} />
              <AboutSection course={course} />
              <ScheduleSection scheduleData={scheduleData} />
              <SSPPortalSection />
              <FAQSection />
            </div>

            {/* Enrollment Card (Right - Sticky) */}
            <div className="lg:col-span-1">
              <EnrollmentCard course={course} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CourseDetail;
