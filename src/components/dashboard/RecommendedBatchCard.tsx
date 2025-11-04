import React from 'react';
import { Card, CardContent } from '../ui/card'; // Corrected path
import { Badge } from '../ui/badge'; // Corrected path
import { Link } from 'react-router-dom';
import { Tables } from '../../integrations/supabase/types'; // Corrected path

type Course = Tables<'courses'>;

interface RecommendedBatchCardProps {
  course: Course;
}

export const RecommendedBatchCard: React.FC<RecommendedBatchCardProps> = ({ course }) => {
  const displayPrice = (course.price === 0) ? 'Free' : (course.discounted_price ? `₹${course.discounted_price}` : `₹${course.price}`);
  const originalPrice = (course.price && course.discounted_price && course.price > course.discounted_price) ? `₹${course.price}` : null;

  return (
    <Link to={`/courses/${course.id}`} className="block group">
      <Card className="w-full overflow-hidden h-full flex flex-col group-hover:shadow-lg transition-shadow duration-200">
        <div className="aspect-video overflow-hidden">
          <img 
            src={course.image_url || "/lovable-uploads/logo_ui_new.png"} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="flex-grow">
            {course.is_live && <Badge className="mb-2">Live</Badge>}
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3 mt-1">{course.description}</p>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">{displayPrice}</span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
