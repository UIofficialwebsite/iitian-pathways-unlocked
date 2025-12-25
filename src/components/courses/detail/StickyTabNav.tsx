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
    const [isSticky, setIsSticky] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);
    const stickyTabsHeight = 57;
    
    // Fixed header height - main navbar is 64px (h-16)
    const headerOffset = isDashboardView ? 73 : 64;

    useEffect(() => {
        const scrollContainer = isDashboardView 
            ? document.querySelector('main.overflow-y-auto') 
            : window;

        if (!scrollContainer) return;

        const handleScroll = () => {
            // Check if nav should be sticky
            if (placeholderRef.current) {
                const placeholderRect = placeholderRef.current.getBoundingClientRect();
                // Nav becomes sticky when its placeholder reaches the bottom of the header
                setIsSticky(placeholderRect.top <= headerOffset);
            }

            // Update active tab based on scroll position
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
            if (currentTab) setActiveTab(currentTab);
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check

        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
        };
    }, [sectionRefs, tabs, isDashboardView, headerOffset]);

    const scrollToSection = (sectionId: string) => {
        const section = sectionRefs[sectionId]?.current;
        if (section) {
            const scrollContainer = isDashboardView 
                ? document.querySelector('main.overflow-y-auto') 
                : window;

            if (scrollContainer) {
                const yOffset = -(headerOffset + stickyTabsHeight);
                const currentScroll = isDashboardView 
                    ? (scrollContainer as HTMLElement).scrollTop 
                    : window.scrollY;
                const y = section.getBoundingClientRect().top + currentScroll + yOffset;
                
                scrollContainer.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    };

    return (
        <>
            {/* Placeholder to prevent layout shift when nav becomes fixed */}
            <div 
                ref={placeholderRef} 
                style={{ height: isSticky ? `${stickyTabsHeight}px` : '0px' }}
                className="transition-[height] duration-0"
            />
            
            <nav 
                ref={navRef}
                style={isSticky ? { top: `${headerOffset}px` } : undefined}
                className={cn(
                    "bg-white border-b w-full transition-shadow duration-300 z-40",
                    isSticky 
                        ? "fixed left-0 right-0 shadow-md backdrop-blur-md bg-white/95" 
                        : "relative shadow-none"
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
        </>
    );
};

export default StickyTabNav;
