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
}

const StickyTabNav: React.FC<StickyTabNavProps> = ({ tabs, sectionRefs }) => {
    const [isSticky, setSticky] = useState(false);
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
    
    const mainNavBarHeight = 64; // Corresponds to h-16
    const stickyNavBarHeight = 57; // Approximate height of this sticky nav itself
    const totalOffset = mainNavBarHeight + stickyNavBarHeight + 16; // Added 16px for padding

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 350) { 
                setSticky(true);
            } else {
                setSticky(false);
            }

            let currentTab = '';
            for (const sectionId in sectionRefs) {
                const section = sectionRefs[sectionId].current;
                if (section && window.scrollY >= section.offsetTop - totalOffset) {
                    currentTab = sectionId;
                }
            }
            if (currentTab) {
                setActiveTab(currentTab);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [sectionRefs, totalOffset]);

    const scrollToSection = (sectionId: string) => {
        const section = sectionRefs[sectionId]?.current;
        if (section) {
            const y = section.getBoundingClientRect().top + window.scrollY - (mainNavBarHeight + stickyNavBarHeight);
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <nav className={cn(
            "bg-white/80 backdrop-blur-lg border-b border-gray-200 z-40 transition-all duration-300",
            isSticky ? "sticky top-16 shadow-md" : "relative"
        )}>
            <div className="container mx-auto px-4">
                <div className="flex justify-start space-x-2 md:space-x-8 overflow-x-auto">
                    {/* CHANGE: Now mapping over the 'tabs' prop instead of a hardcoded array */}
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
            </div>
        </nav>
    );
};

export default StickyTabNav;
