import React, { useState, useMemo } from 'react';
import { Search, FileText, BookOpen, Download, Filter, ArrowRight } from "lucide-react";
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

  // --- 1. Get Content based on Focus Area ---
  const filteredData = useMemo(() => {
    const content = getFilteredContent(profile);
    const combinedContent: any[] = [];

    // Normalize Notes
    content.notes.forEach(note => {
      combinedContent.push({
        id: note.id,
        type: 'Note',
        title: note.title,
        subject: note.subject,
        date: new Date(note.created_at).toLocaleDateString(),
        url: note.file_link || note.content_url,
        tag: 'PDF'
      });
    });

    // Normalize PYQs
    content.pyqs.forEach(pyq => {
      combinedContent.push({
        id: pyq.id,
        type: 'PYQ',
        title: pyq.title,
        subject: pyq.subject,
        date: new Date(pyq.created_at).toLocaleDateString(),
        url: pyq.file_link || pyq.content_url,
        tag: 'Paper'
      });
    });

    return combinedContent;
  }, [profile, getFilteredContent]);

  // --- 2. Apply Search & Type Filters ---
  const displayedContent = filteredData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = activeFilter === "All" || item.type === activeFilter;
    return matchesSearch && matchesType;
  });

  const filters = ["All", "Note", "PYQ"];

  // --- Helper: Open Link ---
  const handleOpen = (url?: string | null) => {
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library</h1>
          <p className="text-gray-500 text-sm mt-1">
            Curated resources for your {profile?.program_type === 'IITM_BS' ? 'IITM BS Degree' : profile?.exam_type || 'Exam'} preparation
          </p>
        </div>
      </div>

      {/* --- SEARCH & FILTERS BAR --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search for notes, papers, topics..." 
            className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-royal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Filter className="h-4 w-4 text-gray-400 mr-1 hidden md:block" />
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                activeFilter === filter
                  ? "bg-royal text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {filter === "Note" ? "Notes" : filter === "PYQ" ? "PYQs" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      {displayedContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedContent.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden">
              <div className="p-5 flex flex-col h-full">
                
                <div className="flex justify-between items-start mb-4">
                  {/* Icon Container */}
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                    item.type === 'Note' ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {item.type === 'Note' ? <BookOpen className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                  </div>
                  
                  {/* Tag */}
                  <Badge variant="secondary" className="bg-gray-100 text-gray-500 hover:bg-gray-200">
                    {item.tag}
                  </Badge>
                </div>

                {/* Content Info */}
                <div className="mb-4 flex-grow">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-royal transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {item.subject || "General Resource"}
                  </p>
                </div>

                {/* Footer & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <span className="text-xs text-gray-400 font-medium">
                    {item.date}
                  </span>
                  
                  <Button 
                    size="sm" 
                    className={cn(
                      "h-8 px-4 rounded-lg transition-all",
                      item.type === 'Note' ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-500 hover:bg-orange-600"
                    )}
                    onClick={() => handleOpen(item.url)}
                  >
                    {item.type === 'Note' ? "Read" : "Solve"} 
                    <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Button>
                </div>

              </div>
            </Card>
          ))}
        </div>
      ) : (
        // --- EMPTY STATE ---
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No resources found</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-xs text-center">
            Try adjusting your search or filters. We are constantly adding new content!
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default LibrarySection;
