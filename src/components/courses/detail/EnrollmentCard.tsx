import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course } from '@/components/admin/courses/types';

interface EnrollmentCardProps {
    course: Course;
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ course }) => {
    const [startDateVisible, setStartDateVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Triggers the animation after the user scrolls down a little
            if (window.scrollY > 50) {
                setStartDateVisible(true);
            } else {
                setStartDateVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="sticky top-24">
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

                        {/* Static details that are always visible */}
                        <div className="space-y-2 mb-4">
                            <h4 className="font-semibold text-gray-700">{course.degree_name} - {course.level}</h4>
                            <div className="text-gray-600">
                                <span>Language: {course.language}</span>
                            </div>
                        </div>

                        {/* Animated start date */}
                        <div
                            className={`transition-all duration-500 ease-in-out transform ${
                                startDateVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
                            }`}
                        >
                            <div className="text-gray-600 font-medium">
                                <span>Starts on: {new Date(course.start_date).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <a href={course.enroll_now_link || '#'} target="_blank" rel="noopener noreferrer" className="block mt-6">
                            <Button size="lg" className="w-full text-lg">Continue with the Enrollment</Button>
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EnrollmentCard;
