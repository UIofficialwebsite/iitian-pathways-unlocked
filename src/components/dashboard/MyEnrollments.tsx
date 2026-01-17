import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Inbox, ChevronRight } from 'lucide-react';
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
  status: string | null;
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
  status: 'Ongoing' | 'Batch Expired' | 'Pending' | 'Unknown';
  subjects: string[]; 
  image_url: string | null;
  price: number | null; 
};

// --- Enrollment List Item ---
const EnrollmentListItem = ({ enrollment, onSelectCourse }: { enrollment: GroupedEnrollment; onSelectCourse?: (courseId: string) => void }) => {
  
  const StatusIndicator = () => {
    if (enrollment.status === 'Pending') {
       return (
         <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
           Payment Pending
         </Badge>
       );
    }

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
    
    // "Success" badge for completed/expired batches
    return (
      <Badge 
        className="bg-green-100 text-green-800 hover:bg-green-100/80 font-medium"
        title="Completed"
      >
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

  const handleClick = (e: React.MouseEvent) => {
    if (onSelectCourse) {
      e.preventDefault();
      onSelectCourse(enrollment.course_id);
    }
  };

  return (
    <Link 
      to={`/courses/${enrollment.course_id}`} 
      className="block group"
      onClick={handleClick}
    >
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

// --- No Enrollments Placeholder ---
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
      <Link to="/courses">
        <Button size="lg" className="flex items-center">
          Explore Courses
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
};


// --- Main Page Component ---
interface MyEnrollmentsProps {
  onSelectCourse?: (courseId: string) => void;
}

const MyEnrollments = ({ onSelectCourse }: MyEnrollmentsProps) => {
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
        // 1. Fetch raw enrollments
        const { data: rawData, error } = await supabase
          .from('enrollments')
          .select(`
            id,
            course_id,
            subject_name,
            status,
            courses (
              id,
              title, 
              start_date,
              end_date,
              image_url,
              price
            )
          `)
          .eq('user_id', user.id)
          // Hide FAILED transactions, but keep PENDING to show user status as requested
          .neq('status', 'FAILED');

        if (error) throw error;

        if (!rawData) {
          setGroupedEnrollments([]);
          return;
        }

        // 2. Process and group the raw data
        const today = new Date();
        const enrollmentsMap = new Map<string, GroupedEnrollment>();

        for (const enrollment of rawData as unknown as RawEnrollment[]) {
          if (!enrollment.courses) continue; 
          const course_id = enrollment.course_id;
          
          const endDate = enrollment.courses.end_date 
            ? new Date(enrollment.courses.end_date) 
            : null;

          // Determine Status based on DB status column first
          let status: GroupedEnrollment['status'] = 'Unknown';
          const dbStatus = enrollment.status?.toUpperCase();

          if (dbStatus === 'PENDING') {
              status = 'Pending';
          } else if (endDate && today > endDate) {
              status = 'Batch Expired';
          } else if (dbStatus === 'SUCCESS' || dbStatus === 'PAID' || dbStatus === 'ACTIVE') {
              status = 'Ongoing'; 
          } else {
             // Fallback for nulls or other states
             status = 'Ongoing';
          }

          // If we already have this course in the map, we prioritize the "best" status
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
          
          // Logic: If any part of the course is 'Ongoing', the whole card shows as Ongoing.
          if (status === 'Ongoing') groupedEntry.status = 'Ongoing';
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Enrollments</h1>
        <p className="text-gray-600">All the courses you are currently enrolled in.</p>
      </div>

      {groupedEnrollments.length === 0 ? (
        <NoEnrollmentsPlaceholder />
      ) : (
        <div className="space-y-4">
          {groupedEnrollments.map((enrollment) => (
            <EnrollmentListItem key={enrollment.course_id} enrollment={enrollment} onSelectCourse={onSelectCourse} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;
