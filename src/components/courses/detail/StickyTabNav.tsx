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
    isDashboardView?: boolean; // NEW: Added to handle dashboard view context
}

const StickyTabNav: React.FC<StickyTabNavProps> = ({ tabs, sectionRefs, isDashboardView }) => {
    const [isSticky, setSticky] = useState(false);
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
    
    // Configurable heights for calculation
    const mainNavBarHeight = 64; 
    const dashboardSubHeaderHeight = 73; // Height of RegularBatchesTab header
    const stickyNavBarHeight = 57; 

    // Calculate total offset based on view
    const currentHeaderHeight = isDashboardView ? dashboardSubHeaderHeight : mainNavBarHeight;
    const totalOffset = currentHeaderHeight + stickyNavBarHeight + 16; 

    useEffect(() => {
        const handleScroll = () => {
            // Determine if the nav should be sticky
            // Threshold is lower in dashboard view as there is no large main navbar scroll
            const threshold = isDashboardView ? 200 : 350;
            setSticky(window.scrollY > threshold);

            // Logic for auto-highlighting the active tab on scroll
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
    }, [sectionRefs, tabs, totalOffset, isDashboardView]);

    // Scrolls to the correct section, accounting for the height of the nav bars
    const scrollToSection = (sectionId: string) => {
        const section = sectionRefs[sectionId]?.current;
        if (section) {
            const y = section.getBoundingClientRect().top + window.scrollY - (currentHeaderHeight + stickyNavBarHeight);
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <nav className={cn(
            "bg-white/80 backdrop-blur-lg border-b z-30 transition-all duration-300",
            // UPDATED: In dashboard mode, stick to top-73 (below sub-header)
            isSticky 
                ? (isDashboardView ? "sticky top-[73px] shadow-md" : "sticky top-16 shadow-md") 
                : "relative"
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
                                    ? "border-blue-600 text-blue-600"
                                    : "border-transparent text-gray-600 hover:text-blue-600"
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
