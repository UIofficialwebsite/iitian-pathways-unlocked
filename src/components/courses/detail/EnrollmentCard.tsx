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

    useEffect(() => {
        const handleScroll = () => {
            if (cardRef.current) {
                const { top } = cardRef.current.getBoundingClientRect();
                // Start animation when the top of the card is at or above the top of the viewport
                setDetailsVisible(top <= 0);
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
                        <div className="flex items-baseline mb-4">
                            <span className="text-3xl font-bold text-gray-900">₹{course.discounted_price || course.price}</span>
                            {course.discounted_price && (
                                <span className="text-gray-500 line-through ml-2">₹{course.price}</span>
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
