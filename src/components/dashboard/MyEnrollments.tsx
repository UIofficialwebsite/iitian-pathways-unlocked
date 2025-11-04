import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Inbox, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// --- This is the placeholder for an enrolled course card ---
// You would replace this with your actual CourseCard component
const EnrolledCourseCardPlaceholder = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>You are enrolled in this course.</CardDescription>
    </CardHeader>
  </Card>
);

// --- This is the main component for the "No Enrollments" state ---
const NoEnrollmentsPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg bg-gray-50 min-h-[400px] border border-gray-200">
      {/* Icon based on the "empty box" in your image */}
      <Inbox className="h-32 w-32 text-gray-400 mb-6" strokeWidth={1.5} />
      
      {/* Heading with matching font style */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        No Enrollments Yet!
      </h2>
      
      {/* Description with matching font style */}
      <p className="text-gray-600 max-w-md mx-auto">
        It looks like you haven't enrolled in any courses. Explore our courses and start your learning journey!
      </p>
      
      {/* Button to navigate to courses */}
      <Button asChild size="lg" className="mt-6">
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
  // --- START: Placeholder Logic ---
  // Replace this with your actual data fetching (e.g., from useAuth and Supabase)
  const [enrollments, setEnrollments] = useState<any[]>([]); // Set to [] to test empty state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      // --- TOGGLE THIS TO TEST ---
      // setEnrollments([{ id: 1, title: "Sample Course 1" }]); // Test with data
      setEnrollments([]); // Test with empty state
      // ---
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);
  // --- END: Placeholder Logic ---


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
      {enrollments.length === 0 ? (
        // --- This is the empty state design you requested ---
        <NoEnrollmentsPlaceholder />
      ) : (
        // --- This is where your list of courses would go ---
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((course) => (
            <EnrolledCourseCardPlaceholder key={course.id} title={course.title} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnrollments;
