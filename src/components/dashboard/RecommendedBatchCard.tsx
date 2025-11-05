import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

// --- HELPER FUNCTIONS (MOVED TO TOP & UPDATED) ---

/**
 * Helper function (outside component)
 * Formats a date string (YYYY-MM-DD) to a more readable format (DD Month YYYY)
 */
const formatDate = (dateStr: string | null | undefined): string => {
  // --- THIS IS THE REQUESTED CHANGE ---
  if (!dateStr) return 'To be announced'; 
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    // --- THIS IS THE REQUESTED CHANGE ---
    return 'To be announced'; 
  }
};

/**
 * Formats a slug-like string (e.g., 'data-science') to 'Data Science'
 */
const formatBranch = (branch: string | null): string => {
  if (!branch) return '';
  return branch
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generates the specific audience text based on second-level filters
 */
const getAudienceText = (course: Course): string => {
  const { exam_category, branch, level, student_status } = course;

  if (exam_category === 'IITM BS') {
    const parts: string[] = [];
    if (branch) parts.push(formatBranch(branch));
    if (level) parts.push(level); // 'Foundation', 'Diploma', etc.
    
    if (parts.length > 0) {
      return `For IITM BS (${parts.join(' - ')})`;
    }
    return 'For IITM BS';
  }

  if (exam_category === 'COMPETITIVE_EXAM') {
    if (student_status) {
      return `For ${student_status}`;
    }
    return 'For Competitive Exams';
  }

  if (exam_category) {
    return `For ${exam_category}`;
  }

  return 'For All Students';
};

/**
 * Calculates discount percentage
 */
const getDiscount = (
  salePrice: number | null | undefined, 
  originalPrice: number
): string | null => {
  if (typeof originalPrice !== 'number' || originalPrice <= 0) {
    return null;
  }
  if (typeof salePrice !== 'number' || salePrice === null) {
    return null;
  }
  if (originalPrice <= salePrice) {
    return null;
  }
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  return discount > 0 ? `${discount}% OFF` : null;
};


// --- TYPE DEFINITION ---
type Course = Tables<'courses'> & {
  discounted_price?: number | null; // Can be null
};


// --- COMPONENT ---
export const RecommendedBatchCard: React.FC<{ course: Course }> = ({ course }) => {

  const {
    id,
    title,
    image_url,
    price,
    discounted_price,
    start_date,
    end_date,
  } = course;

  const originalPrice = price;
  const salePrice = discounted_price;
  
  const discount = getDiscount(salePrice, originalPrice);
  const hasDiscount = !!discount;

  const finalPriceValue = (salePrice !== null && salePrice < originalPrice) ? salePrice : originalPrice;
  const finalPriceString = finalPriceValue === 0 ? 'Free' : `₹${Math.round(finalPriceValue)}`;
  
  // Use the helper functions (now defined at the top)
  const startDate = formatDate(start_date);
  const endDate = formatDate(end_date);
  const audienceText = getAudienceText(course);

  const courseUrl = `${window.location.origin}/courses/${id}`;
  const shareText = `Check out this course: ${title} on IITian Pathways!`;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}%0A${encodeURIComponent(courseUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md h-full flex flex-col"
      style={{
        fontFamily: "'Inter', sans-serif" 
      }}
    >
      <CardContent className="p-4 space-y-4 flex-1 flex flex-col">
        
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 h-[3.25rem] flex-1">
            {title || 'Unnamed Batch'}
          </h3>
          <Button 
            onClick={handleShare}
            variant="ghost"
            size="icon" 
            className="rounded-full text-green-600 hover:text-green-700 hover:bg-green-50 flex-shrink-0 h-9 w-9"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        <Card className="bg-gray-50 border border-gray-200 overflow-hidden shadow-none">
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            <img 
              src={image_url || "/lovable-uploads/logo_ui_new.png"}
              alt={title || 'Course Image'} 
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex items-center text-sm font-medium text-gray-600">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              {audienceText}
            </div>
            <div className="flex items-center text-sm font-medium text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              Starts {startDate} | Ends {endDate}
            </div>
          </div>
        </Card>
        
        <div className="flex-grow" />

        <div className="flex justify-between items-end pt-2">
          
          <div className="flex-shrink-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {finalPriceString} 
              </span>
              {hasDiscount && (
                <span className="text-md font-medium text-gray-400 line-through">
                  ₹{Math.round(originalPrice)}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-gray-500 -mt-1">(For Full Course)</p>
          </div>
          
          {hasDiscount && (
            <div className="relative flex-shrink-0 ml-2">
              <Badge className="bg-red-500 text-white text-sm font-bold py-1.5 px-3 rounded-md">
                {discount}
              </Badge>
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
