import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Course } from '@/components/admin/courses/types';

interface EnrollmentCardProps {
    course: Course | null;
}

const INCLUSIONS = [
    "Interactive Live Classes",
    "24/7 Doubt Support",
    "SSP Portal Access",
    "Comprehensive Notes"
];

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ course }) => {
    // This check ensures the component never crashes.
    if (!course) {
        return null;
    }

    return (
        <div className="sticky top-24">
            <Card className="overflow-hidden shadow-xl">
                <CardHeader className="p-0">
                    <img src={course.image_url || '/placeholder.svg'} alt={course.title} className="w-full h-auto object-cover aspect-video" />
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-baseline mb-4">
                        <span className="text-3xl font-bold text-gray-900">${course.discounted_price || course.price}</span>
                        {course.discounted_price && (
                            <span className="text-gray-500 line-through ml-2">${course.price}</span>
                        )}
                    </div>
                    <a href={course.enroll_now_link || '#'} target="_blank" rel="noopener noreferrer">
                        <Button size="lg" className="w-full text-lg">Enroll Now</Button>
                    </a>
                    <div className="mt-6 space-y-3">
                        <h4 className="font-semibold text-gray-700">This course includes:</h4>
                        {INCLUSIONS.map((item, index) => (
                            <div key={index} className="flex items-center text-gray-600">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EnrollmentCard;
