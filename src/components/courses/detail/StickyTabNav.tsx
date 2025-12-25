import React, { useState, useEffect, RefObject, useRef, useCallback } from 'react';
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
    
    const stickyTabsHeight = 57;
    // In standard view: main NavBar is 64px (h-16)
    const headerOffset = isDashboardView ? 0 : 64;

    // Get the scroll container based on view type
    const getScrollContainer = useCallback(() => {
        if (isDashboardView) {
            // In dashboard, scroll happens in the overflow-y-auto container
            return document.querySelector('.overflow-y-auto.custom-scrollbar') as HTMLElement | null;
        }
        return null; // Use window for standard view
    }, [isDashboardView]);

    // Scroll-spy: determine which section is currently active
    const updateActiveTab = useCallback(() => {
        const scrollContainer = getScrollContainer();
        
        // Offset from top where we consider a section "active"
        const activationOffset = stickyTabsHeight + 80;
        
        let currentTab = tabs[0]?.id || '';
        
        for (const tab of tabs) {
            const section = sectionRefs[tab.id]?.current;
            if (section) {
                const rect = section.getBoundingClientRect();
                
                if (isDashboardView && scrollContainer) {
                    const containerRect = scrollContainer.getBoundingClientRect();
                    const sectionTop = rect.top - containerRect.top;
                    if (sectionTop <= activationOffset) {
                        currentTab = tab.id;
                    }
                } else {
                    if (rect.top <= activationOffset + headerOffset) {
                        currentTab = tab.id;
                    }
                }
            }
        }
        
        setActiveTab(currentTab);
    }, [tabs, sectionRefs, isDashboardView, headerOffset, getScrollContainer]);

    // Check if nav should show shadow (is in sticky mode)
    const updateStickyState = useCallback(() => {
        if (!navRef.current) return;
        
        const rect = navRef.current.getBoundingClientRect();
        
        if (isDashboardView) {
            const scrollContainer = getScrollContainer();
            if (scrollContainer) {
                const containerRect = scrollContainer.getBoundingClientRect();
                // Nav is sticky when its top is at or near the container top
                setIsSticky(rect.top <= containerRect.top + 5);
            }
        } else {
            setIsSticky(rect.top <= headerOffset + 5);
        }
    }, [isDashboardView, headerOffset, getScrollContainer]);

    useEffect(() => {
        const scrollContainer = getScrollContainer();
        const scrollTarget = scrollContainer || window;

        const handleScroll = () => {
            updateStickyState();
            updateActiveTab();
        };

        scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial check
        requestAnimationFrame(handleScroll);

        return () => {
            scrollTarget.removeEventListener('scroll', handleScroll);
        };
    }, [getScrollContainer, updateStickyState, updateActiveTab]);

    const scrollToSection = (sectionId: string) => {
        const section = sectionRefs[sectionId]?.current;
        if (!section) return;

        const scrollContainer = getScrollContainer();
        
        if (isDashboardView && scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            const currentScroll = scrollContainer.scrollTop;
            
            // Target position: section top relative to container, minus sticky nav height
            const targetScroll = currentScroll + (sectionRect.top - containerRect.top) - stickyTabsHeight - 10;
            
            scrollContainer.scrollTo({ top: targetScroll, behavior: 'smooth' });
        } else {
            const yOffset = -(headerOffset + stickyTabsHeight + 10);
            const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
        
        setActiveTab(sectionId);
    };

    // For dashboard view: always use sticky positioning within the scroll container
    // For standard view: use sticky with top offset for the fixed navbar
    return (
        <nav 
            ref={navRef}
            style={{ top: isDashboardView ? '0px' : `${headerOffset}px` }}
            className={cn(
                "bg-white border-b w-full z-40 sticky",
                "transition-shadow duration-200",
                isSticky 
                    ? "shadow-md backdrop-blur-sm bg-white/98" 
                    : "shadow-none"
            )}
        >
            <div className="container mx-auto px-3 md:px-4">
                <div className="flex justify-start gap-1 md:gap-2 lg:gap-8 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => scrollToSection(tab.id)}
                            className={cn(
                                "py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm lg:text-base font-semibold border-b-2 transition-all duration-200 whitespace-nowrap flex-shrink-0",
                                activeTab === tab.id
                                    ? "border-orange-500 text-orange-600"
                                    : "border-transparent text-gray-600 hover:text-orange-500 hover:border-orange-200"
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
