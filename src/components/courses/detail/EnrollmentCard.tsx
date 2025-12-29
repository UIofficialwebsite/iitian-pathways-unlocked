import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course } from '@/components/admin/courses/types';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, BookOpen, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

interface EnrollmentCardProps {
    course: Course;
    className?: string;
    isDashboardView?: boolean;
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ course, className, isDashboardView }) => {
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const discountPercentage = course.price && course.discounted_price
        ? Math.round(((course.price - course.discounted_price) / course.price) * 100)
        : 0;

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    // restored scroll-spy behavior for expansion
    useEffect(() => {
        const scrollContainer = isDashboardView 
            ? document.querySelector('.overflow-y-auto.custom-scrollbar') 
            : window;

        const handleScroll = () => {
            const scrollTop = isDashboardView 
                ? (scrollContainer as HTMLElement).scrollTop 
                : window.scrollY;

            // restored: Details expand animatedly after scrolling 100px
            if (scrollTop > 100) {
                setDetailsVisible(true);
            } else {
                setDetailsVisible(false);
            }
        };

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [isDashboardView]);

    const handleShare = async () => {
        const courseUrl = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: course.title, url: courseUrl });
                toast.success('Shared successfully');
            } else {
                await navigator.clipboard.writeText(courseUrl);
                setCopied(true);
                toast.success('Link copied');
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div className={cn(
            "lg:sticky z-30 transition-all duration-300", 
            isDashboardView ? "top-20" : "top-32", // correctly fixed position
            className
        )}>
            <div className="rounded-xl bg-gradient-to-b from-slate-200 to-transparent p-0.5 shadow-xl">
                <Card className="overflow-hidden rounded-lg font-sans bg-white">
                    <CardHeader className="p-0">
                        <img 
                            src={course.image_url || '/placeholder.svg'} 
                            alt={course.title} 
                            className="w-full h-auto object-cover aspect-video" 
                        />
                    </CardHeader>
                    <CardContent className="p-6">
                        
                        {/* restored behavior: initially only buttons are shown */}
                        <div className="flex gap-2 mb-2">
                            <a href={course.enroll_now_link || '#'} target="_blank" rel="noopener noreferrer" className="flex-1">
                                <Button size="lg" className="w-full text-base bg-royal hover:bg-royal-dark text-white font-bold">
                                    Enroll Now
                                </Button>
                            </a>
                            <Button
                                size="lg"
                                variant="outline"
                                className="aspect-square p-0 border-slate-200"
                                onClick={handleShare}
                            >
                                {copied ? <Check className="h-5 w-5 text-green-600" /> : <Share2 className="h-5 w-5 text-slate-600" />}
                            </Button>
                        </div>

                        {/* restored behavior: Price and details animate in on scroll */}
                        <div
                            className="transition-all ease-in-out duration-500 overflow-hidden"
                            style={{
                                maxHeight: detailsVisible ? '600px' : '0', // increased to prevent cut-off
                                opacity: detailsVisible ? 1 : 0,
                            }}
                        >
                            <Separator className="my-4" />
                            
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-baseline">
                                    <span className="text-3xl font-bold text-slate-900">₹{course.discounted_price || course.price}</span>
                                    {course.discounted_price && (
                                        <span className="text-slate-500 line-through ml-2 font-normal">₹{course.price}</span>
                                    )}
                                </div>
                                {course.discounted_price && (
                                    <div className="bg-green-500 text-white font-bold text-xs px-2 py-1 rounded">
                                        {discountPercentage}% OFF
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-2 pb-2">
                                <div className="flex items-start text-slate-700">
                                    <MapPin className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">{course.branch} — {course.level}</span>
                                </div>
                                <div className="flex items-start text-slate-700">
                                    <Calendar className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex flex-col text-sm">
                                        <span className="font-medium">Starts: {formatDate(course.start_date)}</span>
                                        <span className="font-medium">Ends: {formatDate(course.end_date)}</span>
                                    </div>
                                </div>
                                <div className="flex items-start text-slate-700">
                                    <BookOpen className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">Medium: {course.language}</span>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EnrollmentCard;
