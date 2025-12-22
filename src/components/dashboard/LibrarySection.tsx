import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { useStudyMaterials, StudyMaterial } from "@/hooks/useStudyMaterials";

// --- Reusable Card Component ---
interface ContentItem extends Partial<StudyMaterial> {
  id: string;
  title: string;
  category: string;
  url?: string;
  subject?: string;
}

const ContentCard: React.FC<{ item: ContentItem; handleOpen: (item: ContentItem) => void }> = ({ item, handleOpen }) => {
    // Placeholder image based on a generic education theme
    const thumbnailUrl = `https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=200&q=80`;

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.url) window.open(item.url, '_blank');
    };

    return (
        <Card 
            className="group bg-white border border-slate-200 rounded-md p-4 transition-all duration-200 hover:border-blue-700 hover:shadow-md cursor-pointer flex flex-col"
            onClick={() => handleOpen(item)}
        >
            <div className="flex gap-4 mb-4 items-stretch">
                {/* Thumbnail Cover */}
                <div className="w-[95px] h-[130px] bg-slate-800 rounded-sm flex-shrink-0 overflow-hidden border border-black/5 shadow-sm">
                    <img 
                        src={thumbnailUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Details Column */}
                <div className="flex flex-col flex-1">
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 line-clamp-3 leading-snug mb-1">
                        {item.title}
                    </h3>
                    
                    {/* Date removed as requested */}

                    {/* Aligned Badges - Anchored to bottom of image height */}
                    <div className="flex gap-1.5 mt-auto">
                        <Badge className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                            PDF
                        </Badge>
                        {item.subject && (
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                                {item.subject.substring(0, 3)}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button 
                    variant="ghost"
                    className="flex-1 h-9 text-xs font-bold text-slate-900 border border-slate-200 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50 transition-all"
                >
                    View Content
                </Button>
                <button 
                    onClick={handleDownload}
                    className="bg-blue-700 hover:bg-blue-800 h-9 px-3 rounded-md transition-colors flex items-center justify-center"
                    title="Download Resource"
                >
                    <Download className="h-4 w-4 text-white" strokeWidth={3} />
                </button>
            </div>
        </Card>
    );
};

// --- Main Library Component ---
const contentCategories = [
    'PYQs (Previous Year Questions)',
    'Short Notes and Mindmaps',
    'Free Lectures',
    'Free Question Bank',
    'UI ki Padhai',
];

const LibrarySection: React.FC<{ profile: Tables<'profiles'> | null }> = ({ profile }) => {
  const navigate = useNavigate();
  const { materials, loading } = useStudyMaterials(); 
  
  const [activeTab, setActiveTab] = useState(contentCategories[0]);
  const [showAll, setShowAll] = useState(false);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);

  const filteredContent = useMemo(() => {
    if (!materials) return [];
    const userFocus = profile?.program_type || 'General';

    return materials.filter(item => {
        const matchesFocus = !item.exam_category || item.exam_category === 'General' || item.exam_category === userFocus;
        if (!matchesFocus) return false;

        if (activeTab === 'PYQs (Previous Year Questions)') return item.material_type === 'pyq';
        if (activeTab === 'Short Notes and Mindmaps') return item.material_type === 'note' || item.material_type === 'mindmap';
        if (activeTab === 'Free Question Bank') return item.material_type === 'question_bank';
        return false;
    });
  }, [materials, activeTab, profile]);

  const displayedContent = showAll ? filteredContent : filteredContent.slice(0, 6);

  return (
    <div className="flex flex-col min-h-full bg-slate-50/50">
      {/* HEADER SECTION */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 md:px-8 max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-3">
                   <Button 
                        variant="ghost" size="icon" className="rounded-full h-9 w-9 -ml-2"
                        onClick={() => viewingItem ? setViewingItem(null) : navigate(-1)}
                   >
                      <ArrowLeft className="h-5 w-5" />
                   </Button>
                   <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-700" strokeWidth={2.5} />
                        <h1 className="text-lg font-bold text-slate-900 uppercase tracking-wider truncate max-w-[200px] md:max-w-none">
                            {viewingItem ? viewingItem.title : 'UI Library'}
                        </h1>
                   </div>
              </div>
              {!viewingItem && filteredContent.length > 6 && (
                  <button 
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs font-bold text-blue-700 hover:opacity-70 transition-opacity uppercase tracking-tight"
                  >
                    {showAll ? 'Show Less' : `View All →`}
                  </button>
              )}
          </div>

          {!viewingItem && (
              <div className="px-4 md:px-8 max-w-7xl mx-auto overflow-x-auto scrollbar-hide">
                   <div className="flex space-x-6 border-transparent">
                        {contentCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => { setActiveTab(cat); setShowAll(false); }}
                            className={cn(
                              "pb-3 text-xs font-bold uppercase tracking-tight transition-all border-b-2 px-1 whitespace-nowrap",
                              activeTab === cat ? "text-blue-700 border-blue-700" : "text-slate-500 border-transparent hover:text-slate-800"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                   </div>
              </div>
          )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
        {viewingItem ? (
            <div className="w-full bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden h-[80vh]">
                <iframe 
                    src={viewingItem.url} 
                    className="w-full h-full border-0" 
                    title="Content Viewer"
                    allowFullScreen
                />
            </div>
        ) : (
            <>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-md" />)}
                    </div>
                ) : filteredContent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {displayedContent.map((item) => (
                            <ContentCard 
                                key={item.id} 
                                item={{...item, category: activeTab, url: item.file_url}} 
                                handleOpen={(i) => i.url && setViewingItem(i)} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white border border-dashed rounded-md">
                        <p className="text-slate-500 font-medium">No resources found in this category.</p>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;
