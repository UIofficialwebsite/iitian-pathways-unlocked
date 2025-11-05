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
  courses: {
    id: string;
    title: string | null;
    start_date: string | null; 
    end_date: string | null;   
    image_url: string | null;
    price: number | null; // Added price
  } | null;
};

type GroupedEnrollment = {
  course_id: string;
  title: string;
  start_date: string | null; 
  end_date: string | null;   
  status: 'Ongoing' | 'Batch Expired' | 'Unknown';
  subjects: string[]; // Still needed for grouping logic
  image_url: string | null;
  price: number | null; // Added price
};

// --- NEW: Enrollment List Item (Larger and refined) ---
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

  // --- NEW: Price Display Logic ---
  const PriceDisplay = () => {
    if (enrollment.price === 0) {
      return (
        <span className="font-medium text-green-700">Free</span> // Dark green for Free
      );
    }
    
    if (enrollment.price && enrollment.price > 0) {
      return (
        <span className="font-medium text-gray-800">{`₹${enrollment.price}`}</span> // Show price
      );
    }
    
    // Fallback if price is null
    return null;
  };

  return (
    // The entire card is a link, with hover effect
    <Link to={`/courses/${enrollment.course_id}`} className="block group">
      <Card className="w-full relative overflow-hidden flex flex-col rounded-lg
                     border border-gray-200 group-hover:border-black transition-all duration-200">
        {/* Increased padding from p-4 to p-5 */}
        <CardContent className="flex items-center gap-5 p-5">
          
          {/* Image Container (16:9 Aspect Ratio) - Increased size */}
          <div className="flex-shrink-0 w-36 sm:w-48 aspect-video overflow-hidden rounded-lg bg-gray-50">
            <img 
              src={enrollment.image_url || "/lovable-uploads/logo_ui_new.png"}
              alt={enrollment.title} 
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Middle Section: Title, Date - Increased spacing */}
          <div className="flex-grow space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-0">
              <CardTitle className="text-lg md:text-xl font-bold text-gray-900 pr-4">
                {enrollment.title}
              </CardTitle>
              {/* Status Indicator */}
              <div className="flex-shrink-0 mt-1 sm:mt-0">
                <StatusIndicator />
              </div>
            </div>
            
            {/* Date - Updated to show Free/Paid */}
            <p className="text-base text-gray-600 flex items-center gap-1.5">
              <span>{formattedEndDate}</span>
              <span>•</span>
              <PriceDisplay />
            </p>
            
          </div>

          {/* Right Arrow */}
          <ChevronRight className="h-6 w-6 text-gray-400 ml-2 flex-shrink-0" />
        </CardContent>
        
        {/* Expiry Date Banner (NO LINK) - Increased padding and font size */}
        {enrollment.status === 'Batch Expired' && (
          <div className="bg-red-50 text-red-700 text-base p-4 text-center">
            This batch got expired on {formattedEndDate}!
          </div>
        )}
      </Card>
    </Link>
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


// --- Main Page Component (Logic unchanged) ---
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
        // 1. Fetch raw enrollments
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
              price
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

        for (const enrollment of rawData as unknown as RawEnrollment[]) {
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
              price: enrollment.courses.price, // Store the price
            });
          }

          // Add subject to the grouped list
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
        // --- List of EnrollmentListItem components ---
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
