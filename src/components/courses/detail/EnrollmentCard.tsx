import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course } from '@/components/admin/courses/types';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, BookOpen, Share2, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import EnrollButton from '@/components/EnrollButton';
import { useNavigate } from 'react-router-dom';

interface EnrollmentCardProps {
    course: Course;
    isDashboardView?: boolean;
    customEnrollHandler?: () => void;
    // Ownership props
    isMainCourseOwned?: boolean;
    ownedAddons?: string[];
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ 
    course, 
    isDashboardView, 
    customEnrollHandler,
    isMainCourseOwned = false,
    ownedAddons = []
}) => {
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const discountPercentage = course.price && course.discounted_price
        ? Math.round(((course.price - course.discounted_price) / course.price) * 100)
        : 0;
        
    // Check for expiration
    const today = new Date();
    const endDate = course.end_date ? new Date(course.end_date) : null;
    const isExpired = endDate && today > endDate;

    // Logic: If main course is owned AND user isn't upgrading, treat as enrolled
    // Note: This simple logic assumes if customEnrollHandler is passed, there might be options.
    // We rely on the parent (CourseDetail) to determine if there are remaining add-ons to buy.
    
    // Determine button state
    const isEnrolledAndActive = isMainCourseOwned && !isExpired;

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

    const handleShare = async () => {
        const courseUrl = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: course.title, url: courseUrl });
            } else {
                await navigator.clipboard.writeText(courseUrl);
                setCopied(true);
                toast.success('Link copied to clipboard');
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const renderMainButton = () => {
        // Case 1: Already Enrolled & Active & No more upgrades (or handled by parent logic)
        // If parent passed customEnrollHandler, it implies upgrades MIGHT be available.
        // But if `isMainCourseOwned` is true, we should be careful about text.
        
        if (isEnrolledAndActive) {
            // If customEnrollHandler exists, it means there are optional items.
            // But we need to check if we actually have anything left to buy?
            // That logic resides in CourseDetail calculating 'isFullyEnrolled'. 
            // For here, if customEnrollHandler is passed and main is owned, assume "Upgrade/Customize"
            if (customEnrollHandler) {
                 return (
                    <Button 
                        size="lg" 
                        className="flex-1 text-lg w-full bg-royal hover:bg-royal/90"
                        onClick={customEnrollHandler}
                    >
                        Customize / Upgrade
                    </Button>
                 );
            }
            
            // Otherwise, purely enrolled
            return (
                <Button 
                    size="lg" 
                    className="flex-1 text-lg w-full bg-green-600 hover:bg-green-700"
                    onClick={() => navigate('/dashboard')}
                >
                    Already Enrolled <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            );
        }

        // Case 2: Not Enrolled or Expired -> Show Enroll/Pay Options
        if (customEnrollHandler) {
            return (
                <Button 
                    size="lg" 
                    className="flex-1 text-lg w-full bg-royal hover:bg-royal/90"
                    onClick={customEnrollHandler}
                >
                    Enroll Now
                </Button>
            );
        } else {
            return (
                <EnrollButton
                    courseId={course.id}
                    coursePrice={course.discounted_price || course.price}
                    enrollmentLink={course.enroll_now_link || undefined}
                    className="flex-1 text-lg w-full bg-royal hover:bg-royal/90"
                >
                    Enroll Now
                </EnrollButton>
            );
        }
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
                            <div className="flex items-baseline">
                                <span className="text-3xl font-bold text-gray-900">₹{course.discounted_price || course.price}</span>
                                {course.discounted_price && (
                                    <span className="text-gray-500 line-through ml-2 font-normal">₹{course.price}</span>
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

                        <div className="flex gap-2">
                            {renderMainButton()}

                            <Button size="lg" variant="outline" className="aspect-square p-0" onClick={handleShare}>
                                {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EnrollmentCard;
