import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, BookOpen, Video, Zap, FileQuestion, ArrowRight, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

// --- Refined Horizontal Card Design ---
const ContentCard: React.FC<{ item: ContentItem; handleOpen: (item: ContentItem) => void }> = ({ item, handleOpen }) => {
    const visuals = getContentVisuals(item.category);
    // Educational placeholder image
    const thumbnailUrl = `https://images.unsplash.com/photo-1606326666490-45213152f676?auto=format&fit=crop&w=300&q=80`;

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.url) window.open(item.url, '_blank');
    };

    return (
        <Card 
            className="group bg-white border border-slate-200 rounded-xl transition-all duration-300 hover:border-blue-600 hover:shadow-xl cursor-pointer flex h-[180px] overflow-hidden"
            onClick={() => handleOpen(item)}
        >
            {/* 1. Full-Height Thumbnail (Left Side) */}
            <div className="w-[120px] h-full flex-shrink-0 relative overflow-hidden bg-slate-200 border-r border-slate-100">
                <img 
                    src={thumbnailUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                <div className="absolute top-2 left-2">
                    <div className={cn("p-1.5 rounded-md shadow-sm bg-white/90 backdrop-blur-sm", visuals.color)}>
                        <visuals.icon className="h-4 w-4" />
                    </div>
                </div>
            </div>

            {/* 2. Content Area (Right Side) */}
            <div className="flex flex-col flex-1 p-4 relative">
                <div className="flex justify-between items-start mb-1">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                       {item.category.split(' ')[0]}
                   </span>
                   <Badge className="bg-blue-50 text-blue-700 border-none text-[9px] font-bold px-1.5 py-0 rounded-sm">
                        {item.subject?.toUpperCase() || 'GEN'}
                    </Badge>
                </div>

                <h3 className="text-sm md:text-base font-bold text-slate-900 line-clamp-3 leading-tight mb-2 group-hover:text-blue-700 transition-colors">
                    {item.title}
                </h3>
                
                {/* 3. Bottom Aligned Actions */}
                <div className="mt-auto flex gap-2">
                    <Button 
                        variant="ghost"
                        className="flex-1 h-9 text-xs font-bold text-slate-700 border border-slate-200 hover:border-blue-700 hover:text-blue-700 hover:bg-blue-50 transition-all rounded-lg"
                    >
                        View Content
                    </Button>
                    <button 
                        onClick={handleDownload}
                        className="bg-blue-700 hover:bg-blue-800 h-9 w-9 rounded-lg transition-all flex items-center justify-center shadow-sm active:scale-95"
                        title="Download Resource"
                    >
                        <Download className="h-4 w-4 text-white" strokeWidth={3} />
                    </button>
                </div>
            </div>
        </Card>
    );
};

const LibrarySection: React.FC<{ profile: Tables<'profiles'> | null }> = ({ profile }) => {
  const navigate = useNavigate();
  const { materials, loading } = useStudyMaterials(); 
  
  const [activeTab, setActiveTab] = useState(contentCategories[0]);
  const [showAll, setShowAll] = useState(false);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);
  
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
                type: 'PYQ', tag: getContentVisuals('PYQs (Previous Year Questions)').tag,
                category: 'PYQs (Previous Year Questions)', color: getContentVisuals('PYQs (Previous Year Questions)').color,
             });
        } else if (item.material_type === 'note' || item.material_type === 'mindmap') {
             contentMap['Short Notes and Mindmaps'].push({
                ...commonProps,
                type: item.material_type === 'mindmap' ? 'Mindmap' : 'Note',
                tag: getContentVisuals('Short Notes and Mindmaps').tag,
                category: 'Short Notes and Mindmaps', color: getContentVisuals('Short Notes and Mindmaps').color,
             });
        } else if (item.material_type === 'question_bank') {
             contentMap['Free Question Bank'].push({
                ...commonProps,
                type: 'Test', tag: getContentVisuals('Free Question Bank').tag,
                category: 'Free Question Bank', color: getContentVisuals('Free Question Bank').color,
             });
        }
    });
    return contentMap;
  }, [profile, materials]);

  const fullContent = allCategorizedContent[activeTab] || [];
  const displayedContent = showAll ? fullContent : fullContent.slice(0, 6);

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4 md:px-8 md:pt-5 mb-4">
              <div className="flex items-center gap-4">
                   <Button 
                        variant="ghost" size="icon" className="-ml-2 h-10 w-10 text-black rounded-full"
                        onClick={() => viewingItem ? setViewingItem(null) : navigate(-1)}
                   >
                      <ArrowLeft className="h-6 w-6" />
                   </Button>
                   <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
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
                              activeTab === category ? "text-royal border-royal" : "text-gray-500 border-transparent hover:text-gray-700"
                            )}
                          >
                            {category}
                          </button>
                        ))}
                   </div>
              </div>
          )}
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
        {viewingItem ? (
            <div className="w-full bg-white rounded-lg border shadow-sm overflow-hidden h-[80vh]">
                 <iframe src={viewingItem.url || ''} className="w-full h-full border-0" title="Viewer" />
            </div>
        ) : (
            <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-6 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-700" strokeWidth={2.5} />
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                            {activeTab}
                        </h2>
                    </div>
                    {fullContent.length > 0 && (
                        <button 
                            className="text-xs font-bold text-blue-700 hover:opacity-70 transition-opacity uppercase"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? 'SHOW LESS' : 'VIEW ALL →'}
                        </button>
                    )}
                </div>
                
                {loading ? (
                  <div className="text-center py-20 text-gray-500">Fetching resources...</div>
                ) : displayedContent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedContent.map((item) => (
                            <ContentCard key={item.id} item={item} handleOpen={(i) => setViewingItem(i)} />
                        ))}
                    </div>
                ) : (
                  <div className="text-center py-20 text-gray-400">
                    <p>No resources found for your focus area.</p>
                  </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;
