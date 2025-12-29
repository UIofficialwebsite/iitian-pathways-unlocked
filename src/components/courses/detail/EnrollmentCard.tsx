import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Course } from '@/components/admin/courses/types';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, BookOpen, Share2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EnrollmentCardProps {
    course: Course;
    isDashboardView?: boolean;
    className?: string;
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ course, isDashboardView, className }) => {
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Calculates the discount percentage
    const discountPercentage = course.price && course.discounted_price
        ? Math.round(((course.price - course.discounted_price) / course.price) * 100)
        : 0;

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setDetailsVisible(true);
            } else {
                setDetailsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const formatDate = (dateString: string) => {
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
                toast.success('Shared successfully');
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
        <div className={cn("sticky top-24 overflow-visible", className)} ref={cardRef}>
            <div className="rounded-xl bg-gradient-to-b from-neutral-200 to-transparent p-0.5 shadow-xl overflow-visible">
                <Card className="overflow-visible rounded-lg font-sans">
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

                        {/* Animated details section */}
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
                                        <span className="font-normal">Starts on: {formatDate(course.start_date)}</span>
                                        <span className="font-normal">Ends on: {formatDate(course.end_date)}</span>
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
                            <a href={course.enroll_now_link || '#'} target="_blank" rel="noopener noreferrer" className="flex-1">
                                <Button size="lg" className="w-full text-lg">Continue with the Enrollment</Button>
                            </a>
                            <Button
                                size="lg"
                                variant="outline"
                                className="aspect-square p-0"
                                onClick={handleShare}
                            >
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
