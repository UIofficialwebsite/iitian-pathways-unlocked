import React, { useState, useEffect, RefObject } from 'react';
import { cn } from '@/lib/utils';
import { Course } from '@/components/admin/courses/types'; // Import Course type
import { Button } from '@/components/ui/button';

interface Tab {
    id: string;
    label: string;
}

interface StickyTabNavProps {
    tabs: Tab[];
    sectionRefs: {
        [key: string]: RefObject<HTMLDivElement>;
    };
    course: Course; // Pass the full course object
}

const StickyTabNav: React.FC<StickyTabNavProps> = ({ tabs, sectionRefs, course }) => {
    const [isSticky, setSticky] = useState(false);
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
    
    const mainNavBarHeight = 64; 
    const stickyNavBarHeight = 57; 
    const totalOffset = mainNavBarHeight + stickyNavBarHeight + 16; 

    useEffect(() => {
        const handleScroll = () => {
            setSticky(window.scrollY > 350);

            let currentTab = '';
            for (const tab of tabs) {
                const section = sectionRefs[tab.id]?.current;
                if (section && window.scrollY >= section.offsetTop - totalOffset) {
                    currentTab = tab.id;
                }
            }
            if (currentTab) {
                setActiveTab(currentTab);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sectionRefs, tabs, totalOffset]);

    const scrollToSection = (sectionId: string) => {
        const section = sectionRefs[sectionId]?.current;
        if (section) {
            const y = section.getBoundingClientRect().top + window.scrollY - (mainNavBarHeight + stickyNavBarHeight);
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <nav className={cn(
            "bg-white/95 backdrop-blur-lg border-b z-30 transition-all duration-300",
            isSticky ? "sticky top-16 shadow-md" : "relative"
        )}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 md:space-x-8 overflow-x-auto">
                        {/* When sticky, show the course title */}
                        {isSticky && (
                            <h3 className="hidden md:block text-lg font-bold text-gray-800 whitespace-nowrap pr-4">
                                {course.title}
                            </h3>
                        )}
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => scrollToSection(tab.id)}
                                className={cn(
                                    "py-4 px-2 md:px-4 text-sm md:text-base font-semibold border-b-2 transition-colors duration-200 whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-600 hover:text-blue-600"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {/* When sticky, show the price and an enroll button */}
                    {isSticky && (
                        <div className="hidden lg:flex items-center gap-4">
                            <span className="text-xl font-bold">₹{course.price}</span>
                            <Button size="sm">Enroll Now</Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default StickyTabNav;
