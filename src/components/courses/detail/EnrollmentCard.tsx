import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/components/admin/courses/types';

// Import all necessary components
import CourseHeader from '@/components/courses/detail/CourseHeader';
import AboutSection from '@/components/courses/detail/AboutSection';
import FeaturesSection from '@/components/courses/detail/FeaturesSection';
import ScheduleSection from '@/components/courses/detail/ScheduleSection';
import SSPPortalSection from '@/components/courses/detail/SSPPortalSection';
import MoreDetailsSection from '@/components/courses/detail/MoreDetailsSection';
import FAQSection from '@/components/courses/detail/FAQSection';
import EnrollmentCard from '@/components/courses/detail/EnrollmentCard';
import WhyChooseUsSection from '@/components/courses/WhyChooseUsSection';
import { Skeleton } from '@/components/ui/skeleton';

const CourseDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id) {
                setError("Course ID is missing.");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    throw error;
                }

                setCourse(data);
            } catch (err: any) {
                setError(err.message);
                console.error("Error fetching course:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 lg:py-12">
                <Skeleton className="h-48 w-full mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (error) return <div className="text-center py-10">Error loading course details. Please try again later.</div>;
    if (!course) return <div className="text-center py-10">Course not found.</div>;

    return (
        <>
            <div className="bg-gray-50">
                <div className="container mx-auto py-8 lg:py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
                        <div className="lg:col-span-2">
                            {/* The CourseHeader is now inside the grid */}
                            <CourseHeader course={course} />
                            
                            {/* The rest of the main content follows */}
                            <div className="mt-8">
                                <AboutSection description={course.description} />
                                <FeaturesSection features={course.features} />
                                <ScheduleSection schedule={course.schedule} />
                                <SSPPortalSection />
                                <MoreDetailsSection course={course} />
                                <FAQSection faqs={course.faqs} />
                            </div>
                        </div>
                        <aside className="lg:col-span-1">
                            {/* The EnrollmentCard will now be sticky relative to the new layout */}
                            <EnrollmentCard course={course} />
                        </aside>
                    </div>
                </div>
            </div>
            <WhyChooseUsSection />
        </>
    );
};

export default CourseDetail;
