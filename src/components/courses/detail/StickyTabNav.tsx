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
    const visibleSections = useRef<Set<string>>(new Set());
    
    const stickyTabsHeight = 57;
    const headerOffset = isDashboardView ? 0 : 64;

    // Get the scroll container based on view type
    const getScrollContainer = useCallback(() => {
        if (isDashboardView) {
            return document.querySelector('.overflow-y-auto.custom-scrollbar') as HTMLElement | null;
        }
        return null;
    }, [isDashboardView]);

    // Intersection Observer for scroll-spy
    useEffect(() => {
        const scrollContainer = getScrollContainer();
        
        // Root margin: negative top margin to account for sticky nav height
        // This makes sections "enter" when they reach just below the sticky nav
        const rootMargin = `-${stickyTabsHeight + 20}px 0px -50% 0px`;
        
        const observerOptions: IntersectionObserverInit = {
            root: isDashboardView ? scrollContainer : null,
            rootMargin,
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
        };

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                const sectionId = entry.target.getAttribute('data-section-id');
                if (!sectionId) return;

                if (entry.isIntersecting) {
                    visibleSections.current.add(sectionId);
                } else {
                    visibleSections.current.delete(sectionId);
                }
            });

            // Determine which tab should be active based on visible sections
            // Priority: the first (topmost) visible section in tab order
            const tabOrder = tabs.map(t => t.id);
            let newActiveTab = activeTab;

            for (const tabId of tabOrder) {
                if (visibleSections.current.has(tabId)) {
                    newActiveTab = tabId;
                    break;
                }
            }

            // If no sections visible, keep the last active or find closest
            if (visibleSections.current.size === 0) {
                // Find the section that's closest above the viewport
                const container = isDashboardView ? scrollContainer : null;
                const containerTop = container?.getBoundingClientRect().top ?? 0;
                
                let closestAbove: string | null = null;
                let closestDistance = Infinity;

                for (const tab of tabs) {
                    const section = sectionRefs[tab.id]?.current;
                    if (section) {
                        const rect = section.getBoundingClientRect();
                        const sectionTop = isDashboardView ? rect.top - containerTop : rect.top;
                        
                        // Section is above the activation line
                        if (sectionTop < stickyTabsHeight + 50) {
                            const distance = Math.abs(sectionTop);
                            if (distance < closestDistance) {
                                closestDistance = distance;
                                closestAbove = tab.id;
                            }
                        }
                    }
                }

                if (closestAbove) {
                    newActiveTab = closestAbove;
                }
            }

            if (newActiveTab !== activeTab) {
                setActiveTab(newActiveTab);
            }
        };

        const observer = new IntersectionObserver(handleIntersection, observerOptions);

        // Observe all sections
        tabs.forEach((tab) => {
            const section = sectionRefs[tab.id]?.current;
            if (section) {
                section.setAttribute('data-section-id', tab.id);
                observer.observe(section);
            }
        });

        return () => {
            observer.disconnect();
            visibleSections.current.clear();
        };
    }, [tabs, sectionRefs, isDashboardView, getScrollContainer, activeTab]);

    // Shadow state based on scroll position
    useEffect(() => {
        const scrollContainer = getScrollContainer();
        const scrollTarget = scrollContainer || window;

        const handleScroll = () => {
            if (!navRef.current) return;
            
            const rect = navRef.current.getBoundingClientRect();
            
            if (isDashboardView && scrollContainer) {
                const containerRect = scrollContainer.getBoundingClientRect();
                setIsSticky(rect.top <= containerRect.top + 5);
            } else {
                setIsSticky(rect.top <= headerOffset + 5);
            }
        };

        scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
        requestAnimationFrame(handleScroll);

        return () => {
            scrollTarget.removeEventListener('scroll', handleScroll);
        };
    }, [getScrollContainer, isDashboardView, headerOffset]);

    const scrollToSection = (sectionId: string) => {
        const section = sectionRefs[sectionId]?.current;
        if (!section) return;

        const scrollContainer = getScrollContainer();
        
        if (isDashboardView && scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            const currentScroll = scrollContainer.scrollTop;
            
            const targetScroll = currentScroll + (sectionRect.top - containerRect.top) - stickyTabsHeight - 10;
            
            scrollContainer.scrollTo({ top: targetScroll, behavior: 'smooth' });
        } else {
            const yOffset = -(headerOffset + stickyTabsHeight + 10);
            const y = section.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
        
        setActiveTab(sectionId);
    };

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
