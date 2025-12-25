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
    const placeholderRef = useRef<HTMLDivElement>(null);
    
    const stickyTabsHeight = 57;
    // In dashboard view: "Back to All Batches" header is 73px
    // In standard view: main NavBar is 64px (h-16)
    const headerOffset = isDashboardView ? 73 : 64;

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
        const containerTop = scrollContainer?.getBoundingClientRect().top ?? 0;
        
        // Offset from top where we consider a section "active"
        // This is the header + sticky nav + some buffer
        const activationOffset = headerOffset + stickyTabsHeight + 50;
        
        let currentTab = tabs[0]?.id || '';
        let minDistance = Infinity;
        
        // Find the section that's closest to (but above) our activation line
        for (const tab of tabs) {
            const section = sectionRefs[tab.id]?.current;
            if (section) {
                const rect = section.getBoundingClientRect();
                // For dashboard view, calculate relative to the scroll container
                const sectionTop = isDashboardView 
                    ? rect.top - containerTop
                    : rect.top;
                
                // Section is considered active if its top is at or above the activation line
                if (sectionTop <= activationOffset) {
                    currentTab = tab.id;
                }
                
                // Also track which section is closest to activation point for edge cases
                const distance = Math.abs(sectionTop - activationOffset);
                if (distance < minDistance && sectionTop <= activationOffset + 100) {
                    minDistance = distance;
                }
            }
        }
        
        setActiveTab(currentTab);
    }, [tabs, sectionRefs, isDashboardView, headerOffset, getScrollContainer]);

    // Check if nav should be sticky
    const updateStickyState = useCallback(() => {
        if (!placeholderRef.current) return;
        
        const scrollContainer = getScrollContainer();
        
        if (isDashboardView && scrollContainer) {
            // In dashboard view, check position relative to the scroll container
            const containerRect = scrollContainer.getBoundingClientRect();
            const placeholderRect = placeholderRef.current.getBoundingClientRect();
            // Placeholder top relative to the container's viewport top
            const relativeTop = placeholderRect.top - containerRect.top;
            setIsSticky(relativeTop <= 0);
        } else {
            // Standard view - check against window
            const placeholderRect = placeholderRef.current.getBoundingClientRect();
            setIsSticky(placeholderRect.top <= headerOffset);
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
        handleScroll();

        return () => {
            scrollTarget.removeEventListener('scroll', handleScroll);
        };
    }, [getScrollContainer, updateStickyState, updateActiveTab]);

    const scrollToSection = (sectionId: string) => {
        const section = sectionRefs[sectionId]?.current;
        if (!section) return;

        const scrollContainer = getScrollContainer();
        
        if (isDashboardView && scrollContainer) {
            // Calculate position within the scroll container
            const containerRect = scrollContainer.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            const currentScroll = scrollContainer.scrollTop;
            
            // Target position: section top relative to container, minus sticky nav height
            const targetScroll = currentScroll + (sectionRect.top - containerRect.top) - stickyTabsHeight - 10;
            
            scrollContainer.scrollTo({ top: targetScroll, behavior: 'smooth' });
        } else {
            // Standard view - scroll window
            const yOffset = -(headerOffset + stickyTabsHeight + 10);
            const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
        
        // Immediately set active tab for responsiveness
        setActiveTab(sectionId);
    };

    return (
        <>
            {/* Placeholder to prevent layout shift when nav becomes fixed */}
            <div 
                ref={placeholderRef} 
                style={{ height: isSticky ? `${stickyTabsHeight}px` : '0px' }}
                aria-hidden="true"
            />
            
            <nav 
                ref={navRef}
                style={isSticky ? { 
                    position: isDashboardView ? 'sticky' : 'fixed',
                    top: isDashboardView ? '0px' : `${headerOffset}px`,
                    left: 0,
                    right: 0,
                } : undefined}
                className={cn(
                    "bg-white border-b w-full transition-shadow duration-200 z-40",
                    isSticky 
                        ? "shadow-md backdrop-blur-sm bg-white/98" 
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
        </>
    );
};

export default StickyTabNav;
