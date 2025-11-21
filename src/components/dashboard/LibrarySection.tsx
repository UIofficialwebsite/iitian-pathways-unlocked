import React, { useState, useMemo } from 'react';
import { Search, FileText, BookOpen, Filter, ArrowRight, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

interface LibrarySectionProps {
  profile: Tables<'profiles'> | null;
}

const LibrarySection: React.FC<LibrarySectionProps> = ({ profile }) => {
  const { getFilteredContent, loading } = useBackend();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // --- 1. Fetch & Normalize Data based on Profile ---
  const filteredData = useMemo(() => {
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
        category: 'Notes'
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
        category: 'PYQ'
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

  const handleOpen = (url?: string | null) => {
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      
      {/* --- TOP HEADER SECTION --- */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Library</h1>
          <p className="text-gray-500 mt-2 text-base">
            Access all your {profile?.program_type === 'IITM_BS' ? 'IITM BS Degree' : 'Competitive Exam'} resources in one place.
          </p>
        </div>

        {/* --- SEARCH & FILTER BAR --- */}
        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-2 md:items-center">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Search by title, subject or topic..." 
              className="pl-10 h-12 bg-transparent border-none shadow-none text-base focus-visible:ring-0 placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Vertical Divider (Desktop only) */}
          <div className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 px-2 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  activeFilter === filter
                    ? "bg-royal text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                )}
              >
                {filter === "Note" ? "Notes" : filter === "PYQ" ? "PYQs" : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- CONTENT CARDS SECTION --- */}
      <div className="min-h-[400px]">
        {displayedContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedContent.map((item) => (
              <Card 
                key={`${item.type}-${item.id}`} 
                className="group hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden cursor-pointer bg-white"
                onClick={() => handleOpen(item.url)}
              >
                <div className="p-5 flex flex-col h-full">
                  
                  {/* Top Row: Icon & Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                      item.type === 'Note' ? "bg-blue-50 text-blue-600" : 
                      item.type === 'PYQ' ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                    )}>
                      {item.type === 'Note' ? <BookOpen className="h-6 w-6" /> : 
                       item.type === 'PYQ' ? <FileText className="h-6 w-6" /> : <Download className="h-6 w-6" />}
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-500 group-hover:bg-royal/5 group-hover:text-royal transition-colors">
                      {item.tag}
                    </Badge>
                  </div>

                  {/* Content Info */}
                  <div className="mb-4 flex-grow">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-royal transition-colors mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {item.subject || "General Resource"}
                    </p>
                  </div>

                  {/* Footer Row: Date & Action Arrow */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-xs text-gray-400 font-medium">
                      Added: {item.date}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-royal group-hover:text-white transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                </div>
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
              We couldn't find any matches for "{searchQuery}". <br/>Try adjusting your search or filter settings.
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
