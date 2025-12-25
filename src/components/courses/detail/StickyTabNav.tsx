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
    
    const dashboardHeaderHeight = 73; 
    const mainNavBarHeight = 64; 
    const stickyTabsHeight = 57;

    useEffect(() => {
        const handleScroll = () => {
            const currentHeader = isDashboardView ? dashboardHeaderHeight : mainNavBarHeight;
            const totalOffset = currentHeader + stickyTabsHeight + 10;

            let currentTab = '';
            for (const tab of tabs) {
                const section = sectionRefs[tab.id]?.current;
                if (section) {
                    const rect = section.getBoundingClientRect();
                    // Detect if section top is hitting the bottom of the sticky nav
                    if (rect.top <= totalOffset + 10) {
                        currentTab = tab.id;
                    }
                }
            }
            if (currentTab) setActiveTab(currentTab);
        };

        const scrollContainer = isDashboardView 
            ? document.querySelector('main.overflow-y-auto') 
            : window;

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [sectionRefs, tabs, isDashboardView]);

    const scrollToSection = (sectionId: string) => {
        const section = sectionRefs[sectionId]?.current;
        if (section) {
            const currentHeader = isDashboardView ? dashboardHeaderHeight : mainNavBarHeight;
            const yOffset = -(currentHeader + stickyTabsHeight);
            const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <nav className={cn(
            "bg-white/90 backdrop-blur-md border-b z-30 w-full transition-all duration-300",
            isDashboardView ? "sticky top-[73px] shadow-sm" : "sticky top-16 shadow-md"
        )}>
            <div className="container mx-auto px-3 md:px-4">
                <div className="flex justify-start gap-4 md:gap-8 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => scrollToSection(tab.id)}
                            className={cn(
                                "py-4 px-2 text-sm md:text-base font-bold border-b-2 transition-colors whitespace-nowrap",
                                activeTab === tab.id
                                    ? "border-orange-500 text-orange-600"
                                    : "border-transparent text-gray-500 hover:text-orange-500"
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
