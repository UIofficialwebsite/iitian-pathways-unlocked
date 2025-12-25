import React, { useState, useEffect, RefObject, useRef } from 'react';
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
    const [headerOffset, setHeaderOffset] = useState(0);
    const navRef = useRef<HTMLElement>(null);
    
    // Sticky height for scroll calculations
    const stickyTabsHeight = 57;

    useEffect(() => {
        const updateOffset = () => {
            // Automatically find the main navbar or dashboard header
            const mainNav = document.querySelector('nav');
            // Check for announcement bar if it exists and is not fixed/floating
            const announcement = document.querySelector('.announcement-bar'); 
            
            let totalHeight = 0;
            if (mainNav) {
                totalHeight += mainNav.getBoundingClientRect().height;
            }
            
            // In Dashboard view, we might need to target a specific sub-header 
            // if the main nav is hidden or different
            if (isDashboardView) {
                const dashboardHeader = document.querySelector('[data-dashboard-header="true"]');
                if (dashboardHeader) totalHeight = dashboardHeader.getBoundingClientRect().height;
            }

            setHeaderOffset(totalHeight);
        };

        // Run once on mount and on every resize
        updateOffset();
        window.addEventListener('resize', updateOffset);

        const handleScroll = () => {
            const totalOffset = headerOffset + stickyTabsHeight + 20;

            let currentTab = '';
            for (const tab of tabs) {
                const section = sectionRefs[tab.id]?.current;
                if (section) {
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= totalOffset) {
                        currentTab = tab.id;
                    }
                }
            }
            if (currentTab) {
                setActiveTab(currentTab);
            }
        };

        const scrollContainer = isDashboardView 
            ? document.querySelector('main.overflow-y-auto') 
            : window;

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
            return () => {
                scrollContainer.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', updateOffset);
            };
        }
    }, [sectionRefs, tabs, isDashboardView, headerOffset]);

    const scrollToSection = (sectionId: string) => {
        const section = sectionRefs[sectionId]?.current;
        if (section) {
            const scrollContainer = isDashboardView 
                ? document.querySelector('main.overflow-y-auto') 
                : window;

            if (scrollContainer) {
                const yOffset = -(headerOffset + stickyTabsHeight);
                const scrollPos = isDashboardView ? (scrollContainer as HTMLElement).scrollTop : window.scrollY;
                const y = section.getBoundingClientRect().top + scrollPos + yOffset;
                
                scrollContainer.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    };

    return (
        <nav 
            ref={navRef}
            style={{ top: `${headerOffset}px` }} 
            className={cn(
                "bg-white/90 backdrop-blur-md border-b z-30 w-full transition-all duration-300 sticky shadow-md"
            )}
        >
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
