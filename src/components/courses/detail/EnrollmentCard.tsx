import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import EnrollButton from "@/components/EnrollButton";
import { Course } from '@/components/admin/courses/types';

interface EnrollmentCardProps {
  course: Course;
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ course }) => {
  const showDiscount = course.discounted_price && course.discounted_price < course.price;
  const finalPrice = showDiscount ? course.discounted_price : course.price;

  const benefits = [
    "SSP Portal Access",
    "Live Classes",
    "Study Materials",
    "Doubt Resolution",
    "Progress Tracking",
    "Certificate on Completion"
  ];

  return (
    <div className="sticky top-24">
      <Card className="shadow-lg relative overflow-hidden">
        {/* Online Badge */}
        <div className="absolute top-0 left-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-1 text-sm font-semibold z-10">
          Online
        </div>
        <CardHeader className="space-y-4 pb-4 pt-10">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-4xl font-bold text-primary">
                  ₹{finalPrice}
                </span>
                {showDiscount && (
                  <span className="ml-3 text-xl text-muted-foreground line-through">
                    ₹{course.price}
                  </span>
                )}
              </div>
              {showDiscount && (
                <Badge variant="destructive">
                  {Math.round(((course.price - course.discounted_price!) / course.price) * 100)}% OFF
                </Badge>
              )}
            </div>
            {course.bestseller && (
              <Badge className="bg-amber-500">⭐ Best Seller</Badge>
            )}
          </div>
          <EnrollButton
            courseId={course.id}
            enrollmentLink={course.enroll_now_link || undefined}
            coursePrice={finalPrice}
            className="w-full"
          >
            Continue with Enrollment
          </EnrollButton>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-lg mb-4">This course includes:</CardTitle>
          <ul className="space-y-3">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentCard;
