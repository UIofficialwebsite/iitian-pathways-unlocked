import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';

// Import UI components for building the page layout
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Import icons for a richer user experience
import { ArrowLeft, AlertCircle, Star, Users, Calendar } from 'lucide-react';

// Import layout components like NavBar and Footer
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

// Import specialized components for the course detail page
import StickyTabNav from '@/components/courses/detail/StickyTabNav';
import EnrollmentCard from '@/components/courses/detail/EnrollmentCard';
import FeaturesSection from '@/components/courses/detail/FeaturesSection';
import AboutSection from '@/components/courses/detail/AboutSection';
import MoreDetailsSection from '@/components/courses/detail/MoreDetailsSection';
import ScheduleSection from '@/components/courses/detail/ScheduleSection';
import SSPPortalSection from '@/components/courses/detail/SSPPortalSection';
import FAQSection from '@/components/courses/detail/FAQSection';
import CourseAccessGuide from '@/components/courses/detail/CourseAccessGuide';
import CourseHeader from '@/components/courses/detail/CourseHeader';

// Define the TypeScript interfaces for the data we expect to fetch
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
  // Get the courseId from the URL parameters
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // State hooks to manage course data, loading status, and errors
  const [course, setCourse] = useState<Course | null>(null);
  const [scheduleData, setScheduleData] = useState<BatchScheduleItem[]>([]);
  const [faqs, setFaqs] = useState<CourseFaq[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for each content section to enable smooth scrolling with the sticky navigation
  const sectionRefs = {
    features: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
    moreDetails: useRef<HTMLDivElement>(null),
    schedule: useRef<HTMLDivElement>(null),
    ssp: useRef<HTMLDivElement>(null),
    access: useRef<HTMLDivElement>(null),
    faqs: useRef<HTMLDivElement>(null),
  };

  // useEffect hook to fetch all course data when the component mounts or courseId changes
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

        // Fetch course, schedule, and FAQs data in parallel for better performance
        const [courseResult, scheduleResult, faqResult] = await Promise.all([
          supabase.from('courses').select('*').eq('id', courseId).maybeSingle(),
          supabase.from('batch_schedule' as any).select('*').eq('course_id', courseId),
          supabase.from('course_faqs' as any).select('question, answer').eq('course_id', courseId),
        ]);

        if (courseResult.error) throw new Error(`Backend Error: ${courseResult.error.message}`);
        
        if (!courseResult.data) {
          setError(`Sorry, we couldn't find a course with the ID: ${courseId}.`);
        } else {
          setCourse(courseResult.data as any);
          if (scheduleResult.data) setScheduleData(scheduleResult.data as any);
          if (faqResult.data && faqResult.data.length > 0) {
            setFaqs(faqResult.data as any);
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

  // Display a loading skeleton while data is being fetched
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

  // Display an error message if fetching fails or the course is not found
  if (error || !course) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <Alert variant="destructive" className="max-w-lg mx-auto text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to Load Course</AlertTitle>
              <AlertDescription>
                {error || 'The course you are looking for could not be found.'}
              </AlertDescription>
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

  // Define the tabs for the sticky navigation bar
  const tabs = [
    { id: 'features', label: 'Features' },
    { id: 'about', label: 'About' },
    { id: 'moreDetails', label: 'More Details' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'ssp', label: 'SSP Portal' },
    { id: 'access', label: 'Course Access' },
    { id: 'faqs', label: 'FAQs' },
  ];

  // Render the main course detail page
  return (
    <>
      <NavBar />
      <main className="min-h-screen pt-20 bg-background">
        <div className="container mx-auto px-4 py-4">
          <Button onClick={() => navigate('/courses')} variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>

        {/* Header Section: Displays the main course title, description, and stats */}
        <CourseHeader course={course} />

        {/* Sticky Navigation: Allows users to jump to different sections */}
        <StickyTabNav tabs={tabs} sectionRefs={sectionRefs} />

        {/* Main Content Area */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Right Column: Contains the sticky enrollment card. It's ordered first on mobile for better UX. */}
            <div className="lg:col-span-1 lg:order-last">
              <div className="lg:sticky top-28">
                <EnrollmentCard course={course} />
              </div>
            </div>

            {/* Left Column: Contains all the detailed sections about the course. */}
            <div className="lg:col-span-2 space-y-12">
              <div id="features" ref={sectionRefs.features} className="scroll-mt-24"><FeaturesSection course={course} /></div>
              <div id="about" ref={sectionRefs.about} className="scroll-mt-24"><AboutSection course={course} /></div>
              <div id="moreDetails" ref={sectionRefs.moreDetails} className="scroll-mt-24"><MoreDetailsSection /></div>
              <div id="schedule" ref={sectionRefs.schedule} className="scroll-mt-24"><ScheduleSection scheduleData={scheduleData} /></div>
              <div id="ssp" ref={sectionRefs.ssp} className="scroll-mt-24"><SSPPortalSection /></div>
              <div id="access" ref={sectionRefs.access} className="scroll-mt-24"><CourseAccessGuide /></div>
              <div id="faqs" ref={sectionRefs.faqs} className="scroll-mt-24">
                <FAQSection faqs={faqs} />
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
