import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Inbox, ChevronRight } from 'lucide-react'; // Added ChevronRight
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardTitle, 
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// --- Define Types ---

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
    expiry_link: string | null; // Added expiry_link
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
  expiry_link: string | null; // Added expiry_link
};

// --- NEW: Enrollment List Item (based on your new image) ---
const EnrollmentListItem = ({ enrollment }: { enrollment: GroupedEnrollment }) => {
  
  const StatusIndicator = () => {
    if (enrollment.status === 'Ongoing') {
      return (
        <div className="flex items-center justify-end gap-2" title="Ongoing">
          <span className="text-sm font-medium text-green-600">Ongoing</span>
          {/* This is the "beep" effect */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      );
    }
    
    // "Success" badge for completed/expired batches
    return (
      <Badge 
        className="bg-green-100 text-green-800 hover:bg-green-100/80 font-medium" // Slightly darker text for contrast
        title="Completed"
      >
        SUCCESS
      </Badge>
    );
  };

  const formattedEndDate = enrollment.end_date 
    ? new Date(enrollment.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ' ')
    : 'No end date';

  return (
    <>
      <Card className="w-full relative overflow-hidden flex flex-col">
        <CardContent className="flex items-center gap-4 p-4">
          {/* Image Container (Adjusted for full resolution and aspect ratio) */}
          <div className="flex-shrink-0 w-28 h-20 md:w-32 md:h-24 overflow-hidden rounded-lg">
            <img 
              src={enrollment.image_url || "/lovable-uploads/logo_ui_new.png"} // Use image_url or placeholder
              alt={enrollment.title} 
              className="w-full h-full object-cover object-center" // Ensure full image, no square crop
            />
          </div>

          {/* Middle Section: Title, Subjects, Date */}
          <div className="flex-grow space-y-1">
            {/* Top Row: Title and Status (aligned to top in card) */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-0">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900 pr-4">
                {enrollment.title}
              </CardTitle>
              {/* Status Indicator */}
              <div className="flex-shrink-0 mt-1 sm:mt-0">
                <StatusIndicator />
              </div>
            </div>
            
            {/* Date */}
            <p className="text-sm text-gray-500">
              {formattedEndDate} • Free {/* Assuming 'Free' is always shown as per image */}
            </p>
            
            {/* Subjects (if needed, otherwise remove) */}
            {/* <CardDescription className="text-sm text-gray-600 line-clamp-2">
              <span className="font-medium text-gray-700">Subjects:</span> {enrollment.subjects.join(', ') || 'N/A'}
            </CardDescription> */}
          </div>

          {/* Right Arrow (always present as per image) */}
          <ChevronRight className="h-6 w-6 text-gray-400 ml-2 flex-shrink-0" />
        </CardContent>
        
        {/* Expiry Link Banner (only for expired batches) */}
        {enrollment.status === 'Batch Expired' && enrollment.expiry_link && (
          <div className="bg-red-50 text-red-700 text-sm p-3 text-center flex items-center justify-center gap-1">
            This batch got expired on {formattedEndDate}! 
            <Link to={enrollment.expiry_link} className="font-semibold underline hover:text-red-800">
              Renew to access this batch again
            </Link>
          </div>
        )}
      </Card>
    </>
  );
};

// --- No Enrollments Placeholder (unchanged) ---
const NoEnrollmentsPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-gray-50 min-h-[400px] border border-gray-200">
      <Inbox className="h-32 w-32 text-gray-400 mb-6" strokeWidth={1.5} />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        No Enrollments Yet!
      </h2>
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        It looks like you haven't enrolled in any courses. Explore our courses and start your learning journey!
      </p>
      <Button asChild size="lg">
        <Link to="/courses">
          Explore Courses
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
};


// --- Main Page Component ---
const MyEnrollments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groupedEnrollments, setGroupedEnrollments] = useState<GroupedEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessEnrollments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // 1. Fetch raw enrollments, joining with courses table
        const { data: rawData, error } = await supabase
          .from('enrollments')
          .select(`
            id,
            course_id,
            subject_name,
            courses (
              id,
              title, 
              start_date,
              end_date,
              image_url,
              expiry_link // Fetch expiry_link
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        if (!rawData) {
          setGroupedEnrollments([]);
          return;
        }

        // 2. Process and group the raw data
        const today = new Date();
        const enrollmentsMap = new Map<string, GroupedEnrollment>();

        for (const enrollment of rawData as RawEnrollment[]) {
          if (!enrollment.courses) continue; 
          const course_id = enrollment.course_id;
          const endDate = enrollment.courses.end_date 
            ? new Date(enrollment.courses.end_date) 
            : null;
          let status: GroupedEnrollment['status'] = 'Unknown';
          if (endDate) {
            status = today > endDate ? 'Batch Expired' : 'Ongoing';
          } else {
            status = 'Ongoing';
          }

          if (!enrollmentsMap.has(course_id)) {
            enrollmentsMap.set(course_id, {
              course_id: course_id,
              title: enrollment.courses.title || 'Unnamed Batch',
              start_date: enrollment.courses.start_date,
              end_date: enrollment.courses.end_date,
              status: status,
              subjects: [],
              image_url: enrollment.courses.image_url,
              expiry_link: enrollment.courses.expiry_link, // Store expiry_link
            });
          }

          const groupedEntry = enrollmentsMap.get(course_id)!;
          if (enrollment.subject_name && !groupedEntry.subjects.includes(enrollment.subject_name)) {
            groupedEntry.subjects.push(enrollment.subject_name);
          }
        }

        const processedEnrollments = Array.from(enrollmentsMap.values());
        setGroupedEnrollments(processedEnrollments);

      } catch (error: any) {
        toast({
          title: "Error",
          description: "Could not fetch your enrollments. " + error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessEnrollments();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-royal" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Enrollments</h1>
        <p className="text-gray-600">All the courses you are currently enrolled in.</p>
      </div>

      {/* Conditional Content */}
      {groupedEnrollments.length === 0 ? (
        // --- Empty State ---
        <NoEnrollmentsPlaceholder />
      ) : (
        // --- UPDATED: List of EnrollmentListItem components ---
        <div className="space-y-4">
          {groupedEnrollments.map((enrollment) => (
            <EnrollmentListItem key={enrollment.course_id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;
