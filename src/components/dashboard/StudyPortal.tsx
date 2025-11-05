import React, { useState, useEffect } from 'react'; // <-- This is the corrected line
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Book, 
  BookOpen,
  Users, 
  MessageSquare, 
  ChevronRight, 
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import { Tables } from '../../integrations/supabase/types';
// Import the universal section
import RecommendedBatchesSection from './RecommendedBatchesSection';
import { useBackend } from '../BackendIntegratedWrapper'; 

// --- Types ---
type UserProfile = Tables<'profiles'>;
type Course = Tables<'courses'> & {
  original_price?: number | null;
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

// --- Re-usable Enrollment List Item ---
const EnrollmentListItem = ({ enrollment }: { enrollment: GroupedEnrollment }) => {
  // ... (This component is unchanged)
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
  // ... (This component is unchanged)
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
  recommendedCourses,
  isLoading,
  notes, 
  pyqs 
} : { 
  recommendedCourses: Course[], 
  isLoading: boolean,
  notes: any[], 
  pyqs: any[] 
}) => (
  // ... (This component is unchanged)
  <div className="space-y-10">
    <RecommendedBatchesSection 
      courses={recommendedCourses} 
      isLoading={isLoading} 
    />
    
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


// --- NEW RECOMMENDATION LOGIC ---

/**
 * Helper to get a numeric, sortable value for a course's level or class.
 * Lower numbers are sorted first (ascending).
 */
const getSortableLevel = (course: Course): number => {
  const level = course.level; // 'Foundation', 'Diploma', 'Degree'
  const status = course.student_status; // 'Class 11', 'Class 12', 'Dropper'

  // IITM BS Levels
  if (level === 'Foundation') return 1;
  if (level === 'Diploma') return 2;
  if (level === 'Degree') return 3;

  // Competitive Exam Levels
  if (status === 'Class 11') return 11;
  if (status === 'Class 12') return 12;
  if (status === 'Dropper') return 13;

  // Fallback for any other/null values
  return 99;
};

/**
 * Sorts courses based on the new logic:
 * 1. Ascending Level (Foundation -> Diploma -> Degree, or Class 11 -> 12 -> Dropper)
 * 2. Ascending Start Date (earliest first)
 * 3. Descending Created Date (newest first)
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
    // Dates in the future are prioritized. null/Infinity dates go to the end.
    const now = new Date().getTime();
    const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
    const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;

    // Prioritize future dates over past dates
    const aIsFuture = dateA > now;
    const bIsFuture = dateB > now;

    if (aIsFuture && !bIsFuture) return -1; // a comes first
    if (!aIsFuture && bIsFuture) return 1;  // b comes first

    // If both are future or both are past, sort by date
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
 * Fetches recommended courses with a 2-level filter,
 * then applies the new advanced sorting.
 */
async function fetchRecommendedCourses(profile: UserProfile | null): Promise<Course[]> {
  // 1. Build the query to FILTER the courses
  const buildQuery = (level: 0 | 1 | 2) => {
    let query = supabase
      .from('courses')
      .select('*, original_price'); // Fetch all matching courses
    
    if (level === 0 || !profile) return query; // Level 0 (generic)

    if (profile.program_type === 'IITM_BS') {
      query = query.eq('exam_category', 'IITM BS'); // Level 1
      if (level === 2 && profile.branch) {
        query = query.eq('branch', profile.branch); // Level 2
      }
    } else if (profile.program_type === 'COMPETITIVE_EXAM') {
      query = query.eq('exam_category', 'COMPETITIVE_EXAM'); // Level 1
      if (level === 2 && profile.exam_type) {
        query = query.eq('exam_type', profile.exam_type); // Level 2
      }
    } else {
      return buildQuery(0); // Fallback
    }
    return query;
  };

  try {
    let courses: Course[] = [];

    // 2. Try to fetch Level 2 (most specific)
    const { data: level2Data, error: level2Error } = await buildQuery(2);
    if (level2Error) throw level2Error;
    if (level2Data && level2Data.length > 0) {
      courses = level2Data as Course[];
    } else {
      // 3. Try Level 1 (broader) if Level 2 had no results
      const { data: level1Data, error: level1Error } = await buildQuery(1);
      if (level1Error) throw level1Error;
      if (level1Data && level1Data.length > 0) {
        courses = level1Data as Course[];
      } else {
        // 4. Fallback to Level 0 (generic) if Level 1 also had no results
        const { data: level0Data, error: level0Error } = await buildQuery(0);
        if (level0Error) throw level0Error;
        courses = (level0Data as Course[]) || [];
      }
    }

    // 5. Apply the advanced sorting logic and take the top 3
    const sortedCourses = sortRecommendedCourses(courses);
    return sortedCourses.slice(0, 3);

  } catch (error) {
    console.error("Error fetching recommended courses:", error);
    return [];
  }
}
// --- END OF NEW RECOMMENDATION LOGIC ---


// --- Main Study Portal Component ---
interface StudyPortalProps {
  profile: UserProfile | null;
  onViewChange: (view: 'dashboard' | 'profile' | 'enrollments' | 'studyPortal') => void;
}

const StudyPortal: React.FC<StudyPortalProps> = ({ profile, onViewChange }) => {
  // ... (This component is unchanged)
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
    if (!user || !profile) {
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
              courses (id, title, start_date, end_date, image_url, price)
            `)
            .eq('user_id', user.id),
          fetchRecommendedCourses(profile) // This now calls the new logic
        ]);

        const { data: rawData, error: enrollError } = enrollmentsResult;
        if (enrollError) throw enrollError;

        setRecommendedCourses(recCoursesResult);

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
          setGroupedEnrollments(Array.from(enrollmentsMap.values()));
        } else {
          setGroupedEnrollments([]);
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
          recommendedCourses={recommendedCourses} 
          isLoading={isLoading}
          notes={notes}
          pyqs={pyqs}
        />
      )}
    </div>
  );
};

export default StudyPortal;
