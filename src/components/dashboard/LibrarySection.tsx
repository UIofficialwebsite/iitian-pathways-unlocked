import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, BookOpen, Video, Zap, FileQuestion, ArrowRight, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { useStudyMaterials } from "@/hooks/useStudyMaterials";

// --- Original Configuration for Categories ---
const contentCategories = [
    'PYQs (Previous Year Questions)',
    'Short Notes and Mindmaps',
    'Free Lectures',
    'Free Question Bank',
    'UI ki Padhai',
];

// Original helper function for category styles
const getContentVisuals = (category: string) => {
  switch (category) {
    case 'PYQs (Previous Year Questions)':
      return { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', tag: 'Paper' };
    case 'Short Notes and Mindmaps':
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

interface ContentItem {
  id: string | number;
  type: string;
  title: string;
  subject?: string;
  url?: string | null;
  tag: string;
  category: string;
  color: string;
}

// --- New Horizontal Card Design ---
const ContentCard: React.FC<{ item: ContentItem; handleOpen: (item: ContentItem) => void }> = ({ item, handleOpen }) => {
    const visuals = getContentVisuals(item.category);
    // Generic placeholder image
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
                    <h3 className="text-sm md:text-base font-bold text-slate-900 line-clamp-3 leading-snug mb-1">
                        {item.title}
                    </h3>
                    
                    {/* Aligned Badges at Bottom */}
                    <div className="flex gap-1.5 mt-auto">
                        <Badge className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                            {visuals.tag}
                        </Badge>
                        {item.subject && (
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                                {item.subject.substring(0, 3)}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Card Actions */}
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

// --- Restored Original Library Component ---
interface LibrarySectionProps {
  profile: Tables<'profiles'> | null;
}

const LibrarySection: React.FC<LibrarySectionProps> = ({ profile }) => {
  const navigate = useNavigate();
  const { materials, loading } = useStudyMaterials(); 
  
  const [activeTab, setActiveTab] = useState(contentCategories[0]);
  const [showAll, setShowAll] = useState(false);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);
  
  // Restored Original Categorization Logic
  const allCategorizedContent = useMemo(() => {
    const contentMap: { [key: string]: ContentItem[] } = {};
    contentCategories.forEach(cat => contentMap[cat] = []);

    if (!materials) return contentMap;

    const userFocusProgram = profile?.program_type || 'General';

    const filteredMaterials = materials.filter(item => {
        if (!item.exam_category || item.exam_category === 'General') return true;
        return item.exam_category === userFocusProgram;
    });

    filteredMaterials.forEach(item => {
        const commonProps = {
            id: item.id,
            title: item.title,
            subject: item.subject || 'General',
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
                tag: getContentVisuals('Short Notes and Mindmaps').tag,
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

  const fullContent = allCategorizedContent[activeTab] || [];
  const displayedContent = showAll ? fullContent : fullContent.slice(0, 6);
  const userFocusText = profile?.program_type === 'IITM_BS' ? 'IITM BS Degree' : profile?.program_type === 'JEE' ? 'JEE Exam' : profile?.program_type === 'NEET' ? 'NEET Exam' : 'Competitive Exam';

  return (
    <div className="flex flex-col min-h-full bg-gray-50/50">
      
      {/* RESTORED ORIGINAL STICKY HEADER */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4 md:px-8 md:pt-5 mb-4">
              <div className="flex items-center gap-4">
                   <Button 
                        variant="ghost" 
                        size="icon" 
                        className="-ml-2 h-10 w-10 text-black hover:bg-gray-100/50 rounded-full"
                        onClick={() => viewingItem ? setViewingItem(null) : navigate(-1)}
                   >
                      <ArrowLeft className="h-6 w-6" />
                   </Button>
                   <h1 className="text-2xl font-bold text-gray-900 tracking-tight line-clamp-1">
                       {viewingItem ? viewingItem.title : 'UI Library'}
                   </h1>
              </div>
          </div>

          {!viewingItem && (
              <div className="px-4 md:px-8 pb-0">
                   <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
                        {contentCategories.map((category) => (
                          <button
                            key={category}
                            onClick={() => { setActiveTab(category); setShowAll(false); }}
                            className={cn(
                              "pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-[3px] px-1",
                              activeTab === category ? "text-royal border-royal" : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                            )}
                          >
                            {category}
                          </button>
                        ))}
                   </div>
              </div>
          )}
      </div>

      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full flex-1">
        {viewingItem ? (
            <div className="flex flex-col space-y-4">
                <div className="w-full bg-white rounded-lg border shadow-sm overflow-hidden h-[75vh] md:h-[80vh] relative">
                     <iframe src={viewingItem.url || ''} className="w-full h-full border-0" title="Viewer" />
                </div>
            </div>
        ) : (
            <>
                <div className="flex justify-between items-center">
                     <h2 className="text-xl font-bold text-gray-900">{activeTab} Content</h2>
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
                            <ContentCard key={item.id} item={item} handleOpen={(i) => setViewingItem(i)} />
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
