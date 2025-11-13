import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Book, 
  BookOpen,
  Users, 
  MessageSquare, 
  ChevronRight, 
  FileText,
  Target // Added Target icon for the welcome message
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { Tables } from '../../integrations/supabase/types';
import RecommendedBatchesSection from './RecommendedBatchesSection';
import { useBackend } from '../BackendIntegratedWrapper';
import ProfileCompletionBanner from './ProfileCompletionBanner';

// --- Types ---
type UserProfile = Tables<'profiles'>;
type Course = Tables<'courses'> & {
  discounted_price?: number | null;
};

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

// --- Props Interface (used by both components) ---
interface StudyPortalProps {
  profile: UserProfile | null;
  onViewChange: (view: 'dashboard' | 'profile' | 'enrollments' | 'studyPortal') => void;
}

// --- Re-usable Enrollment List Item ---
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
const EnrolledView = ({ 
  enrollments
} : { 
  enrollments: GroupedEnrollment[]
}) => {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-bold text-gray-900">My Batches</h2>
        <p className="text-gray-600 mt-1">Continue your learning journey</p>
        <div className="space-y-4 mt-6">
          {enrollments.map((enrollment) => (
            <EnrollmentListItem key={enrollment.course_id} enrollment={enrollment} />
          ))}
        </div>
      </section>
    </div>
  );
};


// --- View 2: Student is NOT Enrolled ---
const NotEnrolledView = ({ 
  profile,
  recommendedCourses,
  isLoading,
  notes, 
  pyqs,
  onEditProfile
} : { 
  profile: any;
  recommendedCourses: Course[], 
  isLoading: boolean,
  notes: any[], 
  pyqs: any[];
  onEditProfile: () => void;
}) => {
  const hasContent = notes.length > 0 || pyqs.length > 0;
  
  return (
    <div className="space-y-10">
      {/* Profile Completion Banner */}
      <ProfileCompletionBanner profile={profile} onEditProfile={onEditProfile} />
      
      {/* Recommended Courses */}
      <RecommendedBatchesSection 
        recommendedCourses={recommendedCourses} 
        loading={isLoading} 
      />
    
      {/* Quick Access - Only show if user has content */}
      {hasContent && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900">Quick Access</h2>
          <p className="text-gray-600 mt-1">Your personalized free notes and PYQs</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Notes Card */}
            {notes.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">My Notes</CardTitle>
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}
            
            {/* PYQs Card */}
            {pyqs.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">My PYQs</CardTitle>
                  <FileText className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Explore</h2>
        <p className="text-gray-600 mt-1">Get additional guidance with these exclusive features</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Link to="/exam-preparation" className="block">
            <Card className="bg-gray-50/50 hover:bg-gray-100 transition-colors border-gray-200 h-full">
              <CardContent className="p-6">
                <Book className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Digital Library</h3>
                <p className="text-gray-600 text-sm mt-1">Access all your free content here</p>
              </CardContent>
            </Card>
          </Link>
          <Card className="bg-gray-50/50 hover:bg-gray-100 transition-colors border-gray-200">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Mentorship</h3>
              <p className="text-gray-600 text-sm mt-1">Get free guidance about your career growth, upskilling and internships</p>
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
};


// --- NEW RECOMMENDATION LOGIC ---

/**
 * Helper to get a numeric, sortable value for a course's level or class.
 */
const getSortableLevel = (course: any): number => {
  const level = course.level; // 'Foundation', 'Diploma', 'Degree'
  const status = course.student_status; // 'Class 11', 'Class 12', 'Dropper'

  if (level === 'Foundation') return 1;
  if (level === 'Diploma') return 2;
  if (level === 'Degree') return 3;

  if (status === 'Class 11') return 11;
  if (status === 'Class 12') return 12;
  if (status === 'Dropper') return 13;

  return 99;
};

/**
 * Sorts courses based on the new logic
 */
const sortRecommendedCourses = (courses: Course[]): Course[] => {
  return courses.sort((a, b) => {
    // 1. Sort by Level/Class (Ascending)
    const levelA = getSortableLevel(a);
    const levelB = getSortableLevel(b);
    if (levelA !== levelB) {
      return levelA - levelB;
    }

    // 2. Sort by Start Date (Ascending - earliest first)
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

    // 3. Sort by Created Date (Descending - newest first)
    const createdA = new Date(a.created_at).getTime();
    const createdB = new Date(b.created_at).getTime();
    return createdB - createdA;
  });
};

/**
 * Builds a Supabase query for Level 1 or 2 filtering.
 * Returns null if profile is incomplete, which triggers fallback to show all courses.
 */
const buildProfileQuery = (profile: UserProfile | null, level: 1 | 2): any => {
  // If no profile or program type, return null to trigger fallback
  if (!profile || !profile.program_type) return null;

  let query: any = supabase
    .from('courses')
    .select('*');
  
  // STRICT FILTERING based on profile
  if (profile.program_type === 'IITM_BS') {
    query = query.eq('exam_category', 'IITM BS'); // Level 1
    if (level === 2 && profile.branch) {
      query = query.eq('branch', profile.branch); // Level 2 - adds branch filter
    }
  } else if (profile.program_type === 'COMPETITIVE_EXAM') {
    query = query.eq('exam_category', 'COMPETITIVE_EXAM'); // Level 1
    if (level === 2 && profile.exam_type) {
      query = query.eq('exam_type', profile.exam_type); // Level 2 - adds exam_type filter
    }
  } else {
    // For 'Upskilling' or other program types
    query = query.eq('exam_category', profile.program_type); 
  }
  return query;
};

/**
 * Fetches recommended courses with enhanced 3-level waterfall filter:
 * - Level 2: Most specific (profile + branch/exam_type)
 * - Level 1: Broader (profile only)
 * - Level 0: Intelligent fallback with diverse courses
 */
async function fetchRecommendedCourses(profile: UserProfile | null): Promise<Course[]> {
  const today = new Date().toISOString();

  // Helper to get non-expired courses from a query
  const getValidCourses = async (
    queryBuilder: any 
  ): Promise<Course[]> => {
    if (!queryBuilder) return [];
    
    // Filter: (end_date > today) OR (end_date IS NULL)
    const { data, error } = await queryBuilder.or(`end_date.gt.${today},end_date.is.null`);
    
    if (error) {
      console.error("Error fetching courses:", error.message); 
      return [];
    }
    return (data as Course[]) || [];
  };

  try {
    // Level 2: Most specific filtering (profile + detailed filters)
    const level2Query = buildProfileQuery(profile, 2);
    const level2Courses = await getValidCourses(level2Query);

    // Level 1: Broader filtering (profile only, no branch/exam_type)
    const level1Query = buildProfileQuery(profile, 1);
    const level1Courses = await getValidCourses(level1Query);
    
    // Combine Level 2 and Level 1 courses, de-duplicating
    const allCourses = new Map<string, Course>();
    
    level2Courses.forEach(course => allCourses.set(course.id, course));
    level1Courses.forEach(course => {
      if (!allCourses.has(course.id)) allCourses.set(course.id, course);
    });
    
    // Level 0: Enhanced Fallback - Show diverse popular courses when profile incomplete
    if (allCourses.size === 0) {
      console.log("No profile-matched courses found. Showing diverse recommendations.");
      
      // Fetch a diverse set of courses: featured, popular, and recent
      const diverseQuery = supabase
        .from('courses')
        .select('*')
        .or(`end_date.gt.${today},end_date.is.null`)
        .limit(20); // Get more courses for better diversity
      
      const { data: diverseData, error: diverseError } = await diverseQuery;
      
      if (diverseError) {
        console.error("Error fetching diverse courses:", diverseError.message);
      } else if (diverseData) {
        // Prioritize: bestsellers, then featured, then recent
        const bestsellers = diverseData.filter(c => c.bestseller);
        const featured = diverseData.filter(c => c.is_live && !c.bestseller);
        const recent = diverseData.filter(c => !c.bestseller && !c.is_live);
        
        // Add in priority order, ensuring diversity
        [...bestsellers, ...featured, ...recent].forEach(course => {
          if (!allCourses.has(course.id) && allCourses.size < 15) {
            allCourses.set(course.id, course as Course);
          }
        });
      }
    }

    // Apply advanced sorting logic
    const combinedList = Array.from(allCourses.values());
    const sortedList = sortRecommendedCourses(combinedList);

    // Return top 3 recommendations
    return sortedList.slice(0, 3);

  } catch (error: any) { 
    console.error("Error in fetchRecommendedCourses:", error.message || error);
    return []; 
  }
}
// --- END OF NEW RECOMMENDATION LOGIC ---


/**
 * --- NEW INTERNAL COMPONENT ---
 * This component holds all the logic that *requires* a valid profile.
 * It will only be rendered by the main StudyPortal component if the profile is valid.
 */
const StudyPortalContent: React.FC<StudyPortalProps> = ({ profile, onViewChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getFilteredContent, contentLoading } = useBackend();
  
  const [groupedEnrollments, setGroupedEnrollments] = useState<GroupedEnrollment[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // This is now SAFE because we know 'profile' is not null here.
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
        // This is also SAFE because 'profile' is not null.
        const [enrollmentsResult, recCoursesResult] = await Promise.all([
          supabase
            .from('enrollments')
            .select(`
              id, course_id, subject_name,
              courses (id, title, start_date, end_date, image_url, price)
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


/**
 * --- MAIN STUDY PORTAL COMPONENT ---
 * This is the component exported. It now acts as a "guard" or "router".
 * It checks for a valid profile *before* rendering the logic-heavy component.
 */
const StudyPortal: React.FC<StudyPortalProps> = ({ profile, onViewChange }) => {

  // --- THE ROBUST FIX ---
  // If the profile is missing or the program_type isn't set, show a
  // welcome/prompt message instead of trying to render the portal.
  // This prevents all downstream hooks from crashing.
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

  // If the profile is valid, render the actual portal content.
  return <StudyPortalContent profile={profile} onViewChange={onViewChange} />;
};

export default StudyPortal;
