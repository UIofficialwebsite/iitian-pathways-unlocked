import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';
import { cn } from "@/lib/utils";

import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, AlertCircle, Star, Users, Calendar 
} from 'lucide-react';
import { toast } from 'sonner';

import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer'; // Import Footer
import StickyTabNav from '@/components/courses/detail/StickyTabNav';
import EnrollmentCard from '@/components/courses/detail/EnrollmentCard';
import { MobileEnrollmentBar } from '@/components/courses/detail/MobileEnrollmentBar';
import FeaturesSection from '@/components/courses/detail/FeaturesSection';
import AboutSection from '@/components/courses/detail/AboutSection';
import MoreDetailsSection from '@/components/courses/detail/MoreDetailsSection';
import ScheduleSection from '@/components/courses/detail/ScheduleSection';
import SSPPortalSection from '@/components/courses/detail/SSPPortalSection';
import FAQSection from '@/components/courses/detail/FAQSection';
import CourseAccessGuide from '@/components/courses/detail/CourseAccessGuide';
import SubjectsSection from '@/components/courses/detail/SubjectsSection';
import { useAuth } from '@/hooks/useAuth';

interface SimpleAddon {
  id: string;
  subject_name: string;
  price: number;
}

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

const CourseDetail = ({ customCourseId, isDashboardView }: any) => {
  const { courseId: urlCourseId } = useParams<{ courseId: string }>();
  const courseId = customCourseId || urlCourseId;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [addons, setAddons] = useState<SimpleAddon[]>([]); 
  const [scheduleData, setScheduleData] = useState<BatchScheduleItem[]>([]);
  const [faqs, setFaqs] = useState<CourseFaq[] | undefined>(undefined);
  
  // Enrollment States
  const [ownedAddons, setOwnedAddons] = useState<string[]>([]);
  const [isMainCourseOwned, setIsMainCourseOwned] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  const sectionRefs = {
    features: useRef<HTMLDivElement>(null),
    curriculum: useRef<HTMLDivElement>(null),
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
        
        const [courseResult, addonsResult, scheduleResult, faqResult] = await Promise.all([
          supabase.from('courses').select('*').eq('id', courseId).maybeSingle(),
          supabase.from('course_addons').select('*').eq('course_id', courseId),
          supabase.from('batch_schedule').select('*').eq('course_id', courseId),
          supabase.from('course_faqs').select('question, answer').eq('course_id', courseId),
        ]);

        if (courseResult.error) throw courseResult.error;
        if (!courseResult.data) { setError("Course not found"); return; }
        
        const fetchedCourse = courseResult.data as Course;
        setCourse(fetchedCourse);

        if (scheduleResult.data) setScheduleData(scheduleResult.data as any);
        if (faqResult.data) setFaqs(faqResult.data as any);
        if (addonsResult.data) setAddons(addonsResult.data as SimpleAddon[]);

        // Check Enrollment Status (Simple Check)
        if (user) {
          const { data: userEnrollments } = await supabase
            .from('enrollments')
            .select('subject_name, status')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .neq('status', 'FAILED');

          if (userEnrollments && userEnrollments.length > 0) {
            const ownedSubjects: string[] = [];
            let mainOwned = false;

            userEnrollments.forEach(enrollment => {
              const status = enrollment.status?.toLowerCase() || '';
              const isSuccess = status === 'success' || status === 'paid' || status === 'active';

              if (isSuccess) {
                if (enrollment.subject_name) {
                  ownedSubjects.push(enrollment.subject_name);
                } else {
                  mainOwned = true;
                }
              }
            });

            setOwnedAddons(ownedSubjects);
            setIsMainCourseOwned(mainOwned);
          }
        }

      } catch (err: any) {
        console.error("Fetch Error", err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, user]);

  const hasOptionalItems = addons.length > 0;

  // Calculate if the user has bought EVERYTHING (Main + All Addons)
  const isFullyEnrolled = useMemo(() => {
    if (!isMainCourseOwned) return false;
    if (!hasOptionalItems) return true; // Main owned, no addons exist -> Fully enrolled

    // Check if every addon available is in the owned list
    return addons.every(addon => ownedAddons.includes(addon.subject_name));
  }, [isMainCourseOwned, addons, ownedAddons, hasOptionalItems]);
  
  const handleConfigClick = () => {
    navigate(`/courses/${courseId}/configure`);
  };

  // --- FREE ENROLLMENT LOGIC ---
  const handleFreeEnroll = async () => {
    if (!user) {
      toast.error("Please login to enroll.");
      navigate('/auth');
      return;
    }

    if (!course) return;

    try {
      setEnrolling(true);
      
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: course.id,
          amount: 0,
          status: 'active', // Direct success for free
          payment_id: 'free_enrollment',
          subject_name: null // Main course
        });

      if (enrollError) throw enrollError;

      toast.success("Successfully enrolled in the batch!");
      setIsMainCourseOwned(true); // Update UI immediately
      
    } catch (err: any) {
      console.error("Free Enrollment Error:", err);
      toast.error("Enrollment failed. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  // Handler Logic
  let customEnrollHandler: (() => void) | undefined = undefined;

  if (hasOptionalItems) {
    customEnrollHandler = handleConfigClick;
  } else if (course && (course.price === 0 || course.price === null)) {
    customEnrollHandler = handleFreeEnroll;
  }

  if (loading) {
    return (
      <div className={cn("min-h-screen bg-background", !isDashboardView && "pt-20")}>
        {!isDashboardView && <NavBar />}
        <div className="max-w-[1440px] mx-auto px-4 py-12 space-y-8">
          <Skeleton className="h-12 w-3/4" />
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
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const tabs = [
    { id: 'features', label: 'Features' },
    ...((course.subject || addons.length > 0) ? [{ id: 'curriculum', label: 'Subjects' }] : []),
    { id: 'about', label: 'About' },
    { id: 'moreDetails', label: 'More Details' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'ssp', label: 'SSP Portal' },
    { id: 'access', label: 'Course Access' },
    { id: 'faqs', label: 'FAQs' },
  ];

  const commonEnrollmentProps = {
    course,
    isDashboardView,
    isMainCourseOwned,
    isFullyEnrolled,
    ownedAddons,
    customEnrollHandler,
    isFreeCourse: course.price === 0 || course.price === null,
    enrolling
  };

  return (
    <div className={cn("bg-slate-50", !isDashboardView && "min-h-screen pt-20")}>
       {!isDashboardView && <NavBar />}
       
       <main className="w-full">
         <div className="border-b border-slate-200 bg-white shadow-sm">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="max-w-4xl">
                   {!isDashboardView && (
                      <Button onClick={() => navigate('/courses')} variant="ghost" size="sm" className="mb-4 -ml-2 text-slate-500 hover:text-royal">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
                      </Button>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.exam_category && <Badge variant="secondary" className="bg-blue-100 text-blue-700">{course.exam_category}</Badge>}
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

         <StickyTabNav tabs={tabs} sectionRefs={sectionRefs} isDashboardView={isDashboardView} />

         <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 lg:pb-10">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             
             <div className="lg:col-span-7 space-y-8">
               <div ref={sectionRefs.features}><FeaturesSection course={course} /></div>
               <div ref={sectionRefs.curriculum}>
                  <SubjectsSection course={course} addons={addons} />
               </div>
               <div ref={sectionRefs.about}><AboutSection course={course} /></div>
               <div ref={sectionRefs.moreDetails}><MoreDetailsSection /></div>
               <div ref={sectionRefs.schedule}><ScheduleSection scheduleData={scheduleData} /></div>
               <div ref={sectionRefs.ssp}><SSPPortalSection /></div>
               <div ref={sectionRefs.access}><CourseAccessGuide /></div>
               <div ref={sectionRefs.faqs}><FAQSection faqs={faqs} /></div>
             </div>
             
             {/* Desktop Sidebar - Hidden on Mobile */}
             <aside className="hidden lg:block lg:col-span-5 relative">
                <div className={cn("sticky z-20 transition-all duration-300", isDashboardView ? "top-32" : "top-32")}>
                  <EnrollmentCard {...commonEnrollmentProps} />
                </div>
             </aside>

             {/* Mobile Fixed Bottom Bar - Hidden on Desktop */}
             <div className="lg:hidden block">
               <MobileEnrollmentBar {...commonEnrollmentProps} />
             </div>

           </div>
         </div>
       </main>
       
       {!isDashboardView && <Footer />}
    </div>
  );
};

export default CourseDetail;
