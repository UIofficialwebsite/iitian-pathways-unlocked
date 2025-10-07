import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import MoreDetailsSection from '@/components/courses/detail/MoreDetailsSection';
import FAQSection from '@/components/courses/detail/FAQSection';

// Define the types for the data we'll be fetching
interface BatchScheduleItem {
  id: string;
  course_id: string;
  batch_name: string;
  subject_name: string;
  file_link: string;
}
interface CourseFaq {
  question: string;
  answer: string;
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [scheduleData, setScheduleData] = useState<BatchScheduleItem[]>([]);
  const [faqs, setFaqs] = useState<CourseFaq[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create refs for each section to handle smooth scrolling
  const sectionRefs = {
    features: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
    schedule: useRef<HTMLDivElement>(null),
    ssp: useRef<HTMLDivElement>(null),
    moreDetails: useRef<HTMLDivElement>(null),
    faqs: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        setError('Course ID is missing from the URL.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all course-related data in parallel for better performance
        const [courseResult, scheduleResult, faqResult] = await Promise.all([
          supabase.from('courses').select('*').eq('id', courseId).maybeSingle(),
          supabase.from('batch_schedule').select('*').eq('course_id', courseId),
          supabase.from('course_faqs').select('question, answer').eq('course_id', courseId),
        ]);

        if (courseResult.error) throw new Error(`Backend Error: ${courseResult.error.message}`);
        
        if (!courseResult.data) {
          setError(`Sorry, we couldn't find a course with the ID: ${courseId}.`);
        } else {
          setCourse(courseResult.data as Course);

          if (scheduleResult.data) setScheduleData(scheduleResult.data as BatchScheduleItem[]);
          
          if (faqResult.data && faqResult.data.length > 0) {
            setFaqs(faqResult.data as CourseFaq[]);
          }
        }
      } catch (err: any) {
        console.error('Error fetching course data:', err);
        setError(err.message || 'An unexpected error occurred. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Loading state with placeholder skeletons
  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-12">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="lg:col-span-1">
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <Alert variant="destructive" className="max-w-lg mx-auto text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to Load Course</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/courses')} variant="outline" className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  // This check prevents rendering with incomplete data, fixing the "cannot read 'title'" error
  if (!course) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Course Not Found</AlertTitle>
            <AlertDescription>The course data could not be loaded or the course does not exist.</AlertDescription>
          </Alert>
        </div>
        <Footer />
      </>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBA';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const tabs = [
    { id: 'features', label: 'Features' },
    { id: 'about', label: 'About' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'ssp', label: 'SSP Portal' },
    { id: 'moreDetails', label: 'More Details' },
    { id: 'faqs', label: 'FAQs' },
  ];

  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-20 bg-background">
        <div className="container mx-auto px-4 py-4">
          <Button onClick={() => navigate('/courses')} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>

        {/* Header Section */}
        <div className="shiny-blue-bg border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.exam_category && <Badge variant="secondary">{course.exam_category}</Badge>}
                {course.level && <Badge variant="outline">{course.level}</Badge>}
                {course.bestseller && <Badge className="bg-amber-500 text-white">⭐ Best Seller</Badge>}
              </div>
              <h1 className="text-4xl font-bold mb-4 text-white">{course.title}</h1>
              <p className="text-lg text-white/90 mb-6">{course.description}</p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-white">
                <div className="flex items-center gap-2"><Star className="h-5 w-5 text-amber-400 fill-amber-400" /><span className="font-semibold">{course.rating || 4.0}</span><span className="text-white/80">rating</span></div>
                <div className="flex items-center gap-2"><Users className="h-5 w-5 text-white/80" /><span className="font-semibold">{course.students_enrolled || 0}</span><span className="text-white/80">students</span></div>
                <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-white/80" /><span className="text-white/80">Starts: {formatDate(course.start_date)}</span></div>
              </div>
            </div>
          </div>
        </div>

        <StickyTabNav tabs={tabs} sectionRefs={sectionRefs} course={course} />

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-12">
            
            <div className="lg:col-span-2 space-y-12">
              <div id="features" ref={sectionRefs.features} className="scroll-mt-32"><FeaturesSection course={course} /></div>
              <div id="about" ref={sectionRefs.about} className="scroll-mt-32"><AboutSection course={course} /></div>
              <div id="schedule" ref={sectionRefs.schedule} className="scroll-mt-32"><ScheduleSection scheduleData={scheduleData} /></div>
              <div id="ssp" ref={sectionRefs.ssp} className="scroll-mt-32"><SSPPortalSection /></div>
              <div id="moreDetails" ref={sectionRefs.moreDetails} className="scroll-mt-32"><MoreDetailsSection /></div>
              <div id="faqs" ref={sectionRefs.faqs} className="scroll-mt-32">
                <FAQSection faqs={faqs} />
              </div>
            </div>

            <div className="lg:col-span-1 relative">
              <div className="sticky top-32">
                <EnrollmentCard course={course} />
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CourseDetail;
