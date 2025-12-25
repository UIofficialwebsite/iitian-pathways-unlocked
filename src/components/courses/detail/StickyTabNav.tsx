import React, { useState, useEffect, RefObject } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
    id: string;
    label: string;
}

interface StickyTabNavProps {
    tabs: Tab[];
    sectionRefs: {
        [key: string]: RefObject<HTMLDivElement>;
    };
    isDashboardView?: boolean;
}

const StickyTabNav: React.FC<StickyTabNavProps> = ({ tabs, sectionRefs, isDashboardView }) => {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
    
    const mainNavBarHeight = 64; 
    const dashboardHeaderHeight = 73; 
    const stickyNavBarHeight = 57; 

    // Calculation for active tab highlighting during scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentHeader = isDashboardView ? dashboardHeaderHeight : mainNavBarHeight;
            const totalOffset = currentHeader + stickyNavBarHeight + 20;

            let currentTab = '';
            for (const tab of tabs) {
                const section = sectionRefs[tab.id]?.current;
                if (section && window.scrollY >= section.offsetTop - totalOffset) {
                    currentTab = tab.id;
                }
            }
            if (currentTab) setActiveTab(currentTab);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sectionRefs, tabs, isDashboardView]);

    const scrollToSection = (sectionId: string) => {
        const section = sectionRefs[sectionId]?.current;
        if (section) {
            const currentHeader = isDashboardView ? dashboardHeaderHeight : mainNavBarHeight;
            const y = section.getBoundingClientRect().top + window.scrollY - (currentHeader + stickyNavBarHeight);
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <nav className={cn(
            "bg-white border-b z-30 transition-all duration-300 w-full",
            /* FIXED: Explicit top offsets. 73px matches the RegularBatchesTab header height. */
            isDashboardView ? "sticky top-[73px] shadow-sm" : "sticky top-16 shadow-sm"
        )}>
            <div className="container mx-auto px-3 md:px-4">
                <div className="flex justify-start gap-1 md:gap-2 lg:gap-8 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => scrollToSection(tab.id)}
                            className={cn(
                                "py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm lg:text-base font-semibold border-b-2 transition-colors duration-200 whitespace-nowrap flex-shrink-0",
                                activeTab === tab.id
                                    ? "border-orange-500 text-orange-600"
                                    : "border-transparent text-gray-600 hover:text-orange-500"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default StickyTabNav;
