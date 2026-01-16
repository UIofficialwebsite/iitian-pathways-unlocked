import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';
import { cn } from "@/lib/utils";

import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, Star, Users, Calendar, PlayCircle, ArrowRight } from 'lucide-react';

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
  const [subCourses, setSubCourses] = useState<Course[]>([]);
  const [scheduleData, setScheduleData] = useState<BatchScheduleItem[]>([]);
  const [faqs, setFaqs] = useState<CourseFaq[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionRefs = {
    features: useRef<HTMLDivElement>(null),
    subCourses: useRef<HTMLDivElement>(null),
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
        
        // Fetch Course, Schedule, FAQs, and Sub-Courses (Children) in parallel
        const [courseResult, scheduleResult, faqResult, subCoursesResult] = await Promise.all([
          supabase.from('courses').select('*').eq('id', courseId).maybeSingle(),
          supabase.from('batch_schedule').select('*').eq('course_id', courseId),
          supabase.from('course_faqs').select('question, answer').eq('course_id', courseId),
          supabase.from('courses').select('*').eq('parent_course_id', courseId).order('created_at', { ascending: true })
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
          if (subCoursesResult.data) {
            setSubCourses(subCoursesResult.data as any);
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
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <div className="max-w-[1440px] mx-auto px-4 text-center">
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
    // Conditionally add Included Courses tab
    ...(subCourses.length > 0 ? [{ id: 'subCourses', label: 'Included Courses' }] : []),
    { id: 'about', label: 'About' },
    { id: 'moreDetails', label: 'More Details' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'ssp', label: 'SSP Portal' },
    { id: 'access', label: 'Course Access' },
    { id: 'faqs', label: 'FAQs' },
  ];

  const scrollMarginClass = isDashboardView ? "scroll-mt-[140px]" : "scroll-mt-24";

  return (
    <div className={cn("bg-slate-50", !isDashboardView && "min-h-screen pt-20")}>
      {!isDashboardView && <NavBar />}
      
      <main className="w-full">
        {/* Header: Max-width increased to prevent card clipping */}
        <div className="border-b border-slate-200 bg-white shadow-sm">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-4xl">
                {!isDashboardView && (
                  <Button onClick={() => navigate('/courses')} variant="ghost" size="sm" className="mb-4 -ml-2 text-slate-500 hover:text-royal">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
                  </Button>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.exam_category && <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">{course.exam_category}</Badge>}
                  {course.bestseller && <Badge className="bg-amber-500 text-white border-none">⭐ Best Seller</Badge>}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">{course.title}</h1>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">{course.description}</p>
                <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-2 text-amber-600"><Star className="h-5 w-5 fill-amber-500 text-amber-500" /> {course.rating || 4.0}</div>
                  <div className="flex items-center gap-2"><Users className="h-5 w-5 text-royal" /> {course.students_enrolled || 0} students</div>
                  <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-royal" /> Starts: {new Date(course.start_date || "").toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <StickyTabNav 
          tabs={tabs} 
          sectionRefs={sectionRefs} 
          isDashboardView={isDashboardView} 
        />

        {/* Main Content Area: Width increased to 1440px */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Grid Split updated to 7/12 (Details) and 5/12 (Card) for more room */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Course Details */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                <div ref={sectionRefs.features} className={scrollMarginClass}><FeaturesSection course={course} /></div>
              </div>

              {/* --- NEW SUB-COURSES SECTION --- */}
              {subCourses.length > 0 && (
                <div ref={sectionRefs.subCourses} className={scrollMarginClass}>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                     <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                        <PlayCircle className="h-6 w-6 text-royal" /> Included Courses & Modules
                     </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subCourses.map((sub) => (
                           <Card key={sub.id} className="hover:shadow-md transition-shadow cursor-pointer group border-slate-200" onClick={() => navigate(`/courses/${sub.id}`)}>
                              <CardContent className="p-4">
                                 <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="text-xs">{sub.subject || 'Module'}</Badge>
                                    <Badge variant={sub.price > 0 ? "secondary" : "default"} className={sub.price > 0 ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-green-100 text-green-700 hover:bg-green-200"}>
                                       {sub.price > 0 ? `₹${sub.price}` : "FREE"}
                                    </Badge>
                                 </div>
                                 <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-royal transition-colors">{sub.title}</h3>
                                 <p className="text-sm text-slate-500 line-clamp-2 mb-3">{sub.description}</p>
                                 <div className="flex items-center text-xs text-royal font-medium group-hover:underline">
                                    View Details <ArrowRight className="w-3 h-3 ml-1" />
                                 </div>
                              </CardContent>
                           </Card>
                        ))}
                     </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                <div ref={sectionRefs.about} className={scrollMarginClass}><AboutSection course={course} /></div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                <div ref={sectionRefs.moreDetails} className={scrollMarginClass}><MoreDetailsSection /></div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                <div ref={sectionRefs.schedule} className={scrollMarginClass}><ScheduleSection scheduleData={scheduleData} /></div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                <div ref={sectionRefs.ssp} className={scrollMarginClass}><SSPPortalSection /></div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                <div ref={sectionRefs.access} className={scrollMarginClass}><CourseAccessGuide /></div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                <div ref={sectionRefs.faqs} className={scrollMarginClass}><FAQSection faqs={faqs} /></div>
              </div>
            </div>

            {/* Right Column: Enrollment Card (STAYS FIXED ON SCROLL) */}
            <aside className="lg:col-span-5 relative">
              {/* This wrapper ensures the card stays fixed below the sticky navigation */}
              <div className={cn(
                "sticky z-20 transition-all duration-300",
                isDashboardView ? "top-32" : "top-32" 
              )}>
                <EnrollmentCard 
                    course={course} 
                    isDashboardView={isDashboardView} 
                />
              </div>
            </aside>
          </div>
        </div>
      </main>

      {!isDashboardView && <Footer />}
    </div>
  );
};

export default CourseDetail;
