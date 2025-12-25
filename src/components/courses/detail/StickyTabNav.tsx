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
    isDashboardView?: boolean; // Prop to differentiate dashboard and standard view
}

const StickyTabNav: React.FC<StickyTabNavProps> = ({ tabs, sectionRefs, isDashboardView }) => {
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
    
    // Header heights for calculation
    const dashboardHeaderHeight = 73; // Matches ModernDashboard sub-header height
    const mainNavBarHeight = 64; // Standard site navbar height
    const stickyTabsHeight = 57;

    useEffect(() => {
        const handleScroll = () => {
            const currentHeader = isDashboardView ? dashboardHeaderHeight : mainNavBarHeight;
            const totalOffset = currentHeader + stickyTabsHeight + 20;

            // Logic for auto-highlighting the active tab on scroll
            let currentTab = '';
            for (const tab of tabs) {
                const section = sectionRefs[tab.id]?.current;
                if (section) {
                    const rect = section.getBoundingClientRect();
                    // Detect active section hitting the sticky bar boundary
                    if (rect.top <= totalOffset) {
                        currentTab = tab.id;
                    }
                }
            }
            if (currentTab) {
                setActiveTab(currentTab);
            }
        };

        // Listen to the specific dashboard scroll container if in dashboard view
        const scrollContainer = isDashboardView 
            ? document.querySelector('main.overflow-y-auto') 
            : window;

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [sectionRefs, tabs, isDashboardView, stickyTabsHeight]);

    // Scrolls to the correct section, accounting for the combined height of sticky bars
    const scrollToSection = (sectionId: string) => {
        const section = sectionRefs[sectionId]?.current;
        if (section) {
            const currentHeader = isDashboardView ? dashboardHeaderHeight : mainNavBarHeight;
            const scrollContainer = isDashboardView 
                ? document.querySelector('main.overflow-y-auto') 
                : window;

            if (scrollContainer) {
                const yOffset = -(currentHeader + stickyTabsHeight);
                const y = section.getBoundingClientRect().top + (isDashboardView ? (scrollContainer as HTMLElement).scrollTop : window.scrollY) + yOffset;
                
                if (isDashboardView) {
                    scrollContainer.scrollTo({ top: y, behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }
        }
    };

    return (
        <nav className={cn(
            "bg-white/90 backdrop-blur-md border-b z-30 w-full transition-all duration-300",
            // FIXED: Set top to exactly 73px to hang below the dashboard sub-header
            isDashboardView ? "sticky top-[73px] shadow-sm" : "sticky top-16 shadow-md"
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
