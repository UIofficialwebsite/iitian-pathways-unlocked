import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
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

// Type for the raw data from Supabase
type RawEnrollment = {
  id: string;
  course_id: string;
  subject_name: string | null;
  courses: {
    id: string;
    batch_name: string | null;
    batch_start_date: string | null;
    batch_end_date: string | null;
    slug: string | null;
  } | null;
};

// Type for the data after we group it by course_id
type GroupedEnrollment = {
  course_id: string;
  batch_name: string;
  batch_start_date: string | null;
  batch_end_date: string | null;
  status: 'Ongoing' | 'Batch Expired' | 'Unknown';
  subjects: string[];
  slug: string | null;
};

// --- NEW Enrollment Card Component ---
const EnrollmentCard = ({ enrollment }: { enrollment: GroupedEnrollment }) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-gray-900 mb-2 pr-2">
            {enrollment.batch_name}
          </CardTitle>
          <Badge 
            variant={enrollment.status === 'Ongoing' ? 'default' : 'destructive'}
            className="flex-shrink-0"
          >
            {enrollment.status}
          </Badge>
        </div>
        <CardDescription>
          {enrollment.batch_end_date
            ? `Batch ends on: ${new Date(enrollment.batch_end_date).toLocaleDateString()}`
            : 'No end date specified'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Subjects Enrolled</h4>
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
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link to={`/courses/${enrollment.slug || ''}`}>
            Go to Course
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
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
        // This query correctly fetches `batch_name` from the `courses` table
        const { data: rawData, error } = await supabase
          .from('enrollments')
          .select(`
            id,
            course_id,
            subject_name,
            courses (
              id,
              batch_name,
              batch_start_date,
              batch_end_date,
              slug
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
          // Check if the joined 'courses' data exists
          if (!enrollment.courses) continue; 

          const course_id = enrollment.course_id;

          // Determine batch status
          const endDate = enrollment.courses.batch_end_date 
            ? new Date(enrollment.courses.batch_end_date) 
            : null;
          let status: GroupedEnrollment['status'] = 'Unknown';
          if (endDate) {
            status = today > endDate ? 'Batch Expired' : 'Ongoing';
          } else {
            // If no end date, assume it's ongoing
            status = 'Ongoing';
          }

          // If this is the first time we see this course_id, create a new entry
          if (!enrollmentsMap.has(course_id)) {
            enrollmentsMap.set(course_id, {
              course_id: course_id,
              batch_name: enrollment.courses.batch_name || 'Unnamed Batch',
              batch_start_date: enrollment.courses.batch_start_date,
              batch_end_date: enrollment.courses.batch_end_date,
              status: status,
              subjects: [],
              slug: enrollment.courses.slug,
            });
          }

          // Add the subject to the list for this course_id
          const groupedEntry = enrollmentsMap.get(course_id)!;
          if (enrollment.subject_name && !groupedEntry.subjects.includes(enrollment.subject_name)) {
            groupedEntry.subjects.push(enrollment.subject_name);
          }
        }

        // Convert the Map values back to an array for rendering
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
        // --- This is the new, simple empty state ---
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">You have no enrollments yet.</p>
            <Button asChild size="lg" className="mt-6">
              <Link to="/courses">
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        // --- This is the new Card Grid implementation ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedEnrollments.map((enrollment) => (
            <EnrollmentCard key={enrollment.course_id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;
