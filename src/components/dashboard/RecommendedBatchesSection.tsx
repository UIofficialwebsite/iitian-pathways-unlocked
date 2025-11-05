import React from 'react';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { RecommendedBatchCard } from './RecommendedBatchCard'; // We import the card here
import { Tables } from '@/integrations/supabase/types';
import { Loader2 } from 'lucide-react';

// Define the Course type this component expects
type Course = Tables<'courses'> & {
  original_price?: number | null;
};

interface RecommendedBatchesSectionProps {
  courses: Course[];
  isLoading: boolean;
}

const RecommendedBatchesSection: React.FC<RecommendedBatchesSectionProps> = ({ courses, isLoading }) => {
  return (
    <Card 
      className="bg-white shadow-sm border border-gray-200"
      style={{ fontFamily: "'Inter', sans-serif" }} // Apply requested font
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Top Recommended Batches
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Let's start with these popular courses
          </CardDescription>
        </div>
        <Button asChild variant="outline" className="font-medium flex-shrink-0">
          <Link to="/courses">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-royal" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {courses.length > 0 ? (
              courses.map((course) => (
                <RecommendedBatchCard key={course.id} course={course} />
              ))
            ) : (
              <p className="text-gray-500 col-span-3">
                No specific recommendations found. Check out all our courses!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendedBatchesSection;
