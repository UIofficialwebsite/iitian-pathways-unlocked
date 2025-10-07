import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import CourseHeader from '../components/courses/detail/CourseHeader';
import EnrollmentCard from '../components/courses/detail/EnrollmentCard';
import FeaturesSection from '../components/courses/detail/FeaturesSection';
import AboutSection from '../components/courses/detail/AboutSection';
import ScheduleSection, { ScheduleData } from '../components/courses/detail/ScheduleSection';
import SSPPortalSection from '../components/courses/detail/SSPPortalSection';
import FAQSection from '../components/courses/detail/FAQSection';
import StickyTabNav from '../components/courses/detail/StickyTabNav';
import { Skeleton } from '@/components/ui/skeleton';
import { Course } from '@/components/admin/courses/types';

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [schedule, setSchedule] = useState<ScheduleData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Refs are used by the sticky nav to detect which section is in view
    const featuresRef = useRef<HTMLDivElement>(null);
    const aboutRef = useRef<HTMLDivElement>(null);
    const scheduleRef = useRef<HTMLDivElement>(null);
    const sspRef = useRef<HTMLDivElement>(null);
    const faqRef = useRef<HTMLDivElement>(null);

    const sectionRefs = {
        features: featuresRef,
        about: aboutRef,
        schedule: scheduleRef,
        ssp: sspRef,
        faq: faqRef,
    };

    useEffect(() => {
        const fetchCourseAndSchedule = async () => {
            if (!courseId) {
                setError("Course ID is missing.");
                setLoading(false);
                return;
            }

            try {
                // Fetch course and schedule data simultaneously
                const coursePromise = supabase.from('courses').select('*').eq('id', courseId).single();
                const schedulePromise = supabase.from('batch_schedule').select('*').eq('course_id', courseId);

                const [{ data: courseData, error: courseError }, { data: scheduleData, error: scheduleError }] = await Promise.all([coursePromise, schedulePromise]);

                if (courseError) throw courseError;
                if (scheduleError) throw scheduleError;
                
                setCourse(courseData);
                
                // Transform schedule data for the component
                const transformedSchedule = scheduleData.map(item => ({
                    day: item.batch_name,
                    classes: [{
                        time: "N/A", 
                        subject: item.subject_name,
                        topic: "Click to view notes",
                        file_link: item.file_link,
                    }]
                }));
                setSchedule(transformedSchedule);

            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch course details. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourseAndSchedule();
    }, [courseId]);

    if (loading) {
        return (
            <>
                <NavBar />
                <div className="container mx-auto px-4 py-8 space-y-12">
                    <Skeleton className="h-96 w-full" />
                </div>
                <Footer />
            </>
        );
    }

    if (error || !course) {
        return (
             <div className="flex flex-col min-h-screen">
                <NavBar />
                <div className="flex-grow flex items-center justify-center text-center p-4">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Oops! Something went wrong.</h2>
                        <p className="text-gray-600">{error || "We couldn't find the course you were looking for."}</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            <NavBar />
            <CourseHeader course={course} />
            <StickyTabNav sectionRefs={sectionRefs} />

            <main className="container mx-auto px-4 py-10">
                <div className="flex flex-col lg:flex-row lg:gap-8">
                    {/* Left Column for Course Content */}
                    <div className="w-full lg:w-2/3 space-y-16">
                        {/* Each section has a unique `id` for direct scrolling and a `scroll-mt-32` class.
                          This margin ensures the content isn't hidden behind the two sticky navbars.
                          (16 for the main navbar + 16 for the tab nav = 32)
                        */}
                        <div id="features" ref={featuresRef} className="scroll-mt-32">
                            <FeaturesSection features={course.features} />
                        </div>
                        <div id="about" ref={aboutRef} className="scroll-mt-32">
                            <AboutSection description={course.description} />
                        </div>
                        <div id="schedule" ref={scheduleRef} className="scroll-mt-32">
                            <ScheduleSection schedule={schedule} />
                        </div>
                        <div id="ssp" ref={sspRef} className="scroll-mt-32">
                            <SSPPortalSection />
                        </div>
                        <div id="faq" ref={faqRef} className="scroll-mt-32">
                            <FAQSection />
                        </div>
                    </div>

                    {/* Right Column for Sticky Enrollment Card */}
                    <div className="hidden lg:block lg:w-1/3">
                        <EnrollmentCard course={course} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CourseDetailPage;
