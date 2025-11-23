import React, { useState, useMemo } from 'react';
import { Search, FileText, BookOpen, Filter, ChevronRight, Download, Video, Zap, FileQuestion } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { Separator } from "@/components/ui/separator";

// --- 1. Content Categories and Mapping ---
const contentCategories = [
    'PYQs (Previous Year Questions)',
    'Short Notes and Mindmaps',
    'Free Lectures',
    'Free Question Bank',
    'UI ki Padhai', // Special course/content
];

// Helper function to determine the icon, color, and background based on content type/category
const getContentVisuals = (category: string) => {
  switch (category) {
    case 'PYQs (Previous Year Questions)':
      return { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' };
    case 'Short Notes and Mindmaps':
      return { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' };
    case 'Free Lectures':
      return { icon: Video, color: 'text-green-600', bg: 'bg-green-50' };
    case 'Free Question Bank':
      return { icon: FileQuestion, color: 'text-purple-600', bg: 'bg-purple-50' };
    case 'UI ki Padhai':
      return { icon: Zap, color: 'text-red-600', bg: 'bg-red-50' };
    default:
      return { icon: Download, color: 'text-gray-600', bg: 'bg-gray-50' };
  }
};

// --- 2. Generic Card Component (Similar Type of Cardings) ---
interface ContentItem {
  id: string | number;
  type: string;
  title: string;
  subject?: string;
  date?: string;
  url?: string | null;
  tag: string;
  category: string;
  color: string;
}

interface ContentCardProps {
  item: ContentItem;
  handleOpen: (url?: string | null) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, handleOpen }) => {
    const visuals = getContentVisuals(item.category);
    
    return (
        <Card 
            key={`${item.type}-${item.id}`} 
            className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl border-gray-200 cursor-pointer"
            onClick={() => handleOpen(item.url)}
        >
            <CardHeader className="p-4 pb-2">
                {/* Top Row: Icon & Badge */}
                <div className="flex justify-between items-start mb-3">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center p-2", visuals.bg)}>
                        <visuals.icon className="h-5 w-5" style={{ color: item.color }} />
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-500 font-semibold border-gray-200 text-xs">
                        {item.tag}
                    </Badge>
                </div>

                {/* Content Info */}
                <CardTitle className="font-bold text-gray-900 text-base line-clamp-2 hover:text-royal transition-colors">
                    {item.title}
                </CardTitle>
                <p className="text-xs text-gray-500 font-medium line-clamp-1">
                    {item.subject || item.category}
                </p>
            </CardHeader>

            <CardContent className="px-4 py-2 flex-grow">
                <span className="text-xs text-gray-400 font-medium">
                    {item.date ? `Added: ${item.date}` : 'Always Available'}
                </span>
            </CardContent>

            {/* Footer Row: Action Button */}
            <CardFooter className="p-4 pt-0">
                <Button 
                    size="sm"
                    variant="outline" 
                    className="w-full text-royal border-royal hover:bg-royal hover:text-white transition-colors flex items-center justify-center gap-1 text-sm"
                >
                    View <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </CardFooter>
        </Card>
    );
};

// --- 3. Content Row Component (Scrollable 2x3 Grid) ---
interface ContentCategoryRowProps {
    category: string;
    items: ContentItem[];
    handleOpen: (url?: string | null) => void;
}

const ContentCategoryRow: React.FC<ContentCategoryRowProps> = ({ category, items, handleOpen }) => {
    // Only show the first 6 items in the initial visible grid
    const visibleItems = items.slice(0, 6);
    const hasMore = items.length > 6;

    // Use a unique ID for the scrollable container
    const scrollContainerId = `scroll-${category.replace(/\s/g, '-')}`;

    // Simple scroll handler (for demonstration, a full-featured carousel would use refs)
    const scroll = (direction: 'left' | 'right') => {
        const container = document.getElementById(scrollContainerId);
        if (container) {
            // Adjust scroll amount based on card width (approx 3 columns worth)
            const scrollAmount = container.offsetWidth * 0.9; 
            container.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{category}</h2>
                <div className="flex items-center space-x-4">
                    {hasMore && (
                        <>
                            {/* Side Arrows for Scrolling */}
                            <Button variant="outline" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100" onClick={() => scroll('left')}>
                                <ChevronRight className="h-4 w-4 rotate-180" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-gray-600 hover:bg-gray-100" onClick={() => scroll('right')}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    {/* View All Link */}
                    <Button variant="link" className="p-0 h-auto text-royal font-semibold">
                        View All
                    </Button>
                </div>
            </div>

            <div 
                id={scrollContainerId} 
                className="grid grid-flow-col-dense auto-cols-[calc((100%/3)-1rem)] md:auto-cols-[calc((100%/3)-1rem)] lg:auto-cols-[calc((100%/3)-1rem)] gap-4 overflow-x-scroll pb-4 scrollbar-hide snap-x"
                style={{ gridTemplateRows: 'repeat(2, auto)' }} // Force 2 rows
            >
                {visibleItems.map((item) => (
                    <div key={item.id} className="snap-start">
                         <ContentCard item={item} handleOpen={handleOpen} />
                    </div>
                ))}
                
                {/* Placeholder for remaining items to enable scrolling for demonstration */}
                {items.length > visibleItems.length && [...Array(items.length - visibleItems.length)].map((_, index) => (
                     <div key={`extra-${index}`} className="snap-start min-w-[250px] md:min-w-full">
                         {/* Optional: Add a placeholder card or nothing */}
                    </div>
                ))}
            </div>
             <Separator /> {/* Separator between categories */}
        </div>
    );
};

// --- 4. Main Library Component ---
interface LibrarySectionProps {
  profile: Tables<'profiles'> | null;
}

const LibrarySection: React.FC<LibrarySectionProps> = ({ profile }) => {
  const PRIMARY_COLOR_CLASS = 'text-royal';
  const { getFilteredContent, loading } = useBackend();
  const [activeTab, setActiveTab] = useState(contentCategories[0]);
  
  // --- Data Categorization based on Focus Mode (Intelligence) ---
  const allCategorizedContent = useMemo(() => {
    // This hook call is key for content filtered by profile (Focus Mode)
    const content = getFilteredContent(profile);
    const contentMap: { [key: string]: ContentItem[] } = {};

    // Initialize map with empty arrays
    contentCategories.forEach(cat => contentMap[cat] = []);

    // Process Notes (Mapped to Short Notes and Mindmaps)
    content.notes.forEach(note => {
      contentMap['Short Notes and Mindmaps'].push({
        id: note.id,
        type: 'Note',
        title: note.title,
        subject: note.subject,
        date: new Date(note.created_at).toLocaleDateString(),
        url: note.file_link || note.content_url,
        tag: 'PDF/Note',
        category: 'Short Notes and Mindmaps',
        color: getContentVisuals('Short Notes and Mindmaps').color,
      });
    });

    // Process PYQs (Mapped directly)
    content.pyqs.forEach(pyq => {
      contentMap['PYQs (Previous Year Questions)'].push({
        id: pyq.id,
        type: 'PYQ',
        title: pyq.title,
        subject: pyq.subject,
        date: new Date(pyq.created_at).toLocaleDateString(),
        url: pyq.file_link || pyq.content_url,
        tag: 'Paper',
        category: 'PYQs (Previous Year Questions)',
        color: getContentVisuals('PYQs (Previous Year Questions)').color,
      });
    });

    // --- Add Placeholder content for missing categories to demonstrate the UI (Must be replaced by proper backend fetching) ---
    const userFocusProgram = profile?.program_type || 'General';

    if (contentMap['Free Lectures'].length === 0) {
         contentMap['Free Lectures'].push(
            { id: 'mock-L1', title: `${userFocusProgram} Video Lecture: Core Concepts`, subject: 'Physics', date: 'Jul 20, 2025', type: 'Video', tag: 'Video', url: '#', category: 'Free Lectures', color: getContentVisuals('Free Lectures').color },
            { id: 'mock-L2', title: `${userFocusProgram} Class 2: Advanced Topics`, subject: 'Mathematics', date: 'Jul 22, 2025', type: 'Video', tag: 'Video', url: '#', category: 'Free Lectures', color: getContentVisuals('Free Lectures').color },
        );
    }
    if (contentMap['Free Question Bank'].length === 0) {
         contentMap['Free Question Bank'].push(
            { id: 'mock-QB1', title: `${userFocusProgram} Mock Test Series 1`, subject: 'All Subjects', date: 'Aug 01, 2025', type: 'Test', tag: 'Test', url: '#', category: 'Free Question Bank', color: getContentVisuals('Free Question Bank').color },
            { id: 'mock-QB2', title: `${userFocusProgram} Chapter Practice Set`, subject: 'Chemistry', date: 'Aug 05, 2025', type: 'Test', tag: 'Test', url: '#', category: 'Free Question Bank', color: getContentVisuals('Free Question Bank').color },
        );
    }
    if (contentMap['UI ki Padhai'].length === 0) {
         contentMap['UI ki Padhai'].push(
            { id: 'mock-UI1', title: `Premium Course Access: UI ki Padhai`, subject: 'Full Program', date: 'Enroll Now', type: 'Course', tag: 'Course', url: '#', category: 'UI ki Padhai', color: getContentVisuals('UI ki Padhai').color },
        );
    }

    return contentMap;
  }, [profile, getFilteredContent]);

  // Content for the currently active tab
  const activeContent = allCategorizedContent[activeTab] || [];

  const userFocusText = profile?.program_type === 'IITM_BS' ? 'IITM BS Degree' : profile?.program_type === 'JEE' ? 'JEE Exam' : profile?.program_type === 'NEET' ? 'NEET Exam' : 'Competitive Exam';

  const handleOpen = (url?: string | null) => {
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* --- UPPER HEADER / BREADCRUMB SECTION (Arrow UI Library) --- */}
      <div className="flex flex-col gap-4 border-b pb-4">
        <div className="flex items-center space-x-2 text-sm font-medium">
            <span className="text-gray-500 transition-colors hover:text-gray-700 cursor-pointer">Dashboard</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">UI Library</h1>
        </div>

        {/* Focus Mode Information */}
        <p className="text-gray-500 text-sm">
            Resources curated for your focus: <span className={cn('font-semibold', PRIMARY_COLOR_CLASS)}>{userFocusText}</span>
        </p>

        {/* --- NAVIGATION BAR OPTIONS (Tabs) --- */}
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {contentCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border-b-2",
                  activeTab === category
                    ? "text-royal border-royal font-semibold bg-royal/5"
                    : "text-gray-600 border-transparent hover:border-gray-300 hover:text-gray-800"
                )}
              >
                {category}
              </button>
            ))}
        </div>
      </div>

      {/* --- CONTENT CARDS SECTION (Based on current Tab and Focus Mode) --- */}
      <div className="min-h-[400px] space-y-6">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Fetching resources tailored for **{userFocusText}**...</div>
        ) : (
             <ContentCategoryRow 
                category={activeTab} 
                items={activeContent} 
                handleOpen={handleOpen} 
            />
        )}

         {/* This is the primary display area. In a single-page view, all categories might be listed one after another: 
        {loading ? (
           <div className="text-center py-20 text-gray-500">Fetching resources...</div>
        ) : (
             Object.entries(allCategorizedContent).map(([category, items]) => {
                if (items.length === 0) return null;
                return <ContentCategoryRow 
                    key={category} 
                    category={category} 
                    items={items} 
                    handleOpen={handleOpen} 
                />;
            })
        )} 
        */}
      </div>
    </div>
  );
};

export default LibrarySection;
