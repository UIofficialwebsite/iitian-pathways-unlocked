import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, BookOpen, Filter, ChevronRight, Download, Video, Zap, FileQuestion, ArrowRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { Separator } from "@/components/ui/separator";

// --- Configuration for Categories ---
const contentCategories = [
    'PYQs (Previous Year Questions)',
    'Short Notes and Mindmaps',
    'Free Lectures',
    'Free Question Bank',
    'UI ki Padhai',
];

// Helper function to define visual style based on category
const getContentVisuals = (category: string) => {
  switch (category) {
    case 'PYQs (Previous Year Questions)':
      return { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', tag: 'Paper' };
    case 'Short Notes and Mindmaps':
      return { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', tag: 'PDF/Note' };
    case 'Free Lectures':
      return { icon: Video, color: 'text-green-600', bg: 'bg-green-50', tag: 'Video' };
    case 'Free Question Bank':
      return { icon: FileQuestion, color: 'text-purple-600', bg: 'bg-purple-50', tag: 'Test' };
    case 'UI ki Padhai':
      return { icon: Zap, color: 'text-red-600', bg: 'bg-red-50', tag: 'Course' };
    default:
      return { icon: Download, color: 'text-gray-600', bg: 'bg-gray-50', tag: 'Resource' };
  }
};

// --- Reusable Card Component ---
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

const ContentCard: React.FC<{ item: ContentItem; handleOpen: (url?: string | null) => void }> = ({ item, handleOpen }) => {
    const visuals = getContentVisuals(item.category);
    
    return (
        <Card 
            className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg border-gray-200 cursor-pointer bg-white"
            onClick={() => handleOpen(item.url)}
        >
            <CardHeader className="p-4 pb-2">
                {/* Top Row: Icon & Badge */}
                <div className="flex justify-between items-start mb-3">
                    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center p-2", visuals.bg)}>
                        <visuals.icon className="h-5 w-5" style={{ color: visuals.color }} />
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-500 font-semibold border-gray-200 text-xs">
                        {visuals.tag}
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
                    {item.date ? `Added: ${item.date}` : 'Date N/A'}
                </span>
            </CardContent>

            {/* Footer Row: Action Button */}
            <CardFooter className="p-4 pt-0">
                <Button 
                    size="sm"
                    variant="outline" 
                    className="w-full text-royal border-royal hover:bg-royal hover:text-white transition-colors flex items-center justify-center gap-1 text-sm"
                >
                    View Content <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
            </CardFooter>
        </Card>
    );
};


// --- Main Library Component ---
interface LibrarySectionProps {
  profile: Tables<'profiles'> | null;
}

const LibrarySection: React.FC<LibrarySectionProps> = ({ profile }) => {
  const navigate = useNavigate();
  const { getFilteredContent, loading } = useBackend();
  const [activeTab, setActiveTab] = useState(contentCategories[0]);
  const [showAll, setShowAll] = useState(false);
  
  // --- Data Categorization ---
  const allCategorizedContent = useMemo(() => {
    const content = getFilteredContent(profile);
    const contentMap: { [key: string]: ContentItem[] } = {};

    contentCategories.forEach(cat => contentMap[cat] = []);

    // 1. Map PYQs
    content.pyqs.forEach(pyq => {
      contentMap['PYQs (Previous Year Questions)'].push({
        id: pyq.id,
        type: 'PYQ',
        title: pyq.title,
        subject: pyq.subject,
        date: new Date(pyq.created_at).toLocaleDateString(),
        url: pyq.file_link || pyq.content_url,
        tag: getContentVisuals('PYQs (Previous Year Questions)').tag,
        category: 'PYQs (Previous Year Questions)',
        color: getContentVisuals('PYQs (Previous Year Questions)').color,
      });
    });

    // 2. Map Notes
    content.notes.forEach(note => {
      contentMap['Short Notes and Mindmaps'].push({
        id: note.id,
        type: 'Note',
        title: note.title,
        subject: note.subject,
        date: new Date(note.created_at).toLocaleDateString(),
        url: note.file_link || note.content_url,
        tag: getContentVisuals('Short Notes and Mindmaps').tag,
        category: 'Short Notes and Mindmaps',
        color: getContentVisuals('Short Notes and Mindmaps').color,
      });
    });

    // 3. Placeholders for demo
    const userFocusProgram = profile?.program_type || 'General';
    
    // Free Lectures
    contentMap['Free Lectures'].push(
        { id: 'mock-L1', title: `${userFocusProgram} Video Lecture: Core Concepts`, subject: 'Physics', date: 'Jul 20, 2025', type: 'Video', tag: 'Video', url: '#', category: 'Free Lectures', color: getContentVisuals('Free Lectures').color },
        { id: 'mock-L2', title: `${userFocusProgram} Class 2: Advanced Topics`, subject: 'Mathematics', date: 'Jul 22, 2025', type: 'Video', tag: 'Video', url: '#', category: 'Free Lectures', color: getContentVisuals('Free Lectures').color },
        { id: 'mock-L3', title: 'Problem Solving Session: Algebra', subject: 'Mathematics', date: 'Jul 24, 2025', type: 'Video', tag: 'Video', url: '#', category: 'Free Lectures', color: getContentVisuals('Free Lectures').color },
    );

    // Free Question Bank
    contentMap['Free Question Bank'].push(
        { id: 'mock-Q1', title: `${userFocusProgram} Full Syllabus Mock Test 1`, subject: 'All Subjects', date: 'Aug 01, 2025', type: 'Test', tag: 'Test', url: '#', category: 'Free Question Bank', color: getContentVisuals('Free Question Bank').color },
        { id: 'mock-Q2', title: 'Chapterwise Practice: Kinematics', subject: 'Physics', date: 'Aug 03, 2025', type: 'Test', tag: 'Test', url: '#', category: 'Free Question Bank', color: getContentVisuals('Free Question Bank').color },
        { id: 'mock-Q3', title: 'Organic Chemistry Speed Drills', subject: 'Chemistry', date: 'Aug 05, 2025', type: 'Test', tag: 'Test', url: '#', category: 'Free Question Bank', color: getContentVisuals('Free Question Bank').color },
        { id: 'mock-Q4', title: 'Calculus: Limits & Continuity Quiz', subject: 'Mathematics', date: 'Aug 08, 2025', type: 'Test', tag: 'Test', url: '#', category: 'Free Question Bank', color: getContentVisuals('Free Question Bank').color },
    );

    // UI ki Padhai
    contentMap['UI ki Padhai'].push(
        { id: 'ui-P1', title: 'Mastering Time Management for Exams', subject: 'Strategy', date: 'Sep 01, 2025', type: 'Course', tag: 'Course', url: '#', category: 'UI ki Padhai', color: getContentVisuals('UI ki Padhai').color },
        { id: 'ui-P2', title: 'Zero to Hero: Mechanics Series', subject: 'Physics', date: 'Sep 10, 2025', type: 'Course', tag: 'Course', url: '#', category: 'UI ki Padhai', color: getContentVisuals('UI ki Padhai').color },
        { id: 'ui-P3', title: 'How to Analyze Mock Tests Effectively', subject: 'Strategy', date: 'Sep 15, 2025', type: 'Course', tag: 'Course', url: '#', category: 'UI ki Padhai', color: getContentVisuals('UI ki Padhai').color },
    );

    return contentMap;
  }, [profile, getFilteredContent]);

  // Content for the currently active tab
  const fullContent = allCategorizedContent[activeTab] || [];
  const displayedContent = showAll ? fullContent : fullContent.slice(0, 6);
  const userFocusText = profile?.program_type === 'IITM_BS' ? 'IITM BS Degree' : profile?.program_type === 'JEE' ? 'JEE Exam' : profile?.program_type === 'NEET' ? 'NEET Exam' : 'Competitive Exam';

  const handleOpen = (url?: string | null) => {
    if (url) window.open(url, '_blank');
  };

  return (
    // Root container with negative margins to pull content up and left/right, ensuring no gray gaps
    <div className="flex flex-col min-h-screen bg-gray-50/50 -m-4 md:-m-8">
      
      {/* HEADER SECTION - White background, Sticky */}
      {/* sticky top-0 ensures it stays visible when scrolling */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
          
          {/* Top Row: Back Arrow + Title */}
          {/* pt-4 moves title up a bit. mb-8 adds space between title and tabs */}
          <div className="flex items-center gap-4 px-4 pt-4 md:px-8 md:pt-5 mb-8">
               <Button 
                    variant="ghost" 
                    size="icon" 
                    className="-ml-2 h-10 w-10 text-black hover:bg-gray-100/50 rounded-full"
                    onClick={() => navigate(-1)}
               >
                  <ArrowLeft className="h-6 w-6" />
               </Button>
               <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                   UI Library
               </h1>
          </div>

          {/* Bottom Row: Tabs Navigation */}
          <div className="px-4 md:px-8">
               <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
                    {contentCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => { setActiveTab(category); setShowAll(false); }}
                        className={cn(
                          "pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-[3px] px-1",
                          activeTab === category
                            ? "text-royal border-royal"
                            : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                        )}
                      >
                        {category}
                      </button>
                    ))}
               </div>
          </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full flex-1">
        
        {/* Content Header (No 'Curated Resources' text) */}
        <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold text-gray-900">
                {activeTab} Content
            </h2>
            {fullContent.length > 0 && (
                <Button 
                    variant="link" 
                    className="p-0 h-auto text-royal font-semibold flex items-center"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? 'Show Less' : `View All (${fullContent.length})`}
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            )}
        </div>
        
        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Fetching **{activeTab}** resources...</div>
        ) : displayedContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedContent.map((item) => (
                    <ContentCard key={item.id} item={item} handleOpen={handleOpen} />
                ))}
            </div>
        ) : (
          <div className="text-center py-20 text-gray-500 bg-white border border-dashed rounded-lg">
            <p>No resources found for **{activeTab}** in your **{userFocusText}** focus area.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;
