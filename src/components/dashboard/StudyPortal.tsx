import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Book, 
  BookOpen, 
  Users, 
  ChevronRight, 
  FileText, 
  Target, 
  ArrowRight, 
  ChevronDown, 
  MoreVertical, 
  Share2, 
  Info, 
  Check, 
  ArrowLeft,
  Calendar,
  Star,
  Layers,
  LayoutDashboard, // Added for My Classroom
  Library // Added for My Classroom
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { Tables } from '../../integrations/supabase/types';
import RecommendedBatchesSection from './RecommendedBatchesSection';
import { useBackend } from '../BackendIntegratedWrapper';
import ProfileCompletionBanner from './ProfileCompletionBanner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// --- Imports from Course Detail Page (Necessary for Full Detail View) ---
import FeaturesSection from '@/components/courses/detail/FeaturesSection';
import AboutSection from '@/components/courses/detail/AboutSection';
import MoreDetailsSection from '@/components/courses/detail/MoreDetailsSection';
import ScheduleSection from '@/components/courses/detail/ScheduleSection';
import SSPPortalSection from '@/components/courses/detail/SSPPortalSection';
import FAQSection from '@/components/courses/detail/FAQSection';
import CourseAccessGuide from '@/components/courses/detail/CourseAccessGuide';

// --- Types ---
type UserProfile = Tables<'profiles'>;
type Course = Tables<'courses'> & {
  discounted_price?: number | null;
};

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

type RawEnrollment = {
  id: string;
  course_id: string;
  subject_name: string | null;
  courses: {
    id: string;
    title: string | null;
    description: string | null; 
    start_date: string | null; 
    end_date: string | null;   
    image_url: string | null;
    price: number | null; 
    exam_category: string | null;
    level: string | null;
    bestseller: boolean | null;
    rating: number | null;
    students_enrolled: number | null;
  } | null;
};

type GroupedEnrollment = {
  course_id: string;
  title: string;
  description: string | null; 
  start_date: string | null; 
  end_date: string | null;   
  status: 'Ongoing' | 'Batch Expired' | 'Unknown';
  subjects: string[];
  image_url: string | null;
  price: number | null;
  exam_category: string | null;
  level: string | null;
  bestseller: boolean | null;
  rating: number | null;
  students_enrolled: number | null;
};

// --- Props Interface ---
interface StudyPortalProps {
  profile: UserProfile | null;
  onViewChange: (view: 'dashboard' | 'profile' | 'enrollments' | 'studyPortal') => void;
}

// --- Re-usable Enrollment List Item ---
const EnrollmentListItem = ({ 
  enrollment, 
  onClick 
}: { 
  enrollment: GroupedEnrollment;
  onClick?: () => void;
}) => {
  const StatusIndicator = () => {
    if (enrollment.status === 'Ongoing') {
      return (
        <div className="flex items-center justify-end gap-2" title="Ongoing">
          <span className="text-sm font-medium text-green-600">Ongoing</span>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80 font-medium" title="Completed">
        SUCCESS
      </Badge>
    );
  };

  const formattedEndDate = enrollment.end_date 
    ? new Date(enrollment.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ' ')
    : 'No end date';

  const PriceDisplay = () => {
    if (enrollment.price === 0) {
      return <span className="font-medium text-green-700">Free</span>;
    }
    if (enrollment.price && enrollment.price > 0) {
      return <span className="font-medium text-gray-800">{`₹${enrollment.price}`}</span>;
    }
    return null;
  };

  const Container = onClick ? 'div' : Link;
  const containerProps = onClick 
    ? { onClick, className: "block group cursor-pointer" } 
    : { to: `/courses/${enrollment.course_id}`, className: "block group" };

  return (
    <Container {...(containerProps as any)}>
      <Card className="w-full relative overflow-hidden flex flex-col rounded-lg border border-gray-200 group-hover:border-black transition-all duration-200 shadow-sm hover:shadow-md">
        <CardContent className="flex items-start gap-5 p-5">
          <div className="flex-shrink-0 w-36 sm:w-48 aspect-video overflow-hidden rounded-lg bg-gray-50 mt-1">
            <img 
              src={enrollment.image_url || "/lovable-uploads/logo_ui_new.png"}
              alt={enrollment.title} 
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="flex-grow space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-0">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900 pr-4 group-hover:text-blue-600 transition-colors">
                {enrollment.title}
              </CardTitle>
              <div className="flex-shrink-0 mt-1 sm:mt-0">
                <StatusIndicator />
              </div>
            </div>
            
            {enrollment.description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {enrollment.description}
              </p>
            )}

            <div className="flex items-center gap-1.5 pt-1">
               <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <span>Valid till: {formattedEndDate}</span>
                <span>•</span>
                <PriceDisplay />
              </p>
            </div>
          </div>
          <ChevronRight className="h-6 w-6 text-gray-400 ml-2 flex-shrink-0 self-center group-hover:text-blue-600 transition-colors" />
        </CardContent>
        {enrollment.status === 'Batch Expired' && (
          <div className="bg-red-50 text-red-700 text-base p-4 text-center border-t border-red-100">
            This batch got expired on {formattedEndDate}!
          </div>
        )}
      </Card>
    </Container>
  );
};

// --- Custom Tab Navigation Component with Scroll Spy Support ---
const CustomDashboardTabNav = ({ 
  tabs, 
  activeTab, 
  onTabClick 
}: { 
  tabs: { id: string, label: string }[], 
  activeTab: string, 
  onTabClick: (id: string) => void 
}) => {
  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm z-30">
      <div className="flex items-center gap-1 md:gap-6 overflow-x-auto scrollbar-hide px-4 md:px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={cn(
              "py-4 px-2 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};


// --- View 1: Student IS Enrolled ---
const EnrolledView = ({ 
  enrollments,
  onViewChange
} : { 
  enrollments: GroupedEnrollment[];
  onViewChange: (view: 'dashboard' | 'profile' | 'enrollments' | 'studyPortal') => void;
}) => {
  const { toast } = useToast();

  const [selectedBatchId, setSelectedBatchId] = useState<string>(enrollments[0]?.course_id || '');
  const [tempSelectedBatchId, setTempSelectedBatchId] = useState<string>(selectedBatchId);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [viewMode, setViewMode] = useState<'main' | 'description'>('main');

  const [fullCourseData, setFullCourseData] = useState<Course | null>(null);
  const [scheduleData, setScheduleData] = useState<BatchScheduleItem[]>([]);
  const [faqs, setFaqs] = useState<CourseFaq[] | undefined>(undefined);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  const contentRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'features', label: 'Features' },
    { id: 'about', label: 'About' },
    { id: 'moreDetails', label: 'Details' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'ssp', label: 'SSP Portal' },
    { id: 'access', label: 'Access' },
    { id: 'faqs', label: 'FAQs' },
  ];

  const currentBatchSummary = enrollments.find(e => e.course_id === selectedBatchId) || enrollments[0];

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedBatchId) return;
      
      setLoadingDetails(true);
      try {
        const [courseResult, scheduleResult, faqResult] = await Promise.all([
          supabase.from('courses').select('*').eq('id', selectedBatchId).maybeSingle(),
          supabase.from('batch_schedule' as any).select('*').eq('course_id', selectedBatchId),
          supabase.from('course_faqs' as any).select('question, answer').eq('course_id', selectedBatchId),
        ]);

        if (courseResult.data) setFullCourseData(courseResult.data as any);
        if (scheduleResult.data) setScheduleData(scheduleResult.data as any);
        if (faqResult.data) setFaqs(faqResult.data as any);

      } catch (err) {
        console.error("Error fetching details", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedBatchId]);

  // --- SCROLL SPY ---
  useEffect(() => {
    if (viewMode !== 'description') return;
    const scrollContainer = contentRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      for (const tab of tabs) {
        const element = document.getElementById(tab.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          if (rect.top - containerRect.top < 150 && rect.bottom - containerRect.top > 50) {
            setActiveTab(tab.id);
            break;
          }
        }
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [viewMode, fullCourseData]);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenSheet = () => {
    setTempSelectedBatchId(selectedBatchId);
    setIsSheetOpen(true);
  };

  const handleContinue = () => {
    setSelectedBatchId(tempSelectedBatchId);
    setIsSheetOpen(false);
    setViewMode('main'); 
    toast({
      title: "Batch Switched",
      description: `You are now viewing ${enrollments.find(e => e.course_id === tempSelectedBatchId)?.title}`,
    });
  };

  const handleDescription = () => {
    setViewMode('description');
  };

  const handleShare = () => {
    if (currentBatchSummary) {
      const shareUrl = `${window.location.origin}/courses/${currentBatchSummary.course_id}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Batch link copied to clipboard!",
      });
    }
  };

  // --- RENDER: FULL DETAIL VIEW (Fixed Layout) ---
  if (viewMode === 'description') {
    return (
      <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 md:-m-6 lg:-m-8 bg-gray-50">
        
        {/* --- FIXED HEADER SECTION --- */}
        <div className="flex-none bg-white z-20 shadow-sm">
           {/* Back Button */}
           <div className="px-4 md:px-6 py-2 border-b border-gray-100">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('main')}
                className="group pl-0 hover:pl-1 hover:bg-transparent text-gray-600 hover:text-gray-900 transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to List
              </Button>
           </div>

           {/* Premium Header Block */}
           <div className="premium-course-header p-6 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-4">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-2 text-blue-200 text-xs font-medium bg-black/20 px-3 py-1 rounded-full w-fit border border-white/10">
                        <BookOpen className="h-3 w-3" />
                        <span>Currently Viewing</span>
                    </div>
                    <Button 
                      onClick={() => handleOpenSheet()} 
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all shadow-sm h-8 text-sm"
                    >
                      Switch Batch <ChevronDown className="ml-2 h-3 w-3" />
                    </Button>
                 </div>

                 <div className="space-y-2">
                   <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                      {fullCourseData?.title || currentBatchSummary.title}
                   </h1>
                   <p className="text-slate-200 max-w-3xl text-sm md:text-base leading-relaxed opacity-90">
                      {fullCourseData?.description || currentBatchSummary.description}
                   </p>
                 </div>
              </div>
           </div>

           {/* Tab Navigation */}
           <CustomDashboardTabNav 
             tabs={tabs} 
             activeTab={activeTab} 
             onTabClick={handleTabClick} 
           />
        </div>

        {/* --- SCROLLABLE CONTENT SECTION --- */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto scrollbar-hide bg-gray-50 p-4 md:p-6 pb-20"
        >
            {loadingDetails ? (
               <div className="flex items-center justify-center h-64">
                 <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
               </div>
            ) : fullCourseData ? (
               <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="space-y-8 pb-12">
                    
                    {/* Video/Features Section: ZERO Padding for full width (px-0) */}
                    <div id="features" className="scroll-mt-32 px-0 pt-0">
                      <FeaturesSection course={fullCourseData} />
                    </div>
                    
                    {/* Text Sections: Standard Padding for Readability (px-5 md:px-8) */}
                    <div className="px-5 md:px-8 space-y-12">
                        <div id="about" className="scroll-mt-32"><AboutSection course={fullCourseData} /></div>
                        <div id="moreDetails" className="scroll-mt-32"><MoreDetailsSection /></div>
                        <div id="schedule" className="scroll-mt-32"><ScheduleSection scheduleData={scheduleData} /></div>
                        <div id="ssp" className="scroll-mt-32"><SSPPortalSection /></div>
                        <div id="access" className="scroll-mt-32"><CourseAccessGuide /></div>
                        <div id="faqs" className="scroll-mt-32"><FAQSection faqs={faqs || []} /></div>
                    </div>
                  </div>
               </div>
            ) : (
               <div className="text-center py-10 text-gray-500">
                 Failed to load details.
               </div>
            )}
        </div>
        
        {/* --- SIDEBAR (Switch Batch) --- */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-bold">Select Batch</SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {enrollments.length > 1 ? (
                 enrollments.map((batch) => (
                  <div 
                    key={batch.course_id}
                    onClick={() => setTempSelectedBatchId(batch.course_id)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden",
                      tempSelectedBatchId === batch.course_id 
                        ? "border-blue-600 bg-blue-50/50 shadow-sm" 
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className={cn(
                          "font-semibold text-base",
                          tempSelectedBatchId === batch.course_id ? "text-blue-700" : "text-gray-900"
                        )}>
                          {batch.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {batch.status === 'Ongoing' ? 'Active Batch' : 'Expired'}
                        </p>
                      </div>
                      
                      <div className={cn(
                        "h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all",
                        tempSelectedBatchId === batch.course_id 
                          ? "border-blue-600 bg-blue-600" 
                          : "border-gray-300 bg-white"
                      )}>
                        {tempSelectedBatchId === batch.course_id && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                   <Book className="h-8 w-8 text-gray-400 mb-2" />
                   <p className="text-gray-600 font-medium">No other enrolled courses found.</p>
                   <p className="text-xs text-gray-500 mt-1">You are currently enrolled in only one batch.</p>
                </div>
              )}
            </div>

            {enrollments.length > 1 && (
              <SheetFooter className="pt-4 mt-auto border-t border-gray-100">
                <Button 
                  onClick={handleContinue} 
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Switch to Selected
                </Button>
              </SheetFooter>
            )}
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // --- RENDER: MAIN LIST VIEW ---
  return (
    <div className="space-y-8">
      {/* --- Header with Background Color Block --- */}
      <div className="premium-course-header rounded-xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm text-blue-200 font-medium uppercase tracking-wider">Selected Batch</p>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity group"
              onClick={handleOpenSheet}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {currentBatchSummary?.title}
              </h1>
              <ChevronDown className="h-6 w-6 text-blue-200 group-hover:text-white transition-colors mt-1" />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/10 text-white">
                <MoreVertical className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDescription} className="cursor-pointer">
                <Info className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share Batch</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* --- BATCH CARD --- */}
      <section>
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-bold text-gray-900">Quick Access</h2>
           <Button variant="link" className="text-blue-600 p-0 h-auto" onClick={() => setViewMode('description')}>
             View Full Details <ArrowRight className="ml-1 h-4 w-4" />
           </Button>
        </div>
        {currentBatchSummary && (
          <EnrollmentListItem 
            enrollment={currentBatchSummary} 
            onClick={() => setViewMode('description')} 
          />
        )}
      </section>

      {/* --- MY CLASSROOM SECTION (Replaces Explore) --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-12">
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Classroom</h2>
            <p className="text-gray-600 mt-1">Quick access to your learning tools</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: My Batches (Redirect to Enrollment Tab) */}
            <div 
              onClick={() => onViewChange('enrollments')}
              className="bg-gray-50/50 hover:bg-gray-100 transition-colors border border-gray-200 rounded-lg p-6 h-full flex flex-col relative cursor-pointer group"
            >
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="h-5 w-5 text-gray-500" />
              </div>
              <Layers className="h-8 w-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900">My Batches</h3>
              <p className="text-gray-600 text-sm mt-1">View currently enrolled & ongoing courses</p>
            </div>

            {/* Card 2: Dashboard (Redirect to SSP Portal) */}
            <div 
              onClick={() => window.open('https://ssp.unknowniitians.live', '_blank')}
              className="bg-gray-50/50 hover:bg-gray-100 transition-colors border border-gray-200 rounded-lg p-6 h-full flex flex-col relative cursor-pointer group"
            >
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="h-5 w-5 text-gray-500" />
              </div>
              <LayoutDashboard className="h-8 w-8 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
              <p className="text-gray-600 text-sm mt-1">Go to SSP Portal</p>
            </div>

            {/* Card 3: Library (Redirect to Exam Prep) */}
            <Link to="/exam-preparation" className="block group h-full">
              <div className="bg-gray-50/50 hover:bg-gray-100 transition-colors border border-gray-200 rounded-lg p-6 h-full flex flex-col relative">
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
                  <ArrowRight className="h-5 w-5 text-gray-500" />
                </div>
                <Library className="h-8 w-8 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold text-gray-900">Library</h3>
                <p className="text-gray-600 text-sm mt-1">Access the Digital Library</p>
              </div>
            </Link>
            
          </div>
        </div>
      </div>
      
      {/* Footer Message */}
      <div className="flex items-center justify-start pt-6 pb-8 text-gray-600 text-xl font-semibold">
        <span className="text-red-500 mr-2">❤️</span> from UnknownIITians
      </div>
    </div>
  );
};

// --- RECOMMENDATION LOGIC (Unchanged) ---
const getSortableLevel = (course: any): number => {
  const level = course.level; 
  const status = course.student_status; 

  if (level === 'Foundation') return 1;
  if (level === 'Diploma') return 2;
  if (level === 'Degree') return 3;

  if (status === 'Class 11') return 11;
  if (status === 'Class 12') return 12;
  if (status === 'Dropper') return 13;

  return 99;
};

const sortRecommendedCourses = (courses: Course[]): Course[] => {
  return courses.sort((a, b) => {
    // 1. Sort by Level/Class 
    const levelA = getSortableLevel(a);
    const levelB = getSortableLevel(b);
    if (levelA !== levelB) {
      return levelA - levelB;
    }

    // 2. Sort by Start Date 
    const now = new Date().getTime();
    const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
    const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
    const aIsFuture = dateA > now;
    const bIsFuture = dateB > now;

    if (aIsFuture && !bIsFuture) return -1; 
    if (!aIsFuture && bIsFuture) return 1;  

    if (dateA !== dateB) {
      return dateA - dateB; 
    }

    // 3. Sort by Created Date 
    const createdA = new Date(a.created_at).getTime();
    const createdB = new Date(b.created_at).getTime();
    return createdB - createdA;
  });
};

const buildProfileQuery = (profile: UserProfile | null, level: 1 | 2): any => {
  if (!profile || !profile.program_type) return null;

  let query: any = supabase
    .from('courses')
    .select('*');
  
  if (profile.program_type === 'IITM_BS') {
    query = query.eq('exam_category', 'IITM BS'); 
    if (level === 2 && profile.branch) {
      query = query.eq('branch', profile.branch);
    }
  } else if (profile.program_type === 'COMPETITIVE_EXAM') {
    query = query.eq('exam_category', 'COMPETITIVE_EXAM'); 
    if (level === 2 && profile.exam_type) {
      query = query.eq('exam_type', profile.exam_type);
    }
  } else {
    query = query.eq('exam_category', profile.program_type); 
  }
  return query;
};

async function fetchRecommendedCourses(profile: UserProfile | null): Promise<Course[]> {
  const today = new Date().toISOString();

  const getValidCourses = async (
    queryBuilder: any 
  ): Promise<Course[]> => {
    if (!queryBuilder) return [];
    
    const { data, error } = await queryBuilder.or(`end_date.gt.${today},end_date.is.null`);
    
    if (error) {
      console.error("Error fetching courses:", error.message); 
      return [];
    }
    return (data as Course[]) || [];
  };

  try {
    const level2Query = buildProfileQuery(profile, 2);
    const level2Courses = await getValidCourses(level2Query);

    const level1Query = buildProfileQuery(profile, 1);
    const level1Courses = await getValidCourses(level1Query);
    
    const allCourses = new Map<string, Course>();
    
    level2Courses.forEach(course => allCourses.set(course.id, course));
    level1Courses.forEach(course => {
      if (!allCourses.has(course.id)) allCourses.set(course.id, course);
    });
    
    if (allCourses.size === 0) {
      console.log("No profile-matched courses found. Showing diverse recommendations.");
      
      const diverseQuery = supabase
        .from('courses')
        .select('*')
        .or(`end_date.gt.${today},end_date.is.null`)
        .limit(20); 
      
      const { data: diverseData, error: diverseError } = await diverseQuery;
      
      if (diverseError) {
        console.error("Error fetching diverse courses:", diverseError.message);
      } else if (diverseData) {
        const bestsellers = diverseData.filter(c => c.bestseller);
        const featured = diverseData.filter(c => c.is_live && !c.bestseller);
        const recent = diverseData.filter(c => !c.bestseller && !c.is_live);
        
        [...bestsellers, ...featured, ...recent].forEach(course => {
          if (!allCourses.has(course.id) && allCourses.size < 15) {
            allCourses.set(course.id, course as Course);
          }
        });
      }
    }

    const combinedList = Array.from(allCourses.values());
    const sortedList = sortRecommendedCourses(combinedList);

    return sortedList.slice(0, 3);

  } catch (error: any) { 
    console.error("Error in fetchRecommendedCourses:", error.message || error);
    return []; 
  }
}

// --- Internal Component (Safe) ---
const StudyPortalContent: React.FC<StudyPortalProps> = ({ profile, onViewChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getFilteredContent, contentLoading } = useBackend();
  
  const [groupedEnrollments, setGroupedEnrollments] = useState<GroupedEnrollment[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const filteredContent = getFilteredContent(profile);
  const { notes, pyqs } = filteredContent;

  const hasEnrollments = groupedEnrollments.length > 0;

  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    const fetchPortalData = async () => {
      setDataLoading(true);
      try {
        const [enrollmentsResult, recCoursesResult] = await Promise.all([
          supabase
            .from('enrollments')
            .select(`
              id, course_id, subject_name,
              courses (
                id, title, description, start_date, end_date, image_url, price,
                exam_category, level, bestseller, rating, students_enrolled
              )
            `)
            .eq('user_id', user.id),
          fetchRecommendedCourses(profile)
        ]);

        const { data: rawData, error: enrollError } = enrollmentsResult;
        if (enrollError) throw enrollError;

        setRecommendedCourses(recCoursesResult);

        if (rawData && rawData.length > 0) {
          const today = new Date();
          const enrollmentsMap = new Map<string, GroupedEnrollment>();
          for (const enrollment of rawData as unknown as RawEnrollment[]) {
            if (!enrollment.courses) continue; 
            const course_id = enrollment.course_id;
            const endDate = enrollment.courses.end_date ? new Date(enrollment.courses.end_date) : null;
            let status: GroupedEnrollment['status'] = endDate ? (today > endDate ? 'Batch Expired' : 'Ongoing') : 'Ongoing';

            if (!enrollmentsMap.has(course_id)) {
              enrollmentsMap.set(course_id, {
                course_id: course_id,
                title: enrollment.courses.title || 'Unnamed Batch',
                description: enrollment.courses.description,
                start_date: enrollment.courses.start_date,
                end_date: enrollment.courses.end_date,
                status: status,
                subjects: [],
                image_url: enrollment.courses.image_url,
                price: enrollment.courses.price,
                exam_category: enrollment.courses.exam_category,
                level: enrollment.courses.level,
                bestseller: enrollment.courses.bestseller,
                rating: enrollment.courses.rating,
                students_enrolled: enrollment.courses.students_enrolled,
              });
            }
            const groupedEntry = enrollmentsMap.get(course_id)!;
            if (enrollment.subject_name && !groupedEntry.subjects.includes(enrollment.subject_name)) {
              groupedEntry.subjects.push(enrollment.subject_name);
            }
          }
          setGroupedEnrollments(Array.from(enrollmentsMap.values()));
        } else {
          setGroupedEnrollments([]);
        }

      } catch (error: any) {
        toast({
          title: "Error",
          description: "Could not load your study portal. " + (error.message || "Unknown error"),
          variant: "destructive",
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchPortalData();
  }, [user, profile, toast]); 

  const isLoading = dataLoading || contentLoading;

  return (
    <div className="max-w-7xl mx-auto">
      {isLoading && !hasEnrollments ? (
         <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-royal" />
        </div>
      ) : hasEnrollments ? (
        <EnrolledView 
          enrollments={groupedEnrollments} 
          onViewChange={onViewChange} // Pass onViewChange to EnrolledView
        />
      ) : (
        <NotEnrolledView 
          profile={profile}
          recommendedCourses={recommendedCourses} 
          isLoading={isLoading}
          notes={notes}
          pyqs={pyqs}
          onEditProfile={() => onViewChange('profile')}
        />
      )}
    </div>
  );
};

// --- Main Component ---
const StudyPortal: React.FC<StudyPortalProps> = ({ profile, onViewChange }) => {
  if (!profile || !profile.program_type) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-white rounded-lg shadow-sm border border-gray-200 text-center">
        <Target className="h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to your Dashboard!</h2>
        <p className="text-gray-600">
          Please set your "Focus Area" to unlock your personalized study portal.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          (A pop-up should have appeared. If not, please click your profile icon in the top right.)
        </p>
      </div>
    );
  }

  return <StudyPortalContent profile={profile} onViewChange={onViewChange} />;
};

export default StudyPortal;
