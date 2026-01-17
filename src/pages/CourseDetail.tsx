import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';
import { cn } from "@/lib/utils";

import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, AlertCircle, Star, Users, Calendar, 
  PlayCircle, ArrowRight, Lock, Unlock 
} from 'lucide-react';

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
// Import the new Modal
import BatchConfigurationModal, { BundleItemWrapper } from '@/components/courses/detail/BatchConfigurationModal';

// Type for Grouped display in Syllabus
interface BundleSection {
  title: string;
  items: BundleItemWrapper[];
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

  const [course, setCourse] = useState<Course | null>(null);
  
  // Data States
  const [bundleItems, setBundleItems] = useState<BundleItemWrapper[]>([]);
  const [bundleSections, setBundleSections] = useState<BundleSection[]>([]);
  const [scheduleData, setScheduleData] = useState<BatchScheduleItem[]>([]);
  const [faqs, setFaqs] = useState<CourseFaq[] | undefined>(undefined);
  
  // Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Parallel Fetching
        const [courseResult, bundleResult, scheduleResult, faqResult] = await Promise.all([
          supabase.from('courses').select('*').eq('id', courseId).maybeSingle(),
          supabase.from('course_bundles').select(`
            id,
            is_mandatory,
            section_title,
            child_course:courses (*)
          `).eq('parent_course_id', courseId).order('display_order', { ascending: true }),
          supabase.from('batch_schedule').select('*').eq('course_id', courseId),
          supabase.from('course_faqs').select('question, answer').eq('course_id', courseId),
        ]);

        if (courseResult.error) throw courseResult.error;
        if (!courseResult.data) { setError("Course not found"); return; }
        
        setCourse(courseResult.data as any);
        if (scheduleResult.data) setScheduleData(scheduleResult.data as any);
        if (faqResult.data) setFaqs(faqResult.data as any);

        // Process Bundle Data
        if (bundleResult.data) {
          const rawItems: BundleItemWrapper[] = [];
          const sectionsMap = new Map<string, BundleItemWrapper[]>();

          bundleResult.data.forEach((item: any) => {
            if (!item.child_course) return;
            
            const wrapper = {
                linkId: item.id,
                isMandatory: item.is_mandatory,
                sectionTitle: item.section_title || "Included Courses",
                course: item.child_course
            };

            rawItems.push(wrapper);

            // Grouping for Syllabus
            if (!sectionsMap.has(wrapper.sectionTitle)) {
              sectionsMap.set(wrapper.sectionTitle, []);
            }
            sectionsMap.get(wrapper.sectionTitle)?.push(wrapper);
          });

          setBundleItems(rawItems);
          setBundleSections(
            Array.from(sectionsMap.entries()).map(([title, items]) => ({ title, items }))
          );
        }

      } catch (err: any) {
        console.error("Fetch Error", err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  // --- LOGIC: Direct Pay vs Config Modal ---
  // If there are ANY optional items, we must open the modal.
  // If everything is mandatory (or no bundle), we just pay directly.
  const hasOptionalItems = bundleItems.some(item => !item.isMandatory);
  
  const handleEnrollClick = () => {
    if (hasOptionalItems) {
      setIsConfigModalOpen(true);
    } 
    // If not optional, we do nothing here; the EnrollmentCard uses default behavior.
  };

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
    ...(bundleSections.length > 0 ? [{ id: 'curriculum', label: 'Syllabus' }] : []),
    { id: 'about', label: 'About' },
    { id: 'moreDetails', label: 'More Details' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'ssp', label: 'SSP Portal' },
    { id: 'access', label: 'Course Access' },
    { id: 'faqs', label: 'FAQs' },
  ];

  return (
    <div className={cn("bg-slate-50", !isDashboardView && "min-h-screen pt-20")}>
       {!isDashboardView && <NavBar />}
       
       <main className="w-full">
         {/* Header */}
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

         <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             
             {/* LEFT COLUMN */}
             <div className="lg:col-span-7 space-y-8">
               <div ref={sectionRefs.features}><FeaturesSection course={course} /></div>

               {/* --- SYLLABUS LIST (Read Only) --- */}
               {bundleSections.length > 0 && (
                 <div ref={sectionRefs.curriculum} className="space-y-6">
                   <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                     <PlayCircle className="h-6 w-6 text-royal" /> Course Syllabus & Subjects
                   </h2>
                   {bundleSections.map((section, idx) => (
                     <Card key={idx} className="border-slate-200 overflow-hidden">
                       <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
                           <CardTitle className="text-md font-bold text-slate-800">{section.title}</CardTitle>
                       </CardHeader>
                       <CardContent className="p-0">
                         <div className="divide-y divide-slate-100">
                           {section.items.map(({ course: subCourse, isMandatory }) => (
                               <div key={subCourse.id} className="p-4 flex gap-4 items-center group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/courses/${subCourse.id}`)}>
                                 <div className="flex-shrink-0">
                                   {isMandatory ? <Lock className="w-5 h-5 text-slate-400" /> : <Unlock className="w-5 h-5 text-green-500" />}
                                 </div>
                                 <div className="flex-grow">
                                   <div className="flex justify-between items-start">
                                     <h4 className="font-semibold text-slate-900 group-hover:text-royal transition-colors">{subCourse.title}</h4>
                                     <Badge variant="outline" className={isMandatory ? "bg-slate-100" : "bg-green-50 text-green-700 border-green-200"}>
                                        {isMandatory ? "Compulsory" : "Optional Add-on"}
                                     </Badge>
                                   </div>
                                   <p className="text-xs text-slate-500 line-clamp-1 mt-1">{subCourse.description}</p>
                                 </div>
                                 <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-royal" />
                               </div>
                           ))}
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               )}

               <div ref={sectionRefs.about}><AboutSection course={course} /></div>
               <div ref={sectionRefs.moreDetails}><MoreDetailsSection /></div>
               <div ref={sectionRefs.schedule}><ScheduleSection scheduleData={scheduleData} /></div>
               <div ref={sectionRefs.ssp}><SSPPortalSection /></div>
               <div ref={sectionRefs.access}><CourseAccessGuide /></div>
               <div ref={sectionRefs.faqs}><FAQSection faqs={faqs} /></div>
             </div>
             
             {/* RIGHT COLUMN */}
             <aside className="lg:col-span-5 relative">
                <div className={cn("sticky z-20 transition-all duration-300", isDashboardView ? "top-32" : "top-32")}>
                  {/* Logic: Pass the handler ONLY if there are optional items. Otherwise undefined (Direct Pay) */}
                  <EnrollmentCard 
                      course={course} 
                      isDashboardView={isDashboardView}
                      customEnrollHandler={hasOptionalItems ? handleEnrollClick : undefined} 
                  />
                </div>
             </aside>
           </div>
         </div>
       </main>

       {/* --- BATCH CONFIGURATION MODAL --- */}
       {course && (
         <BatchConfigurationModal 
            isOpen={isConfigModalOpen}
            onClose={() => setIsConfigModalOpen(false)}
            mainCourse={course}
            bundleItems={bundleItems}
         />
       )}
    </div>
  );
};

export default CourseDetail;
