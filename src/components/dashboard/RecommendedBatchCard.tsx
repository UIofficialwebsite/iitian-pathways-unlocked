import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import EnrollButton from '@/components/EnrollButton';
import { supabase } from "@/integrations/supabase/client";

// --- HELPER FUNCTIONS ---
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'To be announced'; 
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return 'To be announced'; 
  }
};

const formatBranch = (branch: string | null): string => {
  if (!branch) return '';
  return branch
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getAudienceText = (course: any): string => {
  const { exam_category, branch, level, student_status } = course;

  if (exam_category === 'IITM BS') {
    const parts: string[] = [];
    if (branch) parts.push(formatBranch(branch));
    if (level) parts.push(level); 
    if (parts.length > 0) {
      return `For IITM BS (${parts.join(' - ')})`;
    }
    return 'For IITM BS';
  }

  if (exam_category === 'COMPETITIVE_EXAM') {
    if (student_status) return `For ${student_status}`;
    return 'For Competitive Exams';
  }

  if (exam_category) return `For ${exam_category}`;
  return 'For All Students';
};

const getDiscount = (salePrice: number | null | undefined, originalPrice: number): string | null => {
  if (typeof originalPrice !== 'number' || originalPrice <= 0) return null;
  if (typeof salePrice !== 'number' || salePrice === null) return null;
  if (originalPrice <= salePrice) return null;
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  return discount > 0 ? `${discount}% OFF` : null;
};

// --- COMPONENT ---
export const RecommendedBatchCard: React.FC<{ course: any }> = ({ course }) => {
  const navigate = useNavigate();
  const [minAddonPrice, setMinAddonPrice] = useState<number | null>(null);
  const [hasAddons, setHasAddons] = useState(false);

  const {
    id,
    title,
    image_url,
    price,
    discounted_price,
    start_date,
    end_date,
  } = course;

  // --- 1. FETCH ADD-ONS LOGIC ---
  useEffect(() => {
    const checkAddonsAndPrice = async () => {
      const { data, error } = await supabase
        .from('course_addons')
        .select('price')
        .eq('course_id', id);

      if (!error && data && data.length > 0) {
        setHasAddons(true);
        // Only calculate "Starts at" price if Main Batch is FREE
        if (price === 0 || price === null) {
          const paidAddons = data.filter(addon => addon.price > 0);
          if (paidAddons.length > 0) {
            const lowest = Math.min(...paidAddons.map(p => p.price));
            setMinAddonPrice(lowest);
          } else {
            setMinAddonPrice(null);
          }
        }
      } else {
        setHasAddons(false);
        setMinAddonPrice(null);
      }
    };
    checkAddonsAndPrice();
  }, [id, price]);

  // Standard Calc
  const originalPrice = price;
  const salePrice = discounted_price;
  const discount = getDiscount(salePrice, originalPrice);
  const hasDiscount = !!discount;
  const finalPriceValue = (salePrice !== null && salePrice < originalPrice) ? salePrice : originalPrice;
  const finalPriceString = finalPriceValue === 0 ? 'Free' : `₹${Math.round(finalPriceValue)}`;
  
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

  const renderPriceSection = () => {
    // Case: Free base + Paid Addons
    if ((price === 0 || price === null) && minAddonPrice !== null) {
      return (
        <div className="flex-shrink-0">
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Starts at</span>
            <span className="text-3xl font-bold text-gray-900">₹{minAddonPrice.toLocaleString()}</span>
          </div>
          <p className="text-xs font-medium text-gray-500 mt-1">(Customize Batch)</p>
        </div>
      );
    }

    // Standard Case
    return (
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
    );
  };

  const renderActionButton = () => {
    if (hasAddons) {
      return (
        <Button 
          onClick={() => navigate(`/courses/${id}/configure`)}
          className="w-full font-bold bg-black hover:bg-black/90 text-white" // CHANGED TO BLACK
        >
          Buy Now
        </Button>
      );
    }

    return (
      <EnrollButton
        courseId={id}
        enrollmentLink={course.enroll_now_link || undefined}
        coursePrice={finalPriceValue}
        className="w-full font-bold bg-black hover:bg-black/90 text-white" // CHANGED TO BLACK
      >
        Buy Now
      </EnrollButton>
    );
  };

  return (
    <Card 
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md h-full flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
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
          
          {renderPriceSection()}
          
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
                  borderRight: '8px solid #ef4444' 
                }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3">
          <Link to={`/courses/${id}`}>
            <Button variant="outline" className="w-full font-bold border-2">
              Explore
            </Button>
          </Link>
          
          {renderActionButton()}
        </div>

      </CardContent>
    </Card>
  );
};
