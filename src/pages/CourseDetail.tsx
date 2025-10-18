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
import MoreDetailsSection from '@/components/courses/detail/MoreDetailsSection';
import ScheduleSection from '@/components/courses/detail/ScheduleSection';
import SSPPortalSection from '@/components/courses/detail/SSPPortalSection';
import FAQSection from '@/components/courses/detail/FAQSection';
import CourseAccessGuide from '@/components/courses/detail/CourseAccessGuide'; // Make sure to create this component

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

  // Create refs for each section
  const sectionRefs = {
    features: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
    moreDetails: useRef<HTMLDivElement>(null),
    schedule: useRef<HTMLDivElement>(null),
    ssp: useRef<HTMLDivElement>(null),
    access: useRef<HTMLDivElement>(null), // Ref for the new section
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBA';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

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

  const tabs = [
    { id: 'features', label: 'Features' },
    { id: 'about', label: 'About' },
    { id: 'moreDetails', label: 'More Details' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'ssp', label: 'SSP Portal' },
    { id: 'access', label: 'Course Access' }, // New tab
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
          <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                {course.exam_category && <Badge variant="secondary" className="text-xs md:text-sm">{course.exam_category}</Badge>}
                {course.level && <Badge variant="outline" className="text-xs md:text-sm">{course.level}</Badge>}
                {course.bestseller && <Badge className="bg-amber-500 text-white text-xs md:text-sm">⭐ Best Seller</Badge>}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-white leading-tight">{course.title}</h1>
              <p className="text-base md:text-lg text-white/90 mb-4 md:mb-6">{course.description}</p>
              <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-white">
                <div className="flex items-center gap-1.5 md:gap-2"><Star className="h-4 w-4 md:h-5 md:w-5 text-amber-400 fill-amber-400" /><span className="font-semibold">{course.rating || 4.0}</span><span className="text-white/80">rating</span></div>
                <div className="flex items-center gap-1.5 md:gap-2"><Users className="h-4 w-4 md:h-5 md:w-5 text-white/80" /><span className="font-semibold">{course.students_enrolled || 0}</span><span className="text-white/80">students</span></div>
                <div className="flex items-center gap-1.5 md:gap-2"><Calendar className="h-4 w-4 md:h-5 md:w-5 text-white/80" /><span className="text-white/80">Starts: {formatDate(course.start_date)}</span></div>
              </div>
            </div>
          </div>
        </div>

        <StickyTabNav tabs={tabs} sectionRefs={sectionRefs} />

        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            
            {/* Left Column: Course Content */}
            <div className="lg:col-span-2 space-y-8 md:space-y-10 lg:space-y-12">
              <div id="features" ref={sectionRefs.features} className="scroll-mt-24 md:scroll-mt-32"><FeaturesSection course={course} /></div>
              <div id="about" ref={sectionRefs.about} className="scroll-mt-24 md:scroll-mt-32"><AboutSection course={course} /></div>
              <div id="moreDetails" ref={sectionRefs.moreDetails} className="scroll-mt-24 md:scroll-mt-32"><MoreDetailsSection /></div>
              <div id="schedule" ref={sectionRefs.schedule} className="scroll-mt-24 md:scroll-mt-32"><ScheduleSection scheduleData={scheduleData} /></div>
              <div id="ssp" ref={sectionRefs.ssp} className="scroll-mt-24 md:scroll-mt-32"><SSPPortalSection /></div>
              <div id="access" ref={sectionRefs.access} className="scroll-mt-24 md:scroll-mt-32"><CourseAccessGuide /></div>
              <div id="faqs" ref={sectionRefs.faqs} className="scroll-mt-24 md:scroll-mt-32">
                <FAQSection faqs={faqs} />
              </div>
            </div>

            {/* Right Column: Enrollment Card - Hidden on mobile, shown as sticky on desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                <EnrollmentCard course={course} />
              </div>
            </div>

          </div>
          
          {/* Mobile Enrollment Card - Fixed at bottom on mobile */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">₹{course.discounted_price || course.price}</span>
                {course.discounted_price && (
                  <span className="text-sm text-gray-500 line-through">₹{course.price}</span>
                )}
              </div>
              <a href={course.enroll_now_link || '#'} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" className="w-full">Enroll Now</Button>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CourseDetail;
