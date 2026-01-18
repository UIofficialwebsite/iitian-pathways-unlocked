import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course } from '@/components/admin/courses/types';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, BookOpen, ArrowRight, Loader2, Book } from 'lucide-react';
import { toast } from 'sonner';
import EnrollButton from '@/components/EnrollButton';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { ShareButton } from '@/components/ShareButton';

interface EnrollmentCardProps {
    course: Course;
    isDashboardView?: boolean;
    customEnrollHandler?: () => void;
    isMainCourseOwned?: boolean;
    isFullyEnrolled?: boolean;
    ownedAddons?: string[];
    isFreeCourse?: boolean;
    enrolling?: boolean;
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ 
    course, 
    isDashboardView, 
    customEnrollHandler,
    isMainCourseOwned = false,
    isFullyEnrolled = false,
    ownedAddons = [],
    isFreeCourse = false,
    enrolling = false
}) => {
    const [detailsVisible, setDetailsVisible] = useState(false);
    
    // Logic for "Starts at" price
    const [minAddonPrice, setMinAddonPrice] = useState<number | null>(null);
    const [hasAddons, setHasAddons] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const discountPercentage = course.price && course.discounted_price
        ? Math.round(((course.price - course.discounted_price) / course.price) * 100)
        : 0;
        
    const today = new Date();
    const endDate = course.end_date ? new Date(course.end_date) : null;
    const isExpired = endDate && today > endDate;

    // --- 1. FETCH ADD-ONS TO DETERMINE LOWEST PRICE ---
    useEffect(() => {
        const checkAddonsAndPrice = async () => {
            const { data, error } = await supabase
                .from('course_addons')
                .select('price')
                .eq('course_id', course.id);

            if (!error && data && data.length > 0) {
                setHasAddons(true);

                // Only calculate "Starts at" price if the Main Batch is FREE (0 or null)
                if (course.price === 0 || course.price === null) {
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
    }, [course.id, course.price]);

    useEffect(() => {
        const scrollContainer = isDashboardView 
            ? cardRef.current?.closest('.overflow-y-auto') || window 
            : window;

        const handleScroll = () => {
            const currentScroll = scrollContainer instanceof HTMLElement
                ? scrollContainer.scrollTop 
                : window.scrollY;

            setDetailsVisible(currentScroll > 80);
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, [isDashboardView]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "TBD";
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    const renderMainButton = () => {
        // 1. Everything Bought -> "Let's Study"
        if (isFullyEnrolled && !isExpired) {
            return (
                <Button 
                    size="lg" 
                    className="flex-1 text-lg w-full bg-black hover:bg-black/90 text-white h-11"
                    onClick={() => navigate('/dashboard')}
                >
                    <Book className="w-4 h-4 mr-2" /> Let's Study
                </Button>
            );
        }

        // 2. Partial Purchase -> "Upgrade Enrollment"
        if (isMainCourseOwned && !isExpired) {
            return (
                <Button 
                    size="lg" 
                    className="flex-1 text-lg w-full bg-black hover:bg-black/90 text-white h-11" // Keep Black
                    onClick={customEnrollHandler} // Should go to Config Page
                >
                    Upgrade Enrollment
                </Button>
            );
        }

        // 3. New User + Has Paid Add-ons (Special Config Flow)
        if (hasAddons && !customEnrollHandler) {
             return (
                <Button
                    size="lg"
                    className="flex-1 text-lg w-full bg-black hover:bg-black/90 text-white h-11"
                    onClick={() => navigate(`/courses/${course.id}/configure`)}
                >
                    Configure Plan
                </Button>
             );
        }

        // 4. Custom Handler (e.g. Free Direct Enroll)
        if (customEnrollHandler) {
             return (
                <Button 
                    size="lg" 
                    className="flex-1 text-lg w-full bg-black hover:bg-black/90 text-white h-11"
                    onClick={customEnrollHandler}
                    disabled={enrolling}
                >
                    {enrolling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Continue with Enrollment
                </Button>
            );
        } 
        
        // 5. Standard Paid Enrollment
        return (
            <EnrollButton
                courseId={course.id}
                coursePrice={course.discounted_price || course.price}
                enrollmentLink={course.enroll_now_link || undefined}
                className="flex-1 text-lg w-full bg-black hover:bg-black/90 text-white h-11"
            >
                Continue Enrollment
            </EnrollButton>
        );
    };

    // --- Price Rendering Logic ---
    const renderPrice = () => {
        // Case A: Free Base + Paid Addons => "Starts at ..."
        if ((course.price === 0 || course.price === null) && minAddonPrice !== null) {
            return (
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Starts at</span>
                    <span className="text-3xl font-bold text-gray-900">₹{minAddonPrice.toLocaleString()}</span>
                </div>
            );
        }

        // Case B: Standard Price / Discount
        return (
            <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">₹{course.discounted_price || course.price}</span>
                {course.discounted_price && (
                    <span className="text-gray-500 line-through ml-2 font-normal">₹{course.price}</span>
                )}
            </div>
        );
    };

    return (
        <div ref={cardRef}>
            <div className="rounded-xl bg-gradient-to-b from-neutral-200 to-transparent p-0.5 shadow-xl">
                <Card className="overflow-hidden rounded-lg font-sans bg-white">
                    <CardHeader className="p-0">
                        <img src={course.image_url || '/placeholder.svg'} alt={course.title} className="w-full h-auto object-cover aspect-video" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            {renderPrice()}
                            
                            {course.discounted_price && (
                                <div className="relative">
                                    <div className="bg-green-500 text-white font-bold text-sm px-3 py-1 rounded-md">
                                        {discountPercentage}% OFF
                                    </div>
                                    <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-green-500"></div>
                                </div>
                            )}
                        </div>

                        <div
                            className="transition-all ease-in-out duration-500 overflow-hidden"
                            style={{
                                maxHeight: detailsVisible ? '200px' : '0',
                                opacity: detailsVisible ? 1 : 0,
                            }}
                        >
                            <div className="space-y-4 pt-2 pb-4">
                                <div className="flex items-center text-gray-700">
                                    <MapPin className="w-5 h-5 mr-3 text-gray-500" />
                                    <span className="font-normal">{course.branch} - {course.level}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                                    <div className="flex flex-col">
                                        <span className="font-normal">Starts: {formatDate(course.start_date || '')}</span>
                                        <span className="font-normal text-slate-400">Ends: {formatDate(course.end_date || '')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <BookOpen className="w-5 h-5 mr-3 text-gray-500" />
                                    <span className="font-normal">Language: {course.language}</span>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex gap-3 items-center">
                            {renderMainButton()}
                            
                            <ShareButton 
                                url={window.location.href}
                                title={course.title}
                                description={`Check out this course: ${course.title}`}
                                variant="outline"
                                className="shrink-0 aspect-square h-11 w-11 p-0 border-gray-300"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EnrollmentCard;
