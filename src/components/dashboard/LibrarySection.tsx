import React, { useState, useMemo } from 'react';
import { Search, FileText, BookOpen, Filter, ArrowRight, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

// Helper function to determine the icon and color based on content type
// This ensures that the visual elements are derived from dynamic data, not hardcoded mock data
const getContentIcon = (type: 'Note' | 'PYQ', color: string) => {
  switch (type) {
    case 'Note':
      return <BookOpen className="h-6 w-6" style={{ color }} />;
    case 'PYQ':
      return <FileText className="h-6 w-6" style={{ color }} />;
    default:
      return <Download className="h-6 w-6" style={{ color }} />;
  }
};

interface LibrarySectionProps {
  profile: Tables<'profiles'> | null;
}

const LibrarySection: React.FC<LibrarySectionProps> = ({ profile }) => {
  const PRIMARY_COLOR_CLASS = 'text-royal';
  
  // --- Dynamic Content Hooks ---
  const { getFilteredContent, loading } = useBackend();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // --- 1. Fetch & Normalize Dynamic Data based on Profile (Focus Mode) ---
  const filteredData = useMemo(() => {
    // getFilteredContent(profile) ensures content is restricted to the user's focus area
    const content = getFilteredContent(profile);
    const combinedContent: any[] = [];

    // Process Notes
    content.notes.forEach(note => {
      combinedContent.push({
        id: note.id,
        type: 'Note',
        title: note.title,
        subject: note.subject,
        date: new Date(note.created_at).toLocaleDateString(),
        url: note.file_link || note.content_url,
        tag: 'PDF',
        category: 'Notes',
        color: '#2563EB', // Blue for Notes
      });
    });

    // Process PYQs
    content.pyqs.forEach(pyq => {
      combinedContent.push({
        id: pyq.id,
        type: 'PYQ',
        title: pyq.title,
        subject: pyq.subject,
        date: new Date(pyq.created_at).toLocaleDateString(),
        url: pyq.file_link || pyq.content_url,
        tag: 'Paper',
        category: 'PYQ',
        color: '#F97316', // Orange for PYQs
      });
    });

    return combinedContent;
  }, [profile, getFilteredContent]);

  // --- 2. Filter Logic ---
  const displayedContent = filteredData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeFilter === "All") return matchesSearch;
    return matchesSearch && item.type === activeFilter;
  });

  const filters = ["All", "Note", "PYQ"];
  const userFocusProgram = profile?.program_type === 'IITM_BS' ? 'IITM BS Degree' : profile?.program_type === 'JEE' ? 'JEE Exam' : profile?.program_type === 'NEET' ? 'NEET Exam' : 'Competitive Exam';

  const handleOpen = (url?: string | null) => {
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* --- UPPER TABINATION HEADER SECTION (Redesigned without back button) --- */}
      <div className="flex flex-col gap-4 border-b pb-4">
        {/* Text and left side arrow pointing towards right (simulated breadcrumb) */}
        <div className="flex items-center space-x-2 text-sm font-medium">
            <span className="text-gray-500 transition-colors hover:text-gray-700 cursor-pointer">Dashboard</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">UI Library</h1>
        </div>

        {/* Focus Mode Info (Below content based on focus mode strictly) */}
        <p className="text-gray-500 text-sm">
            Resources curated for your focus: <span className={cn('font-semibold', PRIMARY_COLOR_CLASS)}>{userFocusProgram}</span>
        </p>

        {/* --- SEARCH & FILTER BAR --- */}
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 md:items-center">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Search by title, subject or topic..." 
              className="pl-10 h-10 bg-transparent border-none shadow-none text-base focus-visible:ring-0 placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Vertical Divider (Desktop only) */}
          <div className="hidden md:block w-px h-6 bg-gray-200 mx-2"></div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 px-1 scrollbar-hide">
            <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                  activeFilter === filter
                    ? "bg-royal text-white border-royal shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
              >
                {filter === "Note" ? "Notes" : filter === "PYQ" ? "PYQs" : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- CONTENT CARDS SECTION (Redesigned Cards) --- */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading resources...</div>
          // Consider adding a proper skeleton loader here
        ) : displayedContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedContent.map((item) => (
              <Card 
                key={`${item.type}-${item.id}`} 
                className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl border-gray-200"
              >
                <CardHeader className="p-5 pb-3">
                  {/* Top Row: Icon & Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center p-2",
                      item.type === 'Note' ? "bg-blue-50" : "bg-orange-50"
                    )}>
                      {getContentIcon(item.type, item.color)}
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-500 font-semibold border-gray-200">
                      {item.tag}
                    </Badge>
                  </div>

                  {/* Content Info */}
                  <CardTitle className="font-bold text-gray-900 text-lg line-clamp-2 hover:text-royal transition-colors mb-1">
                    {item.title}
                  </CardTitle>
                  <p className="text-sm text-gray-500 font-medium line-clamp-1">
                    {item.subject || "General Resource"}
                  </p>
                </CardHeader>

                <CardContent className="px-5 py-3 flex-grow">
                  <span className="text-xs text-gray-400 font-medium">
                    Added: {item.date}
                  </span>
                </CardContent>

                {/* Footer Row: Action Button */}
                <CardFooter className="p-5 pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full text-royal border-royal hover:bg-royal hover:text-white transition-colors flex items-center justify-center gap-2"
                    onClick={() => handleOpen(item.url)}
                  >
                    View Content <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          // --- Empty State ---
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">No resources found</h3>
            <p className="text-gray-500 mt-2 text-center max-w-md">
              We couldn't find any matches for "{searchQuery}" in your <span className="font-semibold">{userFocusProgram}</span> resources. <br/>Try adjusting your search or filter settings.
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;
