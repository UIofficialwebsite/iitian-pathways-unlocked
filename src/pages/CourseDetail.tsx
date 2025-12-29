import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';
import { cn } from "@/lib/utils";

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
import CourseAccessGuide from '@/components/courses/detail/CourseAccessGuide';

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
interface CourseDetailProps {
  customCourseId?: string; 
  isDashboardView?: boolean;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ customCourseId, isDashboardView }) => {
  const { courseId: urlCourseId } = useParams<{ courseId: string }>();
  const courseId = customCourseId || urlCourseId;
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [scheduleData, setScheduleData] = useState<BatchScheduleItem[]>([]);
  const [faqs, setFaqs] = useState<CourseFaq[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionRefs = {
    features: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
    moreDetails: useRef<HTMLDivElement>(null),
    schedule: useRef<HTMLDivElement>(null),
    ssp: useRef<HTMLDivElement>(null),
    access: useRef<HTMLDivElement>(null),
    faqs: useRef<HTMLDivElement>(null),
  };

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
        const [courseResult, scheduleResult, faqResult] = await Promise.all([
          supabase.from('courses').select('*').eq('id', courseId).maybeSingle(),
          supabase.from('batch_schedule').select('*').eq('course_id', courseId),
          supabase.from('course_faqs').select('question, answer').eq('course_id', courseId),
        ]);

        if (courseResult.error) throw new Error(courseResult.error.message);
        
        if (!courseResult.data) {
          setError(`Course with ID ${courseId} not found.`);
        } else {
          setCourse(courseResult.data as any);
          if (scheduleResult.data) setScheduleData(scheduleResult.data as any);
          if (faqResult.data && faqResult.data.length > 0) {
            setFaqs(faqResult.data as any);
          }
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
          <Skeleton className="h-12 w-3/4 mb-4" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8"><Skeleton className="h-64 w-full" /></div>
            <div className="lg:col-span-1"><Skeleton className="h-96 w-full" /></div>
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
          <Alert variant="destructive" className="max-w-lg mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed to Load Course</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {!isDashboardView && (
            <Button onClick={() => navigate('/courses')} variant="outline" className="mt-6">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
            </Button>
          )}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'features', label: 'Features' },
    { id: 'about', label: 'About' },
    { id: 'moreDetails', label: 'More Details' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'ssp', label: 'SSP Portal' },
    { id: 'access', label: 'Course Access' },
    { id: 'faqs', label: 'FAQs' },
  ];

  /* 140px margin ensures content aligns below header (73px) + tabs (57px) */
  const scrollMarginClass = isDashboardView ? "scroll-mt-[140px]" : "scroll-mt-24";

  return (
    <div className={cn("bg-background", !isDashboardView && "min-h-screen pt-20")}>
      {!isDashboardView && <NavBar />}
      
      <main className="w-full">
        <div className="premium-course-header border-b border-slate-700/50 bg-slate-900 text-white">
          {/* Only show back button container in non-dashboard view */}
          {!isDashboardView && (
            <div className="container mx-auto px-4 py-4">
              <Button onClick={() => navigate('/courses')} variant="ghost" size="sm" className="mb-4 text-slate-300">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
              </Button>
            </div>
          )}
          <div className="container mx-auto px-4 pb-8">
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.exam_category && <Badge className="bg-blue-500/20 text-blue-300">{course.exam_category}</Badge>}
                {course.bestseller && <Badge className="bg-amber-500/90 text-white">⭐ Best Seller</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-md text-slate-300 mb-6">{course.description}</p>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2"><Star className="h-5 w-5 text-amber-400 fill-amber-400" /> {course.rating || 4.0}</div>
                <div className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-400" /> {course.students_enrolled || 0}</div>
                <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-400" /> Starts: {new Date(course.start_date || "").toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        <StickyTabNav 
          tabs={tabs} 
          sectionRefs={sectionRefs} 
          isDashboardView={isDashboardView} 
        />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enrollment Card - Completely untouched */}
            <div className="lg:col-span-1 lg:order-last">
              <div className="lg:sticky top-[140px] z-20">
                <EnrollmentCard course={course} />
              </div>
            </div>

            {/* Content Sections - Wrapped in cards with consistent spacing */}
            <div className="lg:col-span-2 space-y-6">
              <div ref={sectionRefs.features} className={scrollMarginClass}>
                <FeaturesSection course={course} />
              </div>
              <div ref={sectionRefs.about} className={scrollMarginClass}>
                <AboutSection course={course} />
              </div>
              <div ref={sectionRefs.moreDetails} className={scrollMarginClass}>
                <MoreDetailsSection />
              </div>
              <div ref={sectionRefs.schedule} className={scrollMarginClass}>
                <ScheduleSection scheduleData={scheduleData} />
              </div>
              <div ref={sectionRefs.ssp} className={scrollMarginClass}>
                <SSPPortalSection />
              </div>
              <div ref={sectionRefs.access} className={scrollMarginClass}>
                <CourseAccessGuide />
              </div>
              <div ref={sectionRefs.faqs} className={scrollMarginClass}>
                <FAQSection faqs={faqs} />
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
