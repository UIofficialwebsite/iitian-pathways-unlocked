import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, BookOpen, Video, Zap, FileQuestion, ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { useStudyMaterials } from "@/hooks/useStudyMaterials";

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
      // Updated tag to PDF as requested
      return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', tag: 'PDF' };
    case 'Free Lectures':
      return { icon: Video, color: 'text-green-600', bg: 'bg-green-50', tag: 'Video' };
    case 'Free Question Bank':
      return { icon: FileQuestion, color: 'text-purple-600', bg: 'bg-purple-50', tag: 'Test' };
    case 'UI ki Padhai':
      return { icon: Zap, color: 'text-red-600', bg: 'bg-red-50', tag: 'Course' };
    default:
      return { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50', tag: 'Resource' };
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

const ContentCard: React.FC<{ item: ContentItem; handleOpen: (item: ContentItem) => void }> = ({ item, handleOpen }) => {
    const visuals = getContentVisuals(item.category);
    
    return (
        <Card 
            className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg border-gray-200 cursor-pointer bg-white"
            onClick={() => handleOpen(item)}
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
                 {/* Date removed as requested */}
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
  // Fetches data directly from the study_materials table
  const { materials, loading } = useStudyMaterials(); 
  
  const [activeTab, setActiveTab] = useState(contentCategories[0]);
  const [showAll, setShowAll] = useState(false);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);
  
  // --- Data Categorization ---
  const allCategorizedContent = useMemo(() => {
    const contentMap: { [key: string]: ContentItem[] } = {};
    contentCategories.forEach(cat => contentMap[cat] = []);

    if (!materials) return contentMap;

    // Filter materials based on the user's profile program (Focus Area)
    const userFocusProgram = profile?.program_type || 'General';

    const filteredMaterials = materials.filter(item => {
        // Include if the material is General/All OR specifically matches the user's program
        if (!item.exam_category || item.exam_category === 'General') return true;
        return item.exam_category === userFocusProgram;
    });

    // Map filtered database items to UI categories
    filteredMaterials.forEach(item => {
        const commonProps = {
            id: item.id,
            title: item.title,
            subject: item.subject || 'General',
            date: new Date(item.created_at).toLocaleDateString(),
            url: item.file_url,
        };

        if (item.material_type === 'pyq') {
             contentMap['PYQs (Previous Year Questions)'].push({
                ...commonProps,
                type: 'PYQ',
                tag: getContentVisuals('PYQs (Previous Year Questions)').tag,
                category: 'PYQs (Previous Year Questions)',
                color: getContentVisuals('PYQs (Previous Year Questions)').color,
             });
        } else if (item.material_type === 'note' || item.material_type === 'mindmap') {
             contentMap['Short Notes and Mindmaps'].push({
                ...commonProps,
                type: item.material_type === 'mindmap' ? 'Mindmap' : 'Note',
                tag: getContentVisuals('Short Notes and Mindmaps').tag, // This will now resolve to 'PDF'
                category: 'Short Notes and Mindmaps',
                color: getContentVisuals('Short Notes and Mindmaps').color,
             });
        } else if (item.material_type === 'question_bank') {
             contentMap['Free Question Bank'].push({
                ...commonProps,
                type: 'Test',
                tag: getContentVisuals('Free Question Bank').tag,
                category: 'Free Question Bank',
                color: getContentVisuals('Free Question Bank').color,
             });
        }
    });

    return contentMap;
  }, [profile, materials]);

  // Content for the currently active tab
  const fullContent = allCategorizedContent[activeTab] || [];
  const displayedContent = showAll ? fullContent : fullContent.slice(0, 6);
  const userFocusText = profile?.program_type === 'IITM_BS' ? 'IITM BS Degree' : profile?.program_type === 'JEE' ? 'JEE Exam' : profile?.program_type === 'NEET' ? 'NEET Exam' : 'Competitive Exam';

  const handleOpenViewer = (item: ContentItem) => {
    if (item.url) {
        setViewingItem(item);
        // Scroll to top to ensure viewer is visible immediately
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToList = () => {
    setViewingItem(null);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50/50">
      
      {/* HEADER SECTION - Sticky */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
          
          <div className="flex items-center justify-between px-4 pt-4 md:px-8 md:pt-5 mb-4">
              <div className="flex items-center gap-4">
                   {/* If viewing item, this back button goes back to list. If list, it goes back to history. */}
                   <Button 
                        variant="ghost" 
                        size="icon" 
                        className="-ml-2 h-10 w-10 text-black hover:bg-gray-100/50 rounded-full"
                        onClick={() => viewingItem ? handleBackToList() : navigate(-1)}
                   >
                      <ArrowLeft className="h-6 w-6" />
                   </Button>
                   {/* Modified: Show file name directly in header when viewing */}
                   <h1 className="text-2xl font-bold text-gray-900 tracking-tight line-clamp-1">
                       {viewingItem ? viewingItem.title : 'UI Library'}
                   </h1>
              </div>
          </div>

          {/* Show Tabs ONLY if NOT viewing an item */}
          {!viewingItem && (
              <div className="px-4 md:px-8 pb-0">
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
          )}
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full flex-1">
        
        {viewingItem ? (
            /* --- INLINE VIEWER (Replaces Grid) --- */
            <div className="flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-300">
                {/* Removed the top header card containing Title, Subtitle and 'Open New Tab' button.
                   The Title is now displayed in the sticky header above.
                */}

                <div className="w-full bg-white rounded-lg border shadow-sm overflow-hidden h-[75vh] md:h-[80vh] relative">
                     {viewingItem.url ? (
                        <iframe 
                            src={viewingItem.url} 
                            className="w-full h-full border-0" 
                            title="Content Viewer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                     ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Content URL not available
                        </div>
                     )}
                </div>
            </div>
        ) : (
            /* --- GRID VIEW --- */
            <>
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
                            <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                </div>
                
                {loading ? (
                  <div className="text-center py-20 text-gray-500">Fetching **{activeTab}** resources...</div>
                ) : displayedContent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedContent.map((item) => (
                            <ContentCard key={item.id} item={item} handleOpen={handleOpenViewer} />
                        ))}
                    </div>
                ) : (
                  <div className="text-center py-20 text-gray-500 bg-white border border-dashed rounded-lg">
                    <p>No resources found for **{activeTab}** in your **{userFocusText}** focus area.</p>
                  </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;
