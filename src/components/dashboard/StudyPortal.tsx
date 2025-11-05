import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Loader2, 
  Book, 
  BookOpen,
  Users, 
  MessageSquare, 
  ChevronRight, 
  Inbox, 
  ArrowRight,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added for new tab bar
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { Tables } from '../../integrations/supabase/types';
import { RecommendedBatchCard } from './RecommendedBatchCard';
import { useBackend } from '../BackendIntegratedWrapper'; 

// --- Types ---
type UserProfile = Tables<'profiles'>;
type Course = Tables<'courses'>;

// ... (RawEnrollment and GroupedEnrollment types remain the same) ...
type RawEnrollment = {
  id: string;
  course_id: string;
  subject_name: string | null;
  courses: {
    id: string;
    title: string | null;
    start_date: string | null; 
    end_date: string | null;   
    image_url: string | null;
    price: number | null;
  } | null;
};
type GroupedEnrollment = {
  course_id: string;
  title: string;
  start_date: string | null; 
  end_date: string | null;   
  status: 'Ongoing' | 'Batch Expired' | 'Unknown';
  subjects: string[];
  image_url: string | null;
  price: number | null;
};


// ... (EnrollmentListItem component remains the same) ...
const EnrollmentListItem = ({ enrollment }: { enrollment: GroupedEnrollment }) => {
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

  return (
    <Link to={`/courses/${enrollment.course_id}`} className="block group">
      <Card className="w-full relative overflow-hidden flex flex-col rounded-lg border border-gray-200 group-hover:border-black transition-all duration-200">
        <CardContent className="flex items-center gap-5 p-5">
          <div className="flex-shrink-0 w-36 sm:w-48 aspect-video overflow-hidden rounded-lg bg-gray-50">
            <img 
              src={enrollment.image_url || "/lovable-uploads/logo_ui_new.png"}
              alt={enrollment.title} 
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="flex-grow space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-0">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900 pr-4">
                {enrollment.title}
              </CardTitle>
              <div className="flex-shrink-0 mt-1 sm:mt-0">
                <StatusIndicator />
              </div>
            </div>
            <p className="text-base text-gray-600 flex items-center gap-1.5">
              <span>{formattedEndDate}</span>
              <span>•</span>
              <PriceDisplay />
            </p>
          </div>
          <ChevronRight className="h-6 w-6 text-gray-400 ml-2 flex-shrink-0" />
        </CardContent>
        {enrollment.status === 'Batch Expired' && (
          <div className="bg-red-50 text-red-700 text-base p-4 text-center">
            This batch got expired on {formattedEndDate}!
          </div>
        )}
      </Card>
    </Link>
  );
};


// --- View 1: Student IS Enrolled ---
// This component is now only for the "My Batches" tab content
const EnrolledView = ({ 
  enrollments
} : { 
  enrollments: GroupedEnrollment[]
}) => {
  return (
    <div className="space-y-6 pt-4"> {/* Added padding-top */}
      {/* 1. My Batches Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900">My Batches</h2>
        <p className="text-gray-600 mt-1">Continue your learning journey</p>
        <div className="space-y-4 mt-6">
          {enrollments.map((enrollment) => (
            <EnrollmentListItem key={enrollment.course_id} enrollment={enrollment} />
          ))}
        </div>
      </section>

      {/* Quick Access section is removed from here as it's part of the main 
        dashboard, or could be its own tab if needed. 
        This view is now *only* for "My Batches".
      */}
    </div>
  );
};


// --- View 2: Student is NOT Enrolled ---
// This component is now only for the "Recommended" tab content
const NotEnrolledView = ({ 
  recommendedCourses, 
  notes, 
  pyqs 
} : { 
  recommendedCourses: Course[], 
  notes: any[], 
  pyqs: any[] 
}) => (
  <div className="space-y-10 pt-4"> {/* Added padding-top */}
    
    {/* Section 1: Top Recommended Batches */}
    <section>
      <h2 className="text-2xl font-bold text-gray-900">Top Recommended Batches</h2>
      <p className="text-gray-600 mt-1">Based on your focus goal and popular courses</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {recommendedCourses.length > 0 ? (
          recommendedCourses.map((course) => (
            <RecommendedBatchCard key={course.id} course={course} />
          ))
        ) : (
          <p className="text-gray-500 col-span-3">No specific recommendations found. Check out all our courses!</p>
        )}
      </div>
      
      <div className="text-center mt-8">
        <Button variant="outline" asChild className="px-8">
          <Link to="/courses">View All Batches</Link>
        </Button>
      </div>
    </section>
    
    {/* Section 2: Quick Access Section (Moved from EnrolledView) */}
    <section>
        <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
        <p className="text-gray-600 mt-1">Your personalized free notes and PYQs</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Notes Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">My Notes</CardTitle>
              <BookOpen className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              {notes.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {notes.slice(0, 3).map((note: any) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm truncate text-gray-900">{note.title}</p>
                    </div>
                  ))}
                  <Link to="/exam-preparation">
                    <Button variant="outline" size="sm" className="w-full mt-3">View All Notes</Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-500 pt-2">Your personalized notes will appear here.</p>
              )}
            </CardContent>
          </Card>
          {/* PYQs Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">My PYQs</CardTitle>
              <FileText className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              {pyqs.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {pyqs.slice(0, 3).map((pyq: any) => (
                    <div key={pyq.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm truncate text-gray-900">{pyq.title}</p>
                    </div>
                  ))}
                  <Link to="/exam-preparation">
                    <Button variant="outline" size="sm" className="w-full mt-3">View All PYQs</Button>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-500 pt-2">Your personalized PYQs will appear here.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

    {/* Section 3: Explore */}
    <section>
      <h2 className="text-2xl font-bold text-gray-900">Explore</h2>
      <p className="text-gray-600 mt-1">Get Additional guidance with these exclusive features</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="bg-gray-50/50 hover:bg-gray-100 transition-colors border-gray-200">
          <CardContent className="p-6">
            <Book className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Digital Library</h3>
            <p className="text-gray-600 text-sm mt-1">Access all your free content here</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50/50 hover:bg-gray-100 transition-colors border-gray-200">
          <CardContent className="p-6">
            <Users className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Mentorship</h3>
            <p className="text-gray-600 text-sm mt-1">Get free Guidance about your career growth, upskilling and internships</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50/50 hover:bg-gray-100 transition-colors border-gray-200">
          <CardContent className="p-6">
            <MessageSquare className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Ask Doubts</h3>
            <p className="text-gray-600 text-sm mt-1">Ask doubts in the class and get instantly answered</p>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
);

// --- New Recommendation Logic ---
/**
 * Fetches recommended courses with a 2-level filter and fallback.
 * Level 2: Filters by program_type AND branch/exam_type.
 * Level 1: Filters by program_type (e.g., 'IITM BS') only.
 * Level 0: Fetches 3 most recent courses, no filter.
 */
async function fetchRecommendedCourses(profile: UserProfile | null): Promise<Course[]> {
  
  const buildQuery = (level: 0 | 1 | 2) => {
    let query = supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (level === 0 || !profile) return query; // Level 0 (generic) or no profile

    // --- Level 1+ Filtering ---
    if (profile.program_type === 'IITM_BS') {
      query = query.eq('exam_category', 'IITM BS'); // Level 1 filter
      if (level === 2 && profile.branch) {
        query = query.eq('branch', profile.branch); // Level 2 filter
      }
    } else if (profile.program_type === 'COMPETITIVE_EXAM') {
      query = query.eq('exam_category', 'COMPETITIVE_EXAM'); // Level 1 filter
      if (level === 2 && profile.exam_type) {
        query = query.eq('exam_type', profile.exam_type); // Level 2 filter
      }
    } else {
      // No matching program type, fall back to generic
      return buildQuery(0);
    }
    
    return query;
  };

  try {
    // Try Level 2 (Specific)
    const { data: level2Data, error: level2Error } = await buildQuery(2);
    if (level2Error) throw level2Error;
    if (level2Data && level2Data.length > 0) {
      return level2Data;
    }

    // Try Level 1 (Broader)
    const { data: level1Data, error: level1Error } = await buildQuery(1);
    if (level1Error) throw level1Error;
    if (level1Data && level1Data.length > 0) {
      return level1Data;
    }

    // Fallback to Level 0 (Generic)
    const { data: level0Data, error: level0Error } = await buildQuery(0);
    if (level0Error) throw level0Error;
    return level0Data || [];

  } catch (error) {
    console.error("Error fetching recommended courses:", error);
    return []; // Return empty array on error
  }
}


// --- Main Study Portal Component ---
interface StudyPortalProps {
  profile: UserProfile | null;
  onViewChange: (view: 'dashboard' | 'profile' | 'enrollments' | 'studyPortal') => void;
}

const StudyPortal: React.FC<StudyPortalProps> = ({ profile, onViewChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getFilteredContent, contentLoading } = useBackend();
  
  const [groupedEnrollments, setGroupedEnrollments] = useState<GroupedEnrollment[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // New state for the tabs
  const [activeTab, setActiveTab] = useState<'enrolled' | 'recommended'>('recommended');

  const filteredContent = getFilteredContent(profile);
  const { notes, pyqs } = filteredContent;

  useEffect(() => {
    if (!user || !profile) {
      setDataLoading(false);
      return;
    }

    const fetchPortalData = async () => {
      setDataLoading(true);
      try {
        // --- Fetch both enrollments and recommendations ---
        
        // 1. Fetch Enrollments
        const { data: rawData, error: enrollError } = await supabase
          .from('enrollments')
          .select(`
            id, course_id, subject_name,
            courses (id, title, start_date, end_date, image_url, price)
          `)
          .eq('user_id', user.id);
        
        if (enrollError) throw enrollError;

        // 2. Fetch Recommendations (using new smart function)
        const recCourses = await fetchRecommendedCourses(profile);
        setRecommendedCourses(recCourses);

        // 3. Process Enrollments
        if (rawData && rawData.length > 0) {
          const today = new Date();
          const enrollmentsMap = new Map<string, GroupedEnrollment>();
          for (const enrollment of rawData as RawEnrollment[]) {
            if (!enrollment.courses) continue; 
            const course_id = enrollment.course_id;
            const endDate = enrollment.courses.end_date ? new Date(enrollment.courses.end_date) : null;
            let status: GroupedEnrollment['status'] = endDate ? (today > endDate ? 'Batch Expired' : 'Ongoing') : 'Ongoing';

            if (!enrollmentsMap.has(course_id)) {
              enrollmentsMap.set(course_id, {
                course_id: course_id,
                title: enrollment.courses.title || 'Unnamed Batch',
                start_date: enrollment.courses.start_date,
                end_date: enrollment.courses.end_date,
                status: status,
                subjects: [],
                image_url: enrollment.courses.image_url,
                price: enrollment.courses.price,
              });
            }
            const groupedEntry = enrollmentsMap.get(course_id)!;
            if (enrollment.subject_name && !groupedEntry.subjects.includes(enrollment.subject_name)) {
              groupedEntry.subjects.push(enrollment.subject_name);
            }
          }
          const processedEnrollments = Array.from(enrollmentsMap.values());
          setGroupedEnrollments(processedEnrollments);
          
          // 4. Set default tab based on enrollments
          setActiveTab('enrolled'); // User has enrollments, so default to that tab
        } else {
          setGroupedEnrollments([]);
          setActiveTab('recommended'); // User has no enrollments, default to recommendations
        }

      } catch (error: any) {
        toast({
          title: "Error",
          description: "Could not load your study portal. " + error.message,
          variant: "destructive",
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchPortalData();
  }, [user, profile, toast]);

  // Combined loading state
  const isLoading = dataLoading || contentLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-royal" />
      </div>
    );
  }

  return (
    // Changed to smaller spacing
    <div className="max-w-7xl mx-auto space-y-4"> 
      
      {/* Header Nav - Now left-aligned and no bottom margin */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onViewChange('dashboard')}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Study Portal</h1>
      </div>

      {/* --- New Tab Bar --- */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="enrolled" disabled={groupedEnrollments.length === 0}>
            My Batches
          </TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* --- Conditional Content Based on Tab --- */}
      {activeTab === 'enrolled' && (
        <EnrolledView 
          enrollments={groupedEnrollments} 
        />
      )}
      
      {activeTab === 'recommended' && (
        <NotEnrolledView 
          recommendedCourses={recommendedCourses}
          notes={notes}
          pyqs={pyqs}
        />
      )}
    </div>
  );
};

export default StudyPortal;
