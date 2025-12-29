import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course } from '@/components/admin/courses/types';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, BookOpen, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface EnrollmentCardProps {
    course: Course;
    isDashboardView?: boolean; // Added prop to handle dashboard scroll
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ course, isDashboardView }) => {
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const discountPercentage = course.price && course.discounted_price
        ? Math.round(((course.price - course.discounted_price) / course.price) * 100)
        : 0;

    useEffect(() => {
        // Find the correct container to listen for scroll
        const scrollContainer = isDashboardView 
            ? document.querySelector('.overflow-y-auto.custom-scrollbar') 
            : window;

        const handleScroll = () => {
            const scrollPos = isDashboardView && scrollContainer instanceof HTMLElement
                ? scrollContainer.scrollTop 
                : window.scrollY;

            // Trigger details visibility after 80px of scroll
            if (scrollPos > 80) {
                setDetailsVisible(true);
            } else {
                setDetailsVisible(false);
            }
        };

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            // Initial check in case page is already scrolled
            handleScroll();
        }

        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScroll);
            }
        };
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
                await navigator.share({
                    title: course.title,
                    text: `Check out this course: ${course.title}`,
                    url: courseUrl,
                });
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

    return (
        <div ref={cardRef}>
            <div className="rounded-xl bg-gradient-to-b from-neutral-200 to-transparent p-0.5 shadow-xl">
                <Card className="overflow-hidden rounded-lg font-sans">
                    <CardHeader className="p-0">
                        <img 
                            src={course.image_url || '/placeholder.svg'} 
                            alt={course.title} 
                            className="w-full h-auto object-cover aspect-video" 
                        />
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
                                <div className="bg-green-500 text-white font-bold text-sm px-3 py-1 rounded-md">
                                    {discountPercentage}% OFF
                                </div>
                            )}
                        </div>

                        {/* Animated details section that reveals on scroll */}
                        <div
                            className="transition-all ease-in-out duration-500 overflow-hidden"
                            style={{
                                maxHeight: detailsVisible ? '250px' : '0',
                                opacity: detailsVisible ? 1 : 0,
                                marginBottom: detailsVisible ? '1rem' : '0'
                            }}
                        >
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center text-gray-700">
                                    <MapPin className="w-5 h-5 mr-3 text-royal" />
                                    <span className="font-medium text-sm">{course.branch} — {course.level}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <Calendar className="w-5 h-5 mr-3 text-royal" />
                                    <div className="flex flex-col text-sm">
                                        <span>Starts: {formatDate(course.start_date)}</span>
                                        <span className="text-slate-500">Ends: {formatDate(course.end_date)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <BookOpen className="w-5 h-5 mr-3 text-royal" />
                                    <span className="font-medium text-sm">Language: {course.language || 'English'}</span>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex gap-2">
                            <a href={course.enroll_now_link || '#'} target="_blank" rel="noopener noreferrer" className="flex-1">
                                <Button size="lg" className="w-full text-md font-semibold bg-royal hover:bg-royal/90">
                                    Enroll Now
                                </Button>
                            </a>
                            <Button
                                size="lg"
                                variant="outline"
                                className="aspect-square p-0"
                                onClick={handleShare}
                            >
                                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EnrollmentCard;
