import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
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
  } | null;
};

type GroupedEnrollment = {
  course_id: string;
  title: string;
  start_date: string | null; 
  end_date: string | null;   
  status: 'Ongoing' | 'Batch Expired' | 'Unknown';
  subjects: string[];
};

// --- NEW: Enrollment List Item (based on your new image) ---
const EnrollmentListItem = ({ enrollment }: { enrollment: GroupedEnrollment }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Info */}
        <div className="flex-grow">
          {/* Top Row: Title and Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <CardTitle className="text-xl font-bold text-gray-900 pr-4">
              {enrollment.title}
            </CardTitle>
            <Badge 
              variant={enrollment.status === 'Ongoing' ? 'default' : 'destructive'}
              className="flex-shrink-0 mt-2 sm:mt-0"
            >
              {enrollment.status}
            </Badge>
          </div>
          
          {/* Middle Row: End Date */}
          <CardDescription className="mb-3">
            {enrollment.end_date
              ? `Batch ends on: ${new Date(enrollment.end_date).toLocaleDateString()}`
              : 'No end date specified'}
          </CardDescription>

          {/* Bottom Row: Subjects */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Subjects Enrolled:</h4>
            <div className="flex flex-wrap gap-2">
              {enrollment.subjects.length > 0 ? (
                enrollment.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">No specific subjects listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Button */}
        <div className="w-full md:w-auto flex-shrink-0 mt-4 md:mt-0 md:ml-6">
          <Button asChild className="w-full" variant="outline">
            <Link to={`/courses/${enrollment.course_id}`}>
              Go to Course
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// --- No Enrollments Placeholder (based on your previous image) ---
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
              end_date
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
        // --- UPDATED: This is now a vertical stack (space-y-6) ---
        <div className="space-y-6">
          {groupedEnrollments.map((enrollment) => (
            <EnrollmentListItem key={enrollment.course_id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;
