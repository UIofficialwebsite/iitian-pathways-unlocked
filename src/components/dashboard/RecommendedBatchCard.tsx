import React from 'react';
import { Card, CardContent } from '@/components/ui/card'; // We use Card as the base
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

type Course = Tables<'courses'> & {
  original_price?: number | null;
};

/**
 * Formats a date string (YYYY-MM-DD) to a more readable format (DD Month YYYY)
 */
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'TBD';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return 'TBD';
  }
};

/**
 * Calculates discount percentage
 */
const getDiscount = (price: number | null, originalPrice: number | null | undefined) => {
  if (price === null || !originalPrice || originalPrice <= price) {
    return null;
  }
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  return `${discount}% OFF`;
};

export const RecommendedBatchCard: React.FC<{ course: Course }> = ({ course }) => {

  const {
    id,
    title,
    image_url,
    price,
    original_price,
    start_date,
    end_date,
    exam_category,
  } = course;

  const startDate = formatDate(start_date);
  const endDate = formatDate(end_date);
  const discount = getDiscount(price, original_price);
  const hasDiscount = !!discount;

  const courseUrl = `${window.location.origin}/courses/${id}`;
  const shareText = `Check out this course: ${title} on IITian Pathways!`;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent linking to course
    e.stopPropagation(); // Stop event bubbling
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}%0A${encodeURIComponent(courseUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const finalPrice = price === 0 ? 'Free' : `₹${price}`;

  return (
    // This is the MAIN card, a single block as in the wireframe
    <Card 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md h-full flex flex-col"
      style={{
        fontFamily: "'Inter', sans-serif" 
      }}
    >
      <CardContent className="p-4 space-y-4 flex-1 flex flex-col">
        
        {/* --- Batch Name (Outside the sub-card, as per wireframe) --- */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 h-[3.25rem]">
          {title || 'Unnamed Batch'}
        </h3>

        {/* --- Inner Sub-Card (This is the key fix) --- */}
        <Card className="bg-gray-50 border border-gray-200 overflow-hidden shadow-none">
          {/* --- Image Frame with Relative Positioning --- */}
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            <img 
              src={image_url || "/lovable-uploads/logo_ui_new.png"}
              alt={title || 'Course Image'} 
              className="w-full h-full object-cover object-center"
            />
            {/* --- WhatsApp Share Button (Positioned on Image) --- */}
            <Button 
              onClick={handleShare}
              size="icon" 
              className="absolute top-2 right-2 z-10 bg-green-500 hover:bg-green-600 rounded-full shadow-lg h-9 w-9"
            >
              <Share2 className="h-4 w-4 text-white" />
            </Button>
          </div>
          
          {/* --- Content Inside Sub-Card --- */}
          <div className="p-4 space-y-3">
            {/* --- Student Info --- */}
            <div className="flex items-center text-sm font-medium text-gray-600">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              For {exam_category || 'All Students'}
            </div>

            {/* --- Date Info --- */}
            <div className="flex items-center text-sm font-medium text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              Starts {startDate} | Ends {endDate}
            </div>
          </div>
        </Card>
        
        {/* --- Spacer to push content below to the bottom --- */}
        <div className="flex-grow" />

        {/* --- Price & Discount Row (Outside the sub-card) --- */}
        <div className="flex justify-between items-end pt-2">
          
          {/* Price (Left) */}
          <div className="flex-shrink-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {finalPrice}
              </span>
              {hasDiscount && (
                <span className="text-md font-medium text-gray-400 line-through">
                  ₹{original_price}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-gray-500 -mt-1">(For Full Course)</p>
          </div>
          
          {/* Discount Tag (Right) */}
          {hasDiscount && (
            <div className="relative flex-shrink-0 ml-2">
              <Badge className="bg-red-500 text-white text-sm font-bold py-1.5 px-3 rounded-md">
                {discount}
              </Badge>
              {/* --- Pointer Triangle --- */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -left-2 w-0 h-0"
                style={{
                  borderTop: '10px solid transparent',
                  borderBottom: '10px solid transparent',
                  borderRight: '8px solid #ef4444' // red-500
                }}
              />
            </div>
          )}
        </div>

        {/* --- Buttons Row (Outside the sub-card) --- */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          <Button asChild variant="outline" className="w-full font-bold border-2">
            <Link to={`/courses/${id}`}>Explore</Link>
          </Button>
          <Button asChild className="w-full font-bold bg-royal hover:bg-royal/90">
            <Link to={`/courses/${id}`}>Buy Now</Link>
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};
