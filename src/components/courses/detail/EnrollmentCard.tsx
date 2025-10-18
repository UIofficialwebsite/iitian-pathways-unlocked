import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course } from '@/components/admin/courses/types';
import { Separator } from '@/components/ui/separator';

interface EnrollmentCardProps {
    course: Course;
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ course }) => {
    const [detailsVisible, setDetailsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Calculates the discount percentage
    const discountPercentage = course.price && course.discounted_price
        ? Math.round(((course.price - course.discounted_price) / course.price) * 100)
        : 0;

    useEffect(() => {
        const handleScroll = () => {
            // Triggers the animation as soon as the user scrolls down a bit
            if (window.scrollY > 100) {
                setDetailsVisible(true);
            } else {
                setDetailsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="sticky top-24" ref={cardRef}>
            <div className="rounded-xl bg-gradient-to-b from-neutral-200 to-transparent p-0.5 shadow-xl">
                <Card className="overflow-hidden rounded-lg">
                    <CardHeader className="p-0">
                        <img src={course.image_url || '/placeholder.svg'} alt={course.title} className="w-full h-auto object-cover aspect-video" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-baseline">
                                <span className="text-3xl font-bold text-gray-900">₹{course.discounted_price || course.price}</span>
                                {course.discounted_price && (
                                    <span className="text-gray-500 line-through ml-2">₹{course.price}</span>
                                )}
                            </div>
                            {course.discounted_price && (
                                <div className="relative">
                                    <div className="bg-green-500 text-white font-bold text-sm px-3 py-1 rounded-md">
                                        {discountPercentage}% OFF
                                    </div>
                                    <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-green-500"></div>
                                </div>
                            )}
                        </div>

                        {/* Animated details section */}
                        <div
                            className="transition-all ease-in-out duration-500 overflow-hidden"
                            style={{
                                maxHeight: detailsVisible ? '200px' : '0',
                                opacity: detailsVisible ? 1 : 0,
                            }}
                        >
                            <div className="space-y-3 pt-2 pb-4">
                                <h4 className="font-semibold text-gray-700">{course.branch} - {course.level}</h4>
                                <p className="text-sm text-gray-600">
                                    Starts on {new Date(course.start_date).toLocaleDateString()} &bull; Ends on {new Date(course.end_date).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Language: {course.language}
                                </p>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <a href={course.enroll_now_link || '#'} target="_blank" rel="noopener noreferrer" className="block">
                            <Button size="lg" className="w-full text-lg">Continue with the Enrollment</Button>
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EnrollmentCard;
