import React, { useState, useEffect, RefObject } from 'react';
import { cn } from '@/lib/utils';

interface StickyTabNavProps {
    sectionRefs: {
        [key: string]: RefObject<HTMLDivElement>;
    };
}

const TABS = [
    { id: 'features', label: 'Features' },
    { id: 'about', label: 'About' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'ssp', label: 'SSP Portal' },
    { id: 'faq', label: 'FAQs' },
];

const StickyTabNav: React.FC<StickyTabNavProps> = ({ sectionRefs }) => {
    const [isSticky, setSticky] = useState(false);
    const [activeTab, setActiveTab] = useState('features');
    
    const navBarHeight = 64; // h-16 for main navbar

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
                if (section && window.scrollY >= section.offsetTop - (navBarHeight * 2)) {
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
    }, [sectionRefs]);

    // This function is now simplified and more robust
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    return (
        <nav className={cn(
            "bg-white/80 backdrop-blur-lg border-b border-gray-200 z-40 transition-all duration-300",
            isSticky ? "sticky top-16 shadow-md" : "relative"
        )}>
            <div className="container mx-auto px-4">
                <div className="flex justify-start space-x-2 md:space-x-8">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            // The onClick handler now calls the simplified function
                            onClick={() => scrollToSection(tab.id)}
                            className={cn(
                                "py-4 px-2 md:px-4 text-sm md:text-base font-semibold border-b-2 transition-colors duration-200",
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
