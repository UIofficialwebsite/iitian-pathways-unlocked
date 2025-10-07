import React from 'react';
import { Course } from '@/components/admin/courses/types';

interface CourseHeaderProps {
    course: Course;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
    return (
        <div className="relative py-16 md:py-24 overflow-hidden shiny-blue-bg">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl">
                    <span className="bg-white/90 backdrop-blur-sm text-blue-600 font-semibold text-sm px-4 py-1 rounded-full shadow-md mb-4 inline-block">
                        Online
                    </span>
                    {/* Text colors are now dark for readability on the light background */}
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">{course.title}</h1>
                    <p className="mt-4 text-lg text-gray-700">{course.description}</p>
                    <div className="mt-6 flex items-center space-x-6 text-gray-800">
                        <span className="font-semibold">{course.students_enrolled?.toLocaleString()}+ Students Enrolled</span>
                        <span className="font-semibold">Rating: {course.rating} ★</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseHeader;
